import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const gameCharacters = mysqlTable("game_characters", {
  id: int("id").autoincrement().primaryKey(),
  profileKey: varchar("profileKey", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 80 }).notNull(),
  archetype: mysqlEnum("archetype", ["fighter", "mage", "archer"]).notNull(),
  level: int("level").notNull().default(1),
  xp: int("xp").notNull().default(0),
  gold: int("gold").notNull().default(0),
  hp: int("hp").notNull(),
  maxHp: int("maxHp").notNull(),
  mp: int("mp").notNull(),
  maxMp: int("maxMp").notNull(),
  energy: int("energy").notNull(),
  maxEnergy: int("maxEnergy").notNull(),
  strength: int("strength").notNull(),
  dexterity: int("dexterity").notNull(),
  vitality: int("vitality").notNull(),
  intelligence: int("intelligence").notNull(),
  currentRegion: varchar("currentRegion", { length: 64 }).notNull().default("wind-road"),
  floor: int("floor").notNull().default(0),
  positionX: int("positionX").notNull().default(-4),
  positionZ: int("positionZ").notNull().default(-2),
  unlockedRegions: text("unlockedRegions").notNull(),
  isDead: boolean("isDead").notNull().default(false),
  autoPotionEnabled: boolean("autoPotionEnabled").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const gameItems = mysqlTable("game_items", {
  id: int("id").autoincrement().primaryKey(),
  characterId: int("characterId").notNull(),
  templateKey: varchar("templateKey", { length: 80 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  kind: mysqlEnum("kind", ["weapon", "armor", "consumable", "material", "accessory"]).notNull(),
  rarity: mysqlEnum("rarity", ["common", "uncommon", "rare", "epic", "legendary"]).notNull().default("common"),
  weight: int("weight").notNull().default(0),
  quantity: int("quantity").notNull().default(1),
  slot: varchar("slot", { length: 32 }).notNull(),
  equipped: boolean("equipped").notNull().default(false),
  sellValue: int("sellValue").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const gameSkills = mysqlTable("game_skills", {
  id: int("id").autoincrement().primaryKey(),
  characterId: int("characterId").notNull(),
  key: varchar("key", { length: 64 }).notNull(),
  name: varchar("name", { length: 80 }).notNull(),
  element: mysqlEnum("element", ["physical", "fire", "ice", "energy", "earth", "holy", "death"]).notNull(),
  damageBase: int("damageBase").notNull(),
  manaCost: int("manaCost").notNull().default(0),
  energyCost: int("energyCost").notNull().default(0),
  description: varchar("description", { length: 240 }).notNull(),
  hotkey: varchar("hotkey", { length: 8 }),
  equipped: boolean("equipped").notNull().default(false),
});

export const idleHunts = mysqlTable("idle_hunts", {
  id: int("id").autoincrement().primaryKey(),
  characterId: int("characterId").notNull(),
  monsterKey: varchar("monsterKey", { length: 80 }).notNull(),
  region: varchar("region", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["active", "stopped"]).notNull().default("active"),
  totalTurns: int("totalTurns").notNull().default(0),
  rewardsXp: int("rewardsXp").notNull().default(0),
  rewardsGold: int("rewardsGold").notNull().default(0),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  lastResolvedAt: timestamp("lastResolvedAt").defaultNow().notNull(),
});

export const merchantItems = mysqlTable("merchant_items", {
  id: int("id").autoincrement().primaryKey(),
  catalogKey: varchar("catalogKey", { length: 80 }).notNull().unique(),
  cityKey: varchar("cityKey", { length: 64 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  kind: mysqlEnum("kind", ["weapon", "armor", "consumable", "material", "accessory"]).notNull(),
  rarity: mysqlEnum("rarity", ["common", "uncommon", "rare", "epic", "legendary"]).notNull().default("common"),
  weight: int("weight").notNull().default(0),
  slot: varchar("slot", { length: 32 }).notNull(),
  price: int("price").notNull(),
  description: varchar("description", { length: 240 }).notNull(),
});

export const cities = mysqlTable("cities", {
  id: int("id").autoincrement().primaryKey(),
  cityKey: varchar("cityKey", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 96 }).notNull(),
  region: varchar("region", { length: 64 }).notNull(),
  description: varchar("description", { length: 240 }).notNull(),
});

export const gameNpcs = mysqlTable("game_npcs", {
  id: int("id").autoincrement().primaryKey(),
  npcKey: varchar("npcKey", { length: 64 }).notNull().unique(),
  cityKey: varchar("cityKey", { length: 64 }).notNull(),
  name: varchar("name", { length: 96 }).notNull(),
  role: varchar("role", { length: 64 }).notNull(),
  dialogue: varchar("dialogue", { length: 240 }).notNull(),
});

export const gameQuests = mysqlTable("game_quests", {
  id: int("id").autoincrement().primaryKey(),
  characterId: int("characterId").notNull(),
  questKey: varchar("questKey", { length: 80 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  status: mysqlEnum("status", ["available", "active", "complete"]).notNull().default("available"),
  progress: int("progress").notNull().default(0),
  target: int("target").notNull().default(1),
  rewardGold: int("rewardGold").notNull().default(0),
  rewardXp: int("rewardXp").notNull().default(0),
});

export const groundDrops = mysqlTable("ground_drops", {
  id: int("id").autoincrement().primaryKey(),
  characterId: int("characterId").notNull(),
  region: varchar("region", { length: 64 }).notNull(),
  chestKey: varchar("chestKey", { length: 96 }).notNull().default("legacy"),
  itemKey: varchar("itemKey", { length: 80 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  rarity: mysqlEnum("rarity", ["common", "uncommon", "rare", "epic", "legendary"]).notNull().default("common"),
  weight: int("weight").notNull().default(1),
  x: int("x").notNull().default(0),
  z: int("z").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const monsterEncounters = mysqlTable("monster_encounters", {
  id: int("id").autoincrement().primaryKey(),
  characterId: int("characterId").notNull(),
  monsterKey: varchar("monsterKey", { length: 80 }).notNull(),
  region: varchar("region", { length: 64 }).notNull(),
  hp: int("hp").notNull(),
  maxHp: int("maxHp").notNull(),
  respawnAt: timestamp("respawnAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
