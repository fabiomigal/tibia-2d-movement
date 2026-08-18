CREATE TABLE `cities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cityKey` varchar(64) NOT NULL,
	`name` varchar(96) NOT NULL,
	`region` varchar(64) NOT NULL,
	`description` varchar(240) NOT NULL,
	CONSTRAINT `cities_id` PRIMARY KEY(`id`),
	CONSTRAINT `cities_cityKey_unique` UNIQUE(`cityKey`)
);
--> statement-breakpoint
CREATE TABLE `game_npcs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`npcKey` varchar(64) NOT NULL,
	`cityKey` varchar(64) NOT NULL,
	`name` varchar(96) NOT NULL,
	`role` varchar(64) NOT NULL,
	`dialogue` varchar(240) NOT NULL,
	CONSTRAINT `game_npcs_id` PRIMARY KEY(`id`),
	CONSTRAINT `game_npcs_npcKey_unique` UNIQUE(`npcKey`)
);
--> statement-breakpoint
CREATE TABLE `game_quests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`characterId` int NOT NULL,
	`questKey` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`status` enum('available','active','complete') NOT NULL DEFAULT 'available',
	`progress` int NOT NULL DEFAULT 0,
	`target` int NOT NULL DEFAULT 1,
	`rewardGold` int NOT NULL DEFAULT 0,
	`rewardXp` int NOT NULL DEFAULT 0,
	CONSTRAINT `game_quests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ground_drops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`characterId` int NOT NULL,
	`region` varchar(64) NOT NULL,
	`itemKey` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`rarity` enum('common','uncommon','rare','epic','legendary') NOT NULL DEFAULT 'common',
	`weight` int NOT NULL DEFAULT 1,
	`x` int NOT NULL DEFAULT 0,
	`z` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ground_drops_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `merchant_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`catalogKey` varchar(80) NOT NULL,
	`cityKey` varchar(64) NOT NULL,
	`name` varchar(120) NOT NULL,
	`kind` enum('weapon','armor','consumable','material','accessory') NOT NULL,
	`rarity` enum('common','uncommon','rare','epic','legendary') NOT NULL DEFAULT 'common',
	`weight` int NOT NULL DEFAULT 0,
	`slot` varchar(32) NOT NULL,
	`price` int NOT NULL,
	`description` varchar(240) NOT NULL,
	CONSTRAINT `merchant_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `merchant_items_catalogKey_unique` UNIQUE(`catalogKey`)
);
--> statement-breakpoint
ALTER TABLE `game_characters` ADD `autoPotionEnabled` boolean DEFAULT true NOT NULL;