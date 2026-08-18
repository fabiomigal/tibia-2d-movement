export type CombatSkillCost = { name: string; manaCost: number; energyCost: number };

export type CombatResourceCheck =
  | { allowed: true }
  | { allowed: false; message: string };

/** Trata a falta de recurso como estado normal de combate, antes da mutação de ataque. */
export function checkCombatResources(skill: CombatSkillCost | undefined, mp: number, energy: number): CombatResourceCheck {
  if (!skill) return { allowed: false, message: "A habilidade ainda está sendo preparada." };
  const missingMp = Math.max(0, skill.manaCost - mp);
  const missingEnergy = Math.max(0, skill.energyCost - energy);
  if (!missingMp && !missingEnergy) return { allowed: true };
  const requirements = [missingMp ? `${skill.manaCost} MP` : null, missingEnergy ? `${skill.energyCost} EN` : null].filter(Boolean).join(" e ");
  return { allowed: false, message: `${skill.name} requer ${requirements}. Aguarde a recuperação dos seus recursos.` };
}
