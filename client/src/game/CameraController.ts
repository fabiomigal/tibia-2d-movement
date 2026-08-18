/** Horizonte em Miniatura: câmera ortográfica acompanha a rota com amortecimento curto, sem efeito elástico. */
import { Camera } from "@babylonjs/core/Cameras/camera";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import type { WorldBounds } from "./types";

export class CameraController {
  readonly camera: FreeCamera;
  private readonly anchor = Vector2.Zero();

  constructor(private readonly scene: Scene, private readonly bounds: WorldBounds) {
    this.camera = new FreeCamera("world-camera", new Vector3(0, 30, 0), scene);
    this.camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    this.camera.minZ = 0.1;
    this.camera.maxZ = 100;
    this.camera.upVector = new Vector3(0, 0, 1);
    this.camera.setTarget(Vector3.Zero());
    this.resize();
  }

  update(deltaSeconds: number, playerPosition: Vector2) {
    const smoothing = 1 - Math.exp(-deltaSeconds * 7);
    this.anchor.x += (playerPosition.x - this.anchor.x) * smoothing;
    this.anchor.y += (playerPosition.y - this.anchor.y) * smoothing;
    this.clampAnchor();
    this.camera.position.set(this.anchor.x, 30, this.anchor.y);
    this.camera.setTarget(new Vector3(this.anchor.x, 0, this.anchor.y));
  }

  resize() {
    const engine = this.scene.getEngine();
    const width = Math.max(1, engine.getRenderWidth());
    const height = Math.max(1, engine.getRenderHeight());
    const aspect = width / height;
    const verticalSpan = width < 768 ? 16.6 : 16;
    const horizontalSpan = verticalSpan * aspect;

    this.camera.orthoLeft = -horizontalSpan / 2;
    this.camera.orthoRight = horizontalSpan / 2;
    this.camera.orthoTop = verticalSpan / 2;
    this.camera.orthoBottom = -verticalSpan / 2;
    this.clampAnchor();
  }

  private clampAnchor() {
    const orthoLeft = this.camera.orthoLeft ?? -8;
    const orthoRight = this.camera.orthoRight ?? 8;
    const orthoTop = this.camera.orthoTop ?? 8;
    const orthoBottom = this.camera.orthoBottom ?? -8;
    const halfWidth = (orthoRight - orthoLeft) / 2;
    const halfHeight = (orthoTop - orthoBottom) / 2;
    this.anchor.x = Math.max(this.bounds.minX + halfWidth, Math.min(this.bounds.maxX - halfWidth, this.anchor.x));
    this.anchor.y = Math.max(this.bounds.minZ + halfHeight, Math.min(this.bounds.maxZ - halfHeight, this.anchor.y));
  }
}
