// @vitest-environment jsdom
import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { REST_REGENERATION } from "@shared/restRegeneration";

const mocks = vi.hoisted(() => ({
  restMutate: vi.fn(),
  bootstrapRefetch: vi.fn(async () => undefined),
  bootstrapInvalidate: vi.fn(async () => undefined),
  snapshot: null as Record<string, unknown> | null,
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
        combat: passiveMutation, inventory: passiveMutation, travel: passiveMutation, idleStart: passiveMutation,
        idleResume: passiveMutation, revive: passiveMutation, collectDrop: passiveMutation, autoPotion: passiveMutation,
        merchantBuy: passiveMutation, questAccept: passiveMutation, questClaim: passiveMutation, archetype: passiveMutation,
        restState: { useMutation: () => ({ mutate: mocks.restMutate }) },
      },
    },
  };
});

import GameOverlay from "./GameOverlay";

const restingStatus = { movement: "Aguardando comando", isResting: true, speed: 0, hint: "teste", position: [0, 0] as [number, number], nearbyHotspot: null, monsters: [] };
const movingStatus = { ...restingStatus, movement: "Destino", isResting: false, speed: 1 };

describe("GameOverlay — ciclo de repouso integrado", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.snapshot = structuredClone(initialSnapshot);
    mocks.restMutate.mockReset();
    mocks.bootstrapRefetch.mockReset();
    mocks.bootstrapInvalidate.mockReset();
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
});
