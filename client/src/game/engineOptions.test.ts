import { describe, expect, it } from "vitest";
import { createGameEngineOptions } from "./engineOptions";

describe("opções do motor do Vale de Âmbar", () => {
  it("prioriza o caminho WebGL1 para evitar shaders WebGL2 incompatíveis", () => {
    expect(createGameEngineOptions()).toMatchObject({
      disableWebGL2Support: true,
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true,
    });
  });
});
