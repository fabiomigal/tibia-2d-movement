import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Material } from "@babylonjs/core/Materials/material";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";

export type SpriteActorKind = "adventurer" | "goblin" | "boar";
export type SpriteAction = "idle" | "walk" | "attack" | "hit" | "death";
export const SPRITE_PLANE_ROTATION_X = Math.PI / 2;
/** Pixels translúcidos abaixo deste limite são descartados; o personagem permanece sólido sobre o terreno. */
export const SPRITE_ALPHA_CUTOFF = 0.08;
/** Preset compartilhado que mantém as entidades legíveis, sólidas e acima da malha de tiles. */
export const OPAQUE_SPRITE_RENDERING = {
  alpha: 1,
  alphaCutOff: SPRITE_ALPHA_CUTOFF,
  transparencyMode: Material.MATERIAL_ALPHATEST,
  forceDepthWrite: true,
  useAlphaFromDiffuseTexture: true,
  disableLighting: true,
  renderingGroupId: 2,
} as const;
/** Cores plenas e sem atenuação de luz mantêm a leitura da sprite sobre gramado, água e pedra. */
export const OPAQUE_SPRITE_CONTRAST = {
  diffuseHex: "#FFFFFF",
  emissiveHex: "#FFFFFF",
  lighting: "unlit-full-color",
} as const;
type SpriteDirection = "south" | "east" | "north" | "west";

type SpriteSheet = { url: string; columns: number; fps: number; loop: boolean };

/** Alturas em unidades de mundo: 1 tile = 1u; recalibradas para a leitura do novo cenário em grade. */
export const ZAO_SPRITE_SIZE: Record<SpriteActorKind, number> = {
  adventurer: 2.55,
  goblin: 2.18,
  boar: 2.36,
};
const IS_STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === "true";
const STATIC_SPRITE_COLORS: Record<SpriteActorKind, string> = {
  adventurer: "#f2b84b",
  goblin: "#87a85a",
  boar: "#b99064",
};

const spriteSheets: Record<SpriteActorKind, Partial<Record<SpriteAction, SpriteSheet>>> = {
  adventurer: {
    idle: { url: "/manus-storage/adventurer_idle_f791f566.png", columns: 4, fps: 4, loop: true },
    walk: { url: "/manus-storage/adventurer_walk_c19bb4bc.png", columns: 6, fps: 8, loop: true },
    attack: { url: "/manus-storage/adventurer_attack_3f75fd84.png", columns: 6, fps: 12, loop: false },
    hit: { url: "/manus-storage/adventurer_hit_5e3c5bec.png", columns: 4, fps: 10, loop: false },
  },
  goblin: {
    idle: { url: "/manus-storage/goblin_idle_f8be0563.png", columns: 4, fps: 4, loop: true },
    walk: { url: "/manus-storage/goblin_walk_229e3a0a.png", columns: 6, fps: 8, loop: true },
    attack: { url: "/manus-storage/goblin_attack_05f6581b.png", columns: 6, fps: 12, loop: false },
    hit: { url: "/manus-storage/goblin_hit_c3863c07.png", columns: 4, fps: 10, loop: false },
    death: { url: "/manus-storage/goblin_death_fe048a24.png", columns: 6, fps: 8, loop: false },
  },
  boar: {
    idle: { url: "/manus-storage/boar_idle_fee5ef14.png", columns: 4, fps: 4, loop: true },
    walk: { url: "/manus-storage/boar_walk_d2e462b2.png", columns: 6, fps: 8, loop: true },
    attack: { url: "/manus-storage/boar_attack_e5c330cc.png", columns: 6, fps: 12, loop: false },
    hit: { url: "/manus-storage/boar_hit_28aa6f30.png", columns: 4, fps: 10, loop: false },
    death: { url: "/manus-storage/boar_death_e30e85a5.png", columns: 6, fps: 8, loop: false },
  },
};

const directionRows: Record<SpriteDirection, number> = { south: 0, east: 1, north: 2, west: 3 };

/** Recorte UV com eixo V invertido para manter o topo do PNG como topo visual no terreno. */
export function selectSpriteRowUv(direction: SpriteDirection) {
  return { vOffset: (directionRows[direction] + 1) / 4, vScale: -1 / 4 };
}

export function selectSpriteFrame(elapsedSeconds: number, fps: number, columns: number, loop: boolean) {
  const rawFrame = Math.max(0, Math.floor(elapsedSeconds * fps));
  return loop ? rawFrame % columns : Math.min(columns - 1, rawFrame);
}

export function selectSpriteDirection(deltaX: number, deltaZ: number, fallback: SpriteDirection = "south"): SpriteDirection {
  if (Math.abs(deltaX) < 0.0001 && Math.abs(deltaZ) < 0.0001) return fallback;
  if (Math.abs(deltaX) > Math.abs(deltaZ)) return deltaX > 0 ? "east" : "west";
  return deltaZ > 0 ? "south" : "north";
}

/** Camada visual independente da lógica de movimento: recorta atlas 4×N em um plano horizontal do mundo. */
export class AnimatedSpriteActor {
  readonly mesh: Mesh;
  private readonly material: StandardMaterial;
  private readonly textures = new Map<SpriteAction, Texture>();
  private action: SpriteAction = "idle";
  private direction: SpriteDirection = "south";
  private elapsed = 0;
  private forcedAction: SpriteAction | null = null;
  private forcedUntil = 0;
  private lastX: number | null = null;
  private lastZ: number | null = null;

  constructor(private readonly scene: Scene, readonly kind: SpriteActorKind, name: string, size: number) {
    this.mesh = MeshBuilder.CreatePlane(`${name}-sprite`, { width: size, height: size }, scene);
    this.mesh.rotation.x = SPRITE_PLANE_ROTATION_X;
    this.mesh.renderingGroupId = OPAQUE_SPRITE_RENDERING.renderingGroupId;
    this.mesh.isPickable = false;
    this.material = new StandardMaterial(`${name}-sprite-material`, scene);
    this.material.diffuseColor = Color3.FromHexString(OPAQUE_SPRITE_CONTRAST.diffuseHex);
    this.material.emissiveColor = Color3.FromHexString(OPAQUE_SPRITE_CONTRAST.emissiveHex);
    this.material.specularColor = Color3.Black();
    this.material.alpha = OPAQUE_SPRITE_RENDERING.alpha;
    this.material.useAlphaFromDiffuseTexture = OPAQUE_SPRITE_RENDERING.useAlphaFromDiffuseTexture;
    this.material.transparencyMode = OPAQUE_SPRITE_RENDERING.transparencyMode;
    this.material.alphaCutOff = OPAQUE_SPRITE_RENDERING.alphaCutOff;
    this.material.forceDepthWrite = OPAQUE_SPRITE_RENDERING.forceDepthWrite;
    this.material.backFaceCulling = false;
    this.material.disableLighting = OPAQUE_SPRITE_RENDERING.disableLighting;
    this.mesh.material = this.material;
    if (IS_STATIC_DEMO) {
      const color = Color3.FromHexString(STATIC_SPRITE_COLORS[this.kind]);
      this.material.diffuseColor = color;
      this.material.emissiveColor = color;
      this.material.transparencyMode = Material.MATERIAL_OPAQUE;
    } else {
      this.applySheet("idle");
    }
  }

  update(deltaSeconds: number, x: number, y: number, z: number, suggestedAction: SpriteAction) {
    const dx = this.lastX === null ? 0 : x - this.lastX;
    const dz = this.lastZ === null ? 0 : z - this.lastZ;
    this.direction = selectSpriteDirection(dx, dz, this.direction);
    this.lastX = x;
    this.lastZ = z;
    const now = performance.now();
    const action = this.forcedAction && now < this.forcedUntil ? this.forcedAction : suggestedAction;
    if (action !== this.action) {
      this.action = action;
      this.elapsed = 0;
      this.applySheet(action);
    } else {
      this.elapsed += deltaSeconds;
    }
    if (this.forcedAction && now >= this.forcedUntil) this.forcedAction = null;
    const sheet = this.sheet(this.action);
    const texture = this.textures.get(this.action);
    if (texture) {
      texture.uOffset = selectSpriteFrame(this.elapsed, sheet.fps, sheet.columns, sheet.loop) / sheet.columns;
      const rowUv = selectSpriteRowUv(this.direction);
      texture.vOffset = rowUv.vOffset;
    }
    this.mesh.position.set(x, y, z);
  }

  play(action: SpriteAction) {
    const sheet = this.sheet(action);
    this.forcedAction = action;
    this.forcedUntil = performance.now() + (sheet.columns / sheet.fps) * 1000;
    this.action = action;
    this.elapsed = 0;
    this.applySheet(action);
  }

  setVisible(visible: boolean) {
    this.mesh.isVisible = visible;
  }

  dispose() {
    this.textures.forEach((texture) => texture.dispose());
    this.material.dispose();
    this.mesh.dispose();
  }

  private sheet(action: SpriteAction) {
    return spriteSheets[this.kind][action] ?? spriteSheets[this.kind].idle!;
  }

  private applySheet(action: SpriteAction) {
    if (IS_STATIC_DEMO) return;
    const sheet = this.sheet(action);
    let texture = this.textures.get(action);
    if (!texture) {
      texture = new Texture(sheet.url, this.scene, false, false, Texture.NEAREST_SAMPLINGMODE);
      texture.hasAlpha = true;
      texture.wrapU = Texture.CLAMP_ADDRESSMODE;
      texture.wrapV = Texture.CLAMP_ADDRESSMODE;
      texture.uScale = 1 / sheet.columns;
      texture.vScale = selectSpriteRowUv("south").vScale;
      this.textures.set(action, texture);
    }
    this.material.diffuseTexture = texture;
    this.material.emissiveTexture = texture;
  }
}
