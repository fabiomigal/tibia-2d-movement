import { normalizeScreenCombatFloat, type ScreenCombatFloat } from "./combatFloatEvents";

/** Acrescenta à camada visual somente indicadores seguros para estilos CSS. */
export function appendRenderableCombatFloat(current: readonly ScreenCombatFloat[], payload: unknown): ScreenCombatFloat[] {
  const detail = normalizeScreenCombatFloat(payload);
  return detail ? [...current, detail] : [...current];
}
