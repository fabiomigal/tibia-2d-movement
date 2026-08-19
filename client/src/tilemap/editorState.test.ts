import { describe, expect, it } from "vitest";
import { createDemoTileMap, eraseTile, paintTile, putObject, updateObjectProperties, updateTileProperties } from "./editorState";

describe("estado do editor de mapas", () => {
  it("substitui um tile sem duplicar a célula da camada", () => {
    const map = createDemoTileMap();
    const before = map.levels[0].layers.ground.tiles.filter((tile) => tile.x === 3 && tile.y === 3).length;
    const updated = paintTile(map, { layer: "ground", assetId: "stone", x: 3, y: 3 });
    expect(before).toBe(1);
    expect(updated.levels[0].layers.ground.tiles.filter((tile) => tile.x === 3 && tile.y === 3)).toEqual([{ assetId: "stone", x: 3, y: 3, z: 0, collision: undefined }]);
  });

  it("remove tiles e atualiza objetos por posição", () => {
    const map = createDemoTileMap();
    const erased = eraseTile(map, { layer: "ground", x: 0, y: 0 });
    const updated = putObject(erased, { assetId: "oak", x: 3, y: 3, width: 1, height: 1, collision: "blocked", layer: "objects" });
    expect(erased.levels[0].layers.ground.tiles.some((tile) => tile.x === 0 && tile.y === 0)).toBe(false);
    expect(updated.levels[0].objects.find((object) => object.x === 3 && object.y === 3)?.assetId).toBe("oak");
  });

  it("persiste propriedades de tile e de objeto selecionados", () => {
    const map = createDemoTileMap();
    const tileUpdated = updateTileProperties(map, { layer: "ground", x: 1, y: 1, collision: "slow", note: "margem úmida" });
    const objectId = tileUpdated.levels[0].objects[0].objectId;
    const objectUpdated = updateObjectProperties(tileUpdated, { objectId, collision: "interaction", interaction: "inspect", rotation: 90, note: "árvore ancestral" });
    expect(objectUpdated.levels[0].layers.ground.tiles.find((tile) => tile.x === 1 && tile.y === 1)).toMatchObject({ collision: "slow", properties: { note: "margem úmida" } });
    expect(objectUpdated.levels[0].objects[0]).toMatchObject({ collision: "interaction", interaction: "inspect", rotation: 90, properties: { note: "árvore ancestral" } });
  });

  it("inclui personagem, NPC e criatura no mapa demonstrativo", () => {
    const entities = createDemoTileMap().levels[0].entities;
    expect(entities).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "player_spawn", assetId: "explorer" }),
      expect.objectContaining({ kind: "npc", assetId: "villager" }),
      expect.objectContaining({ kind: "creature", assetId: "goblin" }),
    ]));
  });
});
