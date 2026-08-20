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

  it("registra o conjunto OGA separado dos assets Kenney preexistentes", () => {
    const ogaAssetIds = ["oga_grass", "oga_grass_flowers", "oga_path", "oga_water", "oga_stone", "oga_wall", "oga_tree", "oga_flower_bed", "oga_adventurer"];
    expect(ogaAssetIds.map(getTileAsset)).toHaveLength(9);
    expect(getTileAsset("oga_grass")?.sourceUrl).toBe("https://opengameart.org/content/overworld-grass-biome");
    expect(getTileAsset("oga_tree")).toMatchObject({ tileWidth: 48, tileHeight: 48, localFilename: "/manus-storage/vale-ambar-tree_b687db29.png" });
    expect(getTileAsset("oga_adventurer")).toMatchObject({ author: "TheNess", tileWidth: 16, tileHeight: 11, localFilename: "/manus-storage/sprite_oga_f4502ba6.png" });
  });
});
