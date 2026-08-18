import { describe, expect, it } from "vitest";
import { attemptCombatWithResources } from "./combatAttemptPipeline";

describe("tentativa de combate no cliente", () => {
  const skills = [{ key: "ember-strike", name: "Lança Ígnea", manaCost: 12, energyCost: 4 }];

  it("não chama a mutação e avisa o jogador quando os recursos são insuficientes", () => {
    const mutations: unknown[] = [];
    const notices: string[] = [];
    const attempted = attemptCombatWithResources({
      request: { monsterKey: "field-boar", skillKey: "ember-strike" },
      skills,
      mp: 7,
      energy: 0,
      mutate: (request) => mutations.push(request),
      notify: (message) => notices.push(message),
    });

    expect(attempted).toBe(false);
    expect(mutations).toEqual([]);
    expect(notices).toEqual(["Lança Ígnea requer 12 MP e 4 EN. Aguarde a recuperação dos seus recursos."]);
  });

  it("encaminha a requisição normalmente quando os recursos são suficientes", () => {
    const mutations: unknown[] = [];
    const attempted = attemptCombatWithResources({
      request: { monsterKey: "field-boar", skillKey: "ember-strike" },
      skills,
      mp: 12,
      energy: 4,
      mutate: (request) => mutations.push(request),
      notify: () => undefined,
    });
    expect(attempted).toBe(true);
    expect(mutations).toEqual([{ monsterKey: "field-boar", skillKey: "ember-strike" }]);
  });
});
