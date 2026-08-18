import type { CombatRequest } from "./combatRequestPipeline";
import { checkCombatResources, type CombatSkillCost } from "./combatResourceGuard";

type EquippedCombatSkill = CombatSkillCost & { key: string };

/** Decide no cliente se o ataque pode alcançar a mutação ou se deve virar um aviso de recursos. */
export function attemptCombatWithResources({
  request,
  skills,
  mp,
  energy,
  mutate,
  notify,
}: {
  request: CombatRequest;
  skills: EquippedCombatSkill[];
  mp: number;
  energy: number;
  mutate: (request: CombatRequest) => void;
  notify: (message: string) => void;
}): boolean {
  const skill = skills.find((entry) => entry.key === request.skillKey) ?? skills[0];
  const resourceCheck = checkCombatResources(skill, mp, energy);
  if (!resourceCheck.allowed) {
    notify(resourceCheck.message);
    return false;
  }
  mutate(request);
  return true;
}
