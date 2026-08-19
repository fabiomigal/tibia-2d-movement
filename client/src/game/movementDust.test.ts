import { describe, expect, it } from "vitest";
import { resolveMovementDustEmitRate } from "./GameWorld";

describe("poeira de movimento", () => {
  it("emite somente enquanto a apresentação visual do jogador está em deslocamento", () => {
    expect(resolveMovementDustEmitRate(true)).toBeGreaterThan(0);
    expect(resolveMovementDustEmitRate(false)).toBe(0);
  });
});
