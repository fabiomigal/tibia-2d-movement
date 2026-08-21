import { describe, expect, it } from "vitest";
import { dispatchDefaultAttackFromDoubleClick } from "./combatTargetPipeline";
import { resolveDefaultAttackFlow } from "./defaultAttack";

function createDoubleClick(button = 0) {
  let prevented = 0;
  return {
    event: { button, clientX: 96, clientY: 78, preventDefault: () => prevented++ },
    prevented: () => prevented,
  };
}

describe("pipeline de duplo clique de combate", () => {
  it("faz pick relativo ao canvas e emite a ordem de ataque básico do alvo", () => {
    const target = new EventTarget();
    const emitted: unknown[] = [];
    const pickedAt: Array<[number, number]> = [];
    target.addEventListener("vale:attack-target", (event) => emitted.push((event as CustomEvent).detail));
    const { event, prevented } = createDoubleClick();

    const dispatched = dispatchDefaultAttackFromDoubleClick({
      target,
      event,
      bounds: { left: 12, top: 18 },
      player: { x: -4.5, z: -2.5 },
      pick: (x, y) => {
        pickedAt.push([x, y]);
        return { metadata: { valeInteraction: { kind: "monster", monsterEncounterId: 101, monsterKey: "field-boar", x: 2.2, z: 5.6 } } };
      },
    });

    expect(dispatched).toBe(true);
    expect(pickedAt).toEqual([[84, 60]]);
    expect(prevented()).toBe(1);
    expect(emitted).toEqual([{ monsterEncounterId: 101, monsterKey: "field-boar", defaultAttack: true }]);
  });

  it("não consome o gesto quando não há monstro válido ou quando não é clique primário", () => {
    const target = new EventTarget();
    const invalid = createDoubleClick();
    expect(dispatchDefaultAttackFromDoubleClick({ target, event: invalid.event, bounds: { left: 0, top: 0 }, player: { x: 0, z: 0 }, pick: () => null })).toBe(false);
    expect(invalid.prevented()).toBe(0);

    const secondary = createDoubleClick(2);
    expect(dispatchDefaultAttackFromDoubleClick({ target, event: secondary.event, bounds: { left: 0, top: 0 }, player: { x: 0, z: 0 }, pick: () => ({ metadata: { valeInteraction: { kind: "monster", monsterEncounterId: 101, monsterKey: "field-boar", x: 2.2, z: 5.6 } } }) })).toBe(false);
    expect(secondary.prevented()).toBe(0);
  });

  it("mantém o ataque básico até a aproximação, o evento de alvo pronto e o pedido de combate", () => {
    const target = new EventTarget();
    let selected: { monsterEncounterId: number; monsterKey: string; defaultAttack: true } | null = null;
    const combatRequests: Array<{ monsterEncounterId: number; monsterKey: string; skillKey?: string }> = [];
    target.addEventListener("vale:attack-target", (event) => { selected = (event as CustomEvent<typeof selected>).detail; });
    target.addEventListener("vale:attack-target-ready", (event) => {
      const detail = (event as CustomEvent<{ monsterEncounterId: number; monsterKey: string; defaultAttack: boolean }>).detail;
      combatRequests.push({ monsterEncounterId: detail.monsterEncounterId, monsterKey: detail.monsterKey, skillKey: detail.defaultAttack ? undefined : "ember-strike" });
    });

    const { event } = createDoubleClick();
    dispatchDefaultAttackFromDoubleClick({
      target,
      event,
      bounds: { left: 0, top: 0 },
      player: { x: -4.5, z: -2.5 },
      pick: () => ({ metadata: { valeInteraction: { kind: "monster", monsterEncounterId: 101, monsterKey: "field-boar", x: 2.2, z: 5.6 } } }),
    });
    expect(selected).toEqual({ monsterEncounterId: 101, monsterKey: "field-boar", defaultAttack: true });

    const approach = resolveDefaultAttackFlow(selected!.monsterEncounterId, { x: -4.5, z: -2.5 }, { x: 2.2, z: 5.6 }).approach;
    expect(approach.kind).toBe("move");
    if (approach.kind === "move") {
      expect(resolveDefaultAttackFlow(selected!.monsterEncounterId, approach.destination, { x: 2.2, z: 5.6 }).approach).toEqual({ kind: "attack" });
    }
    target.dispatchEvent(new CustomEvent("vale:attack-target-ready", { detail: selected }));
    expect(combatRequests).toEqual([{ monsterEncounterId: 101, monsterKey: "field-boar", skillKey: undefined }]);
  });
});
