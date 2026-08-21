import { describe, expect, it } from "vitest";
import { getZaoWorldSolidFeatures, getZaoWorldVisualZones, resolveWorldSolidSurface, WORLD_SOLID_SURFACE_COLORS } from "./zaoTileWorld";

describe("mundo provisório em cores sólidas", () => {
  it("traduz cada referência visual para uma superfície sem textura", () => {
    expect(resolveWorldSolidSurface("water")).toBe("solid-water");
    expect(resolveWorldSolidSurface("road")).toBe("solid-road");
    expect(resolveWorldSolidSurface("bridge")).toBe("solid-stone");
    expect(resolveWorldSolidSurface("structure")).toBe("solid-wall");
    expect(Object.values(WORLD_SOLID_SURFACE_COLORS)).toEqual(expect.arrayContaining(["#4F7A43", "#3B8798", "#B9874C"]));
  });

  it("mantém a ponte transitável e a água bloqueada com superfícies sem arte", () => {
    const features = getZaoWorldSolidFeatures();
    expect(features.find((feature) => feature.id === "city-bridge")?.surfaceId).toBe("solid-stone");
    expect(features.find((feature) => feature.id === "wind-bridge")?.surfaceId).toBe("solid-stone");
    expect(features.filter((feature) => feature.kind === "water").every((feature) => feature.blocksMovement)).toBe(true);
  });

  it("declara zonas de cor distintas para praça urbana, floresta e clareira da estrada", () => {
    const zones = getZaoWorldVisualZones();
    expect(zones.find((zone) => zone.id === "amber-city-plaza")?.surfaceId).toBe("solid-stone");
    expect(zones.find((zone) => zone.id === "wind-road-forest-floor")?.surfaceId).toBe("solid-grass");
    expect(zones.find((zone) => zone.id === "wind-road-south-clearing")?.surfaceId).toBe("solid-road");
    expect(zones.every((zone) => zone.level > 0)).toBe(true);
  });

  it("alterna apenas cores sólidas entre o campo-base e as zonas de relva", () => {
    const zones = getZaoWorldVisualZones();
    expect(zones.find((zone) => zone.id === "wind-road-forest-floor")?.surfaceId).toBe("solid-grass");
    expect(zones.find((zone) => zone.id === "wind-road-west-grove")?.surfaceId).toBe("solid-grove");
    expect(zones.every((zone) => !Object.prototype.hasOwnProperty.call(zone, "assetId"))).toBe(true);
  });
});
