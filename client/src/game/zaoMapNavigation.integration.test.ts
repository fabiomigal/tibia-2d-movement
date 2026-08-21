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

describe("travessia livre do campo uniforme", () => {
  const disposables: Scene[] = [];

  afterEach(() => {
    disposables.splice(0).forEach((scene) => scene.getEngine().dispose());
  });

  it("permite seguir diretamente da Cidade de Âmbar à Estrada dos Ventos", () => {
    const scene = new Scene(new NullEngine());
    disposables.push(scene);
    const collision = new CollisionWorld({ minX: -20, maxX: 20, minZ: -16, maxZ: 20 });
    createZaoInitialMaps(scene, collision);
    const player = new Player(scene, new Vector2(-4.5, -2.5));

    travel(player, collision, new Vector2(5.1, 8.2));

    expect(player.position.x).toBeCloseTo(5.1, 1);
    expect(player.position.y).toBeGreaterThanOrEqual(8);
    expect(resolveZaoSubarea(player.position.x, player.position.y)).toBe("wind-road");
  });

  it("não instala rios, pontes, casas ou muros como bloqueios internos", () => {
    const scene = new Scene(new NullEngine());
    disposables.push(scene);
    const collision = new CollisionWorld({ minX: -20, maxX: 20, minZ: -16, maxZ: 20 });
    createZaoInitialMaps(scene, collision);

    const cityField = new Player(scene, new Vector2(-2.5, -6));
    travel(cityField, collision, new Vector2(0, -6));
    expect(cityField.position.x).toBeCloseTo(0, 1);

    const windField = new Player(scene, new Vector2(5.25, 4.2));
    travel(windField, collision, new Vector2(8.1, 4.2));
    expect(windField.position.x).toBeCloseTo(8.1, 1);
  });
});
