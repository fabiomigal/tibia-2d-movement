/** Horizonte em Miniatura: colisores claros e estáveis privilegiam leitura e movimento sem atravessamentos. */
import { Vector2 } from "@babylonjs/core/Maths/math.vector";
import type { Obstacle, WorldBounds } from "./types";

export class CollisionWorld {
  private readonly obstacles: Obstacle[] = [];

  constructor(readonly bounds: WorldBounds) {}

  addCircle(center: Vector2, radius: number) {
    this.obstacles.push({ kind: "circle", center, radius });
  }

  addRectangle(minX: number, maxX: number, minZ: number, maxZ: number) {
    this.obstacles.push({ kind: "rect", minX, maxX, minZ, maxZ });
  }

  resolve(current: Vector2, displacement: Vector2, radius: number) {
    const distance = displacement.length();
    const steps = Math.max(1, Math.ceil(distance / 0.1));
    const step = displacement.scale(1 / steps);
    const resolved = current.clone();

    for (let index = 0; index < steps; index += 1) {
      const xCandidate = new Vector2(resolved.x + step.x, resolved.y);
      if (!this.isBlocked(xCandidate, radius)) resolved.x = xCandidate.x;

      const zCandidate = new Vector2(resolved.x, resolved.y + step.y);
      if (!this.isBlocked(zCandidate, radius)) resolved.y = zCandidate.y;
    }

    return resolved;
  }

  private isBlocked(position: Vector2, radius: number) {
    if (
      position.x - radius < this.bounds.minX ||
      position.x + radius > this.bounds.maxX ||
      position.y - radius < this.bounds.minZ ||
      position.y + radius > this.bounds.maxZ
    ) {
      return true;
    }

    return this.obstacles.some((obstacle) => {
      if (obstacle.kind === "circle") {
        const minDistance = obstacle.radius + radius;
        return Vector2.DistanceSquared(position, obstacle.center) < minDistance * minDistance;
      }

      const closestX = Math.max(obstacle.minX, Math.min(position.x, obstacle.maxX));
      const closestZ = Math.max(obstacle.minZ, Math.min(position.y, obstacle.maxZ));
      const deltaX = position.x - closestX;
      const deltaZ = position.y - closestZ;
      return deltaX * deltaX + deltaZ * deltaZ < radius * radius;
    });
  }
}
