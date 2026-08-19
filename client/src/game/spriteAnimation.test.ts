import { describe, expect, it } from "vitest";
import { OPAQUE_SPRITE_CONTRAST, OPAQUE_SPRITE_RENDERING, SPRITE_ALPHA_CUTOFF, SPRITE_PLANE_ROTATION_X, ZAO_SPRITE_SIZE, selectSpriteDirection, selectSpriteFrame, selectSpriteRowUv } from "./spriteAnimation";
import { Material } from "@babylonjs/core/Materials/material";

describe("seleção de frame dos sprites Zao", () => {
  it("repete apenas ações em loop e preserva o último frame das ações únicas", () => {
    expect(selectSpriteFrame(1.1, 4, 4, true)).toBe(0);
    expect(selectSpriteFrame(1.1, 4, 4, false)).toBe(3);
  });

  it("mapeia deslocamentos cardinais às linhas do atlas", () => {
    expect(selectSpriteDirection(1, 0)).toBe("east");
    expect(selectSpriteDirection(-1, 0)).toBe("west");
    expect(selectSpriteDirection(0, 1)).toBe("south");
    expect(selectSpriteDirection(0, -1)).toBe("north");
  });

  it("inverte o eixo V sem trocar a ordem declarada das direções no atlas", () => {
    expect(selectSpriteRowUv("south")).toEqual({ vOffset: 0.25, vScale: -0.25 });
    expect(selectSpriteRowUv("north")).toEqual({ vOffset: 0.75, vScale: -0.25 });
  });

  it("mantém o plano horizontal virado para a câmera superior", () => {
    expect(SPRITE_PLANE_ROTATION_X).toBe(Math.PI / 2);
  });

  it("usa um corte alfa conservador para manter os pixels do personagem opacos", () => {
    expect(SPRITE_ALPHA_CUTOFF).toBeGreaterThan(0);
    expect(SPRITE_ALPHA_CUTOFF).toBeLessThanOrEqual(0.1);
  });

  it("declara material sólido, escrita de profundidade e prioridade visual sobre os tiles", () => {
    expect(OPAQUE_SPRITE_RENDERING).toMatchObject({
      alpha: 1,
      alphaCutOff: SPRITE_ALPHA_CUTOFF,
      transparencyMode: Material.MATERIAL_ALPHATEST,
      forceDepthWrite: true,
      useAlphaFromDiffuseTexture: true,
      disableLighting: true,
      renderingGroupId: 2,
    });
    expect(OPAQUE_SPRITE_CONTRAST).toEqual({
      diffuseHex: "#FFFFFF",
      emissiveHex: "#FFFFFF",
      lighting: "unlit-full-color",
    });
  });

  it("calibra aventureiro e criaturas para a escala do grid de tiles", () => {
    expect(ZAO_SPRITE_SIZE).toEqual({ adventurer: 2.55, goblin: 2.18, boar: 2.36 });
    expect(ZAO_SPRITE_SIZE.adventurer).toBeGreaterThan(2);
    expect(ZAO_SPRITE_SIZE.boar).toBeGreaterThan(ZAO_SPRITE_SIZE.goblin);
  });
});
