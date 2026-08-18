import { describe, expect, it } from "vitest";
import { resolveAttackApproach } from "./targeting";

describe("mira de encontros próximos", () => {
  it("solicita ataque somente quando o personagem está ao alcance", () => {
    expect(resolveAttackApproach({ x: 0, z: 0 }, { x: 0.8, z: 0 })).toEqual({ kind: "attack" });
  });

  it("calcula um ponto de parada antes da criatura quando ela está distante", () => {
    expect(resolveAttackApproach({ x: 0, z: 0 }, { x: 5, z: 0 })).toEqual({ kind: "move", destination: { x: 4.02, z: 0 } });
  });
});
