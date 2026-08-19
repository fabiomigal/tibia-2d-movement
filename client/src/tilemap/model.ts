export const TILEMAP_FORMAT_VERSION = 1;
export const DEFAULT_TILE_SIZE = 32;

export const TILEMAP_LAYER_IDS = [
  "ground",
  "terrain_border",
  "low_objects",
  "objects",
  "high_objects",
  "entities",
  "effects",
] as const;

export type TileMapLayerId = (typeof TILEMAP_LAYER_IDS)[number];
export type CollisionKind = "walkable" | "blocked" | "water" | "danger" | "slow" | "teleport" | "interaction";
export type AssetCategory = "terrain" | "road" | "wall" | "flora" | "rock" | "building" | "bridge" | "decoration" | "character" | "effect";

export interface TileMapCoordinate {
  x: number;
  y: number;
  z: number;
}

export interface TileAssetManifestEntry {
  assetId: string;
  name: string;
  category: AssetCategory;
  sourceUrl: string;
  author: string;
  license: string;
  licenseUrl: string;
  attributionRequired: boolean;
  attributionText?: string;
  originalFilename: string;
  localFilename: string;
  tileWidth: number;
  tileHeight: number;
  previewColor: string;
}

export interface TilePlacement extends TileMapCoordinate {
  assetId: string;
  collision?: CollisionKind;
  properties?: Record<string, boolean | number | string>;
}

export interface MapObject extends TileMapCoordinate {
  objectId: string;
  assetId: string;
  width: number;
  height: number;
  collision: CollisionKind;
  interaction?: "none" | "inspect" | "door" | "chest" | "teleport";
  rotation?: 0 | 90 | 180 | 270;
  layer: TileMapLayerId;
  zIndex: number;
  properties?: Record<string, boolean | number | string>;
}

export interface MapEntity extends TileMapCoordinate {
  entityId: string;
  assetId: string;
  kind: "npc" | "creature" | "player_spawn";
  label: string;
  direction: "north" | "east" | "south" | "west";
  properties?: Record<string, boolean | number | string>;
}

export interface MapEvent extends TileMapCoordinate {
  eventId: string;
  type: "teleport" | "spawn" | "message" | "interaction";
  label: string;
  target?: TileMapCoordinate;
  properties?: Record<string, boolean | number | string>;
}

export interface TileMapLayer {
  id: TileMapLayerId;
  tiles: TilePlacement[];
}

export interface TileMapLevel {
  z: number;
  layers: Record<TileMapLayerId, TileMapLayer>;
  objects: MapObject[];
  entities: MapEntity[];
  events: MapEvent[];
}

export interface TileMapDocument {
  formatVersion: number;
  mapId: string;
  name: string;
  tileSize: number;
  width: number;
  height: number;
  levels: TileMapLevel[];
  updatedAt: string;
}

export const createEmptyLayers = (): Record<TileMapLayerId, TileMapLayer> =>
  Object.fromEntries(TILEMAP_LAYER_IDS.map((id) => [id, { id, tiles: [] }])) as unknown as Record<TileMapLayerId, TileMapLayer>;

export function createEmptyTileMap(input: Pick<TileMapDocument, "mapId" | "name" | "width" | "height"> & { tileSize?: number; z?: number }): TileMapDocument {
  return {
    formatVersion: TILEMAP_FORMAT_VERSION,
    mapId: input.mapId,
    name: input.name,
    tileSize: input.tileSize ?? DEFAULT_TILE_SIZE,
    width: input.width,
    height: input.height,
    levels: [{ z: input.z ?? 0, layers: createEmptyLayers(), objects: [], entities: [], events: [] }],
    updatedAt: new Date(0).toISOString(),
  };
}

export function cloneTileMap(map: TileMapDocument): TileMapDocument {
  return JSON.parse(JSON.stringify(map)) as TileMapDocument;
}
