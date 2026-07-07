import { config } from "../config";

interface SendSmsArgs {
	to: string;
	message: string;
}

// Dev: log to console (mirrors how email OTP is handled in development).
// Production: wire a real SMS provider here once the client supplies fresh
// credentials — the legacy Twilio keys were committed and must be rotated.
export async function sendSms({ to, message }: SendSmsArgs): Promise<void> {
	if (config.environment === "development") {
		console.log(`SMS to ${to}: ${message}`);
		return;
	}

	throw new Error("No SMS provider configured for production yet");
}
