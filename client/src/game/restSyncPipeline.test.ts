import { describe, expect, it } from "vitest";
import { resolveRestSync } from "./restSyncPipeline";

describe("resolveRestSync", () => {
  it("inicia o repouso ao receber um personagem parado", () => {
    expect(resolveRestSync({ wasResting: false, worldReportsRest: true, isDead: false })).toEqual({
      resting: true,
      shouldPersistTransition: true,
      shouldRefreshResources: true,
    });
  });

  it("mantém os ticks ativos sem persistir transições repetidas", () => {
    expect(resolveRestSync({ wasResting: true, worldReportsRest: true, isDead: false })).toEqual({
      resting: true,
      shouldPersistTransition: false,
      shouldRefreshResources: true,
    });
  });

  it("interrompe repouso ao mover ou morrer", () => {
    expect(resolveRestSync({ wasResting: true, worldReportsRest: false, isDead: false })).toMatchObject({
      resting: false,
      shouldPersistTransition: true,
      shouldRefreshResources: false,
    });
    expect(resolveRestSync({ wasResting: true, worldReportsRest: true, isDead: true })).toMatchObject({
      resting: false,
      shouldPersistTransition: true,
      shouldRefreshResources: false,
    });
  });
});
