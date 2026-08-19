import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";
import type { CollisionWorld } from "./CollisionWorld";

const asset = {
  cityBackdrop: "/manus-storage/cidade-ambar_cea13ed9.webp",
  windBackdrop: "/manus-storage/estrada-dos-ventos_88880585.webp",
  grass: "/manus-storage/grass_base_b9fd866c.png",
  cobble: "/manus-storage/light_cobblestone_c07f4862.png",
  roadVertical: "/manus-storage/road_vertical_3ab1e24c.png",
  roadHorizontal: "/manus-storage/road_horizontal_89c91e40.png",
  intersection: "/manus-storage/road_intersection_721efd02.png",
  plaza: "/manus-storage/stone_plaza_ff9b74e3.png",
  bridgeDeck: "/manus-storage/bridge_deck_1429880e.png",
  water: "/manus-storage/deep_water_005fa397.png",
  riverBank: "/manus-storage/river_bank_4e23c9dc.png",
  mountain: "/manus-storage/mountain_base_30a981c5.png",
  cliff: "/manus-storage/cliff_wall_e7dd11db.png",
  pine: "/manus-storage/pine_large_360c51a3.png",
  bush: "/manus-storage/dense_bush_7b4b2d04.png",
  house: "/manus-storage/timber_house_10d4210c.png",
  hall: "/manus-storage/stone_hall_3a62ac02.png",
  market: "/manus-storage/market_stall_0b98b944.png",
  wall: "/manus-storage/stone_wall_efc220a0.png",
  gate: "/manus-storage/stone_gate_a9617681.png",
  tower: "/manus-storage/watchtower_3a477430.png",
  bridge: "/manus-storage/wooden_bridge_4e2b5136.png",
  fountain: "/manus-storage/fountain_f47dc948.png",
  lamp: "/manus-storage/torch_lamp_e7dd11db.png",
  merchant: "/manus-storage/merchant_npc_4bfd04d7.png",
  signpost: "/manus-storage/signpost_blank_3542ed8c.png",
} as const;

export const ZAO_MAP_LAYOUT = {
  city: { label: "Cidade de Âmbar", center: { x: -5.2, z: -3.6 }, riverX: -1.15 },
  windRoad: { label: "Estrada dos Ventos", fromZ: 1.5, toZ: 15.1, gate: { x: 5.1, z: 13.6 } },
} as const;

/** Resolve a subárea ativa do mapa contínuo para o HUD e o minimapa. */
export function resolveZaoSubarea(x: number, z: number): "bamboo-forest" | "wind-road" {
  return z >= ZAO_MAP_LAYOUT.windRoad.fromZ ? "wind-road" : "bamboo-forest";
}

function material(scene: Scene, name: string, url: string, alpha = 1) {
  const mat = new StandardMaterial(`${name}-material`, scene);
  const texture = new Texture(url, scene, false, false, Texture.NEAREST_SAMPLINGMODE);
  texture.hasAlpha = true;
  mat.diffuseTexture = texture;
  mat.emissiveTexture = texture;
  mat.diffuseColor = Color3.White();
  mat.emissiveColor = Color3.White();
  mat.specularColor = Color3.Black();
  mat.useAlphaFromDiffuseTexture = true;
  mat.backFaceCulling = false;
  mat.disableLighting = true;
  mat.alpha = alpha;
  return mat;
}

function ground(scene: Scene, name: string, x: number, z: number, width: number, height: number, url: string, y: number, tileSize = 1.45) {
  const mesh = MeshBuilder.CreateGround(name, { width, height, subdivisions: 1 }, scene);
  mesh.position.set(x, y, z);
  const mat = material(scene, name, url);
  if (mat.diffuseTexture instanceof Texture) {
    mat.diffuseTexture.uScale = width / tileSize;
    mat.diffuseTexture.vScale = height / tileSize;
    mat.diffuseTexture.wrapU = Texture.WRAP_ADDRESSMODE;
    mat.diffuseTexture.wrapV = Texture.WRAP_ADDRESSMODE;
  }
  mesh.material = mat;
  mesh.isPickable = false;
  return mesh;
}

function backdrop(scene: Scene, name: string, x: number, z: number, width: number, height: number, url: string) {
  const mesh = MeshBuilder.CreateGround(name, { width, height, subdivisions: 1 }, scene);
  mesh.position.set(x, 0.026, z);
  const mat = material(scene, name, url);
  if (mat.diffuseTexture instanceof Texture) {
    mat.diffuseTexture.uScale = 1;
    mat.diffuseTexture.vScale = 1;
    mat.diffuseTexture.wrapU = Texture.CLAMP_ADDRESSMODE;
    mat.diffuseTexture.wrapV = Texture.CLAMP_ADDRESSMODE;
  }
  mesh.material = mat;
  mesh.isPickable = false;
  return mesh;
}

function prop(scene: Scene, name: string, x: number, z: number, size: number, url: string, y = 0.075) {
  const mesh = MeshBuilder.CreatePlane(name, { width: size, height: size }, scene);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y, z);
  mesh.material = material(scene, name, url);
  mesh.isPickable = false;
  return mesh;
}

/** Mapas Zao completos: a cidade ocupa a margem sul e a estrada conduz ao portal norte. */
export function createZaoInitialMaps(scene: Scene, collision: CollisionWorld) {
  backdrop(scene, "zao-city-amber-backdrop", -5.2, -3.6, 22.4, 12.6, asset.cityBackdrop);
  backdrop(scene, "zao-wind-road-backdrop", 5.1, 9.0, 22.4, 12.6, asset.windBackdrop);

  // A navegação permanece contínua; apenas as faixas de rio seguem intransponíveis.
  collision.addRectangle(-1.56, -9.1, -0.24, 3.5);
  collision.addRectangle(7.38, -0.2, 8.62, 15.55);
}
