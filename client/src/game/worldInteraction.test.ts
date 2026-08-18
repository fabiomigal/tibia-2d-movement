import { describe, expect, it } from "vitest";
import {
  dispatchInteractionFromPointer,
  resolveInteractionFromActionKey,
  resolveInteractionFromPointer,
} from "./worldInteraction";

const interactions = [
  { id: "portal-vale", label: "Portal do Vale" },
  { id: "npc-selene", label: "Selene" },
];

describe("regras de interação do mundo", () => {
  it("resolve o hotspot próximo quando a tecla de ação é pressionada", () => {
    expect(resolveInteractionFromActionKey("Enter", "portal-vale", interactions)).toEqual(interactions[0]);
  });

  it("ignora teclas não relacionadas e a ausência de hotspot próximo", () => {
    expect(resolveInteractionFromActionKey("e", "portal-vale", interactions)).toBeUndefined();
    expect(resolveInteractionFromActionKey("Enter", null, interactions)).toBeUndefined();
  });

  it("mantém a interação escolhida para entrada de ponteiro e toque", () => {
    expect(resolveInteractionFromPointer("pointer", interactions[1])).toEqual(interactions[1]);
    expect(resolveInteractionFromPointer("touch", interactions[0])).toEqual(interactions[0]);
  });

  it.each(["pointer", "touch"] as const)("emite o evento integrado para %s", (trigger) => {
    const target = new EventTarget();
    let emitted: (typeof interactions)[number] | undefined;
    target.addEventListener("vale:world-interaction", (event) => {
      emitted = (event as CustomEvent<(typeof interactions)[number]>).detail;
    });

    expect(dispatchInteractionFromPointer(target, trigger, interactions[0])).toBe(true);
    expect(emitted).toEqual(interactions[0]);
  });

  it("não emite o evento quando não há hotspot sob o ponteiro", () => {
    const target = new EventTarget();
    let count = 0;
    target.addEventListener("vale:world-interaction", () => count++);

    expect(dispatchInteractionFromPointer(target, "pointer", undefined)).toBe(false);
    expect(count).toBe(0);
  });
});
