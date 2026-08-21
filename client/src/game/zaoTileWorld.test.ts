import { describe, expect, it } from "vitest";
import { CLEAN_FIELD_ATLAS_URLS, CLEAN_FIELD_STATIC_ATLAS_URLS, getCleanFieldGridProfiles } from "./zaoTileWorld";

describe("grades de chão limpas", () => {
  it("declara os quatro atlas de chão publicados sem depender de paredes, objetos ou água profunda", () => {
    expect(CLEAN_FIELD_ATLAS_URLS).toEqual({
      "amber-meadow": "/manus-storage/amber-meadow-atlas_9c669b22.png",
      "wind-trail": "/manus-storage/wind-trail-atlas_2727f147.png",
      "inn-garden": "/manus-storage/inn-garden-atlas_4d8b2099.png",
      "moon-clearing": "/manus-storage/moon-clearing-atlas_b5f9ac1e.png",
    });
  });

  it("mantém a característica de cada mapa apenas na família de chão e na grade", () => {
    const profiles = getCleanFieldGridProfiles();
    expect(profiles).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "amber-city-clean-field", family: "amber-meadow", width: 24, height: 34 }),
      expect.objectContaining({ id: "wind-road-clean-field", family: "wind-trail", width: 24, height: 34 }),
      expect.objectContaining({ id: "amber-inn-clean-field", family: "inn-garden" }),
      expect.objectContaining({ id: "moon-sanctuary-clean-field", family: "moon-clearing" }),
    ]));
    expect(profiles.every((profile) => !Object.prototype.hasOwnProperty.call(profile, "surfaceId"))).toBe(true);
  });

  it("declara cópias dos quatro atlas sob o subdiretório do GitHub Pages", () => {
    expect(CLEAN_FIELD_STATIC_ATLAS_URLS).toEqual(expect.objectContaining({
      "amber-meadow": expect.stringMatching(/tiles\/clean-field\/amber-meadow-atlas\.png$/),
      "wind-trail": expect.stringMatching(/tiles\/clean-field\/wind-trail-atlas\.png$/),
      "inn-garden": expect.stringMatching(/tiles\/clean-field\/inn-garden-atlas\.png$/),
      "moon-clearing": expect.stringMatching(/tiles\/clean-field\/moon-clearing-atlas\.png$/),
    }));
  });
});
