import { resolveRestRegeneration, type RestResources } from "@shared/restRegeneration";

export type RestCycleInput = RestResources & {
  requestedRest: boolean;
  isDead: boolean;
  restStartedAtMs: number | null;
  lastResourceRegenAtMs: number | null;
  nowMs: number;
};

export type RestCycleResult = RestResources & {
  restStartedAtMs: number | null;
  lastResourceRegenAtMs: number | null;
  ticks: number;
};

/** Executa uma transição completa de repouso: recupera ticks já vencidos, inicia ou limpa seus marcadores persistidos. */
export function resolveRestCycle(input: RestCycleInput): RestCycleResult {
  const hasActiveRest = input.restStartedAtMs !== null;
  const recovery = hasActiveRest
    ? resolveRestRegeneration(input, input.lastResourceRegenAtMs ?? input.restStartedAtMs!, input.nowMs)
    : { ...input, ticks: 0, nextTickAtMs: input.nowMs };
  const shouldRest = input.requestedRest && !input.isDead;

  if (!shouldRest) {
    return {
      mp: recovery.mp,
      maxMp: input.maxMp,
      energy: recovery.energy,
      maxEnergy: input.maxEnergy,
      restStartedAtMs: null,
      lastResourceRegenAtMs: null,
      ticks: recovery.ticks,
    };
  }

  if (!hasActiveRest) {
    return {
      mp: input.mp,
      maxMp: input.maxMp,
      energy: input.energy,
      maxEnergy: input.maxEnergy,
      restStartedAtMs: input.nowMs,
      lastResourceRegenAtMs: input.nowMs,
      ticks: 0,
    };
  }

  return {
    mp: recovery.mp,
    maxMp: input.maxMp,
    energy: recovery.energy,
    maxEnergy: input.maxEnergy,
    restStartedAtMs: input.restStartedAtMs,
    lastResourceRegenAtMs: recovery.nextTickAtMs,
    ticks: recovery.ticks,
  };
}
