import { resolveAttackApproach, type AttackApproach, type WorldPoint } from "./targeting";

export type DefaultAttackRequest = { monsterEncounterId: number; monsterKey?: string; defaultAttack: true };
export type DefaultAttackFlow = { request: DefaultAttackRequest; approach: AttackApproach };
export type MonsterDoubleClickTarget = { kind: "monster"; monsterEncounterId?: number; monsterKey?: string; x: number; z: number };

/** Mantém explícita a intenção de ataque básico, sem reutilizar uma habilidade equipada. */
export function createDefaultAttackRequest(monsterEncounterId: number, monsterKey?: string): DefaultAttackRequest {
  return { monsterEncounterId, monsterKey, defaultAttack: true };
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
  if (!interaction?.monsterEncounterId && !interaction?.monsterKey) return null;
  const flow = resolveDefaultAttackFlow(interaction.monsterEncounterId ?? 0, player, interaction);
  flow.request.monsterKey = interaction.monsterKey;
  return flow;
}
