import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import type { auth } from "../../common/auth";
import { CreateLiveChatDto } from "./dto/create-live-chat.dto";
import { ListMessagesQuery } from "./dto/list-messages.query";
import { SendMessageDto } from "./dto/send-message.dto";
import { LiveChatService } from "./live-chat.service";

@ApiTags("live-chats")
@Controller("live-chats")
export class LiveChatController {
	constructor(private readonly liveChatService: LiveChatService) {}

	@Post()
	@ApiOperation({ summary: "Open (or reuse) a chat with another user" })
	getOrCreate(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: CreateLiveChatDto,
	) {
		return this.liveChatService.getOrCreate(session.user.id, dto);
	}

	@Get("mine")
	@ApiOperation({ summary: "List the current user's chats" })
	listMine(@Session() session: UserSession<typeof auth>) {
		return this.liveChatService.listMine(session.user.id);
	}

	@Get(":id/messages")
	@ApiOperation({ summary: "List messages in a chat" })
	listMessages(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
		@Query() query: ListMessagesQuery,
	) {
		return this.liveChatService.listMessages(session.user.id, id, query);
	}

	@Post(":id/messages")
	@ApiOperation({ summary: "Send a message in a chat" })
	sendMessage(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
		@Body() dto: SendMessageDto,
	) {
		return this.liveChatService.sendMessage(session.user.id, id, dto);
	}

	@Patch(":id/seen")
	@ApiOperation({ summary: "Mark the other participant's messages as seen" })
	markSeen(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.liveChatService.markSeen(session.user.id, id);
	}
}
