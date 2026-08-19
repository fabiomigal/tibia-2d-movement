import type { TileMapDocument } from "./model";
import { validateTileMap } from "./validation";

export type TileMapImportResult = { ok: true; map: TileMapDocument } | { ok: false; message: string };

export function parseTileMapImport(raw: string, assetIds: ReadonlySet<string>): TileMapImportResult {
  try {
    const candidate = JSON.parse(raw) as TileMapDocument;
    const issues = validateTileMap(candidate, assetIds);
    return issues.length ? { ok: false, message: issues[0].message } : { ok: true, map: candidate };
  } catch {
    return { ok: false, message: "JSON inválido." };
  }
}
