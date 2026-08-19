import React, { useMemo } from "react";
import { getTileAsset } from "./catalog";
import type { TileMapDocument } from "./model";
import { getVisibleTileRenderNodes, type TileMapViewportBounds } from "./rendering";

export interface TileMapCanvasProps {
  map: TileMapDocument;
  z?: number;
  viewport: TileMapViewportBounds;
  selectedCell?: { x: number; y: number } | null;
  showCollision?: boolean;
  onCellSelect?: (cell: { x: number; y: number }) => void;
}

export function TileMapCanvas({ map, z = 0, viewport, selectedCell, showCollision = false, onCellSelect }: TileMapCanvasProps) {
  const nodes = useMemo(() => getVisibleTileRenderNodes(map, z, viewport), [map, viewport, z]);
  const tileSize = map.tileSize;
  const visibleCells = useMemo(() => {
    const cells: { x: number; y: number }[] = [];
    for (let y = viewport.top; y < Math.min(map.height, viewport.top + viewport.height); y += 1) {
      for (let x = viewport.left; x < Math.min(map.width, viewport.left + viewport.width); x += 1) cells.push({ x, y });
    }
    return cells;
  }, [map.height, map.width, viewport.height, viewport.left, viewport.top, viewport.width]);

  return (
    <div className="tilemap-viewport" aria-label={`Prévia do mapa ${map.name}`}>
      <div className="tilemap-canvas" style={{ width: viewport.width * tileSize, height: viewport.height * tileSize }}>
        {visibleCells.map((cell) => (
          <button
            key={`${cell.x}:${cell.y}`}
            className={`tilemap-cell ${selectedCell?.x === cell.x && selectedCell.y === cell.y ? "is-selected" : ""}`}
            style={{ left: (cell.x - viewport.left) * tileSize, top: (cell.y - viewport.top) * tileSize, width: tileSize, height: tileSize }}
            type="button"
            aria-label={`Tile ${cell.x}, ${cell.y}`}
            onClick={() => onCellSelect?.(cell)}
          />
        ))}
        {nodes.map((node) => {
          const asset = getTileAsset(node.assetId);
          if (!asset) return null;
          const isBlocked = node.collision === "blocked" || node.collision === "water";
          return (
            <div
              key={node.key}
              className={`tilemap-node layer-${node.layer} node-${node.kind} ${showCollision && isBlocked ? "is-blocked" : ""}`}
              style={{
                left: (node.x - viewport.left) * tileSize,
                top: (node.y - viewport.top) * tileSize,
                width: tileSize,
                height: tileSize,
                zIndex: node.order,
                backgroundImage: `url(${asset.localFilename})`,
              }}
              title={`${node.label ? `${node.label} · ` : ""}${asset.name} · ${node.collision ?? "walkable"}`}
            />
          );
        })}
      </div>
    </div>
  );
}
