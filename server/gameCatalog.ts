import type { GameSkill, MonsterTemplate, RegionKey } from "@shared/game";

export const MONSTERS: MonsterTemplate[] = [
  { key: "field-boar", name: "Javali do Campo", region: "wind-road", level: 1, hp: 38, attackMin: 3, attackMax: 7, xp: 18, gold: 7, element: "physical", resistances: {}, color: "#b99064" },
  { key: "wind-goblin", name: "Goblin da Estrada", region: "wind-road", level: 3, hp: 54, attackMin: 5, attackMax: 10, xp: 26, gold: 11, element: "physical", resistances: { earth: 0.7 }, color: "#82965c" },
  { key: "bamboo-archer", name: "Arqueiro Maligno", region: "bamboo-forest", level: 5, hp: 78, attackMin: 8, attackMax: 14, xp: 42, gold: 19, element: "physical", resistances: { earth: 1.25 }, color: "#4c7d62" },
  { key: "inn-mite", name: "Rato da Estalagem", region: "amber-inn", level: 5, hp: 66, attackMin: 7, attackMax: 12, xp: 34, gold: 14, element: "physical", resistances: { earth: 0.9 }, color: "#9b7b5a" },
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
