/** Horizonte em Miniatura: tipos pequenos e explícitos mantêm a intenção de movimento legível. */
import type { Vector2 } from "@babylonjs/core/Maths/math.vector";

export type MovementSource = "Teclado" | "Joystick" | "Destino" | "Rota demo" | "Aguardando";

export interface CircleObstacle {
  readonly kind: "circle";
  readonly center: Vector2;
  readonly radius: number;
}

export interface RectObstacle {
  readonly kind: "rect";
  readonly minX: number;
  readonly maxX: number;
  readonly minZ: number;
  readonly maxZ: number;
}

export type Obstacle = CircleObstacle | RectObstacle;

export interface WorldBounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minZ: number;
  readonly maxZ: number;
}

export interface GameStatus {
  readonly movement: string;
  readonly speed: number;
  readonly hint: string;
  readonly position: readonly [number, number];
  readonly nearbyHotspot: { readonly id: string; readonly label: string; readonly kind: "npc" | "portal" | "stairs" | "monster"; readonly x: number; readonly z: number } | null;
}
