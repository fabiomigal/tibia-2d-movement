import { and, eq, lt } from "drizzle-orm";
import { cities, gameCharacters, gameItems, gameNpcs, gameQuests, gameSkills, groundDrops, idleHunts, merchantItems, monsterEncounters } from "../drizzle/schema";
import { ARCHETYPES, capacityForLevel, damageAfterResistance, inventoryWeight, levelFromXp, REGIONS, WORLD_MONSTER_SPAWNS, type ArchetypeKey, type DamageElement, type MonsterTemplate } from "@shared/game";
import { MONSTERS, SKILLS } from "./gameCatalog";
import { getDb } from "./db";

const PROFILE_KEY = "vale-ambar-demo";
const MAX_SLOTS = 50;
type CharacterRow = typeof gameCharacters.$inferSelect;

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível. Tente novamente em instantes.");
  return db;
}

async function ensureWorldCatalog() {
  const db = await requireDb();
  const existing = await db.select().from(merchantItems).limit(1);
  if (existing.length) return;
  await db.insert(cities).values({ cityKey: "campo-ambar", name: "Posto do Vale", region: "wind-road", description: "Uma parada para viajantes, mercadores e expedições." });
  await db.insert(gameNpcs).values([
    { npcKey: "selene-merchant", cityKey: "campo-ambar", name: "Selene", role: "Mercadora", dialogue: "Cuide da mochila. Cada passo vale mais quando o peso cabe na rota." },
    { npcKey: "arden-scout", cityKey: "campo-ambar", name: "Arden", role: "Batedor", dialogue: "As pedras anciãs respondem a quem observa os sinais do mapa." },
  ]);
  await db.insert(merchantItems).values([
    { catalogKey: "merchant-minor-potion", cityKey: "campo-ambar", name: "Poção de Vida Menor", kind: "consumable", rarity: "common", weight: 1, slot: "consumable", price: 18, description: "Recupera 35 de vida ao ser usada ou pelo auto-pot." },
    { catalogKey: "merchant-route-compass", cityKey: "campo-ambar", name: "Bússola de Rota", kind: "accessory", rarity: "uncommon", weight: 2, slot: "accessory", price: 68, description: "Instrumento de bronze para orientar expedições." },
    { catalogKey: "merchant-amber-ward", cityKey: "campo-ambar", name: "Amuleto de Âmbar", kind: "accessory", rarity: "rare", weight: 2, slot: "accessory", price: 150, description: "Proteção rara para quem se aventura além do posto." },
  ]);
}

async function ensureCharacter() {
  const db = await requireDb();
  const existing = await db.select().from(gameCharacters).where(eq(gameCharacters.profileKey, PROFILE_KEY)).limit(1);
  if (existing[0]) return existing[0];

  await db.insert(gameCharacters).values({
    profileKey: PROFILE_KEY, name: "Aventureiro de Âmbar", archetype: "fighter", level: 1, xp: 0, gold: 120,
    hp: 110, maxHp: 110, mp: 60, maxMp: 60, energy: 80, maxEnergy: 80,
    strength: 12, dexterity: 9, vitality: 11, intelligence: 7, currentRegion: "wind-road", floor: 0,
    positionX: -4, positionZ: -2, unlockedRegions: JSON.stringify(["wind-road"]), isDead: false, autoPotionEnabled: true,
  });
  const [created] = await db.select().from(gameCharacters).where(eq(gameCharacters.profileKey, PROFILE_KEY)).limit(1);
  if (!created) throw new Error("Não foi possível criar o personagem de desenvolvimento.");
  await db.insert(gameItems).values([
    { characterId: created.id, templateKey: "traveler-blade", name: "Lâmina do Viajante", kind: "weapon", rarity: "uncommon", weight: 5, quantity: 1, slot: "weapon", equipped: true, sellValue: 35 },
    { characterId: created.id, templateKey: "amber-cloak", name: "Manto de Âmbar", kind: "armor", rarity: "rare", weight: 4, quantity: 1, slot: "armor", equipped: true, sellValue: 48 },
    { characterId: created.id, templateKey: "minor-potion", name: "Poção de Vida Menor", kind: "consumable", rarity: "common", weight: 1, quantity: 5, slot: "consumable", equipped: false, sellValue: 6 },
    { characterId: created.id, templateKey: "wind-fragment", name: "Fragmento do Vento", kind: "material", rarity: "uncommon", weight: 1, quantity: 3, slot: "material", equipped: false, sellValue: 9 },
  ]);
  await db.insert(gameSkills).values(SKILLS.map((skill, index) => ({
    characterId: created.id, key: skill.key, name: skill.name, element: skill.element, damageBase: skill.damageBase,
    manaCost: skill.manaCost, energyCost: skill.energyCost, description: skill.description, hotkey: index < 4 ? `F${index + 1}` : null, equipped: index < 4,
  })));
  await db.insert(gameQuests).values({ characterId: created.id, questKey: "wind-road-survey", name: "Sinais da Estrada do Vento", status: "available", progress: 0, target: 3, rewardGold: 30, rewardXp: 45 });
  return created;
}

async function loadCharacter(): Promise<CharacterRow> { return ensureCharacter(); }

async function ensureQuestSeed(characterId: number) {
  const db = await requireDb();
  const existing = await db.select().from(gameQuests).where(eq(gameQuests.characterId, characterId)).limit(1);
  if (!existing.length) await db.insert(gameQuests).values({ characterId, questKey: "wind-road-survey", name: "Sinais da Estrada do Vento", status: "available", progress: 0, target: 3, rewardGold: 30, rewardXp: 45 });
}

async function restoreExpiredEncounters(character: CharacterRow) {
  const db = await requireDb();
  const expired = await db.select().from(monsterEncounters).where(and(eq(monsterEncounters.characterId, character.id), eq(monsterEncounters.region, character.currentRegion), lt(monsterEncounters.respawnAt, new Date())));
  for (const encounter of expired) {
    await db.update(monsterEncounters).set({ hp: encounter.maxHp, respawnAt: null }).where(eq(monsterEncounters.id, encounter.id));
  }
}

async function encounterForMonster(character: CharacterRow, monster: MonsterTemplate) {
  const db = await requireDb();
  const [existing] = await db.select().from(monsterEncounters).where(and(eq(monsterEncounters.characterId, character.id), eq(monsterEncounters.monsterKey, monster.key), eq(monsterEncounters.region, character.currentRegion))).limit(1);
  if (!existing) {
    await db.insert(monsterEncounters).values({ characterId: character.id, monsterKey: monster.key, region: character.currentRegion, hp: monster.hp, maxHp: monster.hp, respawnAt: null });
    const [created] = await db.select().from(monsterEncounters).where(and(eq(monsterEncounters.characterId, character.id), eq(monsterEncounters.monsterKey, monster.key), eq(monsterEncounters.region, character.currentRegion))).limit(1);
    if (!created) throw new Error("Não foi possível preparar o encontro da criatura.");
    return created;
  }
  if (existing.hp === 0 && existing.respawnAt && existing.respawnAt <= new Date()) {
    await db.update(monsterEncounters).set({ hp: existing.maxHp, respawnAt: null }).where(eq(monsterEncounters.id, existing.id));
    return { ...existing, hp: existing.maxHp, respawnAt: null };
  }
  return existing;
}

export async function getGameSnapshot() {
  const db = await requireDb();
  await ensureWorldCatalog();
  const character = await loadCharacter();
  await ensureQuestSeed(character.id);
  await restoreExpiredEncounters(character);
  const [items, skills, hunt, quests, drops, encounters] = await Promise.all([
    db.select().from(gameItems).where(eq(gameItems.characterId, character.id)),
    db.select().from(gameSkills).where(eq(gameSkills.characterId, character.id)),
    db.select().from(idleHunts).where(and(eq(idleHunts.characterId, character.id), eq(idleHunts.status, "active"))).limit(1),
    db.select().from(gameQuests).where(eq(gameQuests.characterId, character.id)),
    db.select().from(groundDrops).where(and(eq(groundDrops.characterId, character.id), eq(groundDrops.region, character.currentRegion))),
    db.select().from(monsterEncounters).where(and(eq(monsterEncounters.characterId, character.id), eq(monsterEncounters.region, character.currentRegion))),
  ]);
  return { character: { ...character, capacity: capacityForLevel(character.level), currentWeight: inventoryWeight(items) }, items, skills, activeHunt: hunt[0] ?? null, quests, drops, encounters };
}

function skillForKey(skillKey: string | undefined) { return SKILLS.find((skill) => skill.key === skillKey) ?? SKILLS[0]!; }

export async function resolveCombat(monsterKey: string, skillKey?: string) {
  const db = await requireDb();
  const character = await loadCharacter();
  if (character.isDead) throw new Error("Você está caído. Reviva antes de lutar.");
  const monster = MONSTERS.find((entry) => entry.key === monsterKey);
  if (!monster) throw new Error("Criatura não encontrada.");
  const encounter = await encounterForMonster(character, monster);
  if (encounter.hp === 0) throw new Error("A criatura ainda está se recompondo. Aguarde o retorno dela ao campo.");
  const skill = skillForKey(skillKey);
  if (character.mp < skill.manaCost || character.energy < skill.energyCost) throw new Error("Recursos insuficientes para esta habilidade.");
  const statPower = skill.element === "physical" ? character.strength + character.dexterity : character.intelligence + character.dexterity;
  const rawDamage = skill.damageBase + Math.floor(statPower * 1.15) + Math.floor(Math.random() * 8);
  const damage = damageAfterResistance(rawDamage, monster.resistances[skill.element] ?? 1);
  const critical = Math.random() < Math.min(0.28, character.dexterity / 100);
  const finalDamage = critical ? Math.floor(damage * 1.45) : damage;
  const monsterHp = Math.max(0, encounter.hp - finalDamage);
  const defeated = monsterHp === 0;
  const counterDamage = defeated ? 0 : monster.attackMin + Math.floor(Math.random() * (monster.attackMax - monster.attackMin + 1));
  const remainingHp = Math.max(0, character.hp - counterDamage);
  const [autoPotion] = await db.select().from(gameItems).where(and(eq(gameItems.characterId, character.id), eq(gameItems.templateKey, "minor-potion"))).limit(1);
  const autoPotionUsed = Boolean(character.autoPotionEnabled && remainingHp > 0 && remainingHp <= character.maxHp * 0.35 && autoPotion);
  const hpAfterPotion = autoPotionUsed ? Math.min(character.maxHp, remainingHp + 35) : remainingHp;
  const progression = defeated ? levelFromXp(character.level, character.xp + monster.xp) : { level: character.level, xp: character.xp };
  const nextMaxHp = character.maxHp + Math.max(0, progression.level - character.level) * 12;
  await db.update(gameCharacters).set({ level: progression.level, xp: progression.xp, gold: character.gold + (defeated ? monster.gold : 0), hp: hpAfterPotion, maxHp: nextMaxHp, mp: Math.max(0, character.mp - skill.manaCost), energy: Math.max(0, character.energy - skill.energyCost), isDead: hpAfterPotion === 0, updatedAt: new Date() }).where(eq(gameCharacters.id, character.id));
  await db.update(monsterEncounters).set({ hp: monsterHp, maxHp: monster.hp, respawnAt: defeated ? new Date(Date.now() + 8_000) : null }).where(eq(monsterEncounters.id, encounter.id));
  if (autoPotionUsed && autoPotion) {
    if (autoPotion.quantity > 1) await db.update(gameItems).set({ quantity: autoPotion.quantity - 1 }).where(eq(gameItems.id, autoPotion.id));
    else await db.delete(gameItems).where(eq(gameItems.id, autoPotion.id));
  }
  if (defeated) {
    const spawn = WORLD_MONSTER_SPAWNS.find((entry) => entry.monsterKey === monster.key) ?? { x: 0, z: 0 };
    const chestKey = `chest-${monster.key}-${Date.now()}`;
    await db.insert(groundDrops).values([
      { characterId: character.id, region: character.currentRegion, chestKey, itemKey: `${monster.key}-essence`, name: `Essência de ${monster.name}`, rarity: monster.level >= 20 ? "rare" : "uncommon", weight: 1, x: spawn.x, z: spawn.z },
      { characterId: character.id, region: character.currentRegion, chestKey, itemKey: `${monster.key}-trophy`, name: `Trofeu de ${monster.name}`, rarity: monster.level >= 8 ? "rare" : "common", weight: 1, x: spawn.x, z: spawn.z },
    ]);
    const [quest] = await db.select().from(gameQuests).where(and(eq(gameQuests.characterId, character.id), eq(gameQuests.status, "active"))).limit(1);
    if (quest) { const progress = Math.min(quest.target, quest.progress + 1); await db.update(gameQuests).set({ progress, status: progress >= quest.target ? "complete" : "active" }).where(eq(gameQuests.id, quest.id)); }
  }
  return { result: { monster: monster.name, monsterKey: monster.key, damage: finalDamage, counterDamage, element: skill.element as DamageElement, critical, defeated, monsterHp, monsterMaxHp: monster.hp, xpGained: defeated ? monster.xp : 0, goldGained: defeated ? monster.gold : 0, autoPotionUsed }, snapshot: await getGameSnapshot() };
}

export async function reviveCharacter() {
  const db = await requireDb(); const character = await loadCharacter();
  await db.update(gameCharacters).set({ hp: character.maxHp, mp: character.maxMp, energy: character.maxEnergy, gold: Math.floor(character.gold * 0.975), xp: Math.floor(character.xp * 0.97), isDead: false, currentRegion: "wind-road", floor: 0, positionX: -4, positionZ: -2, updatedAt: new Date() }).where(eq(gameCharacters.id, character.id));
  return getGameSnapshot();
}

export async function updateInventory(action: "equip" | "sell" | "discard" | "use", itemId: number) {
  const db = await requireDb(); const character = await loadCharacter();
  const [item] = await db.select().from(gameItems).where(and(eq(gameItems.id, itemId), eq(gameItems.characterId, character.id))).limit(1);
  if (!item) throw new Error("Item não encontrado na mochila.");
  if (action === "equip" && item.slot !== "consumable" && item.slot !== "material") {
    await db.update(gameItems).set({ equipped: false }).where(and(eq(gameItems.characterId, character.id), eq(gameItems.slot, item.slot)));
    await db.update(gameItems).set({ equipped: true }).where(eq(gameItems.id, item.id));
  } else if (action === "use" && item.kind === "consumable") {
    await db.update(gameCharacters).set({ hp: Math.min(character.maxHp, character.hp + 35), updatedAt: new Date() }).where(eq(gameCharacters.id, character.id));
    if (item.quantity > 1) await db.update(gameItems).set({ quantity: item.quantity - 1 }).where(eq(gameItems.id, item.id)); else await db.delete(gameItems).where(eq(gameItems.id, item.id));
  } else {
    if (action === "sell") await db.update(gameCharacters).set({ gold: character.gold + item.sellValue * item.quantity, updatedAt: new Date() }).where(eq(gameCharacters.id, character.id));
    await db.delete(gameItems).where(eq(gameItems.id, item.id));
  }
  return getGameSnapshot();
}

export async function travelToRegion(region: string) {
  const db = await requireDb(); const character = await loadCharacter();
  const targetRegion = REGIONS.find((entry) => entry.key === region);
  if (!targetRegion) throw new Error("Portal desconhecido.");
  if (character.level < targetRegion.level) throw new Error(`O portal exige nível ${targetRegion.level}.`);
  const unlocked = JSON.parse(character.unlockedRegions) as string[];
  if (!unlocked.includes(targetRegion.key)) unlocked.push(targetRegion.key);
  await db.update(gameCharacters).set({ currentRegion: targetRegion.key, floor: targetRegion.key === "ancient-dungeon" ? 1 : 0, unlockedRegions: JSON.stringify(unlocked), updatedAt: new Date() }).where(eq(gameCharacters.id, character.id));
  return getGameSnapshot();
}

export async function listMerchantItems() { await ensureWorldCatalog(); const db = await requireDb(); return db.select().from(merchantItems); }

export async function buyFromMerchant(catalogKey: string, confirmLegendary = false) {
  const db = await requireDb(); await ensureWorldCatalog(); const character = await loadCharacter();
  const [offer] = await db.select().from(merchantItems).where(eq(merchantItems.catalogKey, catalogKey)).limit(1);
  if (!offer) throw new Error("Oferta não encontrada.");
  if (offer.rarity === "legendary" && !confirmLegendary) throw new Error("Confirme a compra de item lendário.");
  if (character.gold < offer.price) throw new Error("Ouro insuficiente para esta oferta.");
  const items = await db.select().from(gameItems).where(eq(gameItems.characterId, character.id));
  if (items.length >= MAX_SLOTS || inventoryWeight(items) + offer.weight > capacityForLevel(character.level)) throw new Error("A mochila não comporta este item. Guarde ou descarte algo primeiro.");
  await db.insert(gameItems).values({ characterId: character.id, templateKey: offer.catalogKey, name: offer.name, kind: offer.kind, rarity: offer.rarity, weight: offer.weight, quantity: 1, slot: offer.slot, equipped: false, sellValue: Math.max(1, Math.floor(offer.price * 0.5)) });
  await db.update(gameCharacters).set({ gold: character.gold - offer.price, updatedAt: new Date() }).where(eq(gameCharacters.id, character.id));
  return getGameSnapshot();
}

export async function collectGroundDrop(dropId: number) {
  const db = await requireDb(); const character = await loadCharacter();
  const [drop] = await db.select().from(groundDrops).where(and(eq(groundDrops.id, dropId), eq(groundDrops.characterId, character.id))).limit(1);
  if (!drop) throw new Error("Este drop não está mais no chão.");
  const items = await db.select().from(gameItems).where(eq(gameItems.characterId, character.id));
  if (items.length >= MAX_SLOTS || inventoryWeight(items) + drop.weight > capacityForLevel(character.level)) throw new Error("A mochila está cheia. Guarde ou descarte algo primeiro.");
  await db.insert(gameItems).values({ characterId: character.id, templateKey: drop.itemKey, name: drop.name, kind: "material", rarity: drop.rarity, weight: drop.weight, quantity: 1, slot: "material", equipped: false, sellValue: 8 });
  await db.delete(groundDrops).where(eq(groundDrops.id, drop.id));
  return getGameSnapshot();
}

export async function setAutoPotion(enabled: boolean) { const db = await requireDb(); const character = await loadCharacter(); await db.update(gameCharacters).set({ autoPotionEnabled: enabled, updatedAt: new Date() }).where(eq(gameCharacters.id, character.id)); return getGameSnapshot(); }

export async function acceptQuest(questKey: string) {
  const db = await requireDb(); const character = await loadCharacter();
  const [quest] = await db.select().from(gameQuests).where(and(eq(gameQuests.characterId, character.id), eq(gameQuests.questKey, questKey))).limit(1);
  if (!quest) throw new Error("Missão não encontrada.");
  if (quest.status === "available") await db.update(gameQuests).set({ status: "active" }).where(eq(gameQuests.id, quest.id));
  return getGameSnapshot();
}

export async function claimQuest(questKey: string) {
  const db = await requireDb(); const character = await loadCharacter();
  const [quest] = await db.select().from(gameQuests).where(and(eq(gameQuests.characterId, character.id), eq(gameQuests.questKey, questKey))).limit(1);
  if (!quest || quest.status !== "complete") throw new Error("A missão ainda não está pronta para recompensa.");
  const progression = levelFromXp(character.level, character.xp + quest.rewardXp);
  await db.update(gameCharacters).set({ level: progression.level, xp: progression.xp, gold: character.gold + quest.rewardGold, updatedAt: new Date() }).where(eq(gameCharacters.id, character.id));
  await db.update(gameQuests).set({ status: "available", progress: 0 }).where(eq(gameQuests.id, quest.id));
  return getGameSnapshot();
}

export async function selectArchetype(archetypeKey: ArchetypeKey) {
  const db = await requireDb();
  const character = await loadCharacter();
  if (character.level > 1) throw new Error("O arquétipo só pode ser escolhido antes da primeira ascensão.");
  const archetype = ARCHETYPES.find((entry) => entry.key === archetypeKey);
  if (!archetype) throw new Error("Arquétipo desconhecido.");
  await db.update(gameCharacters).set({
    archetype: archetype.key,
    strength: archetype.strength,
    dexterity: archetype.dexterity,
    vitality: archetype.vitality,
    intelligence: archetype.intelligence,
    hp: archetype.maxHp,
    maxHp: archetype.maxHp,
    mp: archetype.maxMp,
    maxMp: archetype.maxMp,
    energy: archetype.maxEnergy,
    maxEnergy: archetype.maxEnergy,
    updatedAt: new Date(),
  }).where(eq(gameCharacters.id, character.id));
  return getGameSnapshot();
}

export async function startIdleHunt(monsterKey: string) {
  const db = await requireDb(); const character = await loadCharacter(); const monster = MONSTERS.find((entry) => entry.key === monsterKey);
  if (!monster) throw new Error("Criatura não encontrada.");
  await db.update(idleHunts).set({ status: "stopped", lastResolvedAt: new Date() }).where(and(eq(idleHunts.characterId, character.id), eq(idleHunts.status, "active")));
  await db.insert(idleHunts).values({ characterId: character.id, monsterKey: monster.key, region: monster.region, status: "active", totalTurns: 0, rewardsXp: 0, rewardsGold: 0, startedAt: new Date(), lastResolvedAt: new Date() });
  return getGameSnapshot();
}

export async function resumeIdleHunt() {
  const db = await requireDb(); const character = await loadCharacter();
  const [hunt] = await db.select().from(idleHunts).where(and(eq(idleHunts.characterId, character.id), eq(idleHunts.status, "active"))).limit(1);
  if (!hunt) return { turns: 0, xp: 0, gold: 0, snapshot: await getGameSnapshot() };
  const monster = MONSTERS.find((entry) => entry.key === hunt.monsterKey);
  if (!monster) throw new Error("A sessão de caça perdeu a criatura selecionada.");
  const elapsedMs = Date.now() - hunt.lastResolvedAt.getTime(); const turns = Math.min(120, Math.max(0, Math.floor(elapsedMs / 5_000)));
  if (turns > 0) {
    const gainedXp = Math.floor(turns * monster.xp * 0.55); const gainedGold = Math.floor(turns * monster.gold * 0.55); const progression = levelFromXp(character.level, character.xp + gainedXp);
    await db.update(idleHunts).set({ totalTurns: hunt.totalTurns + turns, rewardsXp: hunt.rewardsXp + gainedXp, rewardsGold: hunt.rewardsGold + gainedGold, lastResolvedAt: new Date() }).where(eq(idleHunts.id, hunt.id));
    await db.update(gameCharacters).set({ level: progression.level, xp: progression.xp, gold: character.gold + gainedGold, updatedAt: new Date() }).where(eq(gameCharacters.id, character.id));
    return { turns, xp: gainedXp, gold: gainedGold, snapshot: await getGameSnapshot() };
  }
  return { turns: 0, xp: 0, gold: 0, snapshot: await getGameSnapshot() };
}
