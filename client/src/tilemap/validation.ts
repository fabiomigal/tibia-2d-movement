import { TILEMAP_FORMAT_VERSION, TILEMAP_LAYER_IDS, type TileMapDocument } from "./model";

export interface TileMapValidationIssue {
  path: string;
  message: string;
}

const validCoordinate = (value: unknown) => typeof value === "number" && Number.isInteger(value) && value >= 0;

export function validateTileMap(map: TileMapDocument, assetIds: ReadonlySet<string>): TileMapValidationIssue[] {
  const issues: TileMapValidationIssue[] = [];
  if (map.formatVersion !== TILEMAP_FORMAT_VERSION) issues.push({ path: "formatVersion", message: "Versão de mapa não suportada." });
  if (!map.mapId.trim()) issues.push({ path: "mapId", message: "O mapa precisa de um identificador." });
  if (map.width < 1 || map.height < 1) issues.push({ path: "dimensions", message: "Largura e altura devem ser positivas." });
  if (map.tileSize < 1) issues.push({ path: "tileSize", message: "O tamanho de tile deve ser positivo." });

  for (const level of map.levels) {
    for (const layerId of TILEMAP_LAYER_IDS) {
      const layer = level.layers[layerId];
      if (!layer || layer.id !== layerId) {
        issues.push({ path: `levels.${level.z}.layers.${layerId}`, message: "Camada obrigatória ausente ou inválida." });
        continue;
      }
      for (let index = 0; index < layer.tiles.length; index += 1) {
        const tile = layer.tiles[index];
        const path = `levels.${level.z}.layers.${layerId}.tiles.${index}`;
        if (!assetIds.has(tile.assetId)) issues.push({ path, message: `Asset inexistente: ${tile.assetId}.` });
        if (!validCoordinate(tile.x) || !validCoordinate(tile.y) || tile.x >= map.width || tile.y >= map.height) issues.push({ path, message: "Tile fora dos limites do mapa." });
      }
    }
    for (let index = 0; index < level.objects.length; index += 1) {
      const object = level.objects[index];
      const path = `levels.${level.z}.objects.${index}`;
      if (!assetIds.has(object.assetId)) issues.push({ path, message: `Asset inexistente: ${object.assetId}.` });
      if (!validCoordinate(object.x) || !validCoordinate(object.y) || object.x >= map.width || object.y >= map.height) issues.push({ path, message: "Objeto fora dos limites do mapa." });
    }
    for (let index = 0; index < level.entities.length; index += 1) {
      const entity = level.entities[index];
      const path = `levels.${level.z}.entities.${index}`;
      if (!assetIds.has(entity.assetId)) issues.push({ path, message: `Asset inexistente: ${entity.assetId}.` });
      if (!entity.entityId.trim() || !entity.label.trim()) issues.push({ path, message: "Entidade precisa de identificador e rótulo." });
      if (!validCoordinate(entity.x) || !validCoordinate(entity.y) || entity.x >= map.width || entity.y >= map.height) issues.push({ path, message: "Entidade fora dos limites do mapa." });
    }
  }
  return issues;
}
