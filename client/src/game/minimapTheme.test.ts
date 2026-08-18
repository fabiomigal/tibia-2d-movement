import { describe, expect, it } from "vitest";
import { getMinimapMarkerTheme } from "./minimapTheme";

describe("getMinimapMarkerTheme", () => {
  it("atribui assinaturas distintas aos marcadores de regiões contrastantes", () => {
    expect(getMinimapMarkerTheme("bamboo-forest")).toBe("jade");
    expect(getMinimapMarkerTheme("frozen-land")).toBe("ice");
    expect(getMinimapMarkerTheme("volcano")).toBe("ember");
  });

  it("preserva âmbar como assinatura segura para regiões desconhecidas", () => {
    expect(getMinimapMarkerTheme("regiao-inexistente")).toBe("amber");
  });
});
