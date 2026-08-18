export const REST_REGENERATION = {
  tickMs: 2_000,
  mpPerTick: 3,
  energyPerTick: 4,
} as const;

export type RestResources = {
  mp: number;
  maxMp: number;
  energy: number;
  maxEnergy: number;
};

/** Calcula recuperação por ticks completos e preserva a fração de tempo ainda não consumida. */
export function resolveRestRegeneration(resources: RestResources, lastTickAtMs: number, nowMs: number) {
  const elapsed = Math.max(0, nowMs - lastTickAtMs);
  const ticks = Math.floor(elapsed / REST_REGENERATION.tickMs);
  if (!ticks) return { ...resources, ticks: 0, nextTickAtMs: lastTickAtMs };

  return {
    mp: Math.min(resources.maxMp, resources.mp + ticks * REST_REGENERATION.mpPerTick),
    maxMp: resources.maxMp,
    energy: Math.min(resources.maxEnergy, resources.energy + ticks * REST_REGENERATION.energyPerTick),
    maxEnergy: resources.maxEnergy,
    ticks,
    nextTickAtMs: lastTickAtMs + ticks * REST_REGENERATION.tickMs,
  };
}
