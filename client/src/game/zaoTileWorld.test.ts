import { describe, expect, it } from "vitest";
import { UNIFORM_FIELD_DIMENSIONS, UNIFORM_FIELD_TILE_URL } from "./zaoTileWorld";

describe("campo uniforme do Vale de Âmbar", () => {
  it("declara uma única sprite publicada para todo o terreno", () => {
    expect(UNIFORM_FIELD_TILE_URL).toContain("amber-field-uniform");
    expect(UNIFORM_FIELD_TILE_URL).not.toContain("atlas");
  });

  it("cobre toda a grade contínua do mundo sem zonas ou superfícies alternativas", () => {
    expect(UNIFORM_FIELD_DIMENSIONS).toEqual({ width: 48, height: 34 });
  });
});
