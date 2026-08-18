export const COMBAT_VISUAL_HEIGHTS = {
  playerHealthBar: 1.48,
  monsterHealthBar: 1.35,
  playerFloat: 2.12,
  monsterFloat: 1.96,
} as const;

export type CombatVisualTarget = "player" | "monster";

/** Mantém números de combate acima da barra de vida correspondente. */
export function isCombatFloatAboveHealth(target: CombatVisualTarget): boolean {
  return target === "player"
    ? COMBAT_VISUAL_HEIGHTS.playerFloat > COMBAT_VISUAL_HEIGHTS.playerHealthBar
    : COMBAT_VISUAL_HEIGHTS.monsterFloat > COMBAT_VISUAL_HEIGHTS.monsterHealthBar;
}
