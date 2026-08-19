/** Horizonte em Miniatura: o mundo é uma maquete em camadas onde cada obstáculo preserva silhueta e rota. */
import { Color3 } from "@babylonjs/core/Maths/math.color";
import "@babylonjs/core/Culling/ray";
import "@babylonjs/core/Shaders/default.vertex";
import "@babylonjs/core/Shaders/default.fragment";
import { Matrix, Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import type { Scene } from "@babylonjs/core/scene";
import { CameraController } from "./CameraController";
import { CollisionWorld } from "./CollisionWorld";
import { DemoPilot } from "./DemoPilot";
import { MovementInput } from "./MovementInput";
import { Player } from "./Player";
import type { GameStatus, MovementSource, WorldBounds } from "./types";
import { ZAO_START_POSITION, ZAO_WORLD_BOUNDS } from "@shared/game";
import { dispatchHotspotFromActionKey, dispatchHotspotFromWorldPointer } from "./worldHotspotPipeline";
import { resolveAttackApproach } from "./targeting";
import { hasFiniteScreenCoordinates, toRenderableCombatFloatPosition, type CombatFloatEvent } from "./combatFloatEvents";
import { resolveCombatFloatWorldAnchor } from "./combatFloatPipeline";
import { resolveDefaultAttackFlow } from "./defaultAttack";
import { dispatchDefaultAttackFromDoubleClick } from "./combatTargetPipeline";
import { getTargetIndicatorStyle } from "./targetIndicator";
import { COMBAT_VISUAL_HEIGHTS } from "./combatVisualLayout";

const assets = {
  fieldFallback: "/manus-storage/vale-ambar-field-fallback_07dc91d6.png",
  grass: "/manus-storage/vale-ambar-ground_0156fbee.png",
  water: "/manus-storage/vale-ambar-water_d5e9092a.png",
} as const;

const worldBounds: WorldBounds = ZAO_WORLD_BOUNDS;

type LandmarkKind = "npc" | "portal" | "stairs" | "monster";
type LandmarkInteraction = { id: string; kind: LandmarkKind; label: string; x: number; z: number; radius: number; monsterKey?: string };
type HealthBar = { rail: Mesh; fill: Mesh; label: Mesh; labelTexture: DynamicTexture; width: number; fillWidth: number; text: string };
type CreatureAgent = { interaction: LandmarkInteraction; body: Mesh; marker: Mesh; healthBar: HealthBar; hp: number; maxHp: number; home: Vector2; phase: number; state: "idle" | "chase" | "attack" | "return" | "dead"; respawnAt: number; attackCooldown: number };
type LootChest = { chestKey: string; x: number; z: number; body: Mesh; lid: Mesh; glow: Mesh };

export class GameWorld {
  private readonly collision = new CollisionWorld(worldBounds);
  private readonly player: Player;
  private readonly cameraController: CameraController;
  private readonly input: MovementInput;
  private readonly demoPilot: DemoPilot | null;
  private readonly pendingTextures: Array<{
    material: StandardMaterial;
    url: string;
    uScale: number;
    vScale: number;
    alpha: number;
  }> = [];
  private textureRetryTimer: number | null = null;
  private hudTimer = 0;
  private landmarkInteractions: LandmarkInteraction[] = [];
  private creatureAgents: CreatureAgent[] = [];
  private readonly lootChests = new Map<string, LootChest>();
  private readonly playerHealthBar: HealthBar;
  private playerHealth = { hp: 1, maxHp: 1 };
  private activeAttackTarget: string | null = null;
  private selectedAttackTarget: string | null = null;
  private activeAttackUsesDefault = false;
  private nearbyLandmarkId: string | null = null;
  private nearbyHighlight: Mesh | null = null;
  private readonly onWorldPointerDown = (event: PointerEvent) => {
    const bounds = this.canvas.getBoundingClientRect();
    if (this.openLootChestFromPointer(event, bounds)) return;
    if (event.button !== 0) return;
    dispatchHotspotFromWorldPointer<LandmarkInteraction>({
      target: window,
      event,
      bounds,
      pick: (x, y) => this.scene.pick(x, y, (mesh) => Boolean((mesh.metadata as { valeInteraction?: LandmarkInteraction } | undefined)?.valeInteraction)),
    });
  };
  private readonly onWorldContextMenu = (event: MouseEvent) => {
    const bounds = this.canvas.getBoundingClientRect();
    this.openLootChestFromPointer(event as PointerEvent, bounds);
  };
  private readonly onWorldDoubleClick = (event: MouseEvent) => {
    const bounds = this.canvas.getBoundingClientRect();
    dispatchDefaultAttackFromDoubleClick({
      target: window,
      event,
      bounds,
      player: { x: this.player.position.x, z: this.player.position.y },
      pick: (x, y) => {
        const pick = this.scene.pick(x, y, (mesh) => {
          const interaction = (mesh.metadata as { valeInteraction?: LandmarkInteraction } | undefined)?.valeInteraction;
          return interaction?.kind === "monster";
        });
        return pick?.pickedMesh as Mesh | null | undefined;
      },
    });
  };
  private readonly onWorldInteractionKey = (event: KeyboardEvent) => {
    dispatchHotspotFromActionKey({
      target: window,
      event,
      nearbyId: this.nearbyLandmarkId,
      interactions: this.landmarkInteractions,
    });
  };
  private readonly onCreatureDefeated = (event: Event) => {
    const monsterKey = (event as CustomEvent<{ monsterKey?: string }>).detail?.monsterKey;
    const creature = this.creatureAgents.find((entry) => entry.interaction.monsterKey === monsterKey);
    if (!creature) return;
    creature.state = "dead";
    creature.respawnAt = performance.now() + 8_000;
    creature.body.isVisible = false;
    creature.body.isPickable = false;
    creature.marker.isVisible = false;
    this.setHealthBarVisible(creature.healthBar, false);
  };
  private readonly onCombatState = (event: Event) => {
    const detail = (event as CustomEvent<{ player?: { hp: number; maxHp: number }; monsters?: Array<{ key: string; hp: number; maxHp: number }> }>).detail;
    if (detail?.player) this.playerHealth = detail.player;
    for (const state of detail?.monsters ?? []) {
      const creature = this.creatureAgents.find((entry) => entry.interaction.monsterKey === state.key);
      if (!creature) continue;
      creature.hp = state.hp;
      creature.maxHp = state.maxHp;
      this.updateHealthBar(creature.healthBar, creature.body.position.x, COMBAT_VISUAL_HEIGHTS.monsterHealthBar, creature.body.position.z, state.hp, state.maxHp, creature.state !== "dead");
    }
  };
  private readonly onAttackTarget = (event: Event) => {
    const detail = (event as CustomEvent<{ monsterKey?: string; defaultAttack?: boolean }>).detail;
    if (!detail?.monsterKey) return;
    this.activeAttackTarget = detail.monsterKey;
    this.selectedAttackTarget = detail.monsterKey;
    this.activeAttackUsesDefault = detail.defaultAttack === true;
  };
  private readonly onLootChests = (event: Event) => {
    const chests = (event as CustomEvent<Array<{ chestKey: string; x: number; z: number }>>).detail ?? [];
    this.syncLootChests(chests);
  };
  private readonly onFloatingCombatText = (event: Event) => {
    const detail = (event as CustomEvent<{ target?: "player" | "monster"; kind?: "damage" | "critical" | "heal"; value?: number; monsterKey?: string }>).detail;
    if (!detail?.target || !detail.kind || !detail.value) return;
    const combatEvent: CombatFloatEvent = { target: detail.target, kind: detail.kind, value: detail.value, monsterKey: detail.monsterKey };
    const anchor = resolveCombatFloatWorldAnchor(
      combatEvent,
      { x: this.player.position.x, z: this.player.position.y },
      this.creatureAgents.map((entry) => ({ key: entry.interaction.monsterKey ?? "", x: entry.body.position.x, z: entry.body.position.z })),
    );
    if (anchor) this.spawnFloatingCombatText(anchor.x, anchor.y, anchor.z, combatEvent.value, combatEvent.kind);
  };

  constructor(private readonly scene: Scene, private readonly canvas: HTMLCanvasElement, isDemo: boolean) {
    this.createWorldSurface();
    this.createWaterway();
    this.createFieldMottling();
    this.createPathPatches();
    this.createRouteStrokes();
    this.createObstacles();
    this.createFieldDetails();
    this.createCityArchitecture();
    this.createWorldLandmarks();
    this.createForegroundFoliage();

    this.player = new Player(scene, new Vector2(ZAO_START_POSITION.x, ZAO_START_POSITION.z));
    this.playerHealthBar = this.createHealthBar("player-health", "Aventureiro de Âmbar", "#4FDD69", 1.46);
    this.cameraController = new CameraController(scene, worldBounds);
    this.cameraController.update(1, this.player.position);
    this.input = new MovementInput(canvas, (x, y) => this.pickWorldPosition(canvas, x, y), (target) => this.player.setTarget(target));
    this.demoPilot = isDemo ? new DemoPilot() : null;

    this.tryLoadGeneratedTextures();
    this.textureRetryTimer = window.setInterval(() => this.tryLoadGeneratedTextures(), 12_000);
    window.addEventListener("resize", this.onResize);
    window.addEventListener("vale:creature-defeated", this.onCreatureDefeated);
    window.addEventListener("vale:world-combat-state", this.onCombatState);
    window.addEventListener("vale:attack-target", this.onAttackTarget);
    window.addEventListener("vale:loot-chests", this.onLootChests);
    window.addEventListener("vale:floating-combat-text", this.onFloatingCombatText);
    window.addEventListener("keydown", this.onWorldInteractionKey);
    canvas.addEventListener("pointerdown", this.onWorldPointerDown, { capture: true, passive: false });
    canvas.addEventListener("contextmenu", this.onWorldContextMenu, { capture: true });
    canvas.addEventListener("dblclick", this.onWorldDoubleClick, { capture: true });
  }

  update(deltaSeconds: number) {
    const continuousVector = this.input.getContinuousVector();
    let source: MovementSource = continuousVector ? this.input.getSource() : this.player.hasTarget() ? "Destino" : "Aguardando";

    if (!continuousVector && this.demoPilot) {
      this.player.setTarget(this.demoPilot.getTarget(this.player.position));
      source = "Rota demo";
    }

    this.player.update(deltaSeconds, continuousVector, this.collision, source);
    this.updateHealthBar(this.playerHealthBar, this.player.position.x, COMBAT_VISUAL_HEIGHTS.playerHealthBar, this.player.position.y, this.playerHealth.hp, this.playerHealth.maxHp, true);
    this.updateCreatureAgents(deltaSeconds);
    this.updateTargetedAttack();
    this.cameraController.update(deltaSeconds, this.player.position);
    this.updateNearbyLandmark();

    this.hudTimer -= deltaSeconds;
    if (this.hudTimer <= 0) {
      this.hudTimer = 0.12;
      this.emitStatus(source);
    }
  }

  dispose() {
    this.input.dispose();
    this.nearbyHighlight?.dispose();
    this.playerHealthBar.rail.dispose();
    this.playerHealthBar.fill.dispose();
    this.playerHealthBar.label.dispose();
    this.playerHealthBar.labelTexture.dispose();
    this.lootChests.forEach((chest) => { chest.body.dispose(); chest.lid.dispose(); chest.glow.dispose(); });
    if (this.textureRetryTimer !== null) window.clearInterval(this.textureRetryTimer);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("vale:creature-defeated", this.onCreatureDefeated);
    window.removeEventListener("vale:world-combat-state", this.onCombatState);
    window.removeEventListener("vale:attack-target", this.onAttackTarget);
    window.removeEventListener("vale:loot-chests", this.onLootChests);
    window.removeEventListener("vale:floating-combat-text", this.onFloatingCombatText);
    window.removeEventListener("keydown", this.onWorldInteractionKey);
    this.canvas.removeEventListener("pointerdown", this.onWorldPointerDown, true);
    this.canvas.removeEventListener("contextmenu", this.onWorldContextMenu, true);
    this.canvas.removeEventListener("dblclick", this.onWorldDoubleClick, true);
  }

  private readonly onResize = () => this.cameraController.resize();

  private pickWorldPosition(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
    const bounds = canvas.getBoundingClientRect();
    const pick = this.scene.pick(clientX - bounds.left, clientY - bounds.top, (mesh) => mesh.name === "walkable-grass");
    if (!pick?.hit || !pick.pickedPoint) return null;
    return new Vector2(pick.pickedPoint.x, pick.pickedPoint.z);
  }

  private createHealthBar(name: string, displayName: string, fillColor: string, width: number): HealthBar {
    const fillWidth = width - 0.12;
    const rail = MeshBuilder.CreateBox(`${name}-rail`, { width, height: 0.15, depth: 0.082 }, this.scene);
    rail.material = this.colorMaterial(`${name}-rail-material`, "#111710", 0.1, 0.94);
    rail.isPickable = false;
    const fill = MeshBuilder.CreateBox(`${name}-fill`, { width: fillWidth, height: 0.082, depth: 0.092 }, this.scene);
    fill.material = this.colorMaterial(`${name}-fill-material`, fillColor, 0.6, 1);
    fill.isPickable = false;
    const labelTexture = new DynamicTexture(`${name}-label-texture`, { width: 512, height: 128 }, this.scene, true);
    labelTexture.hasAlpha = true;
    const label = MeshBuilder.CreatePlane(`${name}-label`, { width: width + 0.88, height: 0.46 }, this.scene);
    label.rotation.x = Math.PI / 2;
    const labelMaterial = new StandardMaterial(`${name}-label-material`, this.scene);
    labelMaterial.diffuseTexture = labelTexture;
    labelMaterial.emissiveTexture = labelTexture;
    labelMaterial.useAlphaFromDiffuseTexture = true;
    labelMaterial.disableLighting = true;
    labelMaterial.backFaceCulling = false;
    label.material = labelMaterial;
    label.isPickable = false;
    return { rail, fill, label, labelTexture, width, fillWidth, text: displayName };
  }

  private setHealthBarVisible(bar: HealthBar, visible: boolean) {
    bar.rail.isVisible = visible;
    bar.fill.isVisible = visible;
    bar.label.isVisible = visible;
  }

  private updateHealthBar(bar: HealthBar, x: number, y: number, z: number, hp: number, maxHp: number, visible: boolean) {
    this.setHealthBarVisible(bar, visible);
    if (!visible) return;
    const ratio = Math.max(0, Math.min(1, maxHp ? hp / maxHp : 0));
    bar.rail.position.set(x, y, z);
    bar.fill.position.set(x - bar.fillWidth * (1 - ratio) * 0.5, y + 0.035, z - 0.008);
    bar.fill.scaling.x = Math.max(0.02, ratio);
    bar.label.position.set(x, y + 0.28, z + 0.015);
    const text = bar.text;
    if (bar.label.metadata?.healthText !== text) {
      const context = bar.labelTexture.getContext() as unknown as CanvasRenderingContext2D;
      context.clearRect(0, 0, 512, 128);
      context.font = "bold 54px Georgia";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.lineWidth = 8;
      context.strokeStyle = "#10150f";
      context.strokeText(text, 256, 66);
      context.fillStyle = "#F9F3D9";
      context.fillText(text, 256, 66);
      bar.labelTexture.update();
      bar.label.metadata = { ...(bar.label.metadata as Record<string, unknown> | undefined), healthText: text };
    }
  }

  private spawnFloatingCombatText(x: number, y: number, z: number, value: number, kind: "damage" | "critical" | "heal", lifetime = 0.82) {
    const camera = this.scene.activeCamera;
    if (!camera) return;
    const projected = Vector3.Project(new Vector3(x, y, z), Matrix.Identity(), this.scene.getTransformMatrix(), camera.viewport.toGlobal(this.canvas.width, this.canvas.height));
    const bounds = this.canvas.getBoundingClientRect();
    if (projected.z < 0 || projected.z > 1 || !hasFiniteScreenCoordinates(projected.x, projected.y)) return;
    const screenPosition = toRenderableCombatFloatPosition(projected.x, projected.y, this.canvas.width, this.canvas.height, bounds.width, bounds.height);
    if (!screenPosition) return;
    window.dispatchEvent(new CustomEvent("vale:combat-float-screen", { detail: {
      id: `combat-float-${performance.now()}-${Math.random()}`,
      ...screenPosition,
      value,
      kind,
      lifetime,
    } }));
  }

  private syncLootChests(chests: readonly { chestKey: string; x: number; z: number }[]) {
    const incoming = new Set(chests.map((chest) => chest.chestKey));
    this.lootChests.forEach((chest, key) => {
      if (incoming.has(key)) return;
      chest.body.dispose(); chest.lid.dispose(); chest.glow.dispose();
      this.lootChests.delete(key);
    });
    for (const chest of chests) {
      if (this.lootChests.has(chest.chestKey)) continue;
      const glow = MeshBuilder.CreateDisc(`loot-glow-${chest.chestKey}`, { radius: 0.64, tessellation: 20 }, this.scene);
      glow.position.set(chest.x, 0.04, chest.z); glow.rotation.x = Math.PI / 2;
      glow.material = this.colorMaterial(`loot-glow-material-${chest.chestKey}`, "#F2B84B", 0.55, 0.32); glow.isPickable = false;
      const body = MeshBuilder.CreateBox(`loot-chest-${chest.chestKey}`, { width: 0.68, height: 0.34, depth: 0.48 }, this.scene);
      body.position.set(chest.x, 0.22, chest.z); body.material = this.colorMaterial(`loot-chest-material-${chest.chestKey}`, "#7A5131", 0.13);
      const lid = MeshBuilder.CreateBox(`loot-lid-${chest.chestKey}`, { width: 0.73, height: 0.12, depth: 0.53 }, this.scene);
      lid.position.set(chest.x, 0.43, chest.z); lid.material = this.colorMaterial(`loot-lid-material-${chest.chestKey}`, "#D6A84B", 0.35);
      [body, lid].forEach((mesh) => { mesh.isPickable = true; mesh.metadata = { ...(mesh.metadata as Record<string, unknown> | undefined), valeLootChest: chest.chestKey }; });
      this.lootChests.set(chest.chestKey, { ...chest, body, lid, glow });
    }
  }

  private openLootChestFromPointer(event: PointerEvent, bounds: DOMRect) {
    const pick = this.scene.pick(event.clientX - bounds.left, event.clientY - bounds.top, (mesh) => Boolean((mesh.metadata as { valeLootChest?: string } | undefined)?.valeLootChest));
    const chestKey = (pick?.pickedMesh?.metadata as { valeLootChest?: string } | undefined)?.valeLootChest;
    if (!chestKey) return false;
    event.preventDefault(); event.stopImmediatePropagation();
    window.dispatchEvent(new CustomEvent("vale:open-loot-chest", { detail: { chestKey } }));
    return true;
  }

  private createWorldSurface() {
    const base = MeshBuilder.CreateGround("grass-base", { width: 54, height: 54, subdivisions: 2 }, this.scene);
    base.material = this.colorMaterial("grass-base-material", "#657748", 0.2);
    base.isPickable = false;

    const paintedField = MeshBuilder.CreateGround("painted-field", { width: 54, height: 54, subdivisions: 2 }, this.scene);
    paintedField.position.y = 0.006;
    paintedField.material = this.texturedMaterial("painted-field-material", assets.fieldFallback, "#657748", 1, 1, 0.56);
    paintedField.isPickable = false;

    const grass = MeshBuilder.CreateGround("walkable-grass", { width: 54, height: 54, subdivisions: 2 }, this.scene);
    grass.position.y = 0.018;
    grass.material = this.texturedMaterial("grass-material", assets.grass, "#718856", 18, 18, 0.66);
    grass.isPickable = true;
  }

  private createWaterway() {
    // Rio central: a ponte e a passagem sul ficam livres entre os dois trechos bloqueados.
    this.createWaterPatch("zao-river-north", 1.25, -14.5, 3.6, 22);
    this.createWaterPatch("zao-river-south", 1.25, 15.1, 3.6, 20);
    this.createWaterPatch("zao-west-branch", -13.5, -7.4, 22, 2.6);
    this.collision.addRectangle(-0.55, 3.05, -25.5, -3.65);
    this.collision.addRectangle(-0.55, 3.05, 4.65, 25.5);
    this.collision.addRectangle(-24.5, -2.5, -8.7, -6.1);
  }

  private createWaterPatch(name: string, x: number, z: number, width: number, height: number) {
    const bank = MeshBuilder.CreateGround(`${name}-bank`, { width: width + 0.62, height: height + 0.62, subdivisions: 1 }, this.scene);
    bank.position.set(x, 0.031, z);
    bank.material = this.colorMaterial(`${name}-bank-material`, "#7D7748", 0.12);
    bank.isPickable = false;

    const base = MeshBuilder.CreateGround(`${name}-base`, { width, height, subdivisions: 1 }, this.scene);
    base.position.set(x, 0.036, z);
    base.material = this.colorMaterial(`${name}-base-material`, "#386C6E", 0.2);
    base.isPickable = false;

    const water = MeshBuilder.CreateGround(name, { width, height, subdivisions: 1 }, this.scene);
    water.position.set(x, 0.052, z);
    water.material = this.texturedMaterial(`${name}-material`, assets.water, "#4C8D91", width / 2, height / 2, 0.38);
    water.isPickable = false;

    const reedMaterial = this.colorMaterial(`${name}-reed-material`, "#789253", 0.08, 0.88);
    const reeds = [
      [-width * 0.38, -height * 0.34], [-width * 0.16, height * 0.37], [width * 0.28, -height * 0.27], [width * 0.37, height * 0.18],
    ];
    reeds.forEach(([offsetX, offsetZ], index) => {
      const reed = MeshBuilder.CreateDisc(`${name}-reed-${index}`, { radius: 0.22, tessellation: 5 }, this.scene);
      reed.position.set(x + offsetX, 0.062, z + offsetZ);
      reed.rotation.x = Math.PI / 2;
      reed.scaling.set(0.6, 1.9, 1);
      reed.rotation.z = index % 2 ? 0.35 : -0.28;
      reed.material = reedMaterial;
      reed.isPickable = false;
    });
  }

  private createRouteStrokes() {
    const material = this.colorMaterial("route-stroke-material", "#C0A657", 0.12, 0.42);
    const strokes = [
      [-0.7, 0, 3.35, 50, 0],
      [-1, 2.4, 48, 3.35, 0],
      [-12.5, -8.5, 18, 2.8, -0.56],
      [13.5, 9.5, 19, 2.8, 0.46],
      [-16.5, 13, 11, 2.5, -0.18],
    ] as const;

    strokes.forEach(([x, z, width, height, rotation], index) => {
      const stroke = MeshBuilder.CreateGround(`route-stroke-${index}`, { width, height }, this.scene);
      stroke.position.set(x, 0.04, z);
      stroke.rotation.y = rotation;
      stroke.material = material;
      stroke.isPickable = false;
    });
  }

  private createFieldMottling() {
    const patches = [
      [-16, 4, 1.6, 0.72, "#4B673C", 0.045, -0.25],
      [-7, 11, 1.8, 0.68, "#829159", 0.035, 0.1],
      [4.5, 11.4, 2.2, 0.72, "#4E6A43", 0.04, -0.18],
      [13, 3.4, 1.7, 0.65, "#829159", 0.035, 0.26],
      [7.4, -10.3, 2.1, 0.7, "#4E6A43", 0.04, 0.08],
      [-3.5, -12.8, 1.45, 0.65, "#829159", 0.035, 0.24],
      [19, -7.2, 1.35, 0.68, "#4B673C", 0.045, -0.12],
      [-20, -1.6, 1.3, 0.7, "#829159", 0.035, 0.25],
    ] as const;

    patches.forEach(([x, z, radius, depth, color, alpha, rotation], index) => {
      this.createSoftPatch(`terrain-mottle-${index}`, x, z, radius, depth, color, alpha, rotation);
    });
  }

  private createPathPatches() {
    const pathNodes = [
      [-22, 0, 8, 0.78, 0],
      [-17, 5, 7, 0.72, 0.1],
      [-14, -11, 7, 0.7, -0.42],
      [15, -10, 8, 0.7, 0.44],
      [18, 7, 7, 0.62, 0.34],
      [0, 17, 8, 0.62, 0],
      [-21, 17, 7, 0.58, -0.18],
    ] as const;
    pathNodes.forEach(([x, z, width, height, rotation], index) => {
      this.createPathStrip(`traveler-path-${index}`, x, z, width, height, rotation);
    });
  }

  private createPathStrip(name: string, x: number, z: number, width: number, height: number, rotation: number) {
    const strip = MeshBuilder.CreateGround(name, { width, height }, this.scene);
    strip.position.set(x, 0.039, z);
    strip.rotation.y = rotation;
    strip.material = this.colorMaterial(`${name}-material`, "#A79155", 0.04, 0.14);
    strip.isPickable = false;
  }

  private createSoftPatch(name: string, x: number, z: number, radius: number, depth: number, color: string, alpha: number, rotation: number) {
    const patch = MeshBuilder.CreateDisc(name, { radius, tessellation: 40 }, this.scene);
    patch.position.set(x, 0.037, z);
    patch.rotation.x = Math.PI / 2;
    patch.rotation.z = rotation;
    patch.scaling.y = depth;
    patch.material = this.colorMaterial(`${name}-material`, color, 0.05, alpha);
    patch.isPickable = false;
  }

  private createObstacles() {
    this.createBoulder(-21, -16, 1.2);
    this.createBoulder(21, -15, 1.4);
    this.createBoulder(-20, 15, 1.25);
    this.createBoulder(21, 16, 1.1);
    this.createRuin(-18, -5, 1.65);
    this.createTree(-22, 10, 1.35);
    this.createTree(22, 10, 1.3);
    this.createTree(-22, -10, 1.2);
    this.createTree(22, -6, 1.2);
  }

  private createBoulder(x: number, z: number, radius: number) {
    const shadow = MeshBuilder.CreateDisc(`boulder-shadow-${x}`, { radius: radius * 1.1, tessellation: 20 }, this.scene);
    shadow.position.set(x + radius * 0.18, 0.021, z + radius * 0.24);
    shadow.rotation.x = Math.PI / 2;
    shadow.scaling.set(1.18, 0.58, 1);
    shadow.material = this.colorMaterial(`boulder-shadow-mat-${x}`, "#2B4435", 0.03, 0.26);
    shadow.isPickable = false;
    const moss = MeshBuilder.CreateDisc(`boulder-moss-${x}`, { radius: radius * 1.12, tessellation: 24 }, this.scene);
    moss.position.set(x, 0.025, z);
    moss.rotation.x = Math.PI / 2;
    moss.material = this.colorMaterial(`boulder-moss-mat-${x}`, "#597457", 0.12);
    moss.isPickable = false;

    const boulder = MeshBuilder.CreateIcoSphere(`boulder-${x}`, { radius: radius * 0.94, subdivisions: 2 }, this.scene);
    boulder.position.set(x, radius * 0.48, z);
    boulder.scaling.y = 0.64;
    boulder.material = this.colorMaterial(`boulder-mat-${x}`, "#667B83", 0.08);
    boulder.isPickable = false;

    const mossCap = MeshBuilder.CreateIcoSphere(`boulder-cap-${x}`, { radius: radius * 0.7, subdivisions: 2 }, this.scene);
    mossCap.position.set(x - radius * 0.12, radius * 0.72, z - radius * 0.1);
    mossCap.scaling.set(1, 0.24, 0.72);
    mossCap.material = this.colorMaterial(`boulder-cap-mat-${x}`, "#789057", 0.14, 0.86);
    mossCap.isPickable = false;
    this.collision.addCircle(new Vector2(x, z), radius);
  }

  private createRuin(x: number, z: number, radius: number) {
    const stoneMaterial = this.colorMaterial("ruin-stone-material", "#718087", 0.06);
    const mossMaterial = this.colorMaterial("ruin-moss-material", "#66855E", 0.18);
    const base = MeshBuilder.CreateDisc("ruin-base", { radius: radius * 1.08, tessellation: 24 }, this.scene);
    base.position.set(x, 0.022, z);
    base.rotation.x = Math.PI / 2;
    base.material = mossMaterial;
    base.isPickable = false;

    [
      [-0.8, 0.34, 1.45, 0.45],
      [0.1, -0.22, 1.1, 0.46],
      [0.8, 0.38, 0.65, 0.4],
    ].forEach(([offsetX, offsetZ, width, height], index) => {
      const block = MeshBuilder.CreateBox(`ruin-block-${index}`, { width, height: 0.48, depth: 0.58 }, this.scene);
      block.position.set(x + offsetX, 0.25, z + offsetZ);
      block.rotation.y = index === 1 ? 0.18 : -0.14;
      block.material = stoneMaterial;
      block.isPickable = false;
    });
    this.collision.addCircle(new Vector2(x, z), radius);
  }

  private createTree(x: number, z: number, radius: number) {
    const shadow = MeshBuilder.CreateDisc(`tree-shadow-${x}`, { radius: radius * 1.12, tessellation: 28 }, this.scene);
    shadow.position.set(x + radius * 0.18, 0.03, z + radius * 0.23);
    shadow.rotation.x = Math.PI / 2;
    shadow.scaling.z = 0.72;
    shadow.material = this.colorMaterial(`tree-shadow-mat-${x}`, "#27483A", 0.04, 0.24);
    shadow.isPickable = false;

    const trunk = MeshBuilder.CreateCylinder(`tree-trunk-${x}`, { height: 1.1, diameter: 0.32, tessellation: 8 }, this.scene);
    trunk.position.set(x, 0.55, z);
    trunk.material = this.colorMaterial(`tree-trunk-mat-${x}`, "#785C3B", 0.03);
    trunk.isPickable = false;

    const foliageMaterials = [
      this.colorMaterial(`tree-foliage-deep-${x}`, "#355C41", 0.1),
      this.colorMaterial(`tree-foliage-mid-${x}`, "#4E784B", 0.12),
      this.colorMaterial(`tree-foliage-light-${x}`, "#739653", 0.14),
    ];
    const crowns = [[0, 1.28, 0, 1], [-0.42, 1.42, -0.17, 0.67], [0.45, 1.4, 0.14, 0.62], [-0.1, 1.66, -0.43, 0.48]] as const;
    crowns.forEach(([offsetX, height, offsetZ, scale], index) => {
      const foliage = MeshBuilder.CreateIcoSphere(`tree-crown-${x}-${index}`, { radius: radius * scale, subdivisions: 2 }, this.scene);
      foliage.position.set(x + offsetX * radius, height, z + offsetZ * radius);
      foliage.scaling.y = 0.38;
      foliage.material = foliageMaterials[index % foliageMaterials.length];
      foliage.isPickable = false;
    });
    this.collision.addCircle(new Vector2(x, z), radius);
  }

  private createFieldDetails() {
    const flowerMaterial = this.colorMaterial("field-flower-material", "#E7DEA7", 0.18, 0.92);
    const grassMaterial = this.colorMaterial("field-tuft-material", "#A9A15B", 0.06, 0.86);
    const details = [
      [-10, 5.5, 0.22, flowerMaterial],
      [-8, 8.5, 0.14, grassMaterial],
      [1.3, 8.2, 0.2, flowerMaterial],
      [4.2, 9.5, 0.17, grassMaterial],
      [11.6, 10.5, 0.2, flowerMaterial],
      [17, 3.7, 0.15, grassMaterial],
      [3, -12, 0.2, flowerMaterial],
      [-4, -11.5, 0.16, grassMaterial],
      [-18, -8.8, 0.22, flowerMaterial],
      [18, -3.8, 0.17, grassMaterial],
    ] as const;

    details.forEach(([x, z, radius, material], index) => {
      const detail = MeshBuilder.CreateDisc(`field-detail-${index}`, { radius, tessellation: 8 }, this.scene);
      detail.position.set(x, 0.045, z);
      detail.rotation.x = Math.PI / 2;
      detail.material = material;
      detail.isPickable = false;
    });
  }

  private createCityArchitecture() {
    const wall = this.colorMaterial("zao-city-wall-material", "#7A746B", 0.08);
    const timber = this.colorMaterial("zao-city-timber-material", "#6E4A32", 0.06);
    const roof = this.colorMaterial("zao-city-roof-material", "#5D3E2D", 0.08);
    const plaster = this.colorMaterial("zao-city-plaster-material", "#B99B68", 0.05);
    const roadStone = this.colorMaterial("zao-city-road-material", "#A58A5D", 0.04);

    const buildings = [
      ["hall-northwest", -5.6, 5.2, 3.8, 2.9, plaster, roof],
      ["hall-northeast", 5.5, 5.2, 3.6, 2.8, plaster, roof],
      ["house-southwest", -5.4, -3.6, 3.2, 2.5, plaster, roof],
      ["house-southeast", 5.4, -3.6, 3.4, 2.6, plaster, roof],
      ["house-west", -9.4, 8.1, 2.8, 2.3, plaster, roof],
      ["house-east", 9.3, -7.1, 2.9, 2.4, plaster, roof],
      ["watch-house-north", -1.6, -20.6, 2.5, 2.2, timber, roof],
      ["watch-house-south", 8.8, 18.4, 2.5, 2.2, timber, roof],
    ] as const;
    buildings.forEach(([key, x, z, width, depth, bodyMaterial, roofMaterial]) => this.createCityBuilding(key, x, z, width, depth, bodyMaterial, roofMaterial));

    const walls = [
      [-10.5, 7.2, 20.5, 0.42, 0],
      [-10.5, -7.2, 20.5, 0.42, 0],
      [-10.6, 0, 0.42, 11.2, 0],
      [10.6, 0, 0.42, 11.2, 0],
    ] as const;
    walls.forEach(([x, z, width, depth, rotation], index) => {
      const segment = MeshBuilder.CreateBox(`zao-wall-${index}`, { width, height: 0.62, depth }, this.scene);
      segment.position.set(x, 0.31, z);
      segment.rotation.y = rotation;
      segment.material = wall;
      segment.isPickable = false;
      this.collision.addRectangle(x - width * 0.5, x + width * 0.5, z - depth * 0.5, z + depth * 0.5);
    });

    const plaza = MeshBuilder.CreateGround("zao-central-plaza", { width: 7.8, height: 6.2 }, this.scene);
    plaza.position.set(-1.1, 0.052, 1.1);
    plaza.material = roadStone;
    plaza.isPickable = false;
    this.createCityBridge("zao-central-bridge", 1.25, 0);
    this.createCityFountain(-1.5, 1.2);
    this.createCityGate(1.25, -23.2, "zao-north-gate");
    this.createCityGate(1.25, 23.2, "zao-south-gate");

    [-8.6, 8.6].forEach((x, index) => {
      const lamp = MeshBuilder.CreateCylinder(`zao-lamp-${index}`, { height: 1.25, diameter: 0.12, tessellation: 8 }, this.scene);
      lamp.position.set(x, 0.62, 1.8);
      lamp.material = timber;
      lamp.isPickable = false;
      const flame = MeshBuilder.CreateSphere(`zao-lamp-flame-${index}`, { diameter: 0.26, segments: 8 }, this.scene);
      flame.position.set(x, 1.3, 1.8);
      flame.material = this.colorMaterial(`zao-lamp-flame-material-${index}`, "#F2B84B", 0.7);
      flame.isPickable = false;
    });
  }

  private createCityBuilding(key: string, x: number, z: number, width: number, depth: number, bodyMaterial: StandardMaterial, roofMaterial: StandardMaterial) {
    const shadow = MeshBuilder.CreateGround(`${key}-shadow`, { width: width + 0.5, height: depth + 0.5 }, this.scene);
    shadow.position.set(x + 0.22, 0.044, z + 0.22);
    shadow.material = this.colorMaterial(`${key}-shadow-material`, "#2D3D30", 0.02, 0.24);
    shadow.isPickable = false;

    const body = MeshBuilder.CreateBox(`${key}-body`, { width, height: 1.2, depth }, this.scene);
    body.position.set(x, 0.62, z);
    body.material = bodyMaterial;
    body.isPickable = false;

    const roof = MeshBuilder.CreateBox(`${key}-roof`, { width: width + 0.34, height: 0.24, depth: depth + 0.34 }, this.scene);
    roof.position.set(x, 1.32, z);
    roof.rotation.y = 0.06;
    roof.material = roofMaterial;
    roof.isPickable = false;

    const door = MeshBuilder.CreateBox(`${key}-door`, { width: 0.5, height: 0.72, depth: 0.08 }, this.scene);
    door.position.set(x, 0.36, z - depth * 0.51);
    door.material = this.colorMaterial(`${key}-door-material`, "#3B2A24", 0.02);
    door.isPickable = false;

    const window = MeshBuilder.CreateBox(`${key}-window`, { width: 0.48, height: 0.34, depth: 0.06 }, this.scene);
    window.position.set(x + width * 0.28, 0.76, z - depth * 0.52);
    window.material = this.colorMaterial(`${key}-window-material`, "#E0AC50", 0.38);
    window.isPickable = false;

    this.collision.addRectangle(x - width * 0.44, x + width * 0.44, z - depth * 0.42, z + depth * 0.42);
  }

  private createCityBridge(key: string, x: number, z: number) {
    const bridge = MeshBuilder.CreateBox(`${key}-deck`, { width: 5.8, height: 0.16, depth: 4.8 }, this.scene);
    bridge.position.set(x, 0.14, z);
    bridge.material = this.colorMaterial(`${key}-deck-material`, "#92734B", 0.04);
    bridge.isPickable = false;
    for (let index = -2; index <= 2; index += 1) {
      const plank = MeshBuilder.CreateBox(`${key}-plank-${index}`, { width: 0.08, height: 0.2, depth: 4.9 }, this.scene);
      plank.position.set(x + index * 1.08, 0.25, z);
      plank.material = this.colorMaterial(`${key}-plank-material-${index}`, "#C09A5A", 0.05);
      plank.isPickable = false;
    }
  }

  private createCityFountain(x: number, z: number) {
    const basin = MeshBuilder.CreateCylinder("zao-fountain-basin", { height: 0.22, diameter: 2.1, tessellation: 16 }, this.scene);
    basin.position.set(x, 0.16, z);
    basin.material = this.colorMaterial("zao-fountain-stone", "#788187", 0.08);
    basin.isPickable = false;
    const water = MeshBuilder.CreateDisc("zao-fountain-water", { radius: 0.72, tessellation: 20 }, this.scene);
    water.position.set(x, 0.29, z);
    water.rotation.x = Math.PI / 2;
    water.material = this.colorMaterial("zao-fountain-water-material", "#4D9DA1", 0.22);
    water.isPickable = false;
    const column = MeshBuilder.CreateCylinder("zao-fountain-column", { height: 0.82, diameter: 0.3, tessellation: 10 }, this.scene);
    column.position.set(x, 0.64, z);
    column.material = this.colorMaterial("zao-fountain-column-material", "#9BA4A1", 0.08);
    column.isPickable = false;
  }

  private createCityGate(x: number, z: number, key: string) {
    const left = MeshBuilder.CreateBox(`${key}-left`, { width: 0.95, height: 2.8, depth: 1.05 }, this.scene);
    left.position.set(x - 2.1, 1.4, z);
    left.material = this.colorMaterial(`${key}-left-material`, "#6B6A64", 0.1);
    left.isPickable = false;
    const right = left.clone(`${key}-right`);
    if (right) right.position.x = x + 2.1;
    const lintel = MeshBuilder.CreateBox(`${key}-lintel`, { width: 5.1, height: 0.55, depth: 1.18 }, this.scene);
    lintel.position.set(x, 2.55, z);
    lintel.material = this.colorMaterial(`${key}-lintel-material`, "#8B8170", 0.1);
    lintel.isPickable = false;
    const torchMaterial = this.colorMaterial(`${key}-torch-material`, "#F2B84B", 0.72);
    [-2.1, 2.1].forEach((offset, index) => {
      const torch = MeshBuilder.CreateSphere(`${key}-torch-${index}`, { diameter: 0.32, segments: 8 }, this.scene);
      torch.position.set(x + offset, 2.1, z - 0.62);
      torch.material = torchMaterial;
      torch.isPickable = false;
    });
  }

  /** Marcos de conteúdo não selecionáveis: preservam o núcleo congelado de deslocamento. */
  private createWorldLandmarks() {
    this.createMerchantCamp(-4.9, 2.8);
    this.createPortal(19.2, -10.8, "portal-ruinas", "#769A94");
    this.createStairway(-18.2, -4.2);
    this.createMonsterSighting(-18, 8, "sighting-boar", "#B99064", 0.7, "field-boar", "Javali de Zao");
    this.createMonsterSighting(17, -11, "sighting-goblin", "#82965C", 0.63, "wind-goblin", "Goblin da Estrada");
  }

  private createMerchantCamp(x: number, z: number) {
    const canopy = MeshBuilder.CreateCylinder("merchant-canopy", { height: 0.32, diameterTop: 2.05, diameterBottom: 1.55, tessellation: 6 }, this.scene);
    canopy.position.set(x, 1.14, z);
    canopy.material = this.colorMaterial("merchant-canopy-material", "#7B5740", 0.1);
    canopy.isPickable = false;
    [-0.68, 0.68].forEach((offset, index) => {
      const pole = MeshBuilder.CreateCylinder(`merchant-pole-${index}`, { height: 1.25, diameter: 0.1, tessellation: 6 }, this.scene);
      pole.position.set(x + offset, 0.62, z + 0.18);
      pole.material = this.colorMaterial(`merchant-pole-material-${index}`, "#60442E", 0.04);
      pole.isPickable = false;
    });
    const traveler = MeshBuilder.CreateSphere("merchant-selene", { diameter: 0.44, segments: 10 }, this.scene);
    traveler.position.set(x, 0.42, z - 0.22);
    traveler.scaling.y = 1.7;
    traveler.material = this.colorMaterial("merchant-selene-material", "#D6AD70", 0.12);
    this.registerLandmark(traveler, { id: "selene", kind: "npc", label: "Selene · Mercadora", x, z, radius: 1.45 });
    const lamp = MeshBuilder.CreateSphere("merchant-lamp", { diameter: 0.25, segments: 8 }, this.scene);
    lamp.position.set(x + 0.86, 0.68, z - 0.14);
    lamp.material = this.colorMaterial("merchant-lamp-material", "#F2B84B", 0.55);
    lamp.isPickable = false;
  }

  private createPortal(x: number, z: number, name: string, color: string) {
    const outer = MeshBuilder.CreateTorus(`${name}-outer`, { diameter: 1.65, thickness: 0.15, tessellation: 24 }, this.scene);
    outer.position.set(x, 0.2, z);
    outer.rotation.x = Math.PI / 2;
    outer.material = this.colorMaterial(`${name}-outer-material`, color, 0.48, 0.92);
    outer.isPickable = false;
    const inner = MeshBuilder.CreateDisc(`${name}-inner`, { radius: 0.61, tessellation: 24 }, this.scene);
    inner.position.set(x, 0.051, z);
    inner.rotation.x = Math.PI / 2;
    inner.material = this.colorMaterial(`${name}-inner-material`, color, 0.18, 0.42);
    this.registerLandmark(inner, { id: name, kind: "portal", label: "Portal das Ruínas", x, z, radius: 1.35 });
    [0, Math.PI * 0.67, Math.PI * 1.34].forEach((angle, index) => {
      const rune = MeshBuilder.CreateBox(`${name}-rune-${index}`, { width: 0.16, height: 0.08, depth: 0.34 }, this.scene);
      rune.position.set(x + Math.cos(angle) * 0.9, 0.14, z + Math.sin(angle) * 0.9);
      rune.rotation.y = angle;
      rune.material = this.colorMaterial(`${name}-rune-material-${index}`, "#F2B84B", 0.38);
      rune.isPickable = false;
    });
  }

  private createStairway(x: number, z: number) {
    const material = this.colorMaterial("stairway-material", "#7D8790", 0.07);
    [0, 1, 2, 3].forEach((step) => {
      const block = MeshBuilder.CreateBox(`stair-step-${step}`, { width: 1.28 - step * 0.08, height: 0.15, depth: 0.35 }, this.scene);
      block.position.set(x + step * 0.13, 0.075 + step * 0.075, z - step * 0.26);
      block.material = material;
      block.isPickable = false;
    });
    const torch = MeshBuilder.CreateSphere("stairway-torch", { diameter: 0.22, segments: 8 }, this.scene);
    torch.position.set(x - 0.82, 0.54, z - 0.42);
    torch.material = this.colorMaterial("stairway-torch-material", "#F2B84B", 0.72);
    this.registerLandmark(torch, { id: "stairway", kind: "stairs", label: "Escadaria antiga", x, z, radius: 1.25 });
  }

  private createMonsterSighting(x: number, z: number, name: string, color: string, scale: number, monsterKey: string, label: string) {
    const shadow = MeshBuilder.CreateDisc(`${name}-shadow`, { radius: scale * 0.85, tessellation: 16 }, this.scene);
    shadow.position.set(x + 0.12, 0.025, z + 0.16);
    shadow.rotation.x = Math.PI / 2;
    shadow.scaling.z = 0.6;
    shadow.material = this.colorMaterial(`${name}-shadow-material`, "#263F31", 0.02, 0.32);
    shadow.isPickable = false;
    const body = MeshBuilder.CreateSphere(`${name}-body`, { diameter: scale * 1.45, segments: 10 }, this.scene);
    body.position.set(x, scale * 0.38, z);
    body.scaling.set(1.2, 0.72, 0.85);
    body.material = this.colorMaterial(`${name}-body-material`, color, 0.12);
    const interaction: LandmarkInteraction = { id: name, kind: "monster", label, x, z, radius: 1.4, monsterKey };
    this.registerLandmark(body, interaction);
    const marker = MeshBuilder.CreateTorus(`${name}-target-marker`, { diameter: scale * 1.85, thickness: 0.045, tessellation: 20 }, this.scene);
    marker.position.set(x, 0.045, z);
    marker.rotation.x = Math.PI / 2;
    marker.material = this.colorMaterial(`${name}-target-marker-material`, "#F2B84B", 0.42, 0.68);
    marker.isPickable = false;
    const healthBar = this.createHealthBar(`${name}-health`, label, "#4FDD69", 1.14);
    this.updateHealthBar(healthBar, x, COMBAT_VISUAL_HEIGHTS.monsterHealthBar, z, 1, 1, true);
    this.creatureAgents.push({ interaction, body, marker, healthBar, hp: 1, maxHp: 1, home: new Vector2(x, z), phase: this.creatureAgents.length * 1.7, state: "idle", respawnAt: 0, attackCooldown: 0 });
  }

  private registerLandmark(mesh: Mesh, interaction: LandmarkInteraction) {
    mesh.isPickable = true;
    mesh.metadata = { ...(mesh.metadata as Record<string, unknown> | undefined), valeInteraction: interaction };
    this.landmarkInteractions.push(interaction);
  }

  private updateNearbyLandmark() {
    const nearest = this.landmarkInteractions.find((entry) => Vector2.Distance(this.player.position, new Vector2(entry.x, entry.z)) <= entry.radius) ?? null;
    if (nearest?.id === this.nearbyLandmarkId) return;
    this.nearbyLandmarkId = nearest?.id ?? null;
    this.nearbyHighlight?.dispose();
    this.nearbyHighlight = null;
    if (nearest) {
      const ring = MeshBuilder.CreateTorus(`hotspot-highlight-${nearest.id}`, { diameter: nearest.radius * 1.7, thickness: 0.065, tessellation: 24 }, this.scene);
      ring.position.set(nearest.x, 0.12, nearest.z);
      ring.rotation.x = Math.PI / 2;
      ring.material = this.colorMaterial(`hotspot-highlight-material-${nearest.id}`, "#F2B84B", 0.72, 0.92);
      ring.isPickable = false;
      this.nearbyHighlight = ring;
    }
    window.dispatchEvent(new CustomEvent<LandmarkInteraction | null>("vale:world-proximity", { detail: nearest }));
  }

  private updateCreatureAgents(deltaSeconds: number) {
    const now = performance.now();
    for (const creature of this.creatureAgents) {
      if (creature.state === "dead") {
        if (now < creature.respawnAt) continue;
        creature.state = "return";
        creature.body.isVisible = true;
        creature.body.isPickable = true;
        creature.marker.isVisible = true;
        creature.hp = creature.maxHp;
        this.setHealthBarVisible(creature.healthBar, true);
        creature.body.position.x = creature.home.x;
        creature.body.position.z = creature.home.y;
        creature.marker.position.x = creature.home.x;
        creature.marker.position.z = creature.home.y;
        creature.interaction.x = creature.home.x;
        creature.interaction.z = creature.home.y;
      }

      const current = new Vector2(creature.body.position.x, creature.body.position.z);
      const toPlayer = this.player.position.subtract(current);
      const distanceToPlayer = toPlayer.length();
      const toHome = creature.home.subtract(current);
      const distanceToHome = toHome.length();
      creature.attackCooldown = Math.max(0, creature.attackCooldown - deltaSeconds);

      let direction = Vector2.Zero();
      let speed = 0;
      if (distanceToPlayer < 3.9 && distanceToHome < 7.2) {
        if (distanceToPlayer <= 1.18) {
          creature.state = "attack";
          if (creature.attackCooldown === 0) {
            creature.attackCooldown = 2.4;
            window.dispatchEvent(new CustomEvent("vale:creature-attack", { detail: { label: creature.interaction.label } }));
          }
        } else {
          creature.state = "chase";
          direction = toPlayer.normalize();
          speed = 1.25;
        }
      } else if (distanceToHome > 0.15) {
        creature.state = "return";
        direction = toHome.normalize();
        speed = 0.95;
      } else {
        creature.state = "idle";
        creature.phase += deltaSeconds * 0.9;
        direction = new Vector2(Math.cos(creature.phase), Math.sin(creature.phase));
        speed = 0.18;
      }

      if (speed) {
        const next = current.add(direction.scale(speed * deltaSeconds));
        const bounded = new Vector2(Math.min(worldBounds.maxX - 0.5, Math.max(worldBounds.minX + 0.5, next.x)), Math.min(worldBounds.maxZ - 0.5, Math.max(worldBounds.minZ + 0.5, next.y)));
        creature.body.position.x = bounded.x;
        creature.body.position.z = bounded.y;
        creature.marker.position.x = bounded.x;
        creature.marker.position.z = bounded.y;
        creature.interaction.x = bounded.x;
        creature.interaction.z = bounded.y;
      }
      this.updateHealthBar(creature.healthBar, creature.body.position.x, COMBAT_VISUAL_HEIGHTS.monsterHealthBar, creature.body.position.z, creature.hp, creature.maxHp, true);
      const selected = creature.interaction.monsterKey === this.selectedAttackTarget;
      const markerMaterial = creature.marker.material as StandardMaterial;
      const indicator = getTargetIndicatorStyle(selected, creature.state);
      const markerColor = Color3.FromHexString(indicator.color);
      markerMaterial.diffuseColor = markerColor;
      markerMaterial.emissiveColor = markerColor.scale(indicator.glow);
      creature.marker.scaling.setAll(indicator.scale);
    }
  }

  private updateTargetedAttack() {
    if (!this.activeAttackTarget) return;
    const creature = this.creatureAgents.find((entry) => entry.interaction.monsterKey === this.activeAttackTarget);
    if (!creature || creature.state === "dead") { this.activeAttackTarget = null; this.activeAttackUsesDefault = false; return; }
    const creaturePosition = new Vector2(creature.body.position.x, creature.body.position.z);
    const playerPosition = { x: this.player.position.x, z: this.player.position.y };
    const action = this.activeAttackUsesDefault
      ? resolveDefaultAttackFlow(this.activeAttackTarget, playerPosition, { x: creaturePosition.x, z: creaturePosition.y }).approach
      : resolveAttackApproach(playerPosition, { x: creaturePosition.x, z: creaturePosition.y });
    if (action.kind === "attack") {
      const monsterKey = this.activeAttackTarget;
      const defaultAttack = this.activeAttackUsesDefault;
      this.activeAttackTarget = null;
      this.activeAttackUsesDefault = false;
      window.dispatchEvent(new CustomEvent("vale:attack-target-ready", { detail: { monsterKey, defaultAttack } }));
      return;
    }
    this.player.setTarget(new Vector2(action.destination.x, action.destination.z));
  }

  private createForegroundFoliage() {
    const foliageMaterial = this.colorMaterial("foreground-foliage-material", "#34563B", 0.08, 0.9);
    const amberGrassMaterial = this.colorMaterial("foreground-grass-material", "#A49350", 0.08, 0.9);
    const clusters = [
      [-26.2, -25.1, 2.3, foliageMaterial],
      [-24.8, -26.1, 1.7, amberGrassMaterial],
      [25.5, -24.8, 2.5, foliageMaterial],
      [25.5, 25.2, 1.9, amberGrassMaterial],
      [-25.7, 25.2, 2, foliageMaterial],
    ] as const;

    clusters.forEach(([x, z, radius, material], index) => {
      const cluster = MeshBuilder.CreateSphere(`foreground-cluster-${index}`, { diameter: radius * 2, segments: 12 }, this.scene);
      cluster.position.set(x, 0.42, z);
      cluster.scaling.set(1.2, 0.38, 0.78);
      cluster.material = material;
      cluster.isPickable = false;
    });
  }

  private texturedMaterial(name: string, url: string, fallback: string, uScale: number, vScale: number, alpha = 1) {
    const material = new StandardMaterial(name, this.scene);
    material.diffuseColor = Color3.FromHexString(fallback);
    material.specularColor = Color3.Black();
    material.alpha = 0;
    this.pendingTextures.push({ material, url, uScale, vScale, alpha });
    return material;
  }

  private tryLoadGeneratedTextures() {
    this.pendingTextures.forEach((entry) => {
      if (entry.material.diffuseTexture) return;
      void fetch(entry.url, { method: "HEAD", cache: "no-store" })
        .then((response) => response.headers.get("content-type") ?? "")
        .then((contentType) => {
          if (!contentType.startsWith("image/") || contentType.includes("svg")) return;
          const texture = new Texture(entry.url, this.scene, true, false);
          texture.wrapU = Texture.WRAP_ADDRESSMODE;
          texture.wrapV = Texture.WRAP_ADDRESSMODE;
          texture.uScale = entry.uScale;
          texture.vScale = entry.vScale;
          texture.level = entry.url.includes("field-fallback") ? 1 : entry.url.includes("ground") ? 0.42 : 0.68;
          texture.anisotropicFilteringLevel = 4;
          entry.material.diffuseTexture = texture;
          entry.material.alpha = entry.alpha;
        })
        .catch(() => {
          // A cor-base permanece ativa caso o recurso ainda esteja em processamento.
        });
    });
  }

  private colorMaterial(name: string, hex: string, emissiveStrength: number, alpha = 1) {
    const material = new StandardMaterial(name, this.scene);
    const color = Color3.FromHexString(hex);
    material.diffuseColor = color;
    material.emissiveColor = color.scale(emissiveStrength);
    material.specularColor = Color3.Black();
    material.alpha = alpha;
    return material;
  }

  private emitStatus(source: MovementSource) {
    const movement = this.player.isMoving() ? source : source === "Rota demo" ? source : "Aguardando comando";
    const hint = this.demoPilot
      ? "Demonstração ativa · use WASD, setas, toque ou clique para testar"
      : "WASD, setas, clique ou toque no terreno";
    const detail: GameStatus = {
      movement,
      isResting: !this.player.isMoving() && source !== "Rota demo",
      speed: this.player.isMoving() ? this.player.speed : 0,
      hint,
      position: [this.player.position.x, this.player.position.y],
      nearbyHotspot: this.landmarkInteractions.find((entry) => entry.id === this.nearbyLandmarkId) ?? null,
      monsters: this.creatureAgents.filter((entry) => entry.state !== "dead").map((entry) => ({ key: entry.interaction.monsterKey ?? entry.interaction.id, name: entry.interaction.label, x: entry.interaction.x, z: entry.interaction.z, hp: entry.hp, maxHp: entry.maxHp })),
    };
    window.dispatchEvent(new CustomEvent<GameStatus>("vale:status", { detail }));
  }
}
