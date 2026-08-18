import { describe, expect, it } from "vitest";
import { isExpectedGameRuleError } from "./apiErrorLogging";

describe("classificação de erros de API do jogo", () => {
  it("reconhece recurso insuficiente como regra de combate esperada", () => {
    expect(isExpectedGameRuleError({ message: "Recursos insuficientes para esta habilidade." })).toBe(true);
  });

  it("mantém falhas inesperadas disponíveis para diagnóstico técnico", () => {
    expect(isExpectedGameRuleError({ message: "Falha de conexão." })).toBe(false);
  });
});
