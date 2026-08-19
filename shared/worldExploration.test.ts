import { describe, expect, it } from "vitest";
import { MONSTER_RESPAWN_DELAY_MS, REGIONS, WORLD_MONSTER_SPAWNS, WORLD_PORTALS } from "./game";
import { MONSTERS } from "../server/gameCatalog";

describe("expansão de exploração do Vale de Âmbar", () => {
  it("mantém os portais bidirecionais com destino e regiões declaradas", () => {
    const regionKeys = new Set(REGIONS.map((region) => region.key));
    expect(WORLD_PORTALS).toHaveLength(4);
    expect(WORLD_PORTALS.every((portal) => regionKeys.has(portal.from) && regionKeys.has(portal.to))).toBe(true);
    expect(WORLD_PORTALS.every((portal) => Number.isFinite(portal.destination.x) && Number.isFinite(portal.destination.z))).toBe(true);
  });

  it("define spawns únicos, combatíveis e com respawn de exatamente dois segundos", () => {
    const monsterKeys = new Set(MONSTERS.map((monster) => monster.key));
    expect(new Set(WORLD_MONSTER_SPAWNS.map((spawn) => spawn.monsterKey)).size).toBe(WORLD_MONSTER_SPAWNS.length);
    expect(WORLD_MONSTER_SPAWNS.every((spawn) => monsterKeys.has(spawn.monsterKey))).toBe(true);
    expect(MONSTER_RESPAWN_DELAY_MS).toBe(2_000);
  });
});
