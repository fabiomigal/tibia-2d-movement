import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";
import { getTileAsset } from "../tilemap/catalog";
import { getZaoMapFeatures, type ZaoMapFeature, type ZaoMapFeatureKind } from "./zaoMapLayout";

const WORLD_WIDTH = 48;
const WORLD_HEIGHT = 34;
const GROUND_LEVEL = 0.018;

export type WorldTileAssetId = "grass" | "dirt" | "water" | "stone" | "wall";

type TilePatch = {
  id: string;
  assetId: WorldTileAssetId;
  x: number;
  z: number;
  width: number;
  height: number;
  rotation?: number;
  tone?: string;
  level: number;
};

/** Zonas somente visuais. A geometria física continua inteiramente em zaoMapLayout.ts. */
const VISUAL_ZONES: readonly TilePatch[] = [
  { id: "amber-city-plaza", assetId: "stone", x: -5.35, z: -3.42, width: 5.35, height: 4.6, tone: "#F2D39A", level: 0.022 },
  { id: "amber-city-west-court", assetId: "stone", x: -8.9, z: -3.38, width: 2.55, height: 8.75, tone: "#D9C49A", level: 0.021 },
  { id: "amber-city-riverside-lawn", assetId: "grass", x: -0.08, z: -3.48, width: 2.25, height: 10.5, tone: "#A9B970", level: 0.019 },
  { id: "amber-city-south-garden", assetId: "grass", x: -7.7, z: -7.45, width: 11.1, height: 2.25, tone: "#93A860", level: 0.019 },
  { id: "wind-road-forest-floor", assetId: "grass", x: 4.95, z: 9.3, width: 16.8, height: 11.9, tone: "#819A58", level: 0.019 },
  { id: "wind-road-west-grove", assetId: "grass", x: -2.25, z: 9.85, width: 6.2, height: 7.5, tone: "#6D8750", level: 0.02 },
  { id: "wind-road-east-grove", assetId: "grass", x: 12.6, z: 9.6, width: 5.6, height: 8.1, tone: "#708B4D", level: 0.02 },
  { id: "wind-road-south-clearing", assetId: "dirt", x: 5.1, z: 3.68, width: 14.75, height: 2.05, tone: "#D3AB69", level: 0.024 },
];

const DECORATIONS = [
  { assetId: "tree", x: -14.95, z: -7.45, scale: 1.08 },
  { assetId: "oak", x: -13.75, z: -7.15, scale: 0.95 },
  { assetId: "bush", x: -12.4, z: 0.22, scale: 0.72 },
  { assetId: "tree", x: -11.85, z: 0.3, scale: 0.98 },
  { assetId: "oak", x: -8.55, z: -1.85, scale: 0.94 },
  { assetId: "bush", x: -8.68, z: -5.55, scale: 0.72 },
  { assetId: "tree", x: -2.05, z: -5.55, scale: 0.9 },
  { assetId: "bush", x: -1.18, z: -1.18, scale: 0.66 },
  { assetId: "oak", x: 0.62, z: -3.28, scale: 0.76 },
  { assetId: "tree", x: -1.38, z: 10.85, scale: 1.08 },
  { assetId: "oak", x: -0.78, z: 11.35, scale: 0.9 },
  { assetId: "bush", x: -1.72, z: 9.95, scale: 0.7 },
  { assetId: "tree", x: 11.1, z: 10.62, scale: 1.12 },
  { assetId: "oak", x: 12.75, z: 13.22, scale: 1.02 },
  { assetId: "tree", x: 13.05, z: 10.82, scale: 0.88 },
  { assetId: "bush", x: 12.15, z: 9.78, scale: 0.68 },
  { assetId: "bush", x: 0.48, z: 6.1, scale: 0.61 },
  { assetId: "bush", x: 13.08, z: 5.72, scale: 0.61 },
] as const;

export function resolveWorldTileAsset(kind: ZaoMapFeatureKind): WorldTileAssetId {
  switch (kind) {
    case "water": return "water";
    case "road": return "dirt";
    case "bridge": return "stone";
    case "wall": return "wall";
    case "structure":
    case "tower":
    case "gate": return "wall";
    case "cliff": return "stone";
  }
}

export function getZaoWorldTileFeatures(): Array<ZaoMapFeature & { assetId: WorldTileAssetId }> {
  return (["bamboo-forest", "wind-road"] as const)
    .flatMap((subarea) => getZaoMapFeatures(subarea))
    .map((feature) => ({ ...feature, assetId: resolveWorldTileAsset(feature.kind) }));
}

export function getZaoWorldVisualZones() {
  return [...VISUAL_ZONES];
}

function createTileMaterial(scene: Scene, assetId: string, name: string, materialCache: Map<string, StandardMaterial>, tone = "#FFFFFF") {
  const cacheKey = `${assetId}:${tone}`;
  const cached = materialCache.get(cacheKey);
  if (cached) return cached;
  const asset = getTileAsset(assetId);
  if (!asset) throw new Error(`Tile do mundo não encontrado: ${assetId}`);
  const texture = new Texture(asset.localFilename, scene, false, false, Texture.NEAREST_SAMPLINGMODE);
  texture.hasAlpha = true;
  texture.wrapU = Texture.WRAP_ADDRESSMODE;
  texture.wrapV = Texture.WRAP_ADDRESSMODE;
  const material = new StandardMaterial(`${name}-${assetId}-material`, scene);
  const tint = Color3.FromHexString(tone);
  material.diffuseTexture = texture;
  material.emissiveTexture = texture;
  material.diffuseColor = tint;
  material.emissiveColor = tint;
  material.specularColor = Color3.Black();
  material.useAlphaFromDiffuseTexture = true;
  material.backFaceCulling = false;
  material.disableLighting = true;
  materialCache.set(cacheKey, material);
  return material;
}

function createTilePatch(scene: Scene, feature: TilePatch, materialCache: Map<string, StandardMaterial>) {
  const columns = Math.max(1, Math.round(feature.width));
  const rows = Math.max(1, Math.round(feature.height));
  const tileWidth = feature.width / columns;
  const tileHeight = feature.height / rows;
  const material = createTileMaterial(scene, feature.assetId, `world-tile-${feature.id}`, materialCache, feature.tone);
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const tile = MeshBuilder.CreateGround(`world-tile-${feature.id}-${column}-${row}`, { width: tileWidth + 0.012, height: tileHeight + 0.012 }, scene);
      tile.position.set(feature.x + (column + 0.5 - columns / 2) * tileWidth, GROUND_LEVEL + feature.level, feature.z + (row + 0.5 - rows / 2) * tileHeight);
      tile.rotation.y = feature.rotation ?? 0;
      tile.material = material;
      tile.isPickable = false;
    }
  }
}

function getFeatureTileLevel(kind: ZaoMapFeatureKind) {
  switch (kind) {
    case "water": return 0.024;
    case "road": return 0.033;
    case "bridge": return 0.045;
    case "wall":
    case "structure":
    case "tower":
    case "gate":
    case "cliff": return 0.052;
  }
}

/** Renderização jogável em tiles: camadas distinguem cidade, rio, estrada e floresta sem backdrop. */
export function createZaoTileWorld(scene: Scene) {
  const materialCache = new Map<string, StandardMaterial>();
  const grassMaterial = createTileMaterial(scene, "grass", "world-ground", materialCache);
  const grassTexture = grassMaterial.diffuseTexture as Texture;
  grassTexture.uScale = WORLD_WIDTH;
  grassTexture.vScale = WORLD_HEIGHT;
  const ground = MeshBuilder.CreateGround("walkable-grass", { width: WORLD_WIDTH, height: WORLD_HEIGHT, subdivisions: 2 }, scene);
  ground.position.y = GROUND_LEVEL;
  ground.material = grassMaterial;
  ground.isPickable = true;

  getZaoWorldVisualZones().forEach((zone) => createTilePatch(scene, zone, materialCache));
  getZaoWorldTileFeatures().forEach((feature) => createTilePatch(scene, { ...feature, level: getFeatureTileLevel(feature.kind) }, materialCache));
  DECORATIONS.forEach((decoration, index) => {
    const tile = MeshBuilder.CreatePlane(`world-decoration-${index}`, { width: decoration.scale, height: decoration.scale }, scene);
    tile.position.set(decoration.x, GROUND_LEVEL + 0.075, decoration.z);
    tile.rotation.x = Math.PI / 2;
    tile.material = createTileMaterial(scene, decoration.assetId, "world-decoration", materialCache);
    tile.isPickable = false;
  });
}
