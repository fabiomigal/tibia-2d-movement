export type ChestDrop = { id: number; chestKey: string; x: number; z: number };

export type LootChestGroup<T extends ChestDrop> = {
  chestKey: string;
  x: number;
  z: number;
  drops: T[];
};

/** Agrupa apenas itens que ocupam a mesma instância de baú no campo. */
export function groupLootChests<T extends ChestDrop>(drops: readonly T[]): LootChestGroup<T>[] {
  const grouped = new Map<string, LootChestGroup<T>>();
  for (const drop of drops) {
    const chest = grouped.get(drop.chestKey) ?? { chestKey: drop.chestKey, x: drop.x, z: drop.z, drops: [] };
    chest.drops.push(drop);
    grouped.set(drop.chestKey, chest);
  }
  return Array.from(grouped.values());
}
