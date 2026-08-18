import { dispatchWorldInteraction, resolveInteractionFromActionKey, resolveInteractionFromPointer } from "./worldInteraction";

type HotspotMesh<T> = { metadata?: { valeInteraction?: T } };
type PickResult<T> = { pickedMesh?: HotspotMesh<T> | null } | null | undefined;

export type WorldPointerInput = {
  clientX: number;
  clientY: number;
  pointerType: string;
  preventDefault: () => void;
  stopImmediatePropagation: () => void;
};

export type WorldActionInput = {
  key: string;
  preventDefault: () => void;
};

/** Executa o mesmo caminho do canvas: pick de mesh, metadata de hotspot e despacho ao HUD. */
export function dispatchHotspotFromWorldPointer<T>(params: {
  target: Pick<EventTarget, "dispatchEvent">;
  event: WorldPointerInput;
  bounds: Pick<DOMRect, "left" | "top">;
  pick: (x: number, y: number) => PickResult<T>;
}) {
  const { target, event, bounds, pick } = params;
  const result = pick(event.clientX - bounds.left, event.clientY - bounds.top);
  const interaction = resolveInteractionFromPointer(
    event.pointerType === "touch" ? "touch" : "pointer",
    result?.pickedMesh?.metadata?.valeInteraction,
  );
  if (!interaction) return false;
  event.preventDefault();
  event.stopImmediatePropagation();
  return dispatchWorldInteraction(target, interaction);
}

/** Executa o caminho completo da tecla de ação até o evento final de interação. */
export function dispatchHotspotFromActionKey<T extends { id: string }>(params: {
  target: Pick<EventTarget, "dispatchEvent">;
  event: WorldActionInput;
  nearbyId: string | null;
  interactions: readonly T[];
}) {
  const { target, event, nearbyId, interactions } = params;
  const interaction = resolveInteractionFromActionKey(event.key, nearbyId, interactions);
  if (!interaction) return false;
  event.preventDefault();
  return dispatchWorldInteraction(target, interaction);
}
