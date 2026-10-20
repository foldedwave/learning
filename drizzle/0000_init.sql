CREATE TABLE `attempt` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`child_id` integer NOT NULL,
	`learning_session_id` integer,
	`skill_id` text NOT NULL,
	`item_id` text NOT NULL,
	`mode` text NOT NULL,
	`response` text NOT NULL,
	`correct` integer NOT NULL,
	`hints_used` integer DEFAULT 0 NOT NULL,
	`scaffolded` integer DEFAULT false NOT NULL,
	`time_ms` integer NOT NULL,
	`misconception_id` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`child_id`) REFERENCES `child`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`learning_session_id`) REFERENCES `learning_session`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `attempt_child_skill_created` ON `attempt` (`child_id`,`skill_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `attempt_child_created` ON `attempt` (`child_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `auth_session` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`child_id` integer,
	`expires_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	FOREIGN KEY (`child_id`) REFERENCES `child`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `badge_award` (
	`child_id` integer NOT NULL,
	`badge_id` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	PRIMARY KEY(`child_id`, `badge_id`),
	FOREIGN KEY (`child_id`) REFERENCES `child`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `child` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`display_name` text NOT NULL,
	`avatar` text NOT NULL,
	`pin_hash` text,
	`interests` text DEFAULT '[]' NOT NULL,
	`reading_age` integer,
	`year_group` integer NOT NULL,
	`settings` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`archived_at` text
);
--> statement-breakpoint
CREATE TABLE `learning_session` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`child_id` integer NOT NULL,
	`skill_id` text,
	`topic_id` text NOT NULL,
	`tab` text NOT NULL,
	`source` text DEFAULT 'own' NOT NULL,
	`plan_item_id` integer,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`ended_at` text,
	`completed` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`child_id`) REFERENCES `child`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `learning_session_child_started` ON `learning_session` (`child_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `mastery` (
	`child_id` integer NOT NULL,
	`skill_id` text NOT NULL,
	`level` text DEFAULT 'not-started' NOT NULL,
	`score` real DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`correct` integer DEFAULT 0 NOT NULL,
	`practise_attempts` integer DEFAULT 0 NOT NULL,
	`practise_correct` integer DEFAULT 0 NOT NULL,
	`last_practised_at` text,
	`secure_at` text,
	`mastered_at` text,
	`demoted_at` text,
	`review_step` integer,
	`next_review_at` text,
	`provisional` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	PRIMARY KEY(`child_id`, `skill_id`),
	FOREIGN KEY (`child_id`) REFERENCES `child`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `mastery_child_review` ON `mastery` (`child_id`,`next_review_at`);--> statement-breakpoint
CREATE TABLE `parent` (
	`id` integer PRIMARY KEY NOT NULL,
	`pin_hash` text NOT NULL,
	`settings` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pin_attempt` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role` text NOT NULL,
	`child_id` integer,
	`success` integer NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`child_id`) REFERENCES `child`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pin_attempt_lookup` ON `pin_attempt` (`role`,`child_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `plan` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`child_id` integer NOT NULL,
	`week_start` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`child_note` text,
	`parent_summary` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`approved_at` text,
	FOREIGN KEY (`child_id`) REFERENCES `child`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plan_child_week` ON `plan` (`child_id`,`week_start`);--> statement-breakpoint
CREATE TABLE `plan_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plan_id` integer NOT NULL,
	`day` integer NOT NULL,
	`slot` integer NOT NULL,
	`skill_id` text,
	`topic_id` text,
	`tab` text,
	`category` text NOT NULL,
	`minutes` integer DEFAULT 25 NOT NULL,
	`locked` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'todo' NOT NULL,
	`custom_title` text,
	FOREIGN KEY (`plan_id`) REFERENCES `plan`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `real_reward` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`child_id` integer,
	`title` text NOT NULL,
	`star_cost` integer NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`claimed_at` text,
	`approved_at` text,
	FOREIGN KEY (`child_id`) REFERENCES `child`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `resource_check` (
	`url` text PRIMARY KEY NOT NULL,
	`last_checked_at` text NOT NULL,
	`status_code` integer,
	`ok` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reward_event` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`child_id` integer NOT NULL,
	`kind` text NOT NULL,
	`stars` integer NOT NULL,
	`reason` text NOT NULL,
	`skill_id` text,
	`topic_id` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`child_id`) REFERENCES `child`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reward_event_child_created` ON `reward_event` (`child_id`,`created_at`);