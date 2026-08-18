import { describe, expect, it } from "vitest";
import { ARCHETYPES, capacityForLevel, DAMAGE_ELEMENTS, damageAfterResistance, elementMultiplier, inventoryWeight, levelFromXp, REGIONS } from "@shared/game";

describe("regras de progressão do Vale de Âmbar", () => {
  it("aplica a escala de resistência elemental inspirada em Tibia", () => {
    expect(elementMultiplier(0)).toBe(2);
    expect(elementMultiplier(1)).toBe(1);
    expect(elementMultiplier(2)).toBe(0);
    expect(damageAfterResistance(40, 0.5)).toBe(60);
    expect(damageAfterResistance(40, 2)).toBe(1);
  });

  it("calcula capacidade por nível e peso de inventário", () => {
    expect(capacityForLevel(1)).toBe(75);
    expect(capacityForLevel(4)).toBe(150);
    expect(inventoryWeight([{ weight: 4, quantity: 2 }, { weight: 1, quantity: 5 }])).toBe(13);
  });

  it("converte XP excedente em níveis de forma determinística", () => {
    expect(levelFromXp(1, 185)).toEqual({ level: 2, xp: 85 });
  });

  it("mantém os sete elementos e a rota de regiões em ordem de progressão", () => {
    expect(DAMAGE_ELEMENTS).toEqual(["physical", "fire", "ice", "energy", "earth", "holy", "death"]);
    expect(REGIONS[0]).toMatchObject({ key: "wind-road", level: 1 });
    expect(REGIONS.at(-1)).toMatchObject({ key: "volcano", level: 48 });
    expect(REGIONS.every((region, index) => index === 0 || region.level > REGIONS[index - 1]!.level)).toBe(true);
  });

  it("não permite capacidade negativa nem dano nulo em regras de borda", () => {
    expect(capacityForLevel(-3)).toBe(75);
    expect(inventoryWeight([])).toBe(0);
    expect(damageAfterResistance(0, 5)).toBe(1);
  });

  it("oferece três arquétipos com perfis de recurso distintos", () => {
    expect(ARCHETYPES.map((entry) => entry.key)).toEqual(["fighter", "archer", "mage"]);
    expect(ARCHETYPES[0].maxHp).toBeGreaterThan(ARCHETYPES[2].maxHp);
    expect(ARCHETYPES[2].maxMp).toBeGreaterThan(ARCHETYPES[0].maxMp);
  });
});
