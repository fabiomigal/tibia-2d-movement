import { describe, expect, it } from "vitest";
import { createCombatFloatEvents, hasFiniteScreenCoordinates, normalizeScreenCombatFloat, toRenderableCombatFloatPosition } from "./combatFloatEvents";
import { appendRenderableCombatFloat } from "./combatFloatLayer";
import { resolveCombatFloatWorldAnchor } from "./combatFloatPipeline";

describe("createCombatFloatEvents", () => {
  it("classifica dano, crítico inimigo e cura em alvos corretos", () => {
    expect(createCombatFloatEvents({ monsterKey: "field-boar", damage: 42, critical: false, counterDamage: 11, counterCritical: true, healing: 35 })).toEqual([
      { target: "monster", monsterKey: "field-boar", kind: "damage", value: 42 },
      { target: "player", kind: "critical", value: 11 },
      { target: "player", kind: "heal", value: 35 },
    ]);
  });

  it("omite valores nulos para não criar indicadores vazios", () => {
    expect(createCombatFloatEvents({ monsterKey: "road-goblin", damage: 0, critical: true, counterDamage: 0, counterCritical: false, healing: 0 })).toEqual([]);
  });

  it("descarta coordenadas não finitas antes da renderização da camada HTML", () => {
    expect(hasFiniteScreenCoordinates(312.5, 184)).toBe(true);
    expect(hasFiniteScreenCoordinates(Number.NaN, 184)).toBe(false);
    expect(hasFiniteScreenCoordinates(312.5, Number.POSITIVE_INFINITY)).toBe(false);
  });

  it("produz uma posição renderizável a partir de um evento de combate válido", () => {
    const [event] = createCombatFloatEvents({ monsterKey: "field-boar", damage: 42, critical: false, counterDamage: 0, counterCritical: false, healing: 0 });
    expect(event).toMatchObject({ target: "monster", kind: "damage", value: 42 });
    expect(toRenderableCombatFloatPosition(640, 360, 1280, 720, 640, 360)).toEqual({ x: 320, y: 180 });
    expect(toRenderableCombatFloatPosition(Number.NaN, 360, 1280, 720, 640, 360)).toBeNull();
  });

  it("percorre dano do combate até a posição renderizável do alvo no mundo", () => {
    const [damageEvent] = createCombatFloatEvents({ monsterKey: "field-boar", damage: 42, critical: false, counterDamage: 0, counterCritical: false, healing: 0 });
    const anchor = resolveCombatFloatWorldAnchor(damageEvent, { x: -4.5, z: -2.5 }, [{ key: "field-boar", x: 3, z: 5 }]);
    expect(anchor).toEqual({ x: 3, y: 1.58, z: 5 });
    expect(toRenderableCombatFloatPosition(384, 216, 1280, 720, 640, 360)).toEqual({ x: 192, y: 108 });
  });

  it("aceita na camada HTML apenas indicadores com estilos de posição finitos", () => {
    expect(normalizeScreenCombatFloat({ id: "hit-1", x: 192, y: 108, value: 42, kind: "damage", lifetime: 0.82 })).toMatchObject({ id: "hit-1", x: 192, y: 108 });
    expect(normalizeScreenCombatFloat({ id: "hit-invalid", x: Number.NaN, y: 108, value: 42, kind: "damage", lifetime: 0.82 })).toBeNull();
  });

  it("encadeia combate, âncora, projeção e recepção da camada HTML sem NaN", () => {
    const [event] = createCombatFloatEvents({ monsterKey: "field-boar", damage: 42, critical: true, counterDamage: 0, counterCritical: false, healing: 0 });
    const anchor = resolveCombatFloatWorldAnchor(event, { x: -4.5, z: -2.5 }, [{ key: "field-boar", x: 3, z: 5 }]);
    expect(anchor).toEqual({ x: 3, y: 1.58, z: 5 });
    const screen = toRenderableCombatFloatPosition(384, 216, 1280, 720, 640, 360);
    const floats = appendRenderableCombatFloat([], { id: "combat-1", ...screen, value: event.value, kind: event.kind, lifetime: 0.82 });
    expect(floats).toEqual([{ id: "combat-1", x: 192, y: 108, value: 42, kind: "critical", lifetime: 0.82 }]);
  });
});
