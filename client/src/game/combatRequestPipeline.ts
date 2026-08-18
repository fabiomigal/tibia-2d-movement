export type CombatRequest = { monsterKey: string; skillKey?: string };
type AttackReadyDetail = { monsterKey?: string; defaultAttack?: boolean };

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
  if (!detail?.monsterKey) return false;
  mutate({ monsterKey: detail.monsterKey, skillKey: detail.defaultAttack ? undefined : selectedSkill });
  return true;
}
