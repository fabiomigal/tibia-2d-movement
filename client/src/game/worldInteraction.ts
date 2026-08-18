/** Resolve a interação de mundo ativada pela tecla de ação sem depender do motor de renderização. */
export function resolveInteractionFromActionKey<T extends { id: string }>(
  key: string,
  nearbyId: string | null,
  interactions: readonly T[],
): T | undefined {
  if (key !== "Enter" || !nearbyId) return undefined;
  return interactions.find((interaction) => interaction.id === nearbyId);
}

export type WorldInteractionTrigger = "pointer" | "touch";

/** Mantém somente interações acionadas por ponteiro ou toque. */
export function resolveInteractionFromPointer<T>(
  trigger: WorldInteractionTrigger,
  interaction: T | undefined,
): T | undefined {
  return trigger === "pointer" || trigger === "touch" ? interaction : undefined;
}

/** Emite o evento de interação consumido pelo HUD e pelos painéis de mundo. */
export function dispatchWorldInteraction<T>(target: Pick<EventTarget, "dispatchEvent">, interaction: T) {
  return target.dispatchEvent(new CustomEvent<T>("vale:world-interaction", { detail: interaction }));
}

/** Combina o caminho real de ponteiro/toque com a emissão integrada do evento. */
export function dispatchInteractionFromPointer<T>(
  target: Pick<EventTarget, "dispatchEvent">,
  trigger: WorldInteractionTrigger,
  interaction: T | undefined,
) {
  const resolved = resolveInteractionFromPointer(trigger, interaction);
  return resolved ? dispatchWorldInteraction(target, resolved) : false;
}
