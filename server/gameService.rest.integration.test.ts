import { beforeEach, describe, expect, it, vi } from "vitest";
import { gameCharacters, gameItems, gameQuests, gameSkills, groundDrops, idleHunts, merchantItems, monsterEncounters } from "../drizzle/schema";
import { REST_REGENERATION } from "@shared/restRegeneration";

const database = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("./db", () => database);

function thenableRows<T>(rows: T[]) {
  return {
    limit: vi.fn(async () => rows),
    then: <TResult1 = T[], TResult2 = never>(onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null) => Promise.resolve(rows).then(onfulfilled, onrejected),
  };
}

describe("gameService — repouso integrado", () => {
  let now = 1_000_000;
  let character: any;

  beforeEach(() => {
    now = 1_000_000;
    vi.useFakeTimers();
    vi.setSystemTime(new Date(now));
    character = {
      id: 1, profileKey: "vale-ambar-demo", name: "Aventureiro de Âmbar", archetype: "fighter", level: 1, xp: 0, gold: 0,
      hp: 100, maxHp: 100, mp: 10, maxMp: 30, energy: 8, maxEnergy: 40,
      strength: 10, dexterity: 10, vitality: 10, intelligence: 10, currentRegion: "wind-road", floor: 0,
      positionX: 0, positionZ: 0, unlockedRegions: "[\"wind-road\"]", isDead: false, autoPotionEnabled: true,
      restStartedAt: null, lastResourceRegenAt: null, createdAt: new Date(now), updatedAt: new Date(now),
    };

    const rowsFor = (table: unknown) => {
      if (table === gameCharacters) return [character];
      if (table === merchantItems) return [{ id: 1 }];
      if (table === gameQuests) return [{ id: 1, characterId: 1 }];
      if ([gameItems, gameSkills, groundDrops, idleHunts, monsterEncounters].includes(table as never)) return [];
      return [];
    };
    const db = {
      select: vi.fn(() => ({ from: (table: unknown) => ({ where: () => thenableRows(rowsFor(table)), limit: () => Promise.resolve(rowsFor(table)) }) })),
      update: vi.fn(() => ({ set: (patch: Record<string, unknown>) => ({ where: async () => { Object.assign(character, patch); } }) })),
      insert: vi.fn(() => ({ values: async () => undefined })),
    };
    database.getDb.mockResolvedValue(db);
  });

  it("persiste início, devolve snapshot regenerado após ticks e limpa marcadores ao voltar a agir", async () => {
    const { getGameSnapshot, setRestState } = await import("./gameService");

    await setRestState(true);
    expect(character.restStartedAt?.getTime()).toBe(now);
    expect(character.lastResourceRegenAt?.getTime()).toBe(now);

    now += REST_REGENERATION.tickMs * 2;
    vi.setSystemTime(new Date(now));
    const recovered = await getGameSnapshot();
    expect(recovered.character).toMatchObject({ mp: 16, energy: 16 });
    expect(character.lastResourceRegenAt?.getTime()).toBe(now);

    const interrupted = await setRestState(false);
    expect(interrupted.character).toMatchObject({ mp: 16, energy: 16 });
    expect(character.restStartedAt).toBeNull();
    expect(character.lastResourceRegenAt).toBeNull();
  });
});
