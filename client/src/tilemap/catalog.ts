import type { TileAssetManifestEntry } from "./model";

const AURORA_PROJECT_SOURCE = "https://github.com/fabiomigal/tibia-2d-movement";
const AURORA_AUTHORIZATION_RECORD = "https://github.com/fabiomigal/tibia-2d-movement/blob/main/docs/aurora-reference-extraction.md";

function auroraAsset(input: Omit<TileAssetManifestEntry, "sourceUrl" | "author" | "license" | "licenseUrl" | "attributionRequired" | "attributionText">): TileAssetManifestEntry {
  return {
    ...input,
    sourceUrl: AURORA_PROJECT_SOURCE,
    author: "Autor do Vale de Âmbar",
    license: "Uso autorizado pelo autor para este projeto",
    licenseUrl: AURORA_AUTHORIZATION_RECORD,
    attributionRequired: false,
    attributionText: "Recorte derivado da guia Aurora autorizada pelo autor do Vale de Âmbar.",
  };
}

/** Catálogo ativo: cada recurso é um recorte preparado da prancha Aurora autorizada pelo autor. */
export const TILE_ASSET_MANIFEST: TileAssetManifestEntry[] = [
  auroraAsset({ assetId: "aurora_grass", name: "Campo Florido — Variação A", category: "terrain", originalFilename: "Tile de campo fornecida pelo autor — variação A", localFilename: "/manus-storage/field-meadow-a_38596e09.png", tileWidth: 32, tileHeight: 32, previewColor: "#4C821D" }),
  auroraAsset({ assetId: "aurora_grass_variant", name: "Campo Florido — Variação B", category: "terrain", originalFilename: "Tile de campo fornecida pelo autor — variação B", localFilename: "/manus-storage/field-meadow-b_1e3bf0f5.png", tileWidth: 32, tileHeight: 32, previewColor: "#3D761C" }),
  auroraAsset({ assetId: "aurora_path", name: "Trilha Âmbar", category: "road", originalFilename: "Lote B — trilha", localFilename: "/manus-storage/aurora_path_2a1cb6fb.png", tileWidth: 32, tileHeight: 32, previewColor: "#B78B4D" }),
  auroraAsset({ assetId: "aurora_water", name: "Água do Orvalho", category: "terrain", originalFilename: "Lote B — água", localFilename: "/manus-storage/aurora_water_f80cfd58.png", tileWidth: 32, tileHeight: 32, previewColor: "#3A8391" }),
  auroraAsset({ assetId: "aurora_mine_stone", name: "Pedra da Mina de Brasa Azul", category: "rock", originalFilename: "Lote C — pedra", localFilename: "/manus-storage/aurora_mine_stone_ff84402c.png", tileWidth: 32, tileHeight: 32, previewColor: "#354150" }),
  auroraAsset({ assetId: "aurora_fortress_wall", name: "Muralha do Crepúsculo", category: "wall", originalFilename: "Lote D — muralha", localFilename: "/manus-storage/aurora_fortress_wall_9811b8f4.png", tileWidth: 32, tileHeight: 32, previewColor: "#4A4C60" }),
  auroraAsset({ assetId: "aurora_catacomb_stone", name: "Pedra das Catacumbas Violetas", category: "terrain", originalFilename: "Lote E — pedra", localFilename: "/manus-storage/aurora_catacomb_stone_50cddad6.png", tileWidth: 32, tileHeight: 32, previewColor: "#56345F" }),
  auroraAsset({ assetId: "aurora_tree", name: "Árvore do Orvalho", category: "flora", originalFilename: "Lote F — árvore", localFilename: "/manus-storage/aurora_tree_3c9a975d.png", tileWidth: 40, tileHeight: 48, previewColor: "#31563A" }),
  auroraAsset({ assetId: "aurora_flower_bed", name: "Flores do Orvalho", category: "flora", originalFilename: "Lote F — flores", localFilename: "/manus-storage/aurora_flower_bed_2deeda6e.png", tileWidth: 40, tileHeight: 44, previewColor: "#779654" }),
  auroraAsset({ assetId: "aurora_rock_cluster", name: "Conjunto de Rochas", category: "decoration", originalFilename: "Lote F — rochas", localFilename: "/manus-storage/aurora_rock_cluster_be5e100d.png", tileWidth: 40, tileHeight: 44, previewColor: "#52616B" }),
  auroraAsset({ assetId: "aurora_loot_chest", name: "Baú de Saque Aurora", category: "decoration", originalFilename: "Lote F — baú", localFilename: "/manus-storage/aurora_loot_chest_cf0dad5a.png", tileWidth: 40, tileHeight: 40, previewColor: "#9B663B" }),
  auroraAsset({ assetId: "aurora_adventurer", name: "Batedor de Ruínas", category: "character", originalFilename: "Lote G — personagens jogáveis", localFilename: "/manus-storage/aurora_adventurer_46c6b802.png", tileWidth: 32, tileHeight: 32, previewColor: "#D49048" }),
  auroraAsset({ assetId: "aurora_goblin", name: "Guardião de Cristais", category: "character", originalFilename: "Lote G — personagens jogáveis", localFilename: "/manus-storage/aurora_goblin_44e23aa6.png", tileWidth: 32, tileHeight: 32, previewColor: "#73944F" }),
  auroraAsset({ assetId: "aurora_boar", name: "Javali da Floresta", category: "character", originalFilename: "Lote I — criatura média", localFilename: "/manus-storage/aurora_boar_e32a98d2.png", tileWidth: 32, tileHeight: 32, previewColor: "#6E5240" }),
  auroraAsset({ assetId: "aurora_dust", name: "Poeira de Movimento", category: "decoration", originalFilename: "Lote L — poeira", localFilename: "/manus-storage/aurora_dust_sheet_1a1d935b.png", tileWidth: 41, tileHeight: 42, previewColor: "#D5AD6B" }),
];

export const TILE_ASSET_IDS = new Set(TILE_ASSET_MANIFEST.map((asset) => asset.assetId));

export function getTileAsset(assetId: string): TileAssetManifestEntry | undefined {
  return TILE_ASSET_MANIFEST.find((asset) => asset.assetId === assetId);
}
