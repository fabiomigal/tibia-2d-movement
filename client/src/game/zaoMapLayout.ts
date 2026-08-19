import type { Scene } from "@babylonjs/core/scene";
import type { CollisionWorld } from "./CollisionWorld";

export type ZaoSubarea = "bamboo-forest" | "wind-road";
export type ZaoMapFeatureKind = "water" | "road" | "bridge" | "wall" | "structure" | "tower" | "cliff" | "gate";

export type ZaoMapBounds = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

export type ZaoMapFeature = {
  id: string;
  kind: ZaoMapFeatureKind;
  x: number;
  z: number;
  width: number;
  height: number;
  rotation?: number;
  blocksMovement?: boolean;
};

const CITY_BOUNDS: ZaoMapBounds = { minX: -16.4, maxX: 6, minZ: -9.9, maxZ: 2.7 };
const WIND_ROAD_BOUNDS: ZaoMapBounds = { minX: -6.1, maxX: 16.3, minZ: 2.7, maxZ: 15.3 };

export const ZAO_MAP_LAYOUT = {
  city: {
    label: "Cidade de Âmbar",
    center: { x: -5.2, z: -3.6 },
    riverX: -1.15,
    bounds: CITY_BOUNDS,
  },
  windRoad: {
    label: "Estrada dos Ventos",
    fromZ: 1.5,
    toZ: 15.1,
    gate: { x: 5.1, z: 13.6 },
    bounds: WIND_ROAD_BOUNDS,
  },
} as const;

const CITY_FEATURES: readonly ZaoMapFeature[] = [
  { id: "city-river-south", kind: "water", x: -1.15, z: -7.22, width: 1.28, height: 5.35, blocksMovement: true },
  { id: "city-river-north", kind: "water", x: -1.15, z: -0.18, width: 1.28, height: 5.76, blocksMovement: true },
  { id: "city-bridge", kind: "bridge", x: -1.15, z: -3.88, width: 2.3, height: 1.3 },
  { id: "city-east-avenue", kind: "road", x: -4.95, z: -3.45, width: 21.1, height: 1.1 },
  { id: "city-west-road", kind: "road", x: -8.35, z: -3.15, width: 1.15, height: 10.8 },
  { id: "city-north-road", kind: "road", x: -7.1, z: 0.52, width: 1.05, height: 4.4 },
  { id: "city-northwest-lodge", kind: "structure", x: -12.05, z: 0.2, width: 2.35, height: 1.75, blocksMovement: true },
  { id: "city-west-house", kind: "structure", x: -8.55, z: -1.85, width: 2.25, height: 1.72, blocksMovement: true },
  { id: "city-southwest-house", kind: "structure", x: -8.72, z: -5.55, width: 1.95, height: 1.72, blocksMovement: true },
  { id: "city-east-house", kind: "structure", x: -1.22, z: -1.18, width: 1.82, height: 1.52, blocksMovement: true },
  { id: "city-market", kind: "structure", x: 0.62, z: -3.28, width: 1.62, height: 1.35, blocksMovement: true },
  { id: "city-southeast-hall", kind: "structure", x: -2.05, z: -5.55, width: 2.38, height: 1.92, blocksMovement: true },
  { id: "city-north-wall", kind: "wall", x: -7.9, z: 1.05, width: 2.25, height: 0.46, blocksMovement: true },
  { id: "city-west-wall", kind: "wall", x: -10.5, z: -3.48, width: 0.46, height: 2.8, blocksMovement: true },
  { id: "city-east-wall", kind: "wall", x: 0.65, z: -5.12, width: 0.46, height: 2.8, blocksMovement: true },
  { id: "city-west-cliff", kind: "cliff", x: -14.25, z: -6.85, width: 2.75, height: 2.15, blocksMovement: true },
  { id: "city-east-cliff", kind: "cliff", x: 3.35, z: -6.9, width: 2.25, height: 2.2, blocksMovement: true },
];

const WIND_ROAD_FEATURES: readonly ZaoMapFeature[] = [
  { id: "wind-river-south", kind: "water", x: 6.65, z: 3.82, width: 1.3, height: 2.24, blocksMovement: true },
  { id: "wind-river-north", kind: "water", x: 6.65, z: 10.68, width: 1.3, height: 9.26, blocksMovement: true },
  { id: "wind-bridge", kind: "bridge", x: 6.65, z: 5.5, width: 2.45, height: 1.1 },
  { id: "wind-main-road", kind: "road", x: 4.95, z: 9.05, width: 1.78, height: 12.05 },
  { id: "wind-south-road", kind: "road", x: 2.85, z: 3.52, width: 6.4, height: 0.96, rotation: -0.13 },
  { id: "wind-east-road", kind: "road", x: 11.2, z: 3.72, width: 6.25, height: 0.92, rotation: 0.13 },
  { id: "wind-west-palisade", kind: "wall", x: 1.35, z: 7.35, width: 0.52, height: 3.62, blocksMovement: true },
  { id: "wind-east-palisade", kind: "wall", x: 11.62, z: 6.9, width: 0.52, height: 3.4, blocksMovement: true },
  { id: "wind-west-tower", kind: "tower", x: 0.48, z: 6.1, width: 1.28, height: 1.28, blocksMovement: true },
  { id: "wind-east-tower", kind: "tower", x: 13.08, z: 5.72, width: 1.3, height: 1.3, blocksMovement: true },
  { id: "wind-southwest-tower", kind: "tower", x: -4.72, z: 3.28, width: 1.26, height: 1.26, blocksMovement: true },
  { id: "wind-southeast-tower", kind: "tower", x: 13.95, z: 3.18, width: 1.26, height: 1.26, blocksMovement: true },
  { id: "wind-north-gate", kind: "gate", x: 5.05, z: 14.1, width: 2.25, height: 1.15, blocksMovement: true },
  { id: "wind-west-cliff", kind: "cliff", x: -1.38, z: 10.85, width: 2.35, height: 2.65, blocksMovement: true },
  { id: "wind-east-cliff", kind: "cliff", x: 11.1, z: 10.62, width: 2.72, height: 2.6, blocksMovement: true },
  { id: "wind-northeast-cliff", kind: "cliff", x: 12.75, z: 13.22, width: 2.2, height: 2.3, blocksMovement: true },
];

/** Resolve a subárea ativa do mapa contínuo para o HUD e o minimapa. */
export function resolveZaoSubarea(_x: number, z: number): ZaoSubarea {
  return z >= ZAO_MAP_LAYOUT.windRoad.fromZ ? "wind-road" : "bamboo-forest";
}

/** Fonte única para a miniatura e para os obstáculos físicos do cenário. */
export function getZaoMapFeatures(subarea: ZaoSubarea) {
  return subarea === "wind-road" ? WIND_ROAD_FEATURES : CITY_FEATURES;
}

export function getZaoMapBounds(subarea: ZaoSubarea) {
  return subarea === "wind-road" ? WIND_ROAD_BOUNDS : CITY_BOUNDS;
}

export function projectZaoMapPoint(subarea: ZaoSubarea, x: number, z: number) {
  const bounds = getZaoMapBounds(subarea);
  const horizontalSpan = bounds.maxX - bounds.minX;
  const verticalSpan = bounds.maxZ - bounds.minZ;
  return {
    left: Math.min(96, Math.max(4, ((x - bounds.minX) / horizontalSpan) * 100)),
    top: Math.min(96, Math.max(4, ((bounds.maxZ - z) / verticalSpan) * 100)),
  };
}

function addMapCollision(collision: CollisionWorld) {
  [CITY_FEATURES, WIND_ROAD_FEATURES]
    .flat()
    .filter((feature) => feature.blocksMovement)
    .forEach((feature) => {
      collision.addRectangle(
        feature.x - feature.width / 2,
        feature.x + feature.width / 2,
        feature.z - feature.height / 2,
        feature.z + feature.height / 2,
      );
    });
}

/** Os colisores permanecem derivados da geometria declarativa; a renderização é feita em `zaoTileWorld`. */
export function createZaoInitialMaps(_scene: Scene, collision: CollisionWorld) {
  addMapCollision(collision);
}
