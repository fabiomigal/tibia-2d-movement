import { describe, expect, it } from "vitest";
import { groupLootChests } from "./lootChestState";

describe("baús de saque", () => {
  it("agrupa itens do mesmo baú sem misturar posições distintas", () => {
    const chests = groupLootChests([
      { id: 1, chestKey: "boar-1", x: 2, z: 6 },
      { id: 2, chestKey: "boar-1", x: 2, z: 6 },
      { id: 3, chestKey: "goblin-1", x: 8, z: -8 },
    ]);

    expect(chests).toEqual([
      expect.objectContaining({ chestKey: "boar-1", x: 2, z: 6, drops: [{ id: 1, chestKey: "boar-1", x: 2, z: 6 }, { id: 2, chestKey: "boar-1", x: 2, z: 6 }] }),
      expect.objectContaining({ chestKey: "goblin-1", x: 8, z: -8, drops: [{ id: 3, chestKey: "goblin-1", x: 8, z: -8 }] }),
    ]);
  });
});
