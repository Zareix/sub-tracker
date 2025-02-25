CREATE TABLE `category` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256) NOT NULL,
	`icon` text(256)
);
--> statement-breakpoint
CREATE INDEX `category_name_idx` ON `category` (`name`);--> statement-breakpoint
INSERT INTO `category` (`name`, `icon`) VALUES ('Misc', 'circle-ellipsis');--> statement-breakpoint
ALTER TABLE `subscription` ADD `category` integer DEFAULT 1 NOT NULL;