import { resolveAttackApproach, type AttackApproach, type WorldPoint } from "./targeting";

export type DefaultAttackRequest = { monsterEncounterId: number; defaultAttack: true };
export type DefaultAttackFlow = { request: DefaultAttackRequest; approach: AttackApproach };
export type MonsterDoubleClickTarget = { kind: "monster"; monsterEncounterId?: number; x: number; z: number };

/** Mantém explícita a intenção de ataque básico, sem reutilizar uma habilidade equipada. */
export function createDefaultAttackRequest(monsterEncounterId: number): DefaultAttackRequest {
  return { monsterEncounterId, defaultAttack: true };
}

/** Conecta a intenção de duplo clique à aproximação segura e ao golpe quando o alvo entra em alcance. */
export function resolveDefaultAttackFlow(monsterEncounterId: number, player: WorldPoint, target: WorldPoint): DefaultAttackFlow {
  return { request: createDefaultAttackRequest(monsterEncounterId), approach: resolveAttackApproach(player, target) };
}

/** Traduz o alvo efetivamente obtido pelo pick de duplo clique na intenção pública do ataque básico. */
export function resolveDefaultAttackFromDoubleClick(
  interaction: MonsterDoubleClickTarget | undefined,
  player: WorldPoint,
): DefaultAttackFlow | null {
  if (!interaction?.monsterEncounterId) return null;
  return resolveDefaultAttackFlow(interaction.monsterEncounterId, player, interaction);
}
