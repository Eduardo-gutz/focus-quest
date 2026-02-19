CREATE TABLE `achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`unlocked` integer DEFAULT false NOT NULL,
	`unlocked_at` text
);
--> statement-breakpoint
CREATE TABLE `daily_summary` (
	`date` text PRIMARY KEY NOT NULL,
	`total_minutes_used` integer DEFAULT 0 NOT NULL,
	`total_minutes_goal` integer DEFAULT 0 NOT NULL,
	`all_goals_met` integer DEFAULT false NOT NULL,
	`xp_earned` integer DEFAULT 0 NOT NULL,
	`streak_day` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `daily_summary_date_idx` ON `daily_summary` (`date`);--> statement-breakpoint
CREATE TABLE `monitored_apps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`package_name` text,
	`icon_emoji` text,
	`daily_goal_minutes` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `usage_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`app_id` integer NOT NULL,
	`date` text NOT NULL,
	`minutes_used` integer NOT NULL,
	`source` text NOT NULL,
	`goal_met` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `monitored_apps`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "usage_logs_source_check" CHECK("usage_logs"."source" in ('manual', 'auto'))
);
--> statement-breakpoint
CREATE INDEX `usage_logs_date_idx` ON `usage_logs` (`date`);--> statement-breakpoint
CREATE INDEX `usage_logs_app_id_idx` ON `usage_logs` (`app_id`);--> statement-breakpoint
CREATE TABLE `user_stats` (
	`id` integer PRIMARY KEY NOT NULL,
	`current_xp` integer DEFAULT 0 NOT NULL,
	`current_level` integer DEFAULT 1 NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`total_days_tracked` integer DEFAULT 0 NOT NULL,
	`total_goals_met` integer DEFAULT 0 NOT NULL,
	`last_active_date` text
);
