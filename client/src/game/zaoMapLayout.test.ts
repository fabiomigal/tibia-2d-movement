import { describe, expect, it } from "vitest";
import { resolveZaoSubarea, ZAO_MAP_LAYOUT } from "./zaoMapLayout";

describe("layout dos mapas Zao", () => {
  it("mantém a cidade inicial e a Estrada dos Ventos como áreas distintas", () => {
    expect(ZAO_MAP_LAYOUT.city.label).toBe("Cidade de Âmbar");
    expect(ZAO_MAP_LAYOUT.windRoad.label).toBe("Estrada dos Ventos");
    expect(ZAO_MAP_LAYOUT.windRoad.gate.z).toBeGreaterThan(ZAO_MAP_LAYOUT.city.center.z);
  });

  it("troca a subárea quando o personagem alcança o início da Estrada dos Ventos", () => {
    expect(resolveZaoSubarea(ZAO_MAP_LAYOUT.city.center.x, ZAO_MAP_LAYOUT.windRoad.fromZ - 0.01)).toBe("bamboo-forest");
    expect(resolveZaoSubarea(5.1, ZAO_MAP_LAYOUT.windRoad.fromZ)).toBe("wind-road");
  });
});
