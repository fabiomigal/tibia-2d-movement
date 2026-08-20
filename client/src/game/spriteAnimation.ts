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

type SpriteDirection = "south" | "southwest" | "west" | "northwest" | "north" | "northeast" | "east" | "southeast";
type SpriteDirectionRows = Readonly<Partial<Record<SpriteDirection, number>>>;
type SpriteSheet = { url: string; columns: number; fps: number; loop: boolean; rows?: number; directionRows?: SpriteDirectionRows; columnStart?: number; frameColumns?: number };

/** Alturas em unidades de mundo: 1 tile = 1u; recalibradas para a leitura do novo cenário em grade. */
export const ZAO_SPRITE_SIZE: Record<SpriteActorKind, number> = {
  adventurer: 1.12,
  goblin: 2.18,
  boar: 2.36,
};
const IS_STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === "true";
const STATIC_SPRITE_COLORS: Record<SpriteActorKind, string> = {
  adventurer: "#f2b84b",
  goblin: "#87a85a",
  boar: "#b99064",
};

const CARDINAL_DIRECTION_ROWS: SpriteDirectionRows = { south: 0, east: 1, north: 2, west: 3 };
/** O atlas CC0 de TheNess usa 6 colunas e 8 linhas, com diagonais após as direções cardinais. */
export const ADVENTURER_OGA_SPRITE_URL = "/manus-storage/sprite_oga_f4502ba6.png";
export const ADVENTURER_OGA_DIRECTION_ROWS: SpriteDirectionRows = {
  south: 0,
  west: 1,
  north: 2,
  east: 3,
  southwest: 4,
  northwest: 5,
  northeast: 6,
  southeast: 7,
};
const OGA_ADVENTURER_BASE_SHEET = {
  url: ADVENTURER_OGA_SPRITE_URL,
  columns: 6,
  rows: 8,
  directionRows: ADVENTURER_OGA_DIRECTION_ROWS,
} as const;

const spriteSheets: Record<SpriteActorKind, Partial<Record<SpriteAction, SpriteSheet>>> = {
  adventurer: {
    idle: { ...OGA_ADVENTURER_BASE_SHEET, fps: 4, loop: true, frameColumns: 4 },
    walk: { ...OGA_ADVENTURER_BASE_SHEET, fps: 8, loop: true, frameColumns: 4 },
    attack: { ...OGA_ADVENTURER_BASE_SHEET, fps: 10, loop: false, frameColumns: 4 },
    hit: { ...OGA_ADVENTURER_BASE_SHEET, fps: 9, loop: false, columnStart: 1, frameColumns: 1 },
    death: { ...OGA_ADVENTURER_BASE_SHEET, fps: 1, loop: false, columnStart: 2, frameColumns: 1 },
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

/** Recorte UV com eixo V invertido para manter o topo do PNG como topo visual no terreno. */
export function selectSpriteRowUv(direction: SpriteDirection, rows = 4, directionRows: SpriteDirectionRows = CARDINAL_DIRECTION_ROWS) {
  const cardinalFallback: Record<SpriteDirection, "south" | "east" | "north" | "west"> = {
    south: "south", southwest: "west", west: "west", northwest: "west", north: "north", northeast: "east", east: "east", southeast: "east",
  };
  const row = directionRows[direction] ?? directionRows[cardinalFallback[direction]] ?? 0;
  return { vOffset: (row + 1) / rows, vScale: -1 / rows };
}

export function selectSpriteFrame(elapsedSeconds: number, fps: number, columns: number, loop: boolean) {
  const rawFrame = Math.max(0, Math.floor(elapsedSeconds * fps));
  return loop ? rawFrame % columns : Math.min(columns - 1, rawFrame);
}

/** Retorna o recorte horizontal de um estado em atlas que pode reservar colunas exclusivas para ataque. */
export function selectSpriteFrameUv(elapsedSeconds: number, fps: number, frameColumns: number, loop: boolean, atlasColumns: number, columnStart = 0) {
  return { uOffset: (columnStart + selectSpriteFrame(elapsedSeconds, fps, frameColumns, loop)) / atlasColumns, uScale: 1 / atlasColumns };
}

export function selectSpriteDirection(deltaX: number, deltaZ: number, fallback: SpriteDirection = "south"): SpriteDirection {
  if (Math.abs(deltaX) < 0.0001 && Math.abs(deltaZ) < 0.0001) return fallback;
  const horizontal = Math.abs(deltaX);
  const vertical = Math.abs(deltaZ);
  if (horizontal > vertical * 2) return deltaX > 0 ? "east" : "west";
  if (vertical > horizontal * 2) return deltaZ > 0 ? "south" : "north";
  if (deltaX > 0) return deltaZ > 0 ? "southeast" : "northeast";
  return deltaZ > 0 ? "southwest" : "northwest";
}

/** Camada visual independente da lógica de movimento: recorta atlas 4×N ou 8×N em um plano horizontal do mundo. */
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
      const frameUv = selectSpriteFrameUv(this.elapsed, sheet.fps, sheet.frameColumns ?? sheet.columns, sheet.loop, sheet.columns, sheet.columnStart);
      texture.uOffset = frameUv.uOffset;
      const rowUv = selectSpriteRowUv(this.direction, sheet.rows ?? 4, sheet.directionRows);
      texture.vOffset = rowUv.vOffset;
    }
    this.mesh.position.set(x, y, z);
  }

  play(action: SpriteAction) {
    const sheet = this.sheet(action);
    this.forcedAction = action;
    this.forcedUntil = performance.now() + ((sheet.frameColumns ?? sheet.columns) / sheet.fps) * 1000;
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
      texture.vScale = selectSpriteRowUv("south", sheet.rows ?? 4, sheet.directionRows).vScale;
      this.textures.set(action, texture);
    }
    this.material.diffuseTexture = texture;
    this.material.emissiveTexture = texture;
  }
}
