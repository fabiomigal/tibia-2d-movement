import { describe, expect, it } from "vitest";
import { ENVIRONMENT_CYCLE_MS, WEATHER_CYCLE_MS, resolveEnvironmentState } from "./environment";

describe("ciclo ambiental", () => {
  it("percorre amanhecer, dia, crepúsculo e noite em ordem determinística", () => {
    expect(resolveEnvironmentState(0).phase).toBe("dawn");
    expect(resolveEnvironmentState(ENVIRONMENT_CYCLE_MS / 4).phase).toBe("day");
    expect(resolveEnvironmentState(ENVIRONMENT_CYCLE_MS / 2).phase).toBe("dusk");
    expect(resolveEnvironmentState((ENVIRONMENT_CYCLE_MS / 4) * 3).phase).toBe("night");
  });

  it("alterna chuva e névoa sem depender de processos em segundo plano", () => {
    expect(resolveEnvironmentState(WEATHER_CYCLE_MS).weather).toBe("rain");
    expect(resolveEnvironmentState(WEATHER_CYCLE_MS * 3).weather).toBe("mist");
  });
});
