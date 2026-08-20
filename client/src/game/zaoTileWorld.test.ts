import { describe, expect, it } from "vitest";
import { getZaoWorldTileFeatures, getZaoWorldVisualZones, resolveWorldTileAsset } from "./zaoTileWorld";

describe("mundo Zao construído em tiles", () => {
  it("traduz cada tipo de referência para um tile publicado", () => {
    expect(resolveWorldTileAsset("water")).toBe("aurora_water");
    expect(resolveWorldTileAsset("road")).toBe("aurora_path");
    expect(resolveWorldTileAsset("bridge")).toBe("aurora_mine_stone");
    expect(resolveWorldTileAsset("structure")).toBe("aurora_fortress_wall");
  });

  it("mantém a ponte como tile transitável sobre os trechos de água", () => {
    const features = getZaoWorldTileFeatures();
    expect(features.find((feature) => feature.id === "city-bridge")?.assetId).toBe("aurora_mine_stone");
    expect(features.find((feature) => feature.id === "wind-bridge")?.assetId).toBe("aurora_mine_stone");
    expect(features.filter((feature) => feature.kind === "water").every((feature) => feature.blocksMovement)).toBe(true);
  });

  it("declara zonas visuais distintas para praça urbana, floresta e clareira da estrada", () => {
    const zones = getZaoWorldVisualZones();
    expect(zones.find((zone) => zone.id === "amber-city-plaza")?.assetId).toBe("aurora_mine_stone");
    expect(zones.find((zone) => zone.id === "wind-road-forest-floor")?.assetId).toBe("aurora_grass");
    expect(zones.find((zone) => zone.id === "wind-road-south-clearing")?.assetId).toBe("aurora_path");
    expect(zones.find((zone) => zone.id === "wind-road-forest-floor")?.tone).toBe("#5A7948");
    expect(zones.find((zone) => zone.id === "wind-road-south-clearing")?.tone).toBe("#B97840");
    expect(zones.every((zone) => zone.level > 0)).toBe(true);
  });

  it("alterna as duas tiles fornecidas entre o campo-base e as zonas de relva", () => {
    const zones = getZaoWorldVisualZones();
    expect(zones.find((zone) => zone.id === "wind-road-forest-floor")?.assetId).toBe("aurora_grass");
    expect(zones.find((zone) => zone.id === "wind-road-west-grove")?.assetId).toBe("aurora_grass_variant");
    expect(zones.find((zone) => zone.id === "amber-city-south-garden")?.tone).toBe("#FFFFFF");
  });
});
