import type { CombatFloatEvent } from "./combatFloatEvents";
import { COMBAT_VISUAL_HEIGHTS } from "./combatVisualLayout";

export type CombatFloatWorldAnchor = { x: number; y: number; z: number };

type CombatFloatMonsterAnchor = { key: string; x: number; z: number };

/** Resolve a posição no mundo do evento antes de sua projeção na camada HTML. */
export function resolveCombatFloatWorldAnchor(
  event: CombatFloatEvent,
  player: { x: number; z: number },
  monsters: readonly CombatFloatMonsterAnchor[],
): CombatFloatWorldAnchor | null {
  if (event.target === "player") return { x: player.x, y: COMBAT_VISUAL_HEIGHTS.playerFloat, z: player.z };
  const monster = monsters.find((entry) => entry.key === event.monsterKey);
  return monster ? { x: monster.x, y: COMBAT_VISUAL_HEIGHTS.monsterFloat, z: monster.z } : null;
}
