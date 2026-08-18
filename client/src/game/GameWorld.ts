/** Horizonte em Miniatura: o mundo é uma maquete em camadas onde cada obstáculo preserva silhueta e rota. */
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import type { Scene } from "@babylonjs/core/scene";
import { CameraController } from "./CameraController";
import { CollisionWorld } from "./CollisionWorld";
import { DemoPilot } from "./DemoPilot";
import { MovementInput } from "./MovementInput";
import { Player } from "./Player";
import type { GameStatus, MovementSource, WorldBounds } from "./types";

const assets = {
  fieldFallback: "/manus-storage/vale-ambar-field-fallback_07dc91d6.png",
  grass: "/manus-storage/vale-ambar-ground_0156fbee.png",
  water: "/manus-storage/vale-ambar-water_d5e9092a.png",
} as const;

const worldBounds: WorldBounds = {
  minX: -23.4,
  maxX: 23.4,
  minZ: -16.4,
  maxZ: 16.4,
};

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

  constructor(private readonly scene: Scene, canvas: HTMLCanvasElement, isDemo: boolean) {
    this.createWorldSurface();
    this.createWaterway();
    this.createFieldMottling();
    this.createPathPatches();
    this.createRouteStrokes();
    this.createObstacles();
    this.createFieldDetails();
    this.createForegroundFoliage();

    this.player = new Player(scene, new Vector2(-4.5, -2.5));
    this.cameraController = new CameraController(scene, worldBounds);
    this.cameraController.update(1, this.player.position);
    this.input = new MovementInput(canvas, (x, y) => this.pickWorldPosition(canvas, x, y), (target) => this.player.setTarget(target));
    this.demoPilot = isDemo ? new DemoPilot() : null;

    this.tryLoadGeneratedTextures();
    this.textureRetryTimer = window.setInterval(() => this.tryLoadGeneratedTextures(), 12_000);
    window.addEventListener("resize", this.onResize);
  }

  update(deltaSeconds: number) {
    const continuousVector = this.input.getContinuousVector();
    let source: MovementSource = continuousVector ? this.input.getSource() : this.player.hasTarget() ? "Destino" : "Aguardando";

    if (!continuousVector && this.demoPilot) {
      this.player.setTarget(this.demoPilot.getTarget(this.player.position));
      source = "Rota demo";
    }

    this.player.update(deltaSeconds, continuousVector, this.collision, source);
    this.cameraController.update(deltaSeconds, this.player.position);

    this.hudTimer -= deltaSeconds;
    if (this.hudTimer <= 0) {
      this.hudTimer = 0.12;
      this.emitStatus(source);
    }
  }

  dispose() {
    this.input.dispose();
    if (this.textureRetryTimer !== null) window.clearInterval(this.textureRetryTimer);
    window.removeEventListener("resize", this.onResize);
  }

  private readonly onResize = () => this.cameraController.resize();

  private pickWorldPosition(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
    const bounds = canvas.getBoundingClientRect();
    const pick = this.scene.pick(clientX - bounds.left, clientY - bounds.top, (mesh) => mesh.name === "walkable-grass");
    if (!pick?.hit || !pick.pickedPoint) return null;
    return new Vector2(pick.pickedPoint.x, pick.pickedPoint.z);
  }

  private createWorldSurface() {
    const base = MeshBuilder.CreateGround("grass-base", { width: 48, height: 34, subdivisions: 2 }, this.scene);
    base.material = this.colorMaterial("grass-base-material", "#657748", 0.2);
    base.isPickable = false;

    const paintedField = MeshBuilder.CreateGround("painted-field", { width: 48, height: 34, subdivisions: 2 }, this.scene);
    paintedField.position.y = 0.006;
    paintedField.material = this.texturedMaterial("painted-field-material", assets.fieldFallback, "#657748", 1, 1, 0.92);
    paintedField.isPickable = false;

    const grass = MeshBuilder.CreateGround("walkable-grass", { width: 48, height: 34, subdivisions: 2 }, this.scene);
    grass.position.y = 0.018;
    grass.material = this.texturedMaterial("grass-material", assets.grass, "#718856", 16, 12, 0.32);
    grass.isPickable = true;
  }

  private createWaterway() {
    this.createWaterPatch("water-south", -18.25, -8.3, 4.1, 15.4);
    this.createWaterPatch("water-bend", -14.7, -1, 4, 3);
    this.createWaterPatch("water-east", -11.7, -0.25, 3.5, 2.2);
    this.collision.addRectangle(-20.3, -16.2, -16, -0.6);
    this.collision.addRectangle(-16.7, -12.7, -2.5, 0.5);
    this.collision.addRectangle(-13.45, -9.95, -1.35, 0.85);
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
  }

  private createRouteStrokes() {
    const material = this.colorMaterial("route-stroke-material", "#C0A657", 0.12, 0.42);
    const strokes = [
      [-5, 5, 5, 0.18, 0.12],
      [-1, 3.2, 3, 0.16, -0.38],
      [3, 1.2, 4, 0.18, 0.28],
      [9, 7.5, 3.6, 0.14, -0.2],
      [14, -4, 2.8, 0.14, 0.1],
    ] as const;

    strokes.forEach(([x, z, width, height, rotation], index) => {
      const stroke = MeshBuilder.CreateGround(`route-stroke-${index}`, { width, height }, this.scene);
      stroke.position.set(x, 0.015, z);
      stroke.rotation.y = rotation;
      stroke.material = material;
      stroke.isPickable = false;
    });
  }

  private createFieldMottling() {
    const patches = [
      [-16, 4, 1.6, 0.72, "#4B673C", 0.08, -0.25],
      [-7, 11, 1.8, 0.68, "#829159", 0.06, 0.1],
      [4.5, 11.4, 2.2, 0.72, "#4E6A43", 0.07, -0.18],
      [13, 3.4, 1.7, 0.65, "#829159", 0.06, 0.26],
      [7.4, -10.3, 2.1, 0.7, "#4E6A43", 0.07, 0.08],
      [-3.5, -12.8, 1.45, 0.65, "#829159", 0.06, 0.24],
      [19, -7.2, 1.35, 0.68, "#4B673C", 0.08, -0.12],
      [-20, -1.6, 1.3, 0.7, "#829159", 0.06, 0.25],
    ] as const;

    patches.forEach(([x, z, radius, depth, color, alpha, rotation], index) => {
      this.createSoftPatch(`terrain-mottle-${index}`, x, z, radius, depth, color, alpha, rotation);
    });
  }

  private createPathPatches() {
    const pathNodes = [
      [-4.7, -3.2, 4.8, 0.78, -0.18],
      [-1.2, -1.45, 3.8, 0.72, 0.3],
      [2, 0.7, 4.1, 0.7, 0.36],
      [5.4, 2.7, 3.35, 0.68, 0.27],
      [8.2, 4.8, 3.2, 0.62, 0.52],
      [11.2, 6.3, 3.45, 0.6, 0.1],
      [14.5, 5.7, 3.2, 0.58, -0.55],
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
    this.createBoulder(-3.5, 4.2, 1.0);
    this.createBoulder(8.7, 5.4, 1.25);
    this.createBoulder(13.6, -6.2, 0.95);
    this.createRuin(5.8, -4.0, 1.65);
    this.createTree(15.5, 9.6, 1.28);
    this.createTree(-18.5, 9.2, 1.2);
    this.createTree(18.2, -12.4, 1.12);
  }

  private createBoulder(x: number, z: number, radius: number) {
    const moss = MeshBuilder.CreateDisc(`boulder-moss-${x}`, { radius: radius * 1.12, tessellation: 24 }, this.scene);
    moss.position.set(x, 0.025, z);
    moss.rotation.x = Math.PI / 2;
    moss.material = this.colorMaterial(`boulder-moss-mat-${x}`, "#597457", 0.12);
    moss.isPickable = false;

    const boulder = MeshBuilder.CreateSphere(`boulder-${x}`, { diameter: radius * 1.9, segments: 12 }, this.scene);
    boulder.position.set(x, radius * 0.48, z);
    boulder.scaling.y = 0.64;
    boulder.material = this.colorMaterial(`boulder-mat-${x}`, "#667B83", 0.08);
    boulder.isPickable = false;

    const mossCap = MeshBuilder.CreateSphere(`boulder-cap-${x}`, { diameter: radius * 1.42, segments: 10 }, this.scene);
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
    shadow.position.set(x, 0.03, z);
    shadow.rotation.x = Math.PI / 2;
    shadow.scaling.z = 0.72;
    shadow.material = this.colorMaterial(`tree-shadow-mat-${x}`, "#27483A", 0.04, 0.24);
    shadow.isPickable = false;

    const trunk = MeshBuilder.CreateCylinder(`tree-trunk-${x}`, { height: 1.1, diameter: 0.32, tessellation: 8 }, this.scene);
    trunk.position.set(x, 0.55, z);
    trunk.material = this.colorMaterial(`tree-trunk-mat-${x}`, "#785C3B", 0.03);
    trunk.isPickable = false;

    const foliage = MeshBuilder.CreateSphere(`tree-foliage-${x}`, { diameter: radius * 2.1, segments: 16 }, this.scene);
    foliage.position.set(x, 1.35, z);
    foliage.scaling.y = 0.55;
    foliage.material = this.colorMaterial(`tree-foliage-mat-${x}`, "#416A4B", 0.12);
    foliage.isPickable = false;

    const crown = MeshBuilder.CreateSphere(`tree-crown-${x}`, { diameter: radius * 1.5, segments: 12 }, this.scene);
    crown.position.set(x - radius * 0.24, 1.67, z - radius * 0.12);
    crown.scaling.set(1.15, 0.33, 0.84);
    crown.material = this.colorMaterial(`tree-crown-mat-${x}`, "#5C824E", 0.12);
    crown.isPickable = false;
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

  private createForegroundFoliage() {
    const foliageMaterial = this.colorMaterial("foreground-foliage-material", "#34563B", 0.08, 0.9);
    const amberGrassMaterial = this.colorMaterial("foreground-grass-material", "#A49350", 0.08, 0.9);
    const clusters = [
      [-22.7, -14.8, 2.3, foliageMaterial],
      [-20.8, -15.9, 1.7, amberGrassMaterial],
      [21.8, -14.6, 2.5, foliageMaterial],
      [22.5, 14.6, 1.9, amberGrassMaterial],
      [-22.2, 14.5, 2, foliageMaterial],
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
      speed: this.player.isMoving() ? this.player.speed : 0,
      hint,
    };
    window.dispatchEvent(new CustomEvent<GameStatus>("vale:status", { detail }));
  }
}
