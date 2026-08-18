/** Horizonte em Miniatura: uma rota determinística revela fluidez, câmera e leitura de obstáculos em `?demo`. */
import { Vector2 } from "@babylonjs/core/Maths/math.vector";

export class DemoPilot {
  private readonly route = [
    new Vector2(-5, -5),
    new Vector2(0, -6),
    new Vector2(3, 0),
    new Vector2(9, 4),
    new Vector2(14, -1),
    new Vector2(10, -10),
    new Vector2(1, -10),
    new Vector2(-5, -4),
  ];
  private routeIndex = 0;

  getTarget(position: Vector2) {
    const current = this.route[this.routeIndex];
    if (Vector2.Distance(position, current) < 0.55) {
      this.routeIndex = (this.routeIndex + 1) % this.route.length;
    }
    return this.route[this.routeIndex];
  }
}
