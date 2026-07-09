import { BullBoardQueueOptions } from "@bull-board/nestjs";

export const EMAIL_QUEUE = "emails";
export const SEND_EMAIL_JOB = "send-email";

// ── Shared queue registry (used by BullBoardModule.forFeature in AppModule) ──
// Every feature queue should be listed here so it appears in the admin dashboard.
export const QUEUES = [
	{ name: EMAIL_QUEUE },
	{ name: "virtual-try-on" },
] as BullBoardQueueOptions[];

export const SCHEDULER_EVENTS = {
	EMAIL_SEND: "scheduler.email.send",
} as const;

export interface EmailAttachment {
	filename: string;
	content: Buffer | string;
}

export interface EmailJobData {
	to: string | string[];
	cc?: string | string[];
	bcc?: string | string[];
	subject: string;
	text?: string;
	html?: string;
	attachments?: EmailAttachment[];
}

export interface EmailSendPayload extends EmailJobData {
	/** Optional datetime at which the email should be sent. Emails in the past are sent immediately. */
	sendAt?: Date;
}
