import { describe, expect, it } from "vitest";
import { COMBAT_VISUAL_HEIGHTS, isCombatFloatAboveHealth } from "./combatVisualLayout";

describe("hierarquia visual de combate", () => {
  it("mantém barras de vida elevadas e números flutuantes acima delas", () => {
    expect(COMBAT_VISUAL_HEIGHTS.playerHealthBar).toBeGreaterThan(1);
    expect(COMBAT_VISUAL_HEIGHTS.monsterHealthBar).toBeGreaterThan(1);
    expect(isCombatFloatAboveHealth("player")).toBe(true);
    expect(isCombatFloatAboveHealth("monster")).toBe(true);
  });
});
