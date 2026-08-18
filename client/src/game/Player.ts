/** Horizonte em Miniatura: o explorador é uma silhueta clara, orientada pelo âmbar e com resposta contínua. */
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { CollisionWorld } from "./CollisionWorld";
import type { MovementSource } from "./types";

export class Player {
  readonly position: Vector2;
  readonly radius = 0.42;
  readonly speed = 5.2;
  private readonly root: TransformNode;
  private readonly shadow;
  private readonly destinationRing;
  private target: Vector2 | null = null;
  private facing = new Vector2(0, 1);
  private elapsed = 0;
  private moving = false;

  constructor(private readonly scene: Scene, start: Vector2) {
    this.position = start.clone();
    this.root = new TransformNode("player-root", scene);

    const cloak = MeshBuilder.CreateCylinder("player-cloak", { height: 0.56, diameterTop: 0.52, diameterBottom: 0.76, tessellation: 8 }, scene);
    cloak.parent = this.root;
    cloak.position.y = 0.39;
    cloak.material = this.material("player-cloak-material", "#55758A", 0.1);

    const mantle = MeshBuilder.CreateCylinder("player-mantle", { height: 0.16, diameter: 0.86, tessellation: 8 }, scene);
    mantle.parent = this.root;
    mantle.position.y = 0.68;
    mantle.material = this.material("player-mantle-material", "#D89742", 0.2);

    const head = MeshBuilder.CreateSphere("player-head", { diameter: 0.42, segments: 12 }, scene);
    head.parent = this.root;
    head.position.y = 0.81;
    head.material = this.material("player-head-material", "#E7C49B", 0.05);

    const directionMark = MeshBuilder.CreateDisc("player-facing", { radius: 0.13, tessellation: 3 }, scene);
    directionMark.parent = this.root;
    directionMark.position = new Vector3(0, 0.94, 0.29);
    directionMark.rotation.x = Math.PI / 2;
    directionMark.material = this.material("player-facing-material", "#F2B84B", 0.35);

    this.shadow = MeshBuilder.CreateDisc("player-shadow", { radius: 0.52, tessellation: 32 }, scene);
    this.shadow.position.y = 0.035;
    this.shadow.rotation.x = Math.PI / 2;
    this.shadow.scaling.z = 0.65;
    const shadowMaterial = this.material("player-shadow-material", "#233A31", 0);
    shadowMaterial.alpha = 0.3;
    this.shadow.material = shadowMaterial;

    this.destinationRing = MeshBuilder.CreateTorus("destination-ring", { diameter: 1.1, thickness: 0.07, tessellation: 32 }, scene);
    this.destinationRing.position.y = 0.065;
    const ringMaterial = this.material("destination-ring-material", "#F2B84B", 0.8);
    ringMaterial.alpha = 0.85;
    this.destinationRing.material = ringMaterial;
    this.destinationRing.setEnabled(false);

    this.syncVisual();
  }

  setTarget(target: Vector2) {
    this.target = target.clone();
  }

  hasTarget() {
    return this.target !== null;
  }

  isMoving() {
    return this.moving;
  }

  update(deltaSeconds: number, continuousVector: Vector2 | null, collisionWorld: CollisionWorld, source: MovementSource) {
    this.elapsed += deltaSeconds;
    let desired = Vector2.Zero();

    if (continuousVector && continuousVector.lengthSquared() > 0.001) {
      this.target = null;
      desired = continuousVector.normalize().scale(this.speed * deltaSeconds);
    } else if (this.target) {
      const toTarget = this.target.subtract(this.position);
      const distance = toTarget.length();
      if (distance < 0.07) {
        this.target = null;
      } else {
        desired = toTarget.scale(Math.min(this.speed * deltaSeconds / distance, 1));
      }
    }

    const resolved = collisionWorld.resolve(this.position, desired, this.radius);
    const actual = resolved.subtract(this.position);
    this.moving = actual.lengthSquared() > 0.000001;

    if (this.moving) {
      this.position.copyFrom(resolved);
      this.facing = actual.normalize();
    } else if (this.target && desired.lengthSquared() > 0) {
      // Destinos inviáveis se encerram sem vibrar contra a colisão; um novo toque define outra rota.
      this.target = null;
    }

    this.syncVisual();
    this.updateDestinationRing(source);
  }

  private syncVisual() {
    const bob = this.moving ? Math.sin(this.elapsed * 15) * 0.025 : 0;
    this.root.position.set(this.position.x, 0.05 + bob, this.position.y);
    this.root.rotation.y = Math.atan2(this.facing.x, this.facing.y);
    this.shadow.position.x = this.position.x;
    this.shadow.position.z = this.position.y;
  }

  private updateDestinationRing(source: MovementSource) {
    if (!this.target) {
      this.destinationRing.setEnabled(false);
      return;
    }

    this.destinationRing.setEnabled(true);
    this.destinationRing.position.x = this.target.x;
    this.destinationRing.position.z = this.target.y;
    const pulse = 1 + Math.sin(this.elapsed * (source === "Rota demo" ? 4 : 5)) * 0.075;
    this.destinationRing.scaling.set(pulse, 1, pulse);
  }

  private material(name: string, hex: string, emissiveStrength: number) {
    const material = new StandardMaterial(name, this.scene);
    const color = Color3.FromHexString(hex);
    material.diffuseColor = color;
    material.emissiveColor = color.scale(emissiveStrength);
    material.specularColor = Color3.Black();
    return material;
  }
}
