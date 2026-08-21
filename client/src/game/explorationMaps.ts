import type { Scene } from "@babylonjs/core/scene";
import type { CollisionWorld } from "./CollisionWorld";
import { createCleanFieldGrid, type CleanFieldFamily } from "./zaoTileWorld";

type MapDefinition = { id: string; label: string; x: number; z: number; width: number; height: number; fieldFamily: CleanFieldFamily };

export const EXPLORATION_MAPS: readonly MapDefinition[] = [
  { id: "amber-inn", label: "Estalagem do Âmbar", x: -18.2, z: 12.6, width: 7.2, height: 6.1, fieldFamily: "inn-garden" },
  { id: "moon-sanctuary", label: "Santuário da Lua", x: 18.2, z: -11.8, width: 8.6, height: 7.1, fieldFamily: "moon-clearing" },
];

/** Constrói espaços distantes fisicamente para permitir transição sem alterar o núcleo de movimento ou câmera. */
export function createExplorationMaps(scene: Scene, collision: CollisionWorld) {
  const [inn, sanctuary] = EXPLORATION_MAPS;
  if (!inn || !sanctuary) return;

  createCleanFieldGrid(scene, { id: "amber-inn-clean-field", family: inn.fieldFamily, x: inn.x, z: inn.z, width: inn.width, height: inn.height, level: 0.041 });
  const innLeft = inn.x - inn.width / 2;
  const innRight = inn.x + inn.width / 2;
  const innTop = inn.z - inn.height / 2;
  const innBottom = inn.z + inn.height / 2;
  collision.addRectangle(innLeft - 0.18, innRight + 0.18, innTop - 0.18, innTop + 0.18);
  collision.addRectangle(innLeft - 0.18, innRight + 0.18, innBottom - 0.18, innBottom + 0.18);
  collision.addRectangle(innLeft - 0.18, innLeft + 0.18, innTop - 0.18, innBottom + 0.18);
  collision.addRectangle(innRight - 0.18, innRight + 0.18, innTop - 0.18, innBottom + 0.18);

  createCleanFieldGrid(scene, { id: "moon-sanctuary-clean-field", family: sanctuary.fieldFamily, x: sanctuary.x, z: sanctuary.z, width: sanctuary.width, height: sanctuary.height, level: 0.041 });
  const sanctuaryLeft = sanctuary.x - sanctuary.width / 2;
  const sanctuaryRight = sanctuary.x + sanctuary.width / 2;
  const sanctuaryTop = sanctuary.z - sanctuary.height / 2;
  const sanctuaryBottom = sanctuary.z + sanctuary.height / 2;
  collision.addRectangle(sanctuaryLeft - 0.15, sanctuaryRight + 0.15, sanctuaryTop - 0.15, sanctuaryTop + 0.15);
  collision.addRectangle(sanctuaryLeft - 0.15, sanctuaryRight + 0.15, sanctuaryBottom - 0.15, sanctuaryBottom + 0.15);
  collision.addRectangle(sanctuaryLeft - 0.15, sanctuaryLeft + 0.15, sanctuaryTop - 0.15, sanctuaryBottom + 0.15);
  collision.addRectangle(sanctuaryRight - 0.15, sanctuaryRight + 0.15, sanctuaryTop - 0.15, sanctuaryBottom + 0.15);
}
