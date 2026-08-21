import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";
import { getZaoMapFeatures, type ZaoMapFeature, type ZaoMapFeatureKind } from "./zaoMapLayout";

const WORLD_WIDTH = 48;
const WORLD_HEIGHT = 34;
const GROUND_LEVEL = 0.018;
export type WorldSolidSurfaceId = "solid-grass" | "solid-grove" | "solid-road" | "solid-water" | "solid-stone" | "solid-wall";

/** Paleta temporária sem texturas: separa regiões e preserva a leitura do mapa após a limpeza dos tiles. */
export const WORLD_SOLID_SURFACE_COLORS: Readonly<Record<WorldSolidSurfaceId, string>> = {
  "solid-grass": "#4F7A43",
  "solid-grove": "#35613D",
  "solid-road": "#B9874C",
  "solid-water": "#3B8798",
  "solid-stone": "#667083",
  "solid-wall": "#3E4859",
};

type TilePatch = {
  id: string;
  surfaceId: WorldSolidSurfaceId;
  x: number;
  z: number;
  width: number;
  height: number;
  rotation?: number;
  level: number;
};

/** Zonas somente visuais. A geometria física continua inteiramente em zaoMapLayout.ts. */
const VISUAL_ZONES: readonly TilePatch[] = [
  { id: "amber-city-plaza", surfaceId: "solid-stone", x: -5.35, z: -3.42, width: 5.35, height: 4.6, level: 0.022 },
  { id: "amber-city-west-court", surfaceId: "solid-stone", x: -8.9, z: -3.38, width: 2.55, height: 8.75, level: 0.021 },
  { id: "amber-city-riverside-lawn", surfaceId: "solid-grass", x: -0.08, z: -3.48, width: 2.25, height: 10.5, level: 0.019 },
  { id: "amber-city-south-garden", surfaceId: "solid-grove", x: -7.7, z: -7.45, width: 11.1, height: 2.25, level: 0.019 },
  { id: "wind-road-forest-floor", surfaceId: "solid-grass", x: 4.95, z: 9.3, width: 16.8, height: 11.9, level: 0.019 },
  { id: "wind-road-west-grove", surfaceId: "solid-grove", x: -2.25, z: 9.85, width: 6.2, height: 7.5, level: 0.02 },
  { id: "wind-road-east-grove", surfaceId: "solid-grove", x: 12.6, z: 9.6, width: 5.6, height: 8.1, level: 0.02 },
  { id: "wind-road-south-clearing", surfaceId: "solid-road", x: 5.1, z: 3.68, width: 14.75, height: 2.05, level: 0.024 },
];

export function resolveWorldSolidSurface(kind: ZaoMapFeatureKind): WorldSolidSurfaceId {
  switch (kind) {
    case "water": return "solid-water";
    case "road": return "solid-road";
    case "bridge": return "solid-stone";
    case "wall": return "solid-wall";
    case "structure":
    case "tower":
    case "gate": return "solid-wall";
    case "cliff": return "solid-stone";
  }
}

export function getZaoWorldSolidFeatures(): Array<ZaoMapFeature & { surfaceId: WorldSolidSurfaceId }> {
  return (["bamboo-forest", "wind-road"] as const)
    .flatMap((subarea) => getZaoMapFeatures(subarea))
    .map((feature) => ({ ...feature, surfaceId: resolveWorldSolidSurface(feature.kind) }));
}

export function getZaoWorldVisualZones() {
  return [...VISUAL_ZONES];
}

function createSolidMaterial(scene: Scene, surfaceId: WorldSolidSurfaceId, name: string, materialCache: Map<string, StandardMaterial>) {
  const cacheKey = surfaceId;
  const cached = materialCache.get(cacheKey);
  if (cached) return cached;
  const material = new StandardMaterial(`${name}-${surfaceId}-material`, scene);
  const color = Color3.FromHexString(WORLD_SOLID_SURFACE_COLORS[surfaceId]);
  material.diffuseColor = color;
  material.emissiveColor = color;
  material.specularColor = Color3.Black();
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
  const material = createSolidMaterial(scene, feature.surfaceId, `world-surface-${feature.id}`, materialCache);
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

/** Superfícies sólidas temporárias: mantêm a leitura espacial enquanto as tiles e props são removidas do runtime. */
export function createZaoTileWorld(scene: Scene) {
  const materialCache = new Map<string, StandardMaterial>();
  const grassMaterial = createSolidMaterial(scene, "solid-grass", "world-ground", materialCache);
  const ground = MeshBuilder.CreateGround("walkable-grass", { width: WORLD_WIDTH, height: WORLD_HEIGHT, subdivisions: 2 }, scene);
  ground.position.y = GROUND_LEVEL;
  ground.material = grassMaterial;
  ground.isPickable = true;

  getZaoWorldVisualZones().forEach((zone) => createTilePatch(scene, zone, materialCache));
  getZaoWorldSolidFeatures().forEach((feature) => createTilePatch(scene, { ...feature, level: getFeatureTileLevel(feature.kind) }, materialCache));
}
