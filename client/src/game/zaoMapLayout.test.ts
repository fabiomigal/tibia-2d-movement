import { describe, expect, it } from "vitest";
import { getZaoMapFeatures, projectZaoMapPoint, resolveZaoSubarea, ZAO_MAP_LAYOUT } from "./zaoMapLayout";

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

  it("expõe rios, pontes e estruturas para que a miniatura use a mesma geometria do mapa", () => {
    const cityFeatures = getZaoMapFeatures("bamboo-forest");
    const windFeatures = getZaoMapFeatures("wind-road");

    expect(cityFeatures.some((feature) => feature.kind === "water" && feature.blocksMovement)).toBe(true);
    expect(cityFeatures.some((feature) => feature.kind === "bridge" && !feature.blocksMovement)).toBe(true);
    expect(windFeatures.some((feature) => feature.kind === "tower" && feature.blocksMovement)).toBe(true);
    expect(windFeatures.some((feature) => feature.kind === "gate" && feature.blocksMovement)).toBe(true);
  });

  it("projeta coordenadas locais para dentro do quadro do minimapa", () => {
    const cityPoint = projectZaoMapPoint("bamboo-forest", ZAO_MAP_LAYOUT.city.center.x, ZAO_MAP_LAYOUT.city.center.z);
    const roadPoint = projectZaoMapPoint("wind-road", ZAO_MAP_LAYOUT.windRoad.gate.x, ZAO_MAP_LAYOUT.windRoad.gate.z);

    expect(cityPoint.left).toBeGreaterThan(4);
    expect(cityPoint.top).toBeGreaterThan(4);
    expect(roadPoint.left).toBeLessThan(96);
    expect(roadPoint.top).toBeGreaterThan(4);
  });
});
