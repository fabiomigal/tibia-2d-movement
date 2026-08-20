import { describe, expect, it } from "vitest";
import { getZaoWorldTileFeatures, getZaoWorldVisualZones, resolveWorldTileAsset } from "./zaoTileWorld";

describe("mundo Zao construído em tiles", () => {
  it("traduz cada tipo de referência para um tile publicado", () => {
    expect(resolveWorldTileAsset("water")).toBe("oga_water");
    expect(resolveWorldTileAsset("road")).toBe("oga_path");
    expect(resolveWorldTileAsset("bridge")).toBe("oga_stone");
    expect(resolveWorldTileAsset("structure")).toBe("oga_wall");
  });

  it("mantém a ponte como tile transitável sobre os trechos de água", () => {
    const features = getZaoWorldTileFeatures();
    expect(features.find((feature) => feature.id === "city-bridge")?.assetId).toBe("oga_stone");
    expect(features.find((feature) => feature.id === "wind-bridge")?.assetId).toBe("oga_stone");
    expect(features.filter((feature) => feature.kind === "water").every((feature) => feature.blocksMovement)).toBe(true);
  });

  it("declara zonas visuais distintas para praça urbana, floresta e clareira da estrada", () => {
    const zones = getZaoWorldVisualZones();
    expect(zones.find((zone) => zone.id === "amber-city-plaza")?.assetId).toBe("oga_stone");
    expect(zones.find((zone) => zone.id === "wind-road-forest-floor")?.assetId).toBe("oga_grass");
    expect(zones.find((zone) => zone.id === "wind-road-south-clearing")?.assetId).toBe("oga_path");
    expect(zones.find((zone) => zone.id === "wind-road-forest-floor")?.tone).toBe("#738C50");
    expect(zones.find((zone) => zone.id === "wind-road-south-clearing")?.tone).toBe("#C49C5C");
    expect(zones.every((zone) => zone.level > 0)).toBe(true);
  });
});
