import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { Scene } from "@babylonjs/core/scene";
import { Vector2 } from "@babylonjs/core/Maths/math.vector";
import { afterEach, describe, expect, it, vi } from "vitest";
import { REST_REGENERATION } from "@shared/restRegeneration";
import { GameWorld } from "./GameWorld";
import type { GameStatus } from "./types";
import { resolveRestSync } from "./restSyncPipeline";
import { resolveRestCycle } from "../../../server/restCycle";

class TestOffscreenCanvas {
  constructor(public width: number, public height: number) {}
  getContext() { return { canvas: this, clearRect: () => undefined, fillText: () => undefined, strokeText: () => undefined, font: "", textAlign: "center", textBaseline: "middle", lineWidth: 0, strokeStyle: "", fillStyle: "" }; }
}

function createTestWindow() {
  return Object.assign(new EventTarget(), { setInterval: () => 1, clearInterval: () => undefined });
}

describe("repouso — contrato GameWorld, HUD e ciclo persistente", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("inicia pelo status parado, recupera recursos em tick e interrompe ao mundo voltar a mover", () => {
    const target = createTestWindow();
    vi.stubGlobal("window", target);
    vi.stubGlobal("fetch", () => Promise.reject(new Error("recursos externos desabilitados no teste")));
    vi.stubGlobal("OffscreenCanvas", TestOffscreenCanvas);

    const engine = new NullEngine({ renderWidth: 1280, renderHeight: 720 });
    const scene = new Scene(engine);
    const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) }) as unknown as HTMLCanvasElement;
    const world = new GameWorld(scene, canvas, false);
    const statuses: GameStatus[] = [];
    target.addEventListener("vale:status", (event) => statuses.push((event as CustomEvent<GameStatus>).detail));

    world.update(0.13);
    const startStatus = statuses.at(-1)!;
    expect(startStatus.isResting).toBe(true);
    const startSync = resolveRestSync({ wasResting: false, worldReportsRest: startStatus.isResting, isDead: false });
    expect(startSync).toMatchObject({ resting: true, shouldPersistTransition: true });

    const started = resolveRestCycle({ mp: 10, maxMp: 30, energy: 8, maxEnergy: 40, requestedRest: startSync.resting, isDead: false, restStartedAtMs: null, lastResourceRegenAtMs: null, nowMs: 10_000 });
    const snapshotAfterTick = resolveRestCycle({ ...started, requestedRest: true, isDead: false, nowMs: 10_000 + REST_REGENERATION.tickMs * 2 });
    expect(snapshotAfterTick).toMatchObject({ mp: 16, energy: 16, ticks: 2 });

    const internals = world as unknown as { player: { setTarget: (target: Vector2) => void } };
    internals.player.setTarget(new Vector2(12, 8));
    world.update(0.13);
    const movingStatus = statuses.at(-1)!;
    expect(movingStatus.isResting).toBe(false);
    const stopSync = resolveRestSync({ wasResting: true, worldReportsRest: movingStatus.isResting, isDead: false });
    expect(stopSync).toMatchObject({ resting: false, shouldPersistTransition: true });
    const interrupted = resolveRestCycle({ ...snapshotAfterTick, requestedRest: stopSync.resting, isDead: false, nowMs: 10_000 + REST_REGENERATION.tickMs * 2 });
    expect(interrupted).toMatchObject({ restStartedAtMs: null, lastResourceRegenAtMs: null });

    world.dispose();
    scene.dispose();
    engine.dispose();
  });
});
