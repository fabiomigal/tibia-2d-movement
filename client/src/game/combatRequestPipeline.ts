export type CombatRequest = { monsterEncounterId: number; skillKey?: string };
type AttackReadyDetail = { monsterEncounterId?: number; defaultAttack?: boolean };

/** Encaminha a conclusão da aproximação para o combate, mantendo o ataque básico sem skill equipada. */
export function dispatchCombatRequestFromAttackReady({
  event,
  selectedSkill,
  mutate,
}: {
  event: Event;
  selectedSkill?: string;
  mutate: (request: CombatRequest) => void;
}): boolean {
  const detail = (event as CustomEvent<AttackReadyDetail>).detail;
  if (!detail?.monsterEncounterId) return false;
  mutate({ monsterEncounterId: detail.monsterEncounterId, skillKey: detail.defaultAttack ? undefined : selectedSkill });
  return true;
}
