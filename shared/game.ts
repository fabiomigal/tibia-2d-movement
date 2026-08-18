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

export const REGIONS = [
  { key: "wind-road", name: "Estrada do Vento", level: 1, theme: "Campo inicial" },
  { key: "bamboo-forest", name: "Floresta de Bambu", level: 4, theme: "Bosque físico" },
  { key: "elders-ruins", name: "Ruínas Anciãs", level: 7, theme: "Pedra e aranhas" },
  { key: "cursed-graveyard", name: "Cemitério Amaldiçoado", level: 10, theme: "Mortos-vivos" },
  { key: "ancient-dungeon", name: "Calabouço Antigo", level: 14, theme: "Dois andares" },
  { key: "oasis", name: "Oásis das Dunas", level: 18, theme: "Deserto e terra" },
  { key: "desert-island", name: "Ilha Deserta", level: 22, theme: "Areia e serpentes" },
  { key: "ghost-forest", name: "Floresta Assombrada", level: 27, theme: "Morte e sagrado" },
  { key: "frozen-land", name: "Terra Congelada", level: 33, theme: "Gelo" },
  { key: "valley-of-despair", name: "Vale do Desespero", level: 40, theme: "Força bruta" },
  { key: "volcano", name: "Vulcão Carmesim", level: 48, theme: "Fogo e lava" },
] as const;

export type RegionKey = (typeof REGIONS)[number]["key"];

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

/** Posições de referência do campo usadas pelo mundo visual e pelo baú de cada criatura derrotada. */
export const WORLD_MONSTER_SPAWNS = [
  { monsterKey: "field-boar", x: 2, z: 6 },
  { monsterKey: "wind-goblin", x: 8, z: -8 },
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
