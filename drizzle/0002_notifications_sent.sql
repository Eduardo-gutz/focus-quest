CREATE TABLE `notifications_sent` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`app_id` integer NOT NULL,
	`date` text NOT NULL,
	`threshold` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `monitored_apps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notifications_sent_app_date_threshold_idx` ON `notifications_sent` (`app_id`,`date`,`threshold`);
