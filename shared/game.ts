export const DAMAGE_ELEMENTS = ["physical", "fire", "ice", "energy", "earth", "holy", "death"] as const;
export type DamageElement = (typeof DAMAGE_ELEMENTS)[number];

export const ARCHETYPES = [
  { key: "fighter", name: "Combatente", description: "Resiste à linha de frente e converte energia em golpes físicos.", strength: 12, dexterity: 9, vitality: 11, intelligence: 7, maxHp: 110, maxMp: 60, maxEnergy: 80 },
  { key: "archer", name: "Batedor", description: "Prioriza destreza, críticos e uma rota segura entre os perigos.", strength: 9, dexterity: 14, vitality: 9, intelligence: 8, maxHp: 95, maxMp: 65, maxEnergy: 90 },
  { key: "mage", name: "Místico", description: "Canaliza mana e elementos para abrir vantagem contra resistências.", strength: 6, dexterity: 9, vitality: 8, intelligence: 15, maxHp: 85, maxMp: 105, maxEnergy: 65 },
] as const;

export type ArchetypeKey = (typeof ARCHETYPES)[number]["key"];

export const ELEMENT_LABEL: Record<DamageElement, string> = {
  physical: "Físico",
  fire: "Fogo",
  ice: "Gelo",
  energy: "Energia",
  earth: "Terra",
  holy: "Sagrado",
  death: "Morte",
};

export const ELEMENT_COLOR: Record<DamageElement, string> = {
  physical: "#d0d0d0",
  fire: "#ff6a00",
  ice: "#7fd4ff",
  energy: "#d864ff",
  earth: "#8bc34a",
  holy: "#ffd700",
  death: "#9b59b6",
};

/** Posição inicial comum do avatar, usada pelo canvas, serviço e mundo visual. */
export const ZAO_START_POSITION = {
  x: -4.5,
  z: -2.5,
} as const;

/** Limites explícitos do campo Zao para contratos compartilhados de mapa e spawn. 
 * Aumentado em 200% conforme solicitado (de 432 para 864). */
export const ZAO_WORLD_BOUNDS = {
  minX: -864,
  maxX: 864,
  minZ: -864,
  maxZ: 864,
} as const;

export const REGIONS = [
  { key: "wind-road", name: "Estrada dos Ventos", level: 1, theme: "Portal norte e trilhas de pedra" },
  { key: "bamboo-forest", name: "Cidade de Âmbar", level: 4, theme: "Praça, rio e muralhas" },
  { key: "amber-inn", name: "Estalagem do Âmbar", level: 5, theme: "Salão, lareira e quartos de viagem" },
] as const;

export type RegionKey = (typeof REGIONS)[number]["key"];
export const MONSTER_RESPAWN_DELAY_MS = 2_000;

export const WORLD_PORTALS = [
  { id: "portal-inn-entry", label: "Porta da Estalagem", from: "bamboo-forest", to: "amber-inn", x: -9.6, z: -3.3, destination: { x: -18.2, z: 13.9 } },
  { id: "portal-inn-exit", label: "Saída para a Cidade de Âmbar", from: "amber-inn", to: "bamboo-forest", x: -18.2, z: 13.9, destination: { x: -8.55, z: -3.1 } },
] as const satisfies readonly { id: string; label: string; from: RegionKey; to: RegionKey; x: number; z: number; destination: { x: number; z: number } }[];

export type MonsterTemplate = {
  key: string;
  name: string;
  region: RegionKey;
  level: number;
  hp: number;
  attackMin: number;
  attackMax: number;
  xp: number;
  gold: number;
  element: DamageElement;
  resistances: Partial<Record<DamageElement, number>>;
  color: string;
};

/** Posições de referência do campo usadas pelo mundo visual e pelo baú de cada criatura derrotada.
 * Aumentado em spawns para o mapa 200% maior. */
export const WORLD_MONSTER_SPAWNS = [
  // Javali de Campo (field-boar) - Spawns espalhados
  { monsterKey: "field-boar", x: 2, z: 6 },
  { monsterKey: "field-boar", x: -15, z: 12 },
  { monsterKey: "field-boar", x: 25, z: -18 },
  { monsterKey: "field-boar", x: -30, z: -25 },
  { monsterKey: "field-boar", x: 50, z: 50 },
  { monsterKey: "field-boar", x: -60, z: 40 },
  { monsterKey: "field-boar", x: 70, z: -30 },
  { monsterKey: "field-boar", x: -80, z: -60 },
  { monsterKey: "field-boar", x: 120, z: 120 },
  { monsterKey: "field-boar", x: -150, z: 180 },
  { monsterKey: "field-boar", x: 180, z: -150 },
  { monsterKey: "field-boar", x: -200, z: -200 },
  { monsterKey: "field-boar", x: 300, z: 300 },
  { monsterKey: "field-boar", x: -350, z: 250 },
  { monsterKey: "field-boar", x: 400, z: -400 },
  { monsterKey: "field-boar", x: -450, z: -350 },
  { monsterKey: "field-boar", x: 500, z: 100 },
  { monsterKey: "field-boar", x: -550, z: -100 },
  { monsterKey: "field-boar", x: 600, z: 600 },
  { monsterKey: "field-boar", x: -700, z: -700 },

  // Goblin dos Ventos (wind-goblin) - Spawns espalhados
  { monsterKey: "wind-goblin", x: 8, z: -8 },
  { monsterKey: "wind-goblin", x: 20, z: 22 },
  { monsterKey: "wind-goblin", x: -22, z: -10 },
  { monsterKey: "wind-goblin", x: 35, z: 5 },
  { monsterKey: "wind-goblin", x: 60, z: -60 },
  { monsterKey: "wind-goblin", x: -70, z: 70 },
  { monsterKey: "wind-goblin", x: 90, z: 10 },
  { monsterKey: "wind-goblin", x: -95, z: -20 },
  { monsterKey: "wind-goblin", x: 150, z: -150 },
  { monsterKey: "wind-goblin", x: -180, z: 120 },
  { monsterKey: "wind-goblin", x: 200, z: 200 },
  { monsterKey: "wind-goblin", x: 280, z: -280 },
  { monsterKey: "wind-goblin", x: -320, z: 320 },
  { monsterKey: "wind-goblin", x: 450, z: 450 },
  { monsterKey: "wind-goblin", x: -500, z: -500 },
  { monsterKey: "wind-goblin", x: 650, z: 50 },
  { monsterKey: "wind-goblin", x: -650, z: -50 },
  { monsterKey: "wind-goblin", x: 750, z: 750 },
  { monsterKey: "wind-goblin", x: -800, z: 800 },

  // Arqueiro de Bambu (bamboo-archer) - Spawns espalhados
  { monsterKey: "bamboo-archer", x: -6.2, z: -6.2 },
  { monsterKey: "bamboo-archer", x: -40, z: 15 },
  { monsterKey: "bamboo-archer", x: 12, z: -35 },
  { monsterKey: "bamboo-archer", x: 80, z: 80 },
  { monsterKey: "bamboo-archer", x: -90, z: 45 },
  { monsterKey: "bamboo-archer", x: 160, z: 160 },
  { monsterKey: "bamboo-archer", x: -180, z: -100 },
  { monsterKey: "bamboo-archer", x: 350, z: -150 },
  { monsterKey: "bamboo-archer", x: -400, z: 400 },
  { monsterKey: "bamboo-archer", x: 550, z: 200 },
  { monsterKey: "bamboo-archer", x: -600, z: -300 },
  { monsterKey: "bamboo-archer", x: 700, z: 700 },
  { monsterKey: "bamboo-archer", x: -750, z: -750 },

  // Ácaro da Estalagem (inn-mite) - Spawns espalhados
  { monsterKey: "inn-mite", x: -20.2, z: 11.4 },
  { monsterKey: "inn-mite", x: -45, z: -40 },
  { monsterKey: "inn-mite", x: 100, z: -100 },
  { monsterKey: "inn-mite", x: 210, z: 210 },
  { monsterKey: "inn-mite", x: -210, z: -210 },
  { monsterKey: "inn-mite", x: 400, z: 0 },
  { monsterKey: "inn-mite", x: -400, z: 0 },
  { monsterKey: "inn-mite", x: 0, z: 400 },
  { monsterKey: "inn-mite", x: 0, z: -400 },
  { monsterKey: "inn-mite", x: 600, z: -600 },
  { monsterKey: "inn-mite", x: -600, z: 600 },
  { monsterKey: "inn-mite", x: 800, z: 0 },

] as const;

export type GameSkill = {
  key: string;
  name: string;
  element: DamageElement;
  damageBase: number;
  manaCost: number;
  energyCost: number;
  description: string;
};

export const CAPACITY_BASE = 50;
export const CAPACITY_PER_LEVEL = 25;

export const capacityForLevel = (level: number) => CAPACITY_BASE + CAPACITY_PER_LEVEL * Math.max(1, level);
export const elementMultiplier = (resistance = 1) => Math.max(0, 2 - resistance);
export const damageAfterResistance = (rawDamage: number, resistance = 1) => Math.max(1, Math.floor(rawDamage * elementMultiplier(resistance)));
export const xpForNextLevel = (level: number) => 100 + Math.max(0, level - 1) * 80;

export function levelFromXp(level: number, xp: number) {
  let nextLevel = Math.max(1, level);
  let remainingXp = Math.max(0, xp);
  while (remainingXp >= xpForNextLevel(nextLevel)) {
    remainingXp -= xpForNextLevel(nextLevel);
    nextLevel += 1;
  }
  return { level: nextLevel, xp: remainingXp };
}

export function inventoryWeight(items: Array<{ weight: number; quantity: number }>) {
  return items.reduce((total, item) => total + item.weight * item.quantity, 0);
}
