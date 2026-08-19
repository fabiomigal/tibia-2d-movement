import { describe, expect, it } from "vitest";
import { getZaoWorldTileFeatures, getZaoWorldVisualZones, resolveWorldTileAsset } from "./zaoTileWorld";

describe("mundo Zao construído em tiles", () => {
  it("traduz cada tipo de referência para um tile publicado", () => {
    expect(resolveWorldTileAsset("water")).toBe("water");
    expect(resolveWorldTileAsset("road")).toBe("dirt");
    expect(resolveWorldTileAsset("bridge")).toBe("stone");
    expect(resolveWorldTileAsset("structure")).toBe("wall");
  });

  it("mantém a ponte como tile transitável sobre os trechos de água", () => {
    const features = getZaoWorldTileFeatures();
    expect(features.find((feature) => feature.id === "city-bridge")?.assetId).toBe("stone");
    expect(features.find((feature) => feature.id === "wind-bridge")?.assetId).toBe("stone");
    expect(features.filter((feature) => feature.kind === "water").every((feature) => feature.blocksMovement)).toBe(true);
  });

  it("declara zonas visuais distintas para praça urbana, floresta e clareira da estrada", () => {
    const zones = getZaoWorldVisualZones();
    expect(zones.find((zone) => zone.id === "amber-city-plaza")?.assetId).toBe("stone");
    expect(zones.find((zone) => zone.id === "wind-road-forest-floor")?.assetId).toBe("grass");
    expect(zones.find((zone) => zone.id === "wind-road-south-clearing")?.assetId).toBe("dirt");
    expect(zones.every((zone) => zone.level > 0)).toBe(true);
  });
});
