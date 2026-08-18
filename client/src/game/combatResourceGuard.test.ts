import { describe, expect, it } from "vitest";
import { checkCombatResources } from "./combatResourceGuard";

describe("verificação preventiva de recursos de combate", () => {
  const spell = { name: "Lança Ígnea", manaCost: 12, energyCost: 4 };

  it("permite a habilidade quando MP e energia são suficientes", () => {
    expect(checkCombatResources(spell, 12, 4)).toEqual({ allowed: true });
  });

  it("transforma a falta de recurso em mensagem de jogo amigável", () => {
    expect(checkCombatResources(spell, 7, 0)).toEqual({
      allowed: false,
      message: "Lança Ígnea requer 12 MP e 4 EN. Aguarde a recuperação dos seus recursos.",
    });
  });
});
