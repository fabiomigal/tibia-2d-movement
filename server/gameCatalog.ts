import type { GameSkill, MonsterTemplate, RegionKey } from "@shared/game";

export const MONSTERS: MonsterTemplate[] = [
  { key: "field-boar", name: "Javali do Campo", region: "wind-road", level: 1, hp: 38, attackMin: 3, attackMax: 7, xp: 18, gold: 7, element: "physical", resistances: {}, color: "#b99064" },
  { key: "wind-goblin", name: "Goblin da Estrada", region: "wind-road", level: 3, hp: 54, attackMin: 5, attackMax: 10, xp: 26, gold: 11, element: "physical", resistances: { earth: 0.7 }, color: "#82965c" },
  { key: "bamboo-archer", name: "Arqueiro Maligno", region: "bamboo-forest", level: 5, hp: 78, attackMin: 8, attackMax: 14, xp: 42, gold: 19, element: "physical", resistances: { earth: 1.25 }, color: "#4c7d62" },
  { key: "ruin-golem", name: "Golem de Ruína", region: "elders-ruins", level: 8, hp: 118, attackMin: 11, attackMax: 18, xp: 70, gold: 34, element: "earth", resistances: { physical: 1.35, fire: 0.75 }, color: "#7d8790" },
  { key: "grave-wraith", name: "Wraith do Cemitério", region: "cursed-graveyard", level: 12, hp: 144, attackMin: 14, attackMax: 23, xp: 104, gold: 52, element: "death", resistances: { death: 1.7, holy: 0.25 }, color: "#8e6db3" },
  { key: "dune-scorpion", name: "Escorpião das Dunas", region: "oasis", level: 18, hp: 202, attackMin: 20, attackMax: 31, xp: 154, gold: 78, element: "earth", resistances: { earth: 1.55, ice: 0.7 }, color: "#c9954b" },
  { key: "sand-cobra", name: "Cobra da Areia", region: "desert-island", level: 22, hp: 246, attackMin: 24, attackMax: 38, xp: 194, gold: 96, element: "earth", resistances: { earth: 1.4, fire: 0.75 }, color: "#b8a05a" },
  { key: "haunted-bat", name: "Morcego Assombrado", region: "ghost-forest", level: 27, hp: 308, attackMin: 31, attackMax: 48, xp: 262, gold: 128, element: "death", resistances: { death: 1.6, holy: 0.35 }, color: "#75558d" },
  { key: "ice-wolf", name: "Lobo Gélido", region: "frozen-land", level: 33, hp: 410, attackMin: 42, attackMax: 64, xp: 410, gold: 180, element: "ice", resistances: { ice: 1.8, fire: 0.2 }, color: "#8dcbe4" },
  { key: "despair-titan", name: "Titã do Desespero", region: "valley-of-despair", level: 40, hp: 520, attackMin: 51, attackMax: 79, xp: 540, gold: 252, element: "physical", resistances: { physical: 1.3, energy: 0.75 }, color: "#8b735a" },
  { key: "lava-golem", name: "Golem de Lava", region: "volcano", level: 48, hp: 720, attackMin: 66, attackMax: 98, xp: 760, gold: 350, element: "fire", resistances: { fire: 2, ice: 0.15 }, color: "#d56a42" },
];

export const SKILLS: GameSkill[] = [
  { key: "power-strike", name: "Golpe Poderoso", element: "physical", damageBase: 18, manaCost: 0, energyCost: 6, description: "Ataque físico de curta distância." },
  { key: "fireball", name: "Bola de Fogo", element: "fire", damageBase: 28, manaCost: 10, energyCost: 0, description: "Chama concentrada contra um alvo." },
  { key: "ice-shield", name: "Lança de Gelo", element: "ice", damageBase: 25, manaCost: 9, energyCost: 0, description: "Gelo perfurante e frio." },
  { key: "thunder", name: "Trovão", element: "energy", damageBase: 30, manaCost: 13, energyCost: 0, description: "Energia elétrica instável." },
  { key: "arcane-missile", name: "Míssil Arcano", element: "holy", damageBase: 24, manaCost: 8, energyCost: 0, description: "Luz arcana contra mortos-vivos." },
  { key: "eagle-eye", name: "Olho da Águia", element: "earth", damageBase: 22, manaCost: 4, energyCost: 4, description: "Precisão terrosa e firme." },
];

export const monstersForRegion = (region: RegionKey) => MONSTERS.filter((monster) => monster.region === region);
