CREATE TABLE `accounts` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ad_spend` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`channel` text NOT NULL,
	`amount_eur` real NOT NULL,
	`note` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ad_spend_day_idx` ON `ad_spend` (`day`);--> statement-breakpoint
CREATE TABLE `categories` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`sort_order` integer DEFAULT 999 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text,
	`message` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `discount_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`value_label` text NOT NULL,
	`audience` text DEFAULT 'member' NOT NULL,
	`valid_until` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `discount_codes_code_unique` ON `discount_codes` (`code`);--> statement-breakpoint
CREATE TABLE `discount_redemptions` (
	`user_id` text NOT NULL,
	`code_id` text NOT NULL,
	`revealed_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `code_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`code_id`) REFERENCES `discount_codes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`product_id` text,
	`category` text,
	`path` text,
	`src` text,
	`session_id` text NOT NULL,
	`user_id` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `events_type_created_idx` ON `events` (`type`,`created_at`);--> statement-breakpoint
CREATE INDEX `events_product_idx` ON `events` (`product_id`);--> statement-breakpoint
CREATE INDEX `events_session_created_idx` ON `events` (`session_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `favourites` (
	`user_id` text NOT NULL,
	`product_id` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `product_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`token` text NOT NULL,
	`user_id` text,
	`created_at` text NOT NULL,
	`confirmed_at` text,
	`unsubscribed_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_subscribers_email_unique` ON `newsletter_subscribers` (`email`);--> statement-breakpoint
CREATE INDEX `newsletter_token_idx` ON `newsletter_subscribers` (`token`);--> statement-breakpoint
CREATE TABLE `product_similarity` (
	`product_id` text NOT NULL,
	`related_id` text NOT NULL,
	`score` real NOT NULL,
	`reason` text,
	`source` text DEFAULT 'content' NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`product_id`, `related_id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`related_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `similarity_product_score_idx` ON `product_similarity` (`product_id`,`score`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`external_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`seo_description` text,
	`description_source` text,
	`price` real NOT NULL,
	`original_price` real,
	`affiliate_url` text NOT NULL,
	`image_url` text,
	`category` text,
	`brand` text,
	`rating` real,
	`review_count` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`category`) REFERENCES `categories`(`slug`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_external_id_idx` ON `products` (`external_id`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category`);--> statement-breakpoint
CREATE INDEX `products_price_idx` ON `products` (`price`);--> statement-breakpoint
CREATE INDEX `products_original_price_idx` ON `products` (`original_price`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sync_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`started_at` text NOT NULL,
	`finished_at` text,
	`products_upserted` integer DEFAULT 0 NOT NULL,
	`api_calls` integer DEFAULT 0 NOT NULL,
	`rate_limit_remaining` integer,
	`status` text NOT NULL,
	`error` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`emailVerified` integer,
	`image` text,
	`password_hash` text,
	`role` text DEFAULT 'user' NOT NULL,
	`newsletter_opt_in` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
