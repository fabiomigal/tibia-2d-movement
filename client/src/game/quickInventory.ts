export type QuickInventoryItem = {
  id: number;
  name: string;
  quantity: number;
  rarity: string;
};

export type QuickInventoryEntry = {
  name: string;
  quantity: number;
  rarity: string;
};

/** Agrupa a mochila persistida em uma leitura curta apropriada ao HUD de jogo. */
export function createQuickInventory(items: readonly QuickInventoryItem[], limit = 3): QuickInventoryEntry[] {
  const grouped = new Map<string, QuickInventoryEntry>();
  items.forEach((item) => {
    const current = grouped.get(item.name);
    if (current) {
      current.quantity += item.quantity;
      return;
    }
    grouped.set(item.name, { name: item.name, quantity: item.quantity, rarity: item.rarity });
  });
  return Array.from(grouped.values())
    .sort((left, right) => right.quantity - left.quantity || left.name.localeCompare(right.name))
    .slice(0, limit);
}

export function getQuickInventoryTotal(items: readonly QuickInventoryItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}
