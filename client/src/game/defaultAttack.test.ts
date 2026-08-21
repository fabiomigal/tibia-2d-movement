import { describe, expect, it } from "vitest";
import { createDefaultAttackRequest, resolveDefaultAttackFlow, resolveDefaultAttackFromDoubleClick } from "./defaultAttack";

describe("createDefaultAttackRequest", () => {
  it("marca o alvo para usar o ataque básico", () => {
    expect(createDefaultAttackRequest(101, "field-boar")).toEqual({ monsterEncounterId: 101, monsterKey: "field-boar", defaultAttack: true });
  });

  it("leva o duplo clique até a aproximação e ao golpe quando o alvo entra em alcance", () => {
    const fromDistance = resolveDefaultAttackFlow(101, { x: -4.5, z: -2.5 }, { x: 2.2, z: 5.6 });
    expect(fromDistance.request).toEqual({ monsterEncounterId: 101, monsterKey: undefined, defaultAttack: true });
    expect(fromDistance.approach.kind).toBe("move");
    if (fromDistance.approach.kind === "move") {
      expect(resolveDefaultAttackFlow(101, fromDistance.approach.destination, { x: 2.2, z: 5.6 }).approach).toEqual({ kind: "attack" });
    }
  });

  it("conecta o alvo real do duplo clique à emissão do ataque básico pronto", () => {
    const fromDoubleClick = resolveDefaultAttackFromDoubleClick(
      { kind: "monster", monsterEncounterId: 101, monsterKey: "field-boar", x: 2.2, z: 5.6 },
      { x: -4.5, z: -2.5 },
    );
    expect(fromDoubleClick?.request).toEqual({ monsterEncounterId: 101, monsterKey: "field-boar", defaultAttack: true });
    expect(fromDoubleClick?.approach.kind).toBe("move");
    if (fromDoubleClick?.approach.kind === "move") {
      expect(resolveDefaultAttackFlow(101, fromDoubleClick.approach.destination, { x: 2.2, z: 5.6 }).approach).toEqual({ kind: "attack" });
    }
    expect(resolveDefaultAttackFromDoubleClick(undefined, { x: 0, z: 0 })).toBeNull();
  });
});
