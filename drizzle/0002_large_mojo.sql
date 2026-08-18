CREATE TABLE `monster_encounters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`characterId` int NOT NULL,
	`monsterKey` varchar(80) NOT NULL,
	`region` varchar(64) NOT NULL,
	`hp` int NOT NULL,
	`maxHp` int NOT NULL,
	`respawnAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monster_encounters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ground_drops` ADD `chestKey` varchar(96) DEFAULT 'legacy' NOT NULL;