import { describe, expect, it } from "vitest";
import { ADVENTURER_OGA_DIRECTION_ROWS, ADVENTURER_OGA_SPRITE_URL, OPAQUE_SPRITE_CONTRAST, OPAQUE_SPRITE_RENDERING, SPRITE_ALPHA_CUTOFF, SPRITE_PLANE_ROTATION_X, ZAO_SPRITE_SIZE, selectSpriteDirection, selectSpriteFrame, selectSpriteFrameUv, selectSpriteRowUv } from "./spriteAnimation";
import { Material } from "@babylonjs/core/Materials/material";

describe("seleção de frame dos sprites Zao", () => {
  it("repete apenas ações em loop e preserva o último frame das ações únicas", () => {
    expect(selectSpriteFrame(1.1, 4, 4, true)).toBe(0);
    expect(selectSpriteFrame(1.1, 4, 4, false)).toBe(3);
  });

  it("mapeia deslocamentos cardinais e diagonais às linhas do atlas", () => {
    expect(selectSpriteDirection(1, 0)).toBe("east");
    expect(selectSpriteDirection(-1, 0)).toBe("west");
    expect(selectSpriteDirection(0, 1)).toBe("south");
    expect(selectSpriteDirection(0, -1)).toBe("north");
    expect(selectSpriteDirection(1, 1)).toBe("southeast");
    expect(selectSpriteDirection(-1, -1)).toBe("northwest");
  });

  it("inverte o eixo V sem trocar a ordem declarada das direções no atlas", () => {
    expect(selectSpriteRowUv("south")).toEqual({ vOffset: 0.25, vScale: -0.25 });
    expect(selectSpriteRowUv("north")).toEqual({ vOffset: 0.75, vScale: -0.25 });
  });

  it("recorta o atlas OGA de seis por oito preservando as diagonais e frames transitórios legíveis", () => {
    expect(ADVENTURER_OGA_SPRITE_URL).toBe("/manus-storage/sprite_oga_f4502ba6.png");
    expect(selectSpriteRowUv("southwest", 8, ADVENTURER_OGA_DIRECTION_ROWS)).toEqual({ vOffset: 0.625, vScale: -0.125 });
    expect(selectSpriteRowUv("southeast", 8, ADVENTURER_OGA_DIRECTION_ROWS)).toEqual({ vOffset: 1, vScale: -0.125 });
    expect(selectSpriteFrameUv(0.45, 8, 4, true, 6)).toEqual({ uOffset: 0.5, uScale: 1 / 6 });
    expect(selectSpriteFrameUv(0.12, 10, 4, false, 6)).toEqual({ uOffset: 1 / 6, uScale: 1 / 6 });
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
    expect(ZAO_SPRITE_SIZE).toEqual({ adventurer: 1.12, goblin: 2.18, boar: 2.36 });
    expect(ZAO_SPRITE_SIZE.adventurer).toBeGreaterThan(1);
    expect(ZAO_SPRITE_SIZE.adventurer).toBeLessThan(ZAO_SPRITE_SIZE.goblin);
    expect(ZAO_SPRITE_SIZE.boar).toBeGreaterThan(ZAO_SPRITE_SIZE.goblin);
  });
});
