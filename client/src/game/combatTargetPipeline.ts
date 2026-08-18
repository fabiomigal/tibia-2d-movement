import { resolveDefaultAttackFromDoubleClick, type DefaultAttackRequest, type MonsterDoubleClickTarget } from "./defaultAttack";
import type { WorldPoint } from "./targeting";

type ScreenBounds = { left: number; top: number };
type DoubleClickLike = { button: number; clientX: number; clientY: number; preventDefault: () => void };
type PickedMonster = { metadata?: { valeInteraction?: MonsterDoubleClickTarget } } | null | undefined;

/** Faz o pick do duplo clique e publica a mesma ordem de ataque básico consumida pelo mundo. */
export function dispatchDefaultAttackFromDoubleClick({
  target,
  event,
  bounds,
  player,
  pick,
}: {
  target: EventTarget;
  event: DoubleClickLike;
  bounds: ScreenBounds;
  player: WorldPoint;
  pick: (x: number, y: number) => PickedMonster;
}): boolean {
  if (event.button !== 0) return false;
  const interaction = pick(event.clientX - bounds.left, event.clientY - bounds.top)?.metadata?.valeInteraction;
  const attackFlow = resolveDefaultAttackFromDoubleClick(interaction, player);
  if (!attackFlow) return false;
  event.preventDefault();
  target.dispatchEvent(new CustomEvent<DefaultAttackRequest>("vale:attack-target", { detail: attackFlow.request }));
  return true;
}
