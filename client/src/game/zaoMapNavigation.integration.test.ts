import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { Vector2 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { afterEach, describe, expect, it } from "vitest";
import { CollisionWorld } from "./CollisionWorld";
import { Player } from "./Player";
import { createZaoInitialMaps, resolveZaoSubarea } from "./zaoMapLayout";

function travel(player: Player, collision: CollisionWorld, destination: Vector2) {
  player.setTarget(destination);
  for (let frame = 0; frame < 500 && player.hasTarget(); frame += 1) {
    player.update(0.05, null, collision, "Destino");
  }
}

describe("travessia navegável do mapa Zao", () => {
  const disposables: Scene[] = [];

  afterEach(() => {
    disposables.splice(0).forEach((scene) => scene.getEngine().dispose());
  });

  it("permite sair da Cidade de Âmbar, contornar o rio e alcançar a Estrada dos Ventos", () => {
    const scene = new Scene(new NullEngine());
    disposables.push(scene);
    const collision = new CollisionWorld({ minX: -20, maxX: 20, minZ: -16, maxZ: 20 });
    createZaoInitialMaps(scene, collision);
    const player = new Player(scene, new Vector2(-4.5, -2.5));

    travel(player, collision, new Vector2(-2.05, 4.05));
    travel(player, collision, new Vector2(5.1, 4.05));
    travel(player, collision, new Vector2(5.1, 8.2));

    expect(player.position.x).toBeCloseTo(5.1, 1);
    expect(player.position.y).toBeGreaterThanOrEqual(8);
    expect(resolveZaoSubarea(player.position.x, player.position.y)).toBe("wind-road");
  });
});
