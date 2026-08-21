// @vitest-environment jsdom
import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { REST_REGENERATION } from "@shared/restRegeneration";
import { MONSTER_RESPAWN_DELAY_MS } from "@shared/game";

const mocks = vi.hoisted(() => ({
  restMutate: vi.fn(),
  bootstrapRefetch: vi.fn(async () => undefined),
  bootstrapInvalidate: vi.fn(async () => undefined),
  snapshot: null as Record<string, unknown> | null,
  collectDropMutate: vi.fn(),
  collectDropOptions: null as any,
  travelMutate: vi.fn(),
  travelOptions: null as any,
  combatMutate: vi.fn(),
  combatOptions: null as any,
}));

const initialSnapshot = {
  character: { name: "Aventureiro de Âmbar", archetype: "fighter", level: 1, xp: 0, gold: 0, hp: 100, maxHp: 100, mp: 16, maxMp: 30, energy: 16, maxEnergy: 40, strength: 10, dexterity: 10, vitality: 10, intelligence: 10, currentRegion: "wind-road", floor: 0, capacity: 75, currentWeight: 0, isDead: false, autoPotionEnabled: true },
  items: [], skills: [], activeHunt: null, quests: [], drops: [], encounters: [],
};

vi.mock("@/lib/trpc", () => {
  const passiveMutation = { useMutation: () => ({ mutate: vi.fn() }) };
  return {
    trpc: {
      useUtils: () => ({ game: { bootstrap: { invalidate: mocks.bootstrapInvalidate } } }),
      game: {
        bootstrap: { useQuery: () => ({ data: mocks.snapshot, refetch: mocks.bootstrapRefetch }) },
        merchant: { useQuery: () => ({ data: [] }) },
        combat: { useMutation: (options: unknown) => { mocks.combatOptions = options; return { mutate: mocks.combatMutate }; } },
        inventory: passiveMutation,
        travel: { useMutation: (options: unknown) => { mocks.travelOptions = options; return { mutate: mocks.travelMutate }; } },
        idleStart: passiveMutation,
        idleResume: passiveMutation, revive: passiveMutation,
        collectDrop: { useMutation: (options: unknown) => { mocks.collectDropOptions = options; return { mutate: mocks.collectDropMutate, isPending: false }; } },
        autoPotion: passiveMutation,
        merchantBuy: passiveMutation, questAccept: passiveMutation, questClaim: passiveMutation, archetype: passiveMutation,
        restState: { useMutation: () => ({ mutate: mocks.restMutate }) },
      },
    },
  };
});

import GameOverlay from "./GameOverlay";

const restingStatus = { movement: "Aguardando comando", isResting: true, region: "bamboo-forest" as const, speed: 0, hint: "teste", position: [0, 0] as [number, number], nearbyHotspot: null, monsters: [] };
const movingStatus = { ...restingStatus, movement: "Destino", isResting: false, speed: 1 };

describe("GameOverlay — ciclo de repouso integrado", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.snapshot = structuredClone(initialSnapshot);
    mocks.restMutate.mockReset();
    mocks.bootstrapRefetch.mockReset();
    mocks.bootstrapInvalidate.mockReset();
    mocks.collectDropMutate.mockReset();
    mocks.collectDropOptions = null;
    mocks.travelMutate.mockReset();
    mocks.travelOptions = null;
    mocks.combatMutate.mockReset();
    mocks.combatOptions = null;
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("consome repouso do mundo, sincroniza a mutação, busca snapshot periodicamente e interrompe ao mover", () => {
    mocks.bootstrapRefetch.mockImplementation(async () => {
      mocks.snapshot = {
        ...initialSnapshot,
        character: { ...initialSnapshot.character, mp: 20, energy: 22 },
      };
    });
    const view = render(<GameOverlay status={restingStatus} />);
    expect(mocks.restMutate).toHaveBeenCalledWith({ resting: true });

    act(() => { vi.advanceTimersByTime(REST_REGENERATION.tickMs); });
    expect(mocks.bootstrapRefetch).toHaveBeenCalledTimes(1);
    view.rerender(<GameOverlay status={restingStatus} />);
    expect(document.body.textContent).toContain("20/30");
    expect(document.body.textContent).toContain("22/40");

    view.rerender(<GameOverlay status={movingStatus} />);
    expect(mocks.restMutate).toHaveBeenLastCalledWith({ resting: false });
    const refreshesBeforeWait = mocks.bootstrapRefetch.mock.calls.length;
    act(() => { vi.advanceTimersByTime(REST_REGENERATION.tickMs * 2); });
    expect(mocks.bootstrapRefetch).toHaveBeenCalledTimes(refreshesBeforeWait);
  });

  it("transfere o item de um baú aberto para a Mochila Rápida com quantidade e feedback visíveis", async () => {
    const loot = { id: 71, chestKey: "chest-boar", name: "Essência de Javali", rarity: "uncommon", weight: 0.4, x: 2, z: 3 };
    mocks.snapshot = { ...structuredClone(initialSnapshot), drops: [loot] };
    mocks.collectDropMutate.mockImplementation(async ({ dropId }: { dropId: number }) => {
      const options = mocks.collectDropOptions as {
        onMutate?: (input: { dropId: number }) => { itemName: string };
        onSuccess?: (result: unknown, input: { dropId: number }, context: { itemName: string }) => Promise<void>;
      };
      const context = options.onMutate?.({ dropId }) ?? { itemName: "Item" };
      mocks.snapshot = {
        ...structuredClone(initialSnapshot),
        drops: [],
        items: [{ id: 501, name: loot.name, kind: "material", rarity: loot.rarity, weight: loot.weight, quantity: 1, slot: "material", equipped: false, sellValue: 4 }],
      };
      await options.onSuccess?.({}, { dropId }, context);
    });

    const view = render(<GameOverlay status={movingStatus} />);
    act(() => { window.dispatchEvent(new CustomEvent("vale:open-loot-chest", { detail: { chestKey: loot.chestKey } })); });
    expect(document.body.textContent).toContain("Baú de expedição");
    const collectButton = Array.from(document.querySelectorAll("button")).find((button) => button.textContent === "Guardar");
    expect(collectButton).toBeTruthy();

    await act(async () => { fireEvent.click(collectButton!); });
    view.rerender(<GameOverlay status={movingStatus} />);

    expect(mocks.collectDropMutate).toHaveBeenCalledWith({ dropId: loot.id });
    expect(mocks.bootstrapInvalidate).toHaveBeenCalledTimes(1);
    expect(document.body.textContent).toContain("MOCHILA RÁPIDA");
    expect(document.body.textContent).toContain("Essência de Javali");
    expect(document.body.textContent).toContain("×1");
    expect(document.body.textContent).toContain("+ Essência de Javali");
    expect(document.body.textContent).toContain("Essência de Javali guardado na mochila.");
  });

  it("viaja pelo portal explícito e publica a posição de entrada do destino", async () => {
    const received: Array<{ x: number; z: number }> = [];
    const onPortalTravel = (event: Event) => received.push((event as CustomEvent<{ x: number; z: number }>).detail);
    window.addEventListener("vale:portal-travel", onPortalTravel);
    mocks.travelMutate.mockImplementation(async (input: { region: string; portalId?: string }, options?: { onSuccess?: (result: unknown) => Promise<void> }) => {
      await options?.onSuccess?.({});
      return input;
    });
    render(<GameOverlay status={movingStatus} />);

    await act(async () => {
      window.dispatchEvent(new CustomEvent("vale:world-interaction", { detail: { kind: "portal", label: "Travessia do Campo Âmbar", portalId: "portal-inn-entry" } }));
    });

    expect(mocks.travelMutate).toHaveBeenCalledWith({ region: "amber-inn", portalId: "portal-inn-entry" }, expect.anything());
    expect(received).toEqual([{ x: -18.2, z: 13.9 }]);
    expect(document.body.textContent).toContain("Travessia do Campo Âmbar: transição concluída.");
    window.removeEventListener("vale:portal-travel", onPortalTravel);
  });

  it("apresenta no minimapa somente a grade de campo e os marcadores de jogo", () => {
    const statusWithMarkers = {
      ...restingStatus,
      nearbyHotspot: { id: "portal-inn-entry", kind: "portal" as const, label: "Travessia do Campo Âmbar", x: -9.6, z: -3.3 },
      monsters: [{ key: "field-boar", name: "Javali do Campo", x: 2, z: 6, hp: 38, maxHp: 38 }],
    };
    render(<GameOverlay status={statusWithMarkers} />);

    const minimap = document.querySelector(".rpg-minimap__map");
    expect(minimap?.classList.contains("rpg-minimap__map--bamboo-forest")).toBe(true);
    expect(minimap?.querySelector(".minimap-player")).not.toBeNull();
    expect(minimap?.querySelector(".minimap-monster")).not.toBeNull();
    expect(minimap?.querySelector(".minimap-hotspot")).not.toBeNull();
    expect(minimap?.querySelector(".minimap-compass")).not.toBeNull();
    expect(minimap?.querySelector(".minimap-feature, .minimap-water, .minimap-path")).toBeNull();
  });

  it("renova o snapshot ao final dos dois segundos de respawn após uma derrota", async () => {
    render(<GameOverlay status={movingStatus} />);
    await act(async () => {
      await mocks.combatOptions?.onSuccess?.({
        result: { monster: "Javali do Campo", monsterKey: "field-boar", defeated: true, damage: 40, counterDamage: 0, counterCritical: false, healing: 0, element: "physical", critical: false, monsterHp: 0, monsterMaxHp: 38, xpGained: 18, goldGained: 7 },
        snapshot: { ...initialSnapshot, encounters: [] },
      });
    });
    expect(mocks.bootstrapInvalidate).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(MONSTER_RESPAWN_DELAY_MS - 1); });
    expect(mocks.bootstrapInvalidate).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(1); });
    expect(mocks.bootstrapInvalidate).toHaveBeenCalledTimes(2);
  });
});
