import { describe, expect, it } from "vitest";
import { getZaoWorldTileFeatures, resolveWorldTileAsset } from "./zaoTileWorld";

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
});
