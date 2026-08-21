import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";

const WORLD_WIDTH = 48;
const WORLD_HEIGHT = 34;
const GROUND_LEVEL = 0.018;
const IS_GITHUB_PAGES = import.meta.env.VITE_GITHUB_PAGES === "true";

/** Sprite autorizada pelo usuário, repetida uma vez para cada célula de mundo. */
export const UNIFORM_FIELD_TILE_URL = IS_GITHUB_PAGES
  ? `${import.meta.env.BASE_URL}field-assets/amber-field-uniform.png`
  : "/manus-storage/amber-field-uniform_e1aac744.png";

export const UNIFORM_FIELD_DIMENSIONS = { width: WORLD_WIDTH, height: WORLD_HEIGHT } as const;

/**
 * Cria o único plano visual do mundo. A textura é repetida em cada unidade da
 * grade para que todos os biomas exibam o mesmo campo limpo solicitado.
 */
export function createZaoTileWorld(scene: Scene) {
  const material = new StandardMaterial("uniform-field-material", scene);
  const texture = new Texture(UNIFORM_FIELD_TILE_URL, scene, true, false);
  texture.uScale = WORLD_WIDTH;
  texture.vScale = WORLD_HEIGHT;
  texture.hasAlpha = false;
  material.diffuseTexture = texture;
  material.emissiveTexture = texture;
  material.diffuseColor = Color3.White();
  material.emissiveColor = Color3.White();
  material.specularColor = Color3.Black();
  material.disableLighting = true;
  material.backFaceCulling = false;

  const ground = MeshBuilder.CreateGround("walkable-grass", { width: WORLD_WIDTH, height: WORLD_HEIGHT, subdivisions: 1 }, scene);
  ground.position.y = GROUND_LEVEL;
  ground.material = material;
  ground.isPickable = true;
}
