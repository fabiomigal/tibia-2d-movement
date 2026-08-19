import { describe, expect, it } from "vitest";
import { EXPLORATION_MAPS } from "./explorationMaps";

describe("mapas de exploração", () => {
  it("declara interior e santuário em áreas físicas distintas", () => {
    expect(EXPLORATION_MAPS.map((map) => map.id)).toEqual(["amber-inn", "moon-sanctuary"]);
    expect(new Set(EXPLORATION_MAPS.map((map) => `${map.x}:${map.z}`)).size).toBe(EXPLORATION_MAPS.length);
    expect(EXPLORATION_MAPS.every((map) => map.width > 5 && map.height > 5)).toBe(true);
  });
});
