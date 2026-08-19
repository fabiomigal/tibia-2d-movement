import { describe, expect, it } from "vitest";
import { createEmptyTileMap } from "./model";
import { createDemoTileMap } from "./editorState";
import { getBlockedCells, getVisibleTileRenderNodes } from "./rendering";

describe("renderização do mapa em tiles", () => {
  it("limita nós à janela visível e respeita a ordem de camadas", () => {
    const map = createEmptyTileMap({ mapId: "demo", name: "Demo", width: 40, height: 40 });
    map.levels[0].layers.ground.tiles.push({ x: 1, y: 1, z: 0, assetId: "grass" });
    map.levels[0].layers.objects.tiles.push({ x: 1, y: 1, z: 0, assetId: "tree", collision: "blocked" });
    map.levels[0].layers.ground.tiles.push({ x: 25, y: 25, z: 0, assetId: "grass" });
    const nodes = getVisibleTileRenderNodes(map, 0, { left: 0, top: 0, width: 5, height: 5 });
    expect(nodes).toHaveLength(2);
    expect(nodes[0].layer).toBe("ground");
    expect(nodes[1].layer).toBe("objects");
  });

  it("deriva colisão dos dados, sem depender da arte", () => {
    const map = createEmptyTileMap({ mapId: "demo", name: "Demo", width: 4, height: 4 });
    map.levels[0].layers.ground.tiles.push({ x: 2, y: 1, z: 0, assetId: "water", collision: "water" });
    expect(getBlockedCells(map, 0)).toEqual(new Set(["2:1"]));
  });

  it("renderiza objetos e entidades visíveis acima das camadas de terreno", () => {
    const map = createDemoTileMap();
    const nodes = getVisibleTileRenderNodes(map, 0, { left: 0, top: 0, width: map.width, height: map.height });
    expect(nodes.filter((node) => node.kind === "object").length).toBeGreaterThan(0);
    expect(nodes.filter((node) => node.kind === "entity")).toEqual(expect.arrayContaining([
      expect.objectContaining({ assetId: "explorer", label: "Ponto inicial" }),
      expect.objectContaining({ assetId: "villager", label: "Lina, a cartógrafa" }),
      expect.objectContaining({ assetId: "goblin", label: "Goblino da margem" }),
    ]));
  });
});
