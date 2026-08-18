import { describe, expect, it } from "vitest";
import { getTargetIndicatorStyle } from "./targetIndicator";

describe("getTargetIndicatorStyle", () => {
  it("prioriza o anel vermelho e ampliado para a criatura selecionada", () => {
    expect(getTargetIndicatorStyle(true, "attack")).toEqual({ color: "#E84545", glow: 0.82, scale: 1.56 });
  });

  it("mantém o anel âmbar para criaturas que não são alvo", () => {
    expect(getTargetIndicatorStyle(false, "chase")).toEqual({ color: "#F2B84B", glow: 0.42, scale: 1.12 });
  });
});
