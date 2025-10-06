CREATE TABLE `devices` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`push_subscription` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
