/** Horizonte em Miniatura: entradas distintas convergem para ações semânticas, nunca para checks espalhados. */
import { Vector2 } from "@babylonjs/core/Maths/math.vector";
import type { MovementSource } from "./types";

const movementKeys = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

export class MovementInput {
  private readonly pressedKeys = new Set<string>();
  private joystick = Vector2.Zero();
  private source: MovementSource = "Aguardando";

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (!movementKeys.has(event.code)) return;
    event.preventDefault();
    this.pressedKeys.add(event.code);
  };

  private readonly onKeyUp = (event: KeyboardEvent) => {
    if (!movementKeys.has(event.code)) return;
    event.preventDefault();
    this.pressedKeys.delete(event.code);
  };

  private readonly onBlur = () => {
    this.pressedKeys.clear();
    this.joystick = Vector2.Zero();
  };

  private readonly onJoystick = (event: Event) => {
    const detail = (event as CustomEvent<{ x: number; z: number }>).detail;
    if (!detail) return;
    this.joystick = new Vector2(detail.x, detail.z);
  };

  private readonly onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    this.canvas.focus();
    const target = this.pickWorldPosition(event.clientX, event.clientY);
    if (target) {
      event.preventDefault();
      this.onDestination(target);
      this.source = "Destino";
    }
  };

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly pickWorldPosition: (clientX: number, clientY: number) => Vector2 | null,
    private readonly onDestination: (target: Vector2) => void,
  ) {
    window.addEventListener("keydown", this.onKeyDown, { passive: false });
    window.addEventListener("keyup", this.onKeyUp, { passive: false });
    window.addEventListener("blur", this.onBlur);
    window.addEventListener("vale:joystick", this.onJoystick);
    canvas.addEventListener("pointerdown", this.onPointerDown, { passive: false });
  }

  getContinuousVector() {
    const keyboard = new Vector2(
      (this.pressedKeys.has("KeyD") || this.pressedKeys.has("ArrowRight") ? 1 : 0) -
        (this.pressedKeys.has("KeyA") || this.pressedKeys.has("ArrowLeft") ? 1 : 0),
      (this.pressedKeys.has("KeyW") || this.pressedKeys.has("ArrowUp") ? 1 : 0) -
        (this.pressedKeys.has("KeyS") || this.pressedKeys.has("ArrowDown") ? 1 : 0),
    );

    if (keyboard.lengthSquared() > 0) {
      this.source = "Teclado";
      return keyboard.normalize();
    }

    if (this.joystick.lengthSquared() > 0.01) {
      this.source = "Joystick";
      return this.joystick.lengthSquared() > 1 ? this.joystick.normalize() : this.joystick.clone();
    }

    return null;
  }

  getSource() {
    return this.source;
  }

  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    window.removeEventListener("vale:joystick", this.onJoystick);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
  }
}
