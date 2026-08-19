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

const DECORATIONS = [
  { assetId: "tree", x: -14.9, z: -7.45, scale: 1.08 },
  { assetId: "oak", x: -12.4, z: 1.7, scale: 1.2 },
  { assetId: "bush", x: -6.1, z: -7.2, scale: 0.72 },
  { assetId: "tree", x: 10.5, z: 10.85, scale: 1.12 },
  { assetId: "oak", x: 14.7, z: 12.65, scale: 1.06 },
  { assetId: "bush", x: 8.85, z: 2.8, scale: 0.72 },
] as const;

export type WorldTileAssetId = "grass" | "dirt" | "water" | "stone" | "wall";

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

function createTileMaterial(scene: Scene, assetId: string, name: string, materialCache: Map<string, StandardMaterial>) {
  const cached = materialCache.get(assetId);
  if (cached) return cached;
  const asset = getTileAsset(assetId);
  if (!asset) throw new Error(`Tile do mundo não encontrado: ${assetId}`);
  const texture = new Texture(asset.localFilename, scene, false, false, Texture.NEAREST_SAMPLINGMODE);
  texture.hasAlpha = true;
  texture.wrapU = Texture.WRAP_ADDRESSMODE;
  texture.wrapV = Texture.WRAP_ADDRESSMODE;
  const material = new StandardMaterial(`${name}-${assetId}-material`, scene);
  material.diffuseTexture = texture;
  material.emissiveTexture = texture;
  material.diffuseColor = Color3.White();
  material.emissiveColor = Color3.White();
  material.specularColor = Color3.Black();
  material.useAlphaFromDiffuseTexture = true;
  material.backFaceCulling = false;
  material.disableLighting = true;
  materialCache.set(assetId, material);
  return material;
}

function createTilePatch(scene: Scene, feature: ZaoMapFeature & { assetId: WorldTileAssetId }, materialCache: Map<string, StandardMaterial>) {
  const columns = Math.max(1, Math.round(feature.width));
  const rows = Math.max(1, Math.round(feature.height));
  const tileWidth = feature.width / columns;
  const tileHeight = feature.height / rows;
  const material = createTileMaterial(scene, feature.assetId, `world-tile-${feature.id}`, materialCache);
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const tile = MeshBuilder.CreateGround(`world-tile-${feature.id}-${column}-${row}`, { width: tileWidth + 0.012, height: tileHeight + 0.012 }, scene);
      tile.position.set(feature.x + (column + 0.5 - columns / 2) * tileWidth, GROUND_LEVEL + 0.006 + (feature.kind === "water" ? 0.002 : 0), feature.z + (row + 0.5 - rows / 2) * tileHeight);
      tile.rotation.y = feature.rotation ?? 0;
      tile.material = material;
      tile.isPickable = false;
    }
  }
}

/** Renderização jogável em tiles: as referências Zao orientam a composição, mas nenhuma imagem de backdrop é usada. */
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

  getZaoWorldTileFeatures().forEach((feature) => createTilePatch(scene, feature, materialCache));
  DECORATIONS.forEach((decoration, index) => {
    const tile = MeshBuilder.CreatePlane(`world-decoration-${index}`, { width: decoration.scale, height: decoration.scale }, scene);
    tile.position.set(decoration.x, GROUND_LEVEL + 0.025, decoration.z);
    tile.rotation.x = Math.PI / 2;
    tile.material = createTileMaterial(scene, decoration.assetId, "world-decoration", materialCache);
    tile.isPickable = false;
  });
}
