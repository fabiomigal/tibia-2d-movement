/** Horizonte em Miniatura: testes de colisão protegem a previsibilidade do campo e da rota do jogador. */
import { Vector2 } from "@babylonjs/core/Maths/math.vector";
import { describe, expect, it } from "vitest";
import { CollisionWorld } from "./CollisionWorld";

const bounds = { minX: -10, maxX: 10, minZ: -10, maxZ: 10 };

describe("CollisionWorld", () => {
  it("impede atravessar um obstáculo circular mesmo em um deslocamento longo", () => {
    const world = new CollisionWorld(bounds);
    world.addCircle(new Vector2(0, 0), 1);

    const result = world.resolve(new Vector2(-5, 0), new Vector2(10, 0), 0.5);

    expect(result.x).toBeLessThanOrEqual(-1.5);
    expect(result.y).toBe(0);
  });

  it("preserva o eixo livre para permitir deslize ao tangenciar uma rocha", () => {
    const world = new CollisionWorld(bounds);
    world.addCircle(new Vector2(0, 0), 1);

    const result = world.resolve(new Vector2(-1.55, -2), new Vector2(1, 2.8), 0.5);

    expect(result.y).toBeGreaterThan(-1);
    expect(Vector2.Distance(result, Vector2.Zero())).toBeGreaterThanOrEqual(1.5);
  });

  it("mantém o jogador dentro da margem do mundo", () => {
    const world = new CollisionWorld(bounds);

    const result = world.resolve(new Vector2(8.8, 0), new Vector2(5, 0), 0.5);

    expect(result.x).toBeLessThanOrEqual(9.5);
    expect(result.y).toBe(0);
  });
});
