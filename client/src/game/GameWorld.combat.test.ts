import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { Scene } from "@babylonjs/core/scene";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GameWorld } from "./GameWorld";

class TestDoubleClick extends Event {
  readonly button = 0;
  readonly clientX = 96;
  readonly clientY = 78;

  constructor() {
    super("dblclick", { cancelable: true });
  }
}

class TestOffscreenCanvas {
  constructor(public width: number, public height: number) {}

  getContext() {
    return {
      canvas: this,
      clearRect: () => undefined,
      fillText: () => undefined,
      strokeText: () => undefined,
      font: "",
      textAlign: "center",
      textBaseline: "middle",
      lineWidth: 0,
      strokeStyle: "",
      fillStyle: "",
    };
  }
}

function createTestWindow() {
  return Object.assign(new EventTarget(), {
    setInterval: () => 1,
    clearInterval: () => undefined,
  });
}

describe("GameWorld — ataque básico por duplo clique", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("faz o fluxo real de duplo clique até a aproximação e emite ataque básico pronto", () => {
    const target = createTestWindow();
    vi.stubGlobal("window", target);
    vi.stubGlobal("fetch", () => Promise.reject(new Error("recursos externos desabilitados no teste")));
    vi.stubGlobal("OffscreenCanvas", TestOffscreenCanvas);

    const engine = new NullEngine({ renderWidth: 1280, renderHeight: 720 });
    const scene = new Scene(engine);
    const canvas = Object.assign(new EventTarget(), {
      width: 1280,
      height: 720,
      getBoundingClientRect: () => ({ left: 12, top: 18, width: 1280, height: 720 }),
    }) as unknown as HTMLCanvasElement;
    const world = new GameWorld(scene, canvas, false);
    const boar = scene.getMeshByName("sighting-boar-body");
    expect(boar).toBeTruthy();
    vi.spyOn(scene, "pick").mockReturnValue({ pickedMesh: boar } as never);

    const targets: unknown[] = [];
    const ready: unknown[] = [];
    target.addEventListener("vale:attack-target", (event) => targets.push((event as CustomEvent).detail));
    target.addEventListener("vale:attack-target-ready", (event) => ready.push((event as CustomEvent).detail));

    const gesture = new TestDoubleClick();
    canvas.dispatchEvent(gesture);
    expect(gesture.defaultPrevented).toBe(true);
    expect(targets).toEqual([{ monsterKey: "field-boar", defaultAttack: true }]);

    world.update(0);
    const gameInternals = world as unknown as { player: { position: { copyFromFloats: (x: number, y: number) => void } } };
    gameInternals.player.position.copyFromFloats(boar!.position.x - 0.4, boar!.position.z);
    world.update(0);
    expect(ready).toEqual([{ monsterKey: "field-boar", defaultAttack: true }]);

    world.dispose();
    scene.dispose();
    engine.dispose();
  });
});
