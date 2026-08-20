import { TILEMAP_LAYER_IDS, cloneTileMap, createEmptyTileMap, type CollisionKind, type MapObject, type TileMapDocument, type TileMapLayerId, type TilePlacement } from "./model";

export type EditorTool = "paint" | "erase" | "object";

function touch(map: TileMapDocument): TileMapDocument {
  const copy = cloneTileMap(map);
  copy.updatedAt = new Date().toISOString();
  return copy;
}

function levelAt(map: TileMapDocument, z = 0) {
  const level = map.levels.find((candidate) => candidate.z === z);
  if (!level) throw new Error(`Nível ${z} não encontrado.`);
  return level;
}

export function paintTile(map: TileMapDocument, input: Pick<TilePlacement, "assetId" | "x" | "y"> & { layer: TileMapLayerId; collision?: CollisionKind; z?: number }): TileMapDocument {
  const copy = touch(map);
  const tiles = levelAt(copy, input.z).layers[input.layer].tiles;
  const replacement: TilePlacement = { assetId: input.assetId, x: input.x, y: input.y, z: input.z ?? 0, collision: input.collision };
  const existingIndex = tiles.findIndex((tile) => tile.x === input.x && tile.y === input.y);
  if (existingIndex >= 0) tiles[existingIndex] = replacement;
  else tiles.push(replacement);
  return copy;
}

export function eraseTile(map: TileMapDocument, input: { x: number; y: number; layer: TileMapLayerId; z?: number }): TileMapDocument {
  const copy = touch(map);
  const tiles = levelAt(copy, input.z).layers[input.layer].tiles;
  levelAt(copy, input.z).layers[input.layer].tiles = tiles.filter((tile) => tile.x !== input.x || tile.y !== input.y);
  return copy;
}

export function putObject(map: TileMapDocument, input: Omit<MapObject, "objectId" | "zIndex" | "z"> & { z?: number }): TileMapDocument {
  const copy = touch(map);
  const level = levelAt(copy, input.z);
  level.objects = level.objects.filter((object) => object.x !== input.x || object.y !== input.y || object.layer !== input.layer);
  level.objects.push({ ...input, z: input.z ?? 0, objectId: `object-${input.assetId}-${input.x}-${input.y}`, zIndex: TILEMAP_LAYER_IDS.indexOf(input.layer) * 10 });
  return copy;
}

export function removeObjectsAt(map: TileMapDocument, input: { x: number; y: number; z?: number }): TileMapDocument {
  const copy = touch(map);
  const level = levelAt(copy, input.z);
  level.objects = level.objects.filter((object) => object.x !== input.x || object.y !== input.y);
  return copy;
}

export function updateTileProperties(map: TileMapDocument, input: { x: number; y: number; layer: TileMapLayerId; collision: CollisionKind; note: string; z?: number }): TileMapDocument {
  const copy = touch(map);
  const tiles = levelAt(copy, input.z).layers[input.layer].tiles;
  const tile = tiles.find((candidate) => candidate.x === input.x && candidate.y === input.y);
  if (!tile) return copy;
  tile.collision = input.collision;
  tile.properties = { ...tile.properties, note: input.note };
  return copy;
}

export function updateObjectProperties(map: TileMapDocument, input: { objectId: string; collision: CollisionKind; interaction: NonNullable<MapObject["interaction"]>; rotation: NonNullable<MapObject["rotation"]>; note: string; z?: number }): TileMapDocument {
  const copy = touch(map);
  const object = levelAt(copy, input.z).objects.find((candidate) => candidate.objectId === input.objectId);
  if (!object) return copy;
  object.collision = input.collision;
  object.interaction = input.interaction;
  object.rotation = input.rotation;
  object.properties = { ...object.properties, note: input.note };
  return copy;
}

export function createDemoTileMap(): TileMapDocument {
  let map = createEmptyTileMap({ mapId: "clareira-das-sete-pontes", name: "Clareira das Sete Pontes", width: 28, height: 18, tileSize: 40 });
  for (let y = 0; y < map.height; y += 1) for (let x = 0; x < map.width; x += 1) map = paintTile(map, { layer: "ground", assetId: "aurora_grass", x, y });
  for (let x = 0; x < map.width; x += 1) map = paintTile(map, { layer: "terrain_border", assetId: "aurora_water", x, y: 9, collision: "water" });
  for (const x of [12, 13, 14, 15]) map = paintTile(map, { layer: "low_objects", assetId: "aurora_mine_stone", x, y: 9, collision: "walkable" });
  for (let x = 2; x < 26; x += 1) map = paintTile(map, { layer: "ground", assetId: "aurora_path", x, y: 4 });
  for (let y = 1; y < 9; y += 1) map = paintTile(map, { layer: "ground", assetId: "aurora_path", x: 13, y });
  for (const [x, y] of [[2, 2], [5, 2], [23, 2], [25, 4], [3, 13], [7, 15], [21, 13], [25, 15]] as const) map = putObject(map, { assetId: "aurora_tree", x, y, width: 1, height: 1, collision: "blocked", layer: "objects" });
  for (const [x, y] of [[7, 6], [8, 6], [7, 7], [8, 7]] as const) map = putObject(map, { assetId: "aurora_fortress_wall", x, y, width: 1, height: 1, collision: "blocked", layer: "high_objects" });
  map = putObject(map, { assetId: "aurora_loot_chest", x: 10, y: 6, width: 1, height: 1, collision: "interaction", interaction: "inspect", layer: "objects" });
  map.levels[0].entities.push(
    { entityId: "spawn-explorador", assetId: "aurora_adventurer", kind: "player_spawn", label: "Ponto inicial", x: 4, y: 6, z: 0, direction: "south" },
    { entityId: "npc-lina", assetId: "aurora_adventurer", kind: "npc", label: "Lina, a cartógrafa", x: 10, y: 4, z: 0, direction: "east", properties: { interaction: "dialogue" } },
    { entityId: "creature-goblin", assetId: "aurora_goblin", kind: "creature", label: "Guardião da margem", x: 21, y: 13, z: 0, direction: "west", properties: { spawnRadius: 2 } },
  );
  return map;
}
