import { describe, expect, it } from "vitest";
import { TILE_ASSET_MANIFEST, getTileAsset } from "./catalog";

describe("catálogo de assets Aurora autorizados", () => {
  it("mantém IDs únicos, URLs estáveis e autorização documentada em cada asset", () => {
    const ids = TILE_ASSET_MANIFEST.map((asset) => asset.assetId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const asset of TILE_ASSET_MANIFEST) {
      expect(asset.localFilename).toMatch(/^\/manus-storage\//);
      expect(asset.license).toBe("Uso autorizado pelo autor para este projeto");
      expect(asset.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it("localiza um asset por identificador sem acoplar o mapa ao arquivo", () => {
    expect(getTileAsset("aurora_water")?.originalFilename).toBe("Lote B — água");
    expect(getTileAsset("aurora_loot_chest")).toMatchObject({
      localFilename: "/manus-storage/aurora_loot_chest_cf0dad5a.png",
      license: "Uso autorizado pelo autor para este projeto",
      category: "decoration",
    });
    expect(getTileAsset("inexistente")).toBeUndefined();
  });

  it("registra o conjunto Aurora como catálogo ativo único", () => {
    const auroraAssetIds = ["aurora_grass", "aurora_grass_variant", "aurora_path", "aurora_water", "aurora_mine_stone", "aurora_fortress_wall", "aurora_catacomb_stone", "aurora_tree", "aurora_flower_bed", "aurora_rock_cluster", "aurora_loot_chest", "aurora_adventurer", "aurora_goblin", "aurora_boar", "aurora_dust"];
    expect(auroraAssetIds.map(getTileAsset)).toHaveLength(15);
    expect(getTileAsset("aurora_grass")?.sourceUrl).toBe("https://github.com/fabiomigal/tibia-2d-movement");
    expect(getTileAsset("aurora_grass")).toMatchObject({ localFilename: "/manus-storage/field-meadow-a_38596e09.png", tileWidth: 32, tileHeight: 32 });
    expect(getTileAsset("aurora_grass_variant")).toMatchObject({ localFilename: "/manus-storage/field-meadow-b_1e3bf0f5.png", tileWidth: 32, tileHeight: 32 });
    expect(getTileAsset("aurora_tree")).toMatchObject({ tileWidth: 40, tileHeight: 48, localFilename: "/manus-storage/aurora_tree_3c9a975d.png" });
    expect(getTileAsset("aurora_adventurer")).toMatchObject({ author: "Autor do Vale de Âmbar", tileWidth: 32, tileHeight: 32, localFilename: "/manus-storage/aurora_adventurer_46c6b802.png" });
  });
});
