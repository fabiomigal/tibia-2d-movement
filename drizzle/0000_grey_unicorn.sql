CREATE TABLE `game_characters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileKey` varchar(64) NOT NULL,
	`name` varchar(80) NOT NULL,
	`archetype` enum('fighter','mage','archer') NOT NULL,
	`level` int NOT NULL DEFAULT 1,
	`xp` int NOT NULL DEFAULT 0,
	`gold` int NOT NULL DEFAULT 0,
	`hp` int NOT NULL,
	`maxHp` int NOT NULL,
	`mp` int NOT NULL,
	`maxMp` int NOT NULL,
	`energy` int NOT NULL,
	`maxEnergy` int NOT NULL,
	`strength` int NOT NULL,
	`dexterity` int NOT NULL,
	`vitality` int NOT NULL,
	`intelligence` int NOT NULL,
	`currentRegion` varchar(64) NOT NULL DEFAULT 'wind-road',
	`floor` int NOT NULL DEFAULT 0,
	`positionX` int NOT NULL DEFAULT -4,
	`positionZ` int NOT NULL DEFAULT -2,
	`unlockedRegions` text NOT NULL,
	`isDead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `game_characters_id` PRIMARY KEY(`id`),
	CONSTRAINT `game_characters_profileKey_unique` UNIQUE(`profileKey`)
);
--> statement-breakpoint
CREATE TABLE `game_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`characterId` int NOT NULL,
	`templateKey` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`kind` enum('weapon','armor','consumable','material','accessory') NOT NULL,
	`rarity` enum('common','uncommon','rare','epic','legendary') NOT NULL DEFAULT 'common',
	`weight` int NOT NULL DEFAULT 0,
	`quantity` int NOT NULL DEFAULT 1,
	`slot` varchar(32) NOT NULL,
	`equipped` boolean NOT NULL DEFAULT false,
	`sellValue` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `game_skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`characterId` int NOT NULL,
	`key` varchar(64) NOT NULL,
	`name` varchar(80) NOT NULL,
	`element` enum('physical','fire','ice','energy','earth','holy','death') NOT NULL,
	`damageBase` int NOT NULL,
	`manaCost` int NOT NULL DEFAULT 0,
	`energyCost` int NOT NULL DEFAULT 0,
	`description` varchar(240) NOT NULL,
	`hotkey` varchar(8),
	`equipped` boolean NOT NULL DEFAULT false,
	CONSTRAINT `game_skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `idle_hunts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`characterId` int NOT NULL,
	`monsterKey` varchar(80) NOT NULL,
	`region` varchar(64) NOT NULL,
	`status` enum('active','stopped') NOT NULL DEFAULT 'active',
	`totalTurns` int NOT NULL DEFAULT 0,
	`rewardsXp` int NOT NULL DEFAULT 0,
	`rewardsGold` int NOT NULL DEFAULT 0,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`lastResolvedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `idle_hunts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
