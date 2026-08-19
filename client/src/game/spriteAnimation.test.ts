import { describe, expect, it } from "vitest";
import { selectSpriteDirection, selectSpriteFrame, selectSpriteRowUv } from "./spriteAnimation";

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
});
