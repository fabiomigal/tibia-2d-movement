export type WorldPoint = { x: number; z: number };

export type AttackApproach =
  | { kind: "attack" }
  | { kind: "move"; destination: WorldPoint };

/** Mantém o personagem a uma curta distância de ataque antes de disparar o golpe. */
export function resolveAttackApproach(player: WorldPoint, target: WorldPoint, attackRange = 1.05): AttackApproach {
  const dx = target.x - player.x;
  const dz = target.z - player.z;
  const distance = Math.hypot(dx, dz);
  if (distance <= attackRange) return { kind: "attack" };
  const standoff = Math.max(0.1, attackRange - 0.07);
  return { kind: "move", destination: { x: target.x - (dx / distance) * standoff, z: target.z - (dz / distance) * standoff } };
}
