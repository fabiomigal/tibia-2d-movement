import { describe, expect, it } from "vitest";
import { createQuickInventory, getQuickInventoryTotal } from "./quickInventory";

describe("quick inventory", () => {
  const items = [
    { id: 1, name: "Presa de javali", quantity: 1, rarity: "common" },
    { id: 2, name: "Fragmento âmbar", quantity: 3, rarity: "rare" },
    { id: 3, name: "Presa de javali", quantity: 2, rarity: "common" },
    { id: 4, name: "Erva do vento", quantity: 1, rarity: "uncommon" },
  ];

  it("agrupa quantidades repetidas e mantém os itens mais numerosos", () => {
    expect(createQuickInventory(items, 2)).toEqual([
      { name: "Fragmento âmbar", quantity: 3, rarity: "rare" },
      { name: "Presa de javali", quantity: 3, rarity: "common" },
    ]);
  });

  it("calcula o total persistido da mochila", () => {
    expect(getQuickInventoryTotal(items)).toBe(7);
  });
});
