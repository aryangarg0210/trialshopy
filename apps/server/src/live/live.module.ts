import { Module } from "@nestjs/common";
import { LiveChatController } from "./live-chat/live-chat.controller";
import { LiveChatService } from "./live-chat/live-chat.service";
import { LiveDemoController } from "./live-demo/live-demo.controller";
import { LiveDemoService } from "./live-demo/live-demo.service";
import { MeetRequestController } from "./meet-request/meet-request.controller";
import { MeetRequestService } from "./meet-request/meet-request.service";
import { MeetingController } from "./meeting/meeting.controller";
import { MeetingService } from "./meeting/meeting.service";

@Module({
	controllers: [
		MeetRequestController,
		MeetingController,
		LiveDemoController,
		LiveChatController,
	],
	providers: [
		MeetRequestService,
		MeetingService,
		LiveDemoService,
		LiveChatService,
	],
})
export class LiveModule {}
