export type CombatFloatTarget = "player" | "monster";
export type CombatFloatKind = "damage" | "critical" | "heal";

export type CombatFloatEvent = {
  target: CombatFloatTarget;
  kind: CombatFloatKind;
  value: number;
  monsterKey?: string;
  monsterEncounterId?: number;
};

export type ScreenCombatFloat = {
  id: string;
  x: number;
  y: number;
  value: number;
  kind: CombatFloatKind;
  lifetime: number;
};

/** Impede que uma projeção do canvas gere estilos CSS inválidos na camada HTML. */
export function hasFiniteScreenCoordinates(x: number, y: number): boolean {
  return Number.isFinite(x) && Number.isFinite(y);
}

export function toRenderableCombatFloatPosition(
  projectedX: number,
  projectedY: number,
  canvasWidth: number,
  canvasHeight: number,
  layerWidth: number,
  layerHeight: number,
): { x: number; y: number } | null {
  if (
    !hasFiniteScreenCoordinates(projectedX, projectedY) ||
    !Number.isFinite(canvasWidth) || !Number.isFinite(canvasHeight) ||
    !Number.isFinite(layerWidth) || !Number.isFinite(layerHeight) ||
    canvasWidth <= 0 || canvasHeight <= 0 || layerWidth <= 0 || layerHeight <= 0
  ) return null;
  const x = (projectedX / canvasWidth) * layerWidth;
  const y = (projectedY / canvasHeight) * layerHeight;
  const horizontalInset = Math.min(42, layerWidth * 0.08);
  const verticalInset = Math.min(46, layerHeight * 0.09);
  return {
    x: Math.min(layerWidth - horizontalInset, Math.max(horizontalInset, x)),
    y: Math.min(layerHeight - verticalInset, Math.max(verticalInset, y)),
  };
}

/** Valida o payload recebido pela camada HTML antes de aplicá-lo a estilos CSS. */
export function normalizeScreenCombatFloat(value: unknown): ScreenCombatFloat | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<ScreenCombatFloat>;
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.value !== "number" ||
    typeof candidate.lifetime !== "number" ||
    !hasFiniteScreenCoordinates(candidate.x ?? Number.NaN, candidate.y ?? Number.NaN) ||
    !Number.isFinite(candidate.value) || !Number.isFinite(candidate.lifetime) ||
    (candidate.kind !== "damage" && candidate.kind !== "critical" && candidate.kind !== "heal")
  ) return null;
  return candidate as ScreenCombatFloat;
}

type CombatFloatSource = {
  monsterKey: string;
  monsterEncounterId?: number;
  damage: number;
  critical: boolean;
  counterDamage: number;
  counterCritical: boolean;
  healing: number;
};

/** Converte o resultado de uma rodada em feedback visual sem depender do canvas. */
export function createCombatFloatEvents(result: CombatFloatSource): CombatFloatEvent[] {
  const events: CombatFloatEvent[] = [];
  if (result.damage > 0) {
    events.push({ 
      target: "monster", 
      monsterKey: result.monsterKey, 
      monsterEncounterId: result.monsterEncounterId,
      kind: result.critical ? "critical" : "damage", 
      value: result.damage 
    });
  }
  if (result.counterDamage > 0) events.push({ target: "player", kind: result.counterCritical ? "critical" : "damage", value: result.counterDamage });
  if (result.healing > 0) events.push({ target: "player", kind: "heal", value: result.healing });
  return events;
}
