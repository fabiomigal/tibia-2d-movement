import { describe, expect, it } from "vitest";
import { AURORA_REFERENCE_DIRECTION_ROWS, AURORA_REFERENCE_SPRITE_URLS, OPAQUE_SPRITE_CONTRAST, OPAQUE_SPRITE_RENDERING, SPRITE_ALPHA_CUTOFF, SPRITE_PLANE_ROTATION_X, ZAO_SPRITE_SIZE, selectSpriteDirection, selectSpriteFrame, selectSpriteFrameUv, selectSpriteRowUv } from "./spriteAnimation";
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

  it("preserva o eixo V nativo sem trocar a ordem declarada das direções no atlas", () => {
    expect(selectSpriteRowUv("south")).toEqual({ vOffset: 0, vScale: 0.25 });
    expect(selectSpriteRowUv("north")).toEqual({ vOffset: 0.5, vScale: 0.25 });
  });

  it("recorta os atlases Aurora de quatro direções e preserva a animação de cada ator", () => {
    expect(AURORA_REFERENCE_SPRITE_URLS.adventurer).toBe("/manus-storage/aurora_adventurer_46c6b802.png");
    expect(AURORA_REFERENCE_SPRITE_URLS.goblin).toBe("/manus-storage/aurora_goblin_44e23aa6.png");
    expect(AURORA_REFERENCE_SPRITE_URLS.boar).toBe("/manus-storage/aurora_boar_e32a98d2.png");
    expect(selectSpriteRowUv("south", 4, AURORA_REFERENCE_DIRECTION_ROWS)).toEqual({ vOffset: 0, vScale: 0.25 });
    expect(selectSpriteRowUv("northeast", 4, AURORA_REFERENCE_DIRECTION_ROWS)).toEqual({ vOffset: 0.25, vScale: 0.25 });
    expect(selectSpriteFrameUv(0.45, 8, 4, true, 4)).toEqual({ uOffset: 3 / 4, uScale: 1 / 4 });
    expect(selectSpriteFrameUv(0.7, 12, 4, false, 4)).toEqual({ uOffset: 3 / 4, uScale: 1 / 4 });
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
    expect(ZAO_SPRITE_SIZE).toEqual({ adventurer: 1.08, goblin: 1.42, boar: 1.58 });
    expect(ZAO_SPRITE_SIZE.adventurer).toBeGreaterThan(1);
    expect(ZAO_SPRITE_SIZE.adventurer).toBeLessThan(ZAO_SPRITE_SIZE.goblin);
    expect(ZAO_SPRITE_SIZE.boar).toBeGreaterThan(ZAO_SPRITE_SIZE.goblin);
  });
});
