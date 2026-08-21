import { describe, expect, it } from "vitest";
import { AURORA_REFERENCE_DIRECTION_ROWS, AURORA_REFERENCE_SPRITE_URLS, AURORA_REFERENCE_STATIC_SPRITE_URLS, BATEDOR_RUINAS_DIRECTION_ROWS, BATEDOR_RUINAS_SPRITE_URLS, BATEDOR_RUINAS_STATIC_SPRITE_URLS, OPAQUE_SPRITE_CONTRAST, OPAQUE_SPRITE_RENDERING, SPRITE_ALPHA_CUTOFF, SPRITE_PLANE_ROTATION_X, ZAO_SPRITE_SIZE, selectCardinalSpriteDirection, selectSpriteDirection, selectSpriteFrame, selectSpriteFrameUv, selectSpriteRowUv, usesSpriteTexture } from "./spriteAnimation";
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

  it("limita o Batedor de Ruínas a uma face cardinal e conserva a última direção em repouso", () => {
    expect(selectCardinalSpriteDirection(1, 0)).toBe("east");
    expect(selectCardinalSpriteDirection(-1, 0)).toBe("west");
    expect(selectCardinalSpriteDirection(0, 1)).toBe("south");
    expect(selectCardinalSpriteDirection(0, -1)).toBe("north");
    expect(selectCardinalSpriteDirection(1, 1)).toBe("south");
    expect(selectCardinalSpriteDirection(-1, -1)).toBe("north");
    expect(selectCardinalSpriteDirection(0, 0, "east")).toBe("east");
    expect(selectCardinalSpriteDirection(0, 0, "northwest")).toBe("west");
  });

  it("preserva o eixo V nativo sem trocar a ordem declarada das direções no atlas", () => {
    expect(selectSpriteRowUv("south")).toEqual({ vOffset: 0, vScale: 0.25 });
    expect(selectSpriteRowUv("north")).toEqual({ vOffset: 0.5, vScale: 0.25 });
  });

  it("recorta o Batedor de Ruínas em quadros isolados com norte na linha superior", () => {
    expect(BATEDOR_RUINAS_SPRITE_URLS).toEqual({
      idle: "/manus-storage/batedor-ruinas-idle-4x4_e8c66a18.png",
      walk: "/manus-storage/batedor-ruinas-walk-4x4_198bb673.png",
      attack: "/manus-storage/batedor-ruinas-attack-4x4_f5f91a67.png",
      hit: "/manus-storage/batedor-ruinas-hit-4x4_78b1c80e.png",
      death: "/manus-storage/batedor-ruinas-death-4x4_e8975156.png",
    });
    expect(BATEDOR_RUINAS_DIRECTION_ROWS).toEqual({ north: 0, east: 1, south: 2, west: 3 });
    expect(selectSpriteRowUv("north", 4, BATEDOR_RUINAS_DIRECTION_ROWS, true)).toEqual({ vOffset: 0.25, vScale: -0.25 });
    expect(selectSpriteRowUv("south", 4, BATEDOR_RUINAS_DIRECTION_ROWS, true)).toEqual({ vOffset: 0.75, vScale: -0.25 });
    expect(AURORA_REFERENCE_SPRITE_URLS.goblin).toBe("/manus-storage/aurora_goblin_44e23aa6.png");
    expect(AURORA_REFERENCE_SPRITE_URLS.boar).toBe("/manus-storage/aurora_boar_e32a98d2.png");
    expect(selectSpriteRowUv("south", 4, AURORA_REFERENCE_DIRECTION_ROWS)).toEqual({ vOffset: 0, vScale: 0.25 });
    expect(selectSpriteRowUv("northeast", 4, AURORA_REFERENCE_DIRECTION_ROWS)).toEqual({ vOffset: 0.25, vScale: 0.25 });
    expect(selectSpriteFrameUv(0.45, 8, 4, true, 4)).toEqual({ uOffset: 3 / 4, uScale: 1 / 4 });
    expect(selectSpriteFrameUv(0.7, 12, 4, false, 4)).toEqual({ uOffset: 3 / 4, uScale: 1 / 4 });
  });

  it("expõe os atlas de personagem e criaturas no subdiretório do GitHub Pages", () => {
    expect(BATEDOR_RUINAS_STATIC_SPRITE_URLS).toEqual(expect.objectContaining({
      idle: expect.stringMatching(/sprites\/batedor-ruinas\/batedor-ruinas-idle-4x4\.png$/),
      walk: expect.stringMatching(/sprites\/batedor-ruinas\/batedor-ruinas-walk-4x4\.png$/),
      attack: expect.stringMatching(/sprites\/batedor-ruinas\/batedor-ruinas-attack-4x4\.png$/),
      hit: expect.stringMatching(/sprites\/batedor-ruinas\/batedor-ruinas-hit-4x4\.png$/),
      death: expect.stringMatching(/sprites\/batedor-ruinas\/batedor-ruinas-death-4x4\.png$/),
    }));
    expect(AURORA_REFERENCE_STATIC_SPRITE_URLS).toEqual({
      goblin: expect.stringMatching(/sprites\/aurora-monsters\/aurora_goblin\.png$/),
      boar: expect.stringMatching(/sprites\/aurora-monsters\/aurora_boar\.png$/),
    });
  });

  it("preserva atlas de imagem para o personagem principal e as criaturas", () => {
    expect(usesSpriteTexture("adventurer")).toBe(true);
    expect(usesSpriteTexture("goblin")).toBe(true);
    expect(usesSpriteTexture("boar")).toBe(true);
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
