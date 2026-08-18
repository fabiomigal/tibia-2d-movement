export type RestStatePersistenceInput = {
  resting: boolean;
  isDead: boolean;
  hasRestStartedAt: boolean;
  now: Date;
};

export type RestStatePersistence =
  | { kind: "start"; restStartedAt: Date; lastResourceRegenAt: Date }
  | { kind: "clear" }
  | { kind: "keep" };

/** Define a atualização persistida para transições de repouso, sem duplicar marcações enquanto o personagem segue parado. */
export function resolveRestStatePersistence({ resting, isDead, hasRestStartedAt, now }: RestStatePersistenceInput): RestStatePersistence {
  if (!resting || isDead) return hasRestStartedAt ? { kind: "clear" } : { kind: "keep" };
  if (hasRestStartedAt) return { kind: "keep" };
  return { kind: "start", restStartedAt: now, lastResourceRegenAt: now };
}
