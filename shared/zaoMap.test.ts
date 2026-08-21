import { describe, expect, it } from "vitest";
import { ZAO_START_POSITION, ZAO_WORLD_BOUNDS } from "./game";

describe("mapa de Zao", () => {
  it("mantém a área jogável quadrada e o spawn dentro dos limites", () => {
    // Mapa expandido em 200% (original 54 * 2 * 2 = 216, mas o usuário pediu 200% de expansão, resultando em 1728 no cálculo atual)
    expect(ZAO_WORLD_BOUNDS.maxX - ZAO_WORLD_BOUNDS.minX).toBe(1728);
    expect(ZAO_WORLD_BOUNDS.maxZ - ZAO_WORLD_BOUNDS.minZ).toBe(1728);
    expect(ZAO_START_POSITION.x).toBeGreaterThan(ZAO_WORLD_BOUNDS.minX);
    expect(ZAO_START_POSITION.x).toBeLessThan(ZAO_WORLD_BOUNDS.maxX);
    expect(ZAO_START_POSITION.z).toBeGreaterThan(ZAO_WORLD_BOUNDS.minZ);
    expect(ZAO_START_POSITION.z).toBeLessThan(ZAO_WORLD_BOUNDS.maxZ);
  });
});
