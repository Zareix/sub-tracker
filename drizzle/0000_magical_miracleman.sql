CREATE TABLE `account` (
	`user_id` text(255) NOT NULL,
	`type` text(255) NOT NULL,
	`provider` text(255) NOT NULL,
	`provider_account_id` text(255) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text(255),
	`scope` text(255),
	`id_token` text,
	`session_state` text(255),
	PRIMARY KEY(`provider`, `provider_account_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `category` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256) NOT NULL,
	`icon` text(256)
);
--> statement-breakpoint
CREATE INDEX `category_name_idx` ON `category` (`name`);--> statement-breakpoint
CREATE TABLE `exchange_rate` (
	`base_currency` text(255) NOT NULL,
	`target_currency` text(255) NOT NULL,
	`rate` real NOT NULL,
	PRIMARY KEY(`base_currency`, `target_currency`)
);
--> statement-breakpoint
CREATE INDEX `exchange_rate_idx` ON `exchange_rate` (`base_currency`,`target_currency`);--> statement-breakpoint
CREATE TABLE `payment_method` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256) NOT NULL,
	`image` text(256)
);
--> statement-breakpoint
CREATE INDEX `payement_method_name_idx` ON `payment_method` (`name`);--> statement-breakpoint
CREATE TABLE `session` (
	`session_token` text(255) PRIMARY KEY NOT NULL,
	`userId` text(255) NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`userId`);--> statement-breakpoint
CREATE TABLE `subscription` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256) NOT NULL,
	`category` integer DEFAULT 1 NOT NULL,
	`image` text(256),
	`description` text(256) DEFAULT '' NOT NULL,
	`price` real DEFAULT 0 NOT NULL,
	`currency` text(255) DEFAULT 'EUR' NOT NULL,
	`payment_method` integer NOT NULL,
	`schedule` text(255) NOT NULL,
	`first_payment_date` integer DEFAULT (unixepoch()) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer,
	FOREIGN KEY (`payment_method`) REFERENCES `payment_method`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `subscription_name_idx` ON `subscription` (`name`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`username` text(255) NOT NULL,
	`password_hash` text(255) NOT NULL,
	`email_verified` integer DEFAULT (unixepoch()),
	`image` text(255)
);
--> statement-breakpoint
CREATE INDEX `user_name_idx` ON `user` (`name`);--> statement-breakpoint
CREATE TABLE `users_to_subscriptions` (
	`user_id` text NOT NULL,
	`subscription_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscription`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `verification_token` (
	`identifier` text(255) NOT NULL,
	`token` text(255) NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
