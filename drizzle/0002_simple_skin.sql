CREATE TABLE `polishes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`framework` varchar(32) NOT NULL,
	`originalCode` text NOT NULL,
	`polishedCode` text,
	`qualityScoreBefore` int,
	`qualityScoreAfter` int,
	`issuesFound` text,
	`improvementsSummary` text,
	`status` enum('pending','analyzing','polishing','completed','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`processingTime` int,
	`creditsUsed` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `polishes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `collaborationSessions`;--> statement-breakpoint
DROP TABLE `components`;--> statement-breakpoint
DROP TABLE `generationHistory`;--> statement-breakpoint
DROP TABLE `projects`;--> statement-breakpoint
DROP TABLE `themes`;--> statement-breakpoint
ALTER TABLE `subscriptions` MODIFY COLUMN `creditsRemaining` int NOT NULL DEFAULT 5;--> statement-breakpoint
ALTER TABLE `subscriptions` MODIFY COLUMN `creditsTotal` int NOT NULL DEFAULT 5;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `stripeSubscriptionId` varchar(255);