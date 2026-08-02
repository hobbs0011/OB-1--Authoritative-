CREATE TABLE IF NOT EXISTS `employer_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`company` text,
	`contact_email` text,
	`created_at` text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `error_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ts` integer,
	`tag` text,
	`message` text,
	`detail` text,
	`student_id` text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `soul_prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text,
	`student_id` text,
	`byte_count` integer,
	`content` text,
	`created_at` text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `submissions` (
	`ref` text PRIMARY KEY NOT NULL,
	`assessment` text,
	`age_group` text,
	`student_name` text,
	`submitted_at` text,
	`payload` text,
	`created_at` text
);
