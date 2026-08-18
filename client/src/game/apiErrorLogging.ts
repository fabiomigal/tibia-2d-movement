/** Erros de regra que já recebem feedback no HUD não devem poluir o console técnico. */
export function isExpectedGameRuleError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "message" in error
    && (error as { message?: unknown }).message === "Recursos insuficientes para esta habilidade.";
}
