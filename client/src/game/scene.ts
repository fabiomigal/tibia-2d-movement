/** Horizonte em Miniatura: a cena nasce uma vez por canvas, com o mundo como dono de regras e do descarte. */
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { GameWorld } from "./GameWorld";

export interface GameHandle {
  readonly scene: Scene;
  dispose(): void;
}

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.09, 0.15, 0.14, 1);
  scene.ambientColor = new Color3(0.74, 0.8, 0.65);

  const daylight = new HemisphericLight("late-afternoon-light", new Vector3(-0.25, 1, 0.32), scene);
  daylight.intensity = 1.25;
  daylight.diffuse = Color3.FromHexString("#F6E3B8");
  daylight.groundColor = Color3.FromHexString("#49634E");

  const isDemo = new URLSearchParams(window.location.search).has("demo");
  const world = new GameWorld(scene, canvas, isDemo);
  scene.onBeforeRenderObservable.add(() => {
    const delta = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05);
    world.update(delta);
  });

  return {
    scene,
    dispose: () => {
      world.dispose();
      scene.dispose();
    },
  };
}
