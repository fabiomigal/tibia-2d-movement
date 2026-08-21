import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { Scene } from "@babylonjs/core/scene";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GameWorld } from "./GameWorld";

class TestPointer extends Event {
  readonly button = 0;
  readonly clientX = 96;
  readonly clientY = 78;

  constructor() {
    super("pointerdown", { cancelable: true });
  }
}

class TestOffscreenCanvas {
  constructor(public width: number, public height: number) {}

  getContext() {
    return { canvas: this, clearRect: () => undefined, fillText: () => undefined, strokeText: () => undefined, font: "", textAlign: "center", textBaseline: "middle", lineWidth: 0, strokeStyle: "", fillStyle: "" };
  }
}

function createTestWindow() {
  return Object.assign(new EventTarget(), { setInterval: () => 1, clearInterval: () => undefined });
}

describe("GameWorld — sprite de baú de drop", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sincroniza pelo evento público, abre pelo ponteiro e libera todos os recursos ao remover o drop", () => {
    const target = createTestWindow();
    vi.stubGlobal("window", target);
    vi.stubGlobal("fetch", () => Promise.reject(new Error("recursos externos desabilitados no teste")));
    vi.stubGlobal("OffscreenCanvas", TestOffscreenCanvas);
    const engine = new NullEngine({ renderWidth: 1280, renderHeight: 720 });
    const scene = new Scene(engine);
    const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, focus: () => undefined, getBoundingClientRect: () => ({ left: 12, top: 18, width: 1280, height: 720 }) }) as unknown as HTMLCanvasElement;
    const world = new GameWorld(scene, canvas, false);
    const internals = world as unknown as { lootChests: Map<string, { sprite: { rotation: { x: number }; metadata: unknown; dispose: () => void }; material: { dispose: () => void }; glow: { dispose: () => void } }> };

    target.dispatchEvent(new CustomEvent("vale:loot-chests", { detail: [{ chestKey: "drop-1", x: 2, z: -3 }] }));
    const chest = internals.lootChests.get("drop-1");
    expect(chest?.sprite.metadata).toEqual({ valeLootChest: "drop-1" });
    expect(chest?.sprite.rotation.x).toBe(Math.PI / 2);
    const materialDispose = vi.spyOn(chest!.material, "dispose");
    const spriteDispose = vi.spyOn(chest!.sprite, "dispose");
    const glowDispose = vi.spyOn(chest!.glow, "dispose");
    vi.spyOn(scene, "pick").mockReturnValue({ pickedMesh: chest!.sprite } as never);
    const opened: unknown[] = [];
    target.addEventListener("vale:open-loot-chest", (event) => opened.push((event as CustomEvent).detail));

    const pointer = new TestPointer();
    canvas.dispatchEvent(pointer);
    expect(pointer.defaultPrevented).toBe(true);
    expect(opened).toEqual([{ chestKey: "drop-1" }]);

    target.dispatchEvent(new CustomEvent("vale:loot-chests", { detail: [] }));
    expect(internals.lootChests.has("drop-1")).toBe(false);
    expect(materialDispose).toHaveBeenCalledOnce();
    expect(spriteDispose).toHaveBeenCalledOnce();
    expect(glowDispose).toHaveBeenCalledOnce();
    world.dispose();
    scene.dispose();
    engine.dispose();
  });
});
