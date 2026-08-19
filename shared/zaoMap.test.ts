import { describe, expect, it } from "vitest";
import { ZAO_START_POSITION, ZAO_WORLD_BOUNDS } from "./game";

describe("mapa de Zao", () => {
  it("mantém a área jogável quadrada e o spawn dentro dos limites", () => {
    expect(ZAO_WORLD_BOUNDS.maxX - ZAO_WORLD_BOUNDS.minX).toBe(54);
    expect(ZAO_WORLD_BOUNDS.maxZ - ZAO_WORLD_BOUNDS.minZ).toBe(54);
    expect(ZAO_START_POSITION.x).toBeGreaterThan(ZAO_WORLD_BOUNDS.minX);
    expect(ZAO_START_POSITION.x).toBeLessThan(ZAO_WORLD_BOUNDS.maxX);
    expect(ZAO_START_POSITION.z).toBeGreaterThan(ZAO_WORLD_BOUNDS.minZ);
    expect(ZAO_START_POSITION.z).toBeLessThan(ZAO_WORLD_BOUNDS.maxZ);
  });
});
