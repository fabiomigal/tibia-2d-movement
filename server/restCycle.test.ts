import { describe, expect, it } from "vitest";
import { REST_REGENERATION } from "@shared/restRegeneration";
import { resolveRestCycle } from "./restCycle";

describe("resolveRestCycle", () => {
  const base = { mp: 10, maxMp: 30, energy: 8, maxEnergy: 40, isDead: false };

  it("inicia o repouso persistindo os dois marcadores no mesmo instante", () => {
    expect(resolveRestCycle({ ...base, requestedRest: true, restStartedAtMs: null, lastResourceRegenAtMs: null, nowMs: 10_000 })).toMatchObject({
      mp: 10, energy: 8, ticks: 0, restStartedAtMs: 10_000, lastResourceRegenAtMs: 10_000,
    });
  });

  it("aplica ticks completos e entrega o snapshot com recursos recuperados", () => {
    const nowMs = 10_000 + REST_REGENERATION.tickMs * 3 + 500;
    expect(resolveRestCycle({ ...base, requestedRest: true, restStartedAtMs: 10_000, lastResourceRegenAtMs: 10_000, nowMs })).toMatchObject({
      mp: 19, energy: 20, ticks: 3, restStartedAtMs: 10_000, lastResourceRegenAtMs: 10_000 + REST_REGENERATION.tickMs * 3,
    });
  });

  it("aplica o último tick vencido e limpa os marcadores quando o personagem volta a agir", () => {
    const nowMs = 10_000 + REST_REGENERATION.tickMs * 2;
    expect(resolveRestCycle({ ...base, requestedRest: false, restStartedAtMs: 10_000, lastResourceRegenAtMs: 10_000, nowMs })).toMatchObject({
      mp: 16, energy: 16, ticks: 2, restStartedAtMs: null, lastResourceRegenAtMs: null,
    });
  });
});
