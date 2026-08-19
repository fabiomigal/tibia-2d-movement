import { describe, expect, it } from "vitest";
import { TILE_ASSET_MANIFEST, getTileAsset } from "./catalog";

describe("catálogo de assets licenciados", () => {
  it("mantém IDs únicos, URLs estáveis e licença em cada asset", () => {
    const ids = TILE_ASSET_MANIFEST.map((asset) => asset.assetId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const asset of TILE_ASSET_MANIFEST) {
      expect(asset.localFilename).toMatch(/^\/manus-storage\//);
      expect(asset.license).toBe("CC0 1.0 Universal");
      expect(asset.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it("localiza um asset por identificador sem acoplar o mapa ao arquivo", () => {
    expect(getTileAsset("water")?.originalFilename).toBe("rpgTile013.png");
    expect(getTileAsset("loot_chest")).toMatchObject({
      localFilename: "/manus-storage/loot-chest-closed_7788d04d.png",
      license: "CC0 1.0 Universal",
      category: "decoration",
    });
    expect(getTileAsset("inexistente")).toBeUndefined();
  });
});
