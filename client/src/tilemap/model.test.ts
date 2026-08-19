import { describe, expect, it } from "vitest";
import { createEmptyTileMap, TILEMAP_LAYER_IDS } from "./model";
import { validateTileMap } from "./validation";

describe("contratos do subsistema de mapas em tiles", () => {
  it("cria todos os níveis e camadas obrigatórios", () => {
    const map = createEmptyTileMap({ mapId: "demo", name: "Demo", width: 16, height: 12 });
    expect(Object.keys(map.levels[0].layers)).toEqual([...TILEMAP_LAYER_IDS]);
    expect(map.tileSize).toBe(32);
  });

  it("identifica referências e coordenadas inválidas", () => {
    const map = createEmptyTileMap({ mapId: "demo", name: "Demo", width: 2, height: 2 });
    map.levels[0].layers.ground.tiles.push({ x: 2, y: 0, z: 0, assetId: "missing" });
    const issues = validateTileMap(map, new Set(["grass"]));
    expect(issues.map((issue) => issue.message)).toContain("Asset inexistente: missing.");
    expect(issues.map((issue) => issue.message)).toContain("Tile fora dos limites do mapa.");
  });

  it("serializa entidades e rejeita spawns sem dados essenciais", () => {
    const map = createEmptyTileMap({ mapId: "demo", name: "Demo", width: 2, height: 2 });
    map.levels[0].entities.push({ entityId: "", assetId: "npc-villager", kind: "npc", label: "", direction: "south", x: 0, y: 0, z: 0 });
    const restored = JSON.parse(JSON.stringify(map));
    expect(restored.levels[0].entities[0].kind).toBe("npc");
    expect(validateTileMap(map, new Set(["npc-villager"])).map((issue) => issue.message)).toContain("Entidade precisa de identificador e rótulo.");
  });
});
