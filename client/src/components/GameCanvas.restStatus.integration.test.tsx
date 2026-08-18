// @vitest-environment jsdom
import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { REST_REGENERATION } from "@shared/restRegeneration";

const mocks = vi.hoisted(() => ({ restMutate: vi.fn(), refetch: vi.fn(async () => undefined), snapshot: null as Record<string, unknown> | null }));
const initialSnapshot = { character: { name: "Aventureiro de Âmbar", archetype: "fighter", level: 1, xp: 0, gold: 0, hp: 100, maxHp: 100, mp: 16, maxMp: 30, energy: 16, maxEnergy: 40, strength: 10, dexterity: 10, vitality: 10, intelligence: 10, currentRegion: "wind-road", floor: 0, capacity: 75, currentWeight: 0, isDead: false, autoPotionEnabled: true }, items: [], skills: [], activeHunt: null, quests: [], drops: [], encounters: [] };

vi.mock("@babylonjs/core/Engines/engine", () => ({
  Engine: class { runRenderLoop(callback: () => void) { callback(); } resize() {} dispose() {} },
}));
vi.mock("@/game/scene", () => ({
  createGameScene: vi.fn(async () => ({ scene: { render: vi.fn() }, dispose: vi.fn() })),
}));
vi.mock("@/lib/trpc", () => {
  const mutation = { useMutation: () => ({ mutate: vi.fn() }) };
  return { trpc: { useUtils: () => ({ game: { bootstrap: { invalidate: vi.fn() } } }), game: { bootstrap: { useQuery: () => ({ data: mocks.snapshot, refetch: mocks.refetch }) }, merchant: { useQuery: () => ({ data: [] }) }, combat: mutation, inventory: mutation, travel: mutation, idleStart: mutation, idleResume: mutation, revive: mutation, collectDrop: mutation, autoPotion: mutation, merchantBuy: mutation, questAccept: mutation, questClaim: mutation, archetype: mutation, restState: { useMutation: () => ({ mutate: mocks.restMutate }) } } } };
});

import GameCanvas from "./GameCanvas";

describe("GameCanvas — ponte de status de repouso", () => {
  beforeEach(() => {
    mocks.snapshot = structuredClone(initialSnapshot);
    mocks.restMutate.mockReset();
    mocks.refetch.mockReset();
    mocks.refetch.mockImplementation(async () => { mocks.snapshot = { ...initialSnapshot, character: { ...initialSnapshot.character, mp: 20, energy: 22 } }; });
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; });
    vi.useFakeTimers();
  });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); });

  it("encadeia vale:status, HUD real, mutação, refetch regenerado e interrupção", async () => {
    render(<GameCanvas />);
    await act(async () => { await Promise.resolve(); });
    expect(document.body.textContent).toContain("16/30");
    expect(mocks.restMutate).toHaveBeenCalledWith({ resting: true });
    act(() => { vi.advanceTimersByTime(REST_REGENERATION.tickMs); });
    act(() => window.dispatchEvent(new CustomEvent("vale:status", { detail: { movement: "Aguardando comando", isResting: true, speed: 0, hint: "repouso", position: [0, 0], nearbyHotspot: null, monsters: [] } })));
    expect(document.body.textContent).toContain("20/30");
    expect(document.body.textContent).toContain("22/40");
    act(() => window.dispatchEvent(new CustomEvent("vale:status", { detail: { movement: "Destino", isResting: false, speed: 1, hint: "movendo", position: [1, 1], nearbyHotspot: null, monsters: [] } })));
    expect(mocks.restMutate).toHaveBeenLastCalledWith({ resting: false });
  });
});
