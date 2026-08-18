import { resolveAttackApproach, type AttackApproach, type WorldPoint } from "./targeting";

export type DefaultAttackRequest = { monsterKey: string; defaultAttack: true };
export type DefaultAttackFlow = { request: DefaultAttackRequest; approach: AttackApproach };
export type MonsterDoubleClickTarget = { kind: "monster"; monsterKey?: string; x: number; z: number };

/** Mantém explícita a intenção de ataque básico, sem reutilizar uma habilidade equipada. */
export function createDefaultAttackRequest(monsterKey: string): DefaultAttackRequest {
  return { monsterKey, defaultAttack: true };
}

/** Conecta a intenção de duplo clique à aproximação segura e ao golpe quando o alvo entra em alcance. */
export function resolveDefaultAttackFlow(monsterKey: string, player: WorldPoint, target: WorldPoint): DefaultAttackFlow {
  return { request: createDefaultAttackRequest(monsterKey), approach: resolveAttackApproach(player, target) };
}

/** Traduz o alvo efetivamente obtido pelo pick de duplo clique na intenção pública do ataque básico. */
export function resolveDefaultAttackFromDoubleClick(
  interaction: MonsterDoubleClickTarget | undefined,
  player: WorldPoint,
): DefaultAttackFlow | null {
  if (!interaction?.monsterKey) return null;
  return resolveDefaultAttackFlow(interaction.monsterKey, player, interaction);
}
