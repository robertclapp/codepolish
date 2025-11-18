CREATE TABLE `collaborationSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`sessionId` varchar(255) NOT NULL,
	`cursorPosition` text,
	`isActive` int unsigned NOT NULL DEFAULT 1,
	`lastActivity` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `collaborationSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `components` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(64) NOT NULL,
	`category` varchar(64),
	`code` text NOT NULL,
	`framework` varchar(32) NOT NULL DEFAULT 'react',
	`props` text,
	`styles` text,
	`thumbnail` text,
	`isPublic` int unsigned NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `components_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generationHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`componentId` int,
	`prompt` text NOT NULL,
	`type` varchar(64) NOT NULL,
	`inputData` text,
	`outputData` text,
	`status` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`creditsUsed` int NOT NULL DEFAULT 1,
	`generationTime` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generationHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`thumbnail` text,
	`isPublic` int unsigned NOT NULL DEFAULT 0,
	`canvasData` text,
	`themeId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plan` enum('free','pro','team','enterprise') NOT NULL DEFAULT 'free',
	`status` enum('active','cancelled','expired') NOT NULL DEFAULT 'active',
	`creditsRemaining` int NOT NULL DEFAULT 30,
	`creditsTotal` int NOT NULL DEFAULT 30,
	`periodStart` timestamp NOT NULL DEFAULT (now()),
	`periodEnd` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `themes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(255) NOT NULL,
	`description` text,
	`colorPalette` text NOT NULL,
	`typography` text NOT NULL,
	`spacing` text,
	`borderRadius` text,
	`shadows` text,
	`isSystem` int unsigned NOT NULL DEFAULT 0,
	`isPublic` int unsigned NOT NULL DEFAULT 0,
	`thumbnail` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `themes_id` PRIMARY KEY(`id`)
);
