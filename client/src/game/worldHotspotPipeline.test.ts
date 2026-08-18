import { describe, expect, it } from "vitest";
import { dispatchHotspotFromActionKey, dispatchHotspotFromWorldPointer } from "./worldHotspotPipeline";

const portal = { id: "portal-ruins", kind: "portal", label: "Portal das Ruínas" };

function createTarget() {
  const target = new EventTarget();
  const emitted: typeof portal[] = [];
  target.addEventListener("vale:world-interaction", (event) => {
    emitted.push((event as CustomEvent<typeof portal>).detail);
  });
  return { target, emitted };
}

function createPointer(pointerType: string) {
  const calls = { prevented: 0, stopped: 0 };
  return {
    event: {
      clientX: 42,
      clientY: 68,
      pointerType,
      preventDefault: () => calls.prevented++,
      stopImmediatePropagation: () => calls.stopped++,
    },
    calls,
  };
}

describe("pipeline de hotspots do mundo", () => {
  it.each(["mouse", "touch"])("faz pick e emite o evento para %s", (pointerType) => {
    const { target, emitted } = createTarget();
    const { event, calls } = createPointer(pointerType);
    const pickedAt: Array<[number, number]> = [];

    const dispatched = dispatchHotspotFromWorldPointer({
      target,
      event,
      bounds: { left: 10, top: 18 },
      pick: (x, y) => {
        pickedAt.push([x, y]);
        return { pickedMesh: { metadata: { valeInteraction: portal } } };
      },
    });

    expect(dispatched).toBe(true);
    expect(pickedAt).toEqual([[32, 50]]);
    expect(calls).toEqual({ prevented: 1, stopped: 1 });
    expect(emitted).toEqual([portal]);
  });

  it("não bloqueia o ponteiro quando o pick não encontra hotspot", () => {
    const { target, emitted } = createTarget();
    const { event, calls } = createPointer("mouse");

    expect(dispatchHotspotFromWorldPointer({ target, event, bounds: { left: 0, top: 0 }, pick: () => null })).toBe(false);
    expect(calls).toEqual({ prevented: 0, stopped: 0 });
    expect(emitted).toEqual([]);
  });

  it("emite o evento final para a tecla de ação próxima", () => {
    const { target, emitted } = createTarget();
    let prevented = 0;
    const dispatched = dispatchHotspotFromActionKey({
      target,
      event: { key: "Enter", preventDefault: () => prevented++ },
      nearbyId: portal.id,
      interactions: [portal],
    });

    expect(dispatched).toBe(true);
    expect(prevented).toBe(1);
    expect(emitted).toEqual([portal]);
  });
});
