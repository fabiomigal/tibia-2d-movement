import { describe, expect, it } from "vitest";
import { dispatchCombatRequestFromAttackReady } from "./combatRequestPipeline";

describe("consumidor de ataque pronto", () => {
  it("encaminha o ataque básico sem skill equipada para a requisição de combate", () => {
    const requests: unknown[] = [];
    const handled = dispatchCombatRequestFromAttackReady({
      event: new CustomEvent("vale:attack-target-ready", { detail: { monsterEncounterId: 101, monsterKey: "field-boar", defaultAttack: true } }),
      selectedSkill: "ember-strike",
      mutate: (request) => requests.push(request),
    });

    expect(handled).toBe(true);
    expect(requests).toEqual([{ monsterEncounterId: 101, skillKey: undefined }]);
  });

  it("usa a habilidade selecionada apenas quando o ataque não é básico", () => {
    const requests: unknown[] = [];
    dispatchCombatRequestFromAttackReady({
      event: new CustomEvent("vale:attack-target-ready", { detail: { monsterEncounterId: 102, monsterKey: "wind-goblin", defaultAttack: false } }),
      selectedSkill: "ember-strike",
      mutate: (request) => requests.push(request),
    });
    expect(requests).toEqual([{ monsterEncounterId: 102, skillKey: "ember-strike" }]);
  });
});
