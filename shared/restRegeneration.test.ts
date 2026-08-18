import { describe, expect, it } from "vitest";
import { REST_REGENERATION, resolveRestRegeneration } from "./restRegeneration";

describe("resolveRestRegeneration", () => {
  it("mantém os recursos e o marcador de tempo antes do primeiro tick completo", () => {
    const startAt = 10_000;
    const result = resolveRestRegeneration({ mp: 10, maxMp: 30, energy: 7, maxEnergy: 40 }, startAt, startAt + REST_REGENERATION.tickMs - 1);

    expect(result).toMatchObject({ mp: 10, energy: 7, ticks: 0, nextTickAtMs: startAt });
  });

  it("recupera MP e energia somente por ticks completos de repouso", () => {
    const result = resolveRestRegeneration({ mp: 10, maxMp: 30, energy: 7, maxEnergy: 40 }, 10_000, 10_000 + REST_REGENERATION.tickMs * 3 + 900);

    expect(result).toMatchObject({ mp: 19, energy: 19, ticks: 3, nextTickAtMs: 10_000 + REST_REGENERATION.tickMs * 3 });
  });

  it("não permite que os recursos ultrapassem seus máximos", () => {
    const result = resolveRestRegeneration({ mp: 29, maxMp: 30, energy: 39, maxEnergy: 40 }, 0, REST_REGENERATION.tickMs * 8);

    expect(result).toMatchObject({ mp: 30, energy: 40, ticks: 8 });
  });
});
