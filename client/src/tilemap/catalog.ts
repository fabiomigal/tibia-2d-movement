import type { TileAssetManifestEntry } from "./model";

const KENNEY_RPG_SOURCE = "https://opengameart.org/content/rpg-pack-base-set";
const KENNEY_TINY_DUNGEON_SOURCE = "https://kenney.nl/assets/tiny-dungeon";
const CC0_LICENSE = "https://creativecommons.org/publicdomain/zero/1.0/";
const OPEN_GAME_ART_CHEST_SOURCE = "https://opengameart.org/content/treasure-chests-32x32-and-16x16";
const OGA_OVERWORLD_GRASS_SOURCE = "https://opengameart.org/content/overworld-grass-biome";
const OGA_ADVENTURER_SOURCE = "https://opengameart.org/content/rpg-sprite-8-direction-human-male-16x16";

function kenneyAsset(input: Omit<TileAssetManifestEntry, "sourceUrl" | "author" | "license" | "licenseUrl" | "attributionRequired" | "attributionText" | "tileWidth" | "tileHeight">): TileAssetManifestEntry {
  return {
    ...input,
    sourceUrl: KENNEY_RPG_SOURCE,
    author: "Kenney",
    license: "CC0 1.0 Universal",
    licenseUrl: CC0_LICENSE,
    attributionRequired: false,
    attributionText: "Kenney.nl (crédito opcional; registrado por transparência)",
    tileWidth: 64,
    tileHeight: 64,
  };
}

function kenneyTinyDungeonAsset(input: Omit<TileAssetManifestEntry, "sourceUrl" | "author" | "license" | "licenseUrl" | "attributionRequired" | "attributionText" | "tileWidth" | "tileHeight">): TileAssetManifestEntry {
  return {
    ...input,
    sourceUrl: KENNEY_TINY_DUNGEON_SOURCE,
    author: "Kenney",
    license: "CC0 1.0 Universal",
    licenseUrl: CC0_LICENSE,
    attributionRequired: false,
    attributionText: "Kenney.nl (crédito opcional; registrado por transparência)",
    tileWidth: 16,
    tileHeight: 16,
  };
}

function ogaOverworldAsset(input: Omit<TileAssetManifestEntry, "sourceUrl" | "author" | "license" | "licenseUrl" | "attributionRequired" | "attributionText">): TileAssetManifestEntry {
  return {
    ...input,
    sourceUrl: OGA_OVERWORLD_GRASS_SOURCE,
    author: "OpenGameArt Community",
    license: "CC0 1.0 Universal",
    licenseUrl: CC0_LICENSE,
    attributionRequired: false,
    attributionText: "Overworld Grass Biome via OpenGameArt (crédito opcional; registrado por transparência)",
  };
}

function ogaAdventurerAsset(input: Omit<TileAssetManifestEntry, "sourceUrl" | "author" | "license" | "licenseUrl" | "attributionRequired" | "attributionText">): TileAssetManifestEntry {
  return {
    ...input,
    sourceUrl: OGA_ADVENTURER_SOURCE,
    author: "TheNess",
    license: "CC0 1.0 Universal",
    licenseUrl: CC0_LICENSE,
    attributionRequired: false,
    attributionText: "TheNess via OpenGameArt (crédito apreciado, não obrigatório)",
  };
}

export const TILE_ASSET_MANIFEST: TileAssetManifestEntry[] = [
  kenneyAsset({ assetId: "grass", name: "Gramado", category: "terrain", originalFilename: "rpgTile003.png", localFilename: "/manus-storage/rpgTile003_33e8aa73.png", previewColor: "#89bd3c" }),
  kenneyAsset({ assetId: "dirt", name: "Estrada de terra", category: "road", originalFilename: "rpgTile009.png", localFilename: "/manus-storage/rpgTile009_79cd116b.png", previewColor: "#c4925f" }),
  kenneyAsset({ assetId: "water", name: "Água", category: "terrain", originalFilename: "rpgTile013.png", localFilename: "/manus-storage/rpgTile013_d17365e9.png", previewColor: "#65c0d1" }),
  kenneyAsset({ assetId: "stone", name: "Piso de pedra", category: "terrain", originalFilename: "rpgTile048.png", localFilename: "/manus-storage/rpgTile048_caeb7d23.png", previewColor: "#d9d0b3" }),
  kenneyAsset({ assetId: "wall", name: "Muralha", category: "wall", originalFilename: "rpgTile072.png", localFilename: "/manus-storage/rpgTile072_72f04bff.png", previewColor: "#919aa0" }),
  kenneyAsset({ assetId: "roof", name: "Telhado", category: "building", originalFilename: "rpgTile103.png", localFilename: "/manus-storage/rpgTile103_f3c84c44.png", previewColor: "#a46e45" }),
  kenneyAsset({ assetId: "bush", name: "Arbusto", category: "flora", originalFilename: "rpgTile160.png", localFilename: "/manus-storage/rpgTile160_d1a6d3b1.png", previewColor: "#5e9d42" }),
  kenneyAsset({ assetId: "tree", name: "Árvore de copa verde", category: "flora", originalFilename: "rpgTile176.png", localFilename: "/manus-storage/rpgTile176_76f6d1a9.png", previewColor: "#618b39" }),
  kenneyAsset({ assetId: "fence", name: "Cerca", category: "decoration", originalFilename: "rpgTile181.png", localFilename: "/manus-storage/rpgTile181_097bb068.png", previewColor: "#967044" }),
  kenneyAsset({ assetId: "barrel", name: "Barril", category: "decoration", originalFilename: "rpgTile183.png", localFilename: "/manus-storage/rpgTile183_157919f3.png", previewColor: "#9e7540" }),
  kenneyAsset({ assetId: "oak", name: "Carvalho", category: "flora", originalFilename: "rpgTile195.png", localFilename: "/manus-storage/rpgTile195_7b2748d8.png", previewColor: "#67903d" }),
  kenneyAsset({ assetId: "fence_long", name: "Cerca horizontal", category: "decoration", originalFilename: "rpgTile200.png", localFilename: "/manus-storage/rpgTile200_fe35cd13.png", previewColor: "#a77c4d" }),
  kenneyTinyDungeonAsset({ assetId: "explorer", name: "Explorador", category: "character", originalFilename: "tile_0085.png", localFilename: "/manus-storage/tile_0085_d4fc6516.png", previewColor: "#c78e63" }),
  kenneyTinyDungeonAsset({ assetId: "villager", name: "Habitante", category: "character", originalFilename: "tile_0084.png", localFilename: "/manus-storage/tile_0084_af7cbe21.png", previewColor: "#8d5b8f" }),
  kenneyTinyDungeonAsset({ assetId: "goblin", name: "Goblino", category: "character", originalFilename: "tile_0110.png", localFilename: "/manus-storage/tile_0110_3dbf8ff3.png", previewColor: "#c24e46" }),
  ogaOverworldAsset({ assetId: "oga_grass", name: "Gramado do Vale", category: "terrain", originalFilename: "overworld_tileset_grass.png (recorte de gramado)", localFilename: "/manus-storage/vale-ambar-grass_cd07443a.png", tileWidth: 16, tileHeight: 16, previewColor: "#7FA65A" }),
  ogaOverworldAsset({ assetId: "oga_grass_flowers", name: "Gramado florido do Vale", category: "terrain", originalFilename: "overworld_tileset_grass.png (recorte de flores)", localFilename: "/manus-storage/vale-ambar-grass-flowers_b8d10c91.png", tileWidth: 16, tileHeight: 16, previewColor: "#95AD62" }),
  ogaOverworldAsset({ assetId: "oga_path", name: "Trilha clara do Vale", category: "road", originalFilename: "overworld_tileset_grass.png (recorte de trilha)", localFilename: "/manus-storage/vale-ambar-path_b6e3b152.png", tileWidth: 16, tileHeight: 16, previewColor: "#D6B06D" }),
  ogaOverworldAsset({ assetId: "oga_water", name: "Água do Vale", category: "terrain", originalFilename: "overworld_tileset_grass.png (recorte de água)", localFilename: "/manus-storage/vale-ambar-water_2d11e2c5.png", tileWidth: 16, tileHeight: 16, previewColor: "#5A9CAA" }),
  ogaOverworldAsset({ assetId: "oga_stone", name: "Pedra do Vale", category: "rock", originalFilename: "overworld_tileset_grass.png (recorte de pedra)", localFilename: "/manus-storage/vale-ambar-stone_9095b7f2.png", tileWidth: 16, tileHeight: 16, previewColor: "#A89E8A" }),
  ogaOverworldAsset({ assetId: "oga_wall", name: "Muro do Vale", category: "wall", originalFilename: "overworld_tileset_grass.png (recorte de muro)", localFilename: "/manus-storage/vale-ambar-wall_ba5e000b.png", tileWidth: 16, tileHeight: 16, previewColor: "#898275" }),
  ogaOverworldAsset({ assetId: "oga_tree", name: "Árvore do Vale", category: "flora", originalFilename: "overworld_tileset_grass.png (recorte de árvore)", localFilename: "/manus-storage/vale-ambar-tree_b687db29.png", tileWidth: 48, tileHeight: 48, previewColor: "#587D4B" }),
  ogaOverworldAsset({ assetId: "oga_flower_bed", name: "Canteiro do Vale", category: "flora", originalFilename: "overworld_tileset_grass.png (recorte de canteiro)", localFilename: "/manus-storage/vale-ambar-flower-bed_f48fafee.png", tileWidth: 16, tileHeight: 16, previewColor: "#AF8C70" }),
  ogaAdventurerAsset({ assetId: "oga_adventurer", name: "Aventureiro do Vale", category: "character", originalFilename: "sprite_oga.png", localFilename: "/manus-storage/sprite_oga_f4502ba6.png", tileWidth: 16, tileHeight: 11, previewColor: "#D7B48A" }),
  {
    assetId: "loot_chest",
    name: "Baú de saque fechado",
    category: "decoration",
    sourceUrl: OPEN_GAME_ART_CHEST_SOURCE,
    author: "Blarumyrran",
    license: "CC0 1.0 Universal",
    licenseUrl: CC0_LICENSE,
    attributionRequired: false,
    attributionText: "Blarumyrran via OpenGameArt (crédito opcional; registrado por transparência)",
    originalFilename: "chests_32x32.png (frame fechado)",
    localFilename: "/manus-storage/loot-chest-closed_7788d04d.png",
    tileWidth: 32,
    tileHeight: 32,
    previewColor: "#9d7148",
  },
];

export const TILE_ASSET_IDS = new Set(TILE_ASSET_MANIFEST.map((asset) => asset.assetId));

export function getTileAsset(assetId: string): TileAssetManifestEntry | undefined {
  return TILE_ASSET_MANIFEST.find((asset) => asset.assetId === assetId);
}
