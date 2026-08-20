import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";
import { getTileAsset } from "../tilemap/catalog";
import type { CollisionWorld } from "./CollisionWorld";

const IS_STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === "true";
type AssetId = "grass" | "dirt" | "stone" | "wall" | "tree" | "oak" | "bush";
type MapDefinition = { id: string; label: string; x: number; z: number; width: number; height: number; floor: AssetId; tone: string };

export const EXPLORATION_MAPS: readonly MapDefinition[] = [
  { id: "amber-inn", label: "Estalagem do Âmbar", x: -18.2, z: 12.6, width: 7.2, height: 6.1, floor: "stone", tone: "#D7BD8B" },
  { id: "moon-sanctuary", label: "Santuário da Lua", x: 18.2, z: -11.8, width: 8.6, height: 7.1, floor: "dirt", tone: "#97A784" },
];

function material(scene: Scene, id: AssetId, tone: string, cache: Map<string, StandardMaterial>) {
  const key = `${id}:${tone}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const asset = getTileAsset(id);
  if (!asset) throw new Error(`Asset de exploração ausente: ${id}`);
  const output = new StandardMaterial(`exploration-${key}`, scene);
  const tint = Color3.FromHexString(tone);
  if (!IS_STATIC_DEMO) {
    const texture = new Texture(asset.localFilename, scene, false, false, Texture.NEAREST_SAMPLINGMODE);
    texture.hasAlpha = true;
    texture.wrapU = Texture.WRAP_ADDRESSMODE;
    texture.wrapV = Texture.WRAP_ADDRESSMODE;
    output.diffuseTexture = texture;
    output.emissiveTexture = texture;
  }
  output.diffuseColor = tint;
  output.emissiveColor = tint;
  output.specularColor = Color3.Black();
  output.backFaceCulling = false;
  output.disableLighting = true;
  cache.set(key, output);
  return output;
}

function ground(scene: Scene, definition: MapDefinition, cache: Map<string, StandardMaterial>) {
  const mesh = MeshBuilder.CreateGround(`exploration-floor-${definition.id}`, { width: definition.width, height: definition.height }, scene);
  mesh.position.set(definition.x, 0.041, definition.z);
  mesh.material = material(scene, definition.floor, definition.tone, cache);
  mesh.isPickable = true;
  return mesh;
}

function wall(scene: Scene, x: number, z: number, width: number, depth: number, name: string, cache: Map<string, StandardMaterial>) {
  const mesh = MeshBuilder.CreateBox(name, { width, height: 0.42, depth }, scene);
  mesh.position.set(x, 0.24, z);
  mesh.material = material(scene, "wall", "#B8B0A0", cache);
  mesh.isPickable = false;
}

function decoration(scene: Scene, id: "tree" | "oak" | "bush", x: number, z: number, scale: number, cache: Map<string, StandardMaterial>) {
  const mesh = MeshBuilder.CreatePlane(`exploration-${id}-${x}-${z}`, { width: scale, height: scale }, scene);
  mesh.position.set(x, 0.095, z);
  mesh.rotation.x = Math.PI / 2;
  mesh.material = material(scene, id, "#FFFFFF", cache);
  mesh.isPickable = false;
}

/** Constrói espaços distantes fisicamente para permitir transição sem alterar o núcleo de movimento ou câmera. */
export function createExplorationMaps(scene: Scene, collision: CollisionWorld) {
  const cache = new Map<string, StandardMaterial>();
  const [inn, sanctuary] = EXPLORATION_MAPS;
  if (!inn || !sanctuary) return;

  ground(scene, inn, cache);
  const innLeft = inn.x - inn.width / 2;
  const innRight = inn.x + inn.width / 2;
  const innTop = inn.z - inn.height / 2;
  const innBottom = inn.z + inn.height / 2;
  wall(scene, inn.x, innTop, inn.width, 0.36, "inn-wall-north", cache);
  wall(scene, inn.x, innBottom, inn.width, 0.36, "inn-wall-south", cache);
  wall(scene, innLeft, inn.z, 0.36, inn.height, "inn-wall-west", cache);
  wall(scene, innRight, inn.z, 0.36, inn.height, "inn-wall-east", cache);
  wall(scene, inn.x + 1.2, inn.z - 0.8, 1.25, 0.72, "inn-table", cache);
  collision.addRectangle(innLeft - 0.18, innRight + 0.18, innTop - 0.18, innTop + 0.18);
  collision.addRectangle(innLeft - 0.18, innRight + 0.18, innBottom - 0.18, innBottom + 0.18);
  collision.addRectangle(innLeft - 0.18, innLeft + 0.18, innTop - 0.18, innBottom + 0.18);
  collision.addRectangle(innRight - 0.18, innRight + 0.18, innTop - 0.18, innBottom + 0.18);
  collision.addRectangle(inn.x + 0.58, inn.x + 1.82, inn.z - 1.15, inn.z - 0.45);

  ground(scene, sanctuary, cache);
  const sanctuaryLeft = sanctuary.x - sanctuary.width / 2;
  const sanctuaryRight = sanctuary.x + sanctuary.width / 2;
  const sanctuaryTop = sanctuary.z - sanctuary.height / 2;
  const sanctuaryBottom = sanctuary.z + sanctuary.height / 2;
  wall(scene, sanctuary.x, sanctuaryTop, sanctuary.width, 0.3, "sanctuary-cliff-north", cache);
  wall(scene, sanctuary.x, sanctuaryBottom, sanctuary.width, 0.3, "sanctuary-cliff-south", cache);
  wall(scene, sanctuaryLeft, sanctuary.z, 0.3, sanctuary.height, "sanctuary-cliff-west", cache);
  wall(scene, sanctuaryRight, sanctuary.z, 0.3, sanctuary.height, "sanctuary-cliff-east", cache);
  decoration(scene, "tree", sanctuaryLeft + 1, sanctuaryTop + 1.1, 1.15, cache);
  decoration(scene, "oak", sanctuaryRight - 1.2, sanctuaryTop + 1.15, 1.05, cache);
  decoration(scene, "bush", sanctuaryLeft + 1.15, sanctuaryBottom - 1.1, 0.85, cache);
  decoration(scene, "bush", sanctuaryRight - 1.05, sanctuaryBottom - 1, 0.78, cache);
  collision.addRectangle(sanctuaryLeft - 0.15, sanctuaryRight + 0.15, sanctuaryTop - 0.15, sanctuaryTop + 0.15);
  collision.addRectangle(sanctuaryLeft - 0.15, sanctuaryRight + 0.15, sanctuaryBottom - 0.15, sanctuaryBottom + 0.15);
  collision.addRectangle(sanctuaryLeft - 0.15, sanctuaryLeft + 0.15, sanctuaryTop - 0.15, sanctuaryBottom + 0.15);
  collision.addRectangle(sanctuaryRight - 0.15, sanctuaryRight + 0.15, sanctuaryTop - 0.15, sanctuaryBottom + 0.15);
}
