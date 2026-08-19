import { describe, expect, it } from "vitest";
import { TILE_ASSET_IDS } from "./catalog";
import { createDemoTileMap } from "./editorState";
import { parseTileMapImport } from "./importing";

describe("importação de mapas", () => {
  it("aceita um documento demonstrativo válido", () => {
    const result = parseTileMapImport(JSON.stringify(createDemoTileMap()), TILE_ASSET_IDS);
    expect(result).toMatchObject({ ok: true, map: { mapId: "clareira-das-sete-pontes" } });
  });

  it("recusa JSON inválido e documentos com assets desconhecidos", () => {
    expect(parseTileMapImport("{", TILE_ASSET_IDS)).toEqual({ ok: false, message: "JSON inválido." });
    const map = createDemoTileMap();
    map.levels[0].layers.ground.tiles[0].assetId = "desconhecido";
    expect(parseTileMapImport(JSON.stringify(map), TILE_ASSET_IDS)).toMatchObject({ ok: false, message: "Asset inexistente: desconhecido." });
  });
});
