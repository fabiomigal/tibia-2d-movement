import { TILEMAP_LAYER_IDS, type MapEntity, type MapObject, type TileMapDocument, type TileMapLayerId, type TilePlacement } from "./model";

export interface TileMapViewportBounds {
  left: number;
  top: number;
  width: number;
  height: number;
  overscan?: number;
}

export interface TileRenderNode {
  key: string;
  assetId: string;
  x: number;
  y: number;
  layer: TileMapLayerId;
  order: number;
  collision?: TilePlacement["collision"];
  kind: "tile" | "object" | "entity";
  label?: string;
}

const layerOrder = new Map(TILEMAP_LAYER_IDS.map((id, index) => [id, index]));

function isVisible(x: number, y: number, bounds: TileMapViewportBounds): boolean {
  const overscan = bounds.overscan ?? 1;
  return x >= bounds.left - overscan && x < bounds.left + bounds.width + overscan && y >= bounds.top - overscan && y < bounds.top + bounds.height + overscan;
}

function objectNode(object: MapObject): TileRenderNode {
  return {
    key: `object:${object.objectId}`,
    assetId: object.assetId,
    x: object.x,
    y: object.y,
    layer: object.layer,
    order: (layerOrder.get(object.layer) ?? 0) * 10_000 + object.zIndex,
    collision: object.collision,
    kind: "object",
  };
}

function entityNode(entity: MapEntity): TileRenderNode {
  return {
    key: `entity:${entity.entityId}`,
    assetId: entity.assetId,
    x: entity.x,
    y: entity.y,
    layer: "entities",
    order: (layerOrder.get("entities") ?? 0) * 10_000,
    kind: "entity",
    label: entity.label,
  };
}

export function getVisibleTileRenderNodes(map: TileMapDocument, z: number, bounds: TileMapViewportBounds): TileRenderNode[] {
  const level = map.levels.find((candidate) => candidate.z === z);
  if (!level) return [];

  const nodes: TileRenderNode[] = [];
  for (const layerId of TILEMAP_LAYER_IDS) {
    const layerIndex = layerOrder.get(layerId) ?? 0;
    for (const tile of level.layers[layerId].tiles) {
      if (!isVisible(tile.x, tile.y, bounds)) continue;
      nodes.push({
        key: `tile:${layerId}:${tile.x}:${tile.y}:${tile.assetId}`,
        assetId: tile.assetId,
        x: tile.x,
        y: tile.y,
        layer: layerId,
        order: layerIndex * 10_000,
        collision: tile.collision,
        kind: "tile",
      });
    }
  }
  for (const object of level.objects) if (isVisible(object.x, object.y, bounds)) nodes.push(objectNode(object));
  for (const entity of level.entities) if (isVisible(entity.x, entity.y, bounds)) nodes.push(entityNode(entity));
  return nodes.sort((left, right) => left.order - right.order || left.y - right.y || left.x - right.x);
}

export function getBlockedCells(map: TileMapDocument, z: number): Set<string> {
  const level = map.levels.find((candidate) => candidate.z === z);
  const cells = new Set<string>();
  if (!level) return cells;
  for (const layerId of TILEMAP_LAYER_IDS) {
    for (const tile of level.layers[layerId].tiles) if (tile.collision === "blocked" || tile.collision === "water") cells.add(`${tile.x}:${tile.y}`);
  }
  for (const object of level.objects) if (object.collision === "blocked" || object.collision === "water") cells.add(`${object.x}:${object.y}`);
  return cells;
}
