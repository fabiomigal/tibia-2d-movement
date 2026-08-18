import { describe, expect, it } from "vitest";
import { resolveRestStatePersistence } from "./restStatePersistence";

describe("resolveRestStatePersistence", () => {
  const now = new Date("2026-08-18T20:00:00.000Z");

  it("cria os dois marcadores de tempo ao entrar em repouso", () => {
    expect(resolveRestStatePersistence({ resting: true, isDead: false, hasRestStartedAt: false, now })).toEqual({
      kind: "start",
      restStartedAt: now,
      lastResourceRegenAt: now,
    });
  });

  it("mantém a marcação já existente enquanto permanece parado", () => {
    expect(resolveRestStatePersistence({ resting: true, isDead: false, hasRestStartedAt: true, now })).toEqual({ kind: "keep" });
  });

  it("limpa os marcadores ao agir ou quando o personagem está caído", () => {
    expect(resolveRestStatePersistence({ resting: false, isDead: false, hasRestStartedAt: true, now })).toEqual({ kind: "clear" });
    expect(resolveRestStatePersistence({ resting: true, isDead: true, hasRestStartedAt: true, now })).toEqual({ kind: "clear" });
  });
});
