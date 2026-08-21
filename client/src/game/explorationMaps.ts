import type { Scene } from "@babylonjs/core/scene";
import type { CollisionWorld } from "./CollisionWorld";

type MapDefinition = { id: string; label: string; x: number; z: number; width: number; height: number; tone: string };

/** Metadados preservados para as transições de área, sem paredes, props ou pisos sobrepostos. */
export const EXPLORATION_MAPS: readonly MapDefinition[] = [
  { id: "amber-inn", label: "Estalagem do Âmbar", x: -18.2, z: 12.6, width: 7.2, height: 6.1, tone: "#8294B0" },
];

/** As duas áreas usam o mesmo campo global, portanto não instalam objetos nem colisores próprios. */
export function createExplorationMaps(_scene: Scene, _collision: CollisionWorld) {
  // As posições e os destinos continuam descritos em EXPLORATION_MAPS.
}
