import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";

const WORLD_WIDTH = 48;
const WORLD_HEIGHT = 34;
/** Acima de qualquer plano legado: a grade é a única superfície visual do mapa. */
const GROUND_LEVEL = 0.075;
const ATLAS_COLUMNS = 5;
const IS_STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === "true";

export type CleanFieldFamily = "amber-meadow" | "wind-trail" | "inn-garden" | "moon-clearing";

/** Atlases horizontais de cinco tiles de chão, sem objetos, paredes, água profunda ou estruturas. */
export const CLEAN_FIELD_ATLAS_URLS: Readonly<Record<CleanFieldFamily, string>> = {
  "amber-meadow": "/manus-storage/amber-meadow-atlas_9c669b22.png",
  "wind-trail": "/manus-storage/wind-trail-atlas_2727f147.png",
  "inn-garden": "/manus-storage/inn-garden-atlas_4d8b2099.png",
  "moon-clearing": "/manus-storage/moon-clearing-atlas_b5f9ac1e.png",
};

/** Cópias da release incluídas no artefato estático, respeitando o subdiretório do GitHub Pages. */
export const CLEAN_FIELD_STATIC_ATLAS_URLS: Readonly<Record<CleanFieldFamily, string>> = {
  "amber-meadow": `${import.meta.env.BASE_URL}tiles/clean-field/amber-meadow-atlas.png`,
  "wind-trail": `${import.meta.env.BASE_URL}tiles/clean-field/wind-trail-atlas.png`,
  "inn-garden": `${import.meta.env.BASE_URL}tiles/clean-field/inn-garden-atlas.png`,
  "moon-clearing": `${import.meta.env.BASE_URL}tiles/clean-field/moon-clearing-atlas.png`,
};

function atlasUrl(family: CleanFieldFamily) {
  return IS_STATIC_DEMO ? CLEAN_FIELD_STATIC_ATLAS_URLS[family] : CLEAN_FIELD_ATLAS_URLS[family];
}

export type CleanFieldGridProfile = {
  id: string;
  family: CleanFieldFamily;
  x: number;
  z: number;
  width: number;
  height: number;
  level?: number;
};

/** Cada perfil mantém a identidade de área por meio do chão, e não por construções ou objetos. */
export const CLEAN_FIELD_GRID_PROFILES: readonly CleanFieldGridProfile[] = [
  { id: "amber-city-clean-field", family: "amber-meadow", x: -12, z: 0, width: 24, height: WORLD_HEIGHT },
  { id: "wind-road-clean-field", family: "wind-trail", x: 12, z: 0, width: 24, height: WORLD_HEIGHT },
  { id: "amber-inn-clean-field", family: "inn-garden", x: -18.2, z: 12.6, width: 7.2, height: 6.1, level: 0.041 },
  { id: "moon-sanctuary-clean-field", family: "moon-clearing", x: 18.2, z: -11.8, width: 8.6, height: 7.1, level: 0.041 },
];

export function getCleanFieldGridProfiles() {
  return [...CLEAN_FIELD_GRID_PROFILES];
}

function materialForTile(scene: Scene, family: CleanFieldFamily, tileIndex: number, cache: Map<string, StandardMaterial>) {
  const key = `${family}:${tileIndex}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const material = new StandardMaterial(`clean-field-${key}`, scene);
  const texture = new Texture(atlasUrl(family), scene, false, false, Texture.NEAREST_SAMPLINGMODE);
  texture.uScale = 1 / ATLAS_COLUMNS;
  texture.uOffset = tileIndex / ATLAS_COLUMNS;
  texture.vScale = -1;
  texture.vOffset = 1;
  texture.wrapU = Texture.CLAMP_ADDRESSMODE;
  texture.wrapV = Texture.CLAMP_ADDRESSMODE;
  texture.hasAlpha = false;
  material.diffuseTexture = texture;
  material.emissiveTexture = texture;
  material.specularColor.set(0, 0, 0);
  material.disableLighting = true;
  material.backFaceCulling = false;
  cache.set(key, material);
  return material;
}

/** Cria uma grade visual de chão. Nenhum objeto de mapa, parede, ponte, muro ou casa é produzido. */
export function createCleanFieldGrid(scene: Scene, profile: CleanFieldGridProfile, materialCache = new Map<string, StandardMaterial>()) {
  const columns = Math.max(1, Math.round(profile.width));
  const rows = Math.max(1, Math.round(profile.height));
  const tileWidth = profile.width / columns;
  const tileHeight = profile.height / rows;
  const level = profile.level ?? GROUND_LEVEL;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const tileIndex = (column * 3 + row * 2 + (profile.id.length % ATLAS_COLUMNS)) % ATLAS_COLUMNS;
      const tile = MeshBuilder.CreateGround(`clean-field-${profile.id}-${column}-${row}`, { width: tileWidth + 0.008, height: tileHeight + 0.008 }, scene);
      tile.position.set(profile.x + (column + 0.5 - columns / 2) * tileWidth, level, profile.z + (row + 0.5 - rows / 2) * tileHeight);
      tile.material = materialForTile(scene, profile.family, tileIndex, materialCache);
      tile.isPickable = true;
    }
  }
}

/** Reconstrói o exterior como duas grades limpas: Campo de Âmbar e Estrada dos Ventos. */
export function createZaoTileWorld(scene: Scene) {
  const cache = new Map<string, StandardMaterial>();
  CLEAN_FIELD_GRID_PROFILES
    .filter((profile) => profile.id === "amber-city-clean-field" || profile.id === "wind-road-clean-field")
    .forEach((profile) => createCleanFieldGrid(scene, profile, cache));
}
