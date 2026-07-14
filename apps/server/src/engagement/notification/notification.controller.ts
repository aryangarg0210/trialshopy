import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles, Session, type UserSession } from "@thallesp/nestjs-better-auth";
import type { auth } from "../../common/auth";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { ListNotificationsQuery } from "./dto/list-notifications.query";
import { NotificationResponseDto } from "./dto/responses/notification.response";
import { PaginatedNotificationsResponseDto } from "./dto/responses/paginated-notifications.response";
import { NotificationService } from "./notification.service";

@ApiTags("notifications")
@Controller("notifications")
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@Get()
	@ApiOperation({ summary: "List the current user's notifications" })
	@ApiOkResponse({ type: PaginatedNotificationsResponseDto })
	listMine(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListNotificationsQuery,
	) {
		return this.notificationService.listMine(session.user.id, query);
	}

	@Patch("read-all")
	@ApiOperation({
		summary: "Mark all of the current user's notifications read",
	})
	@ApiOkResponse({ schema: { example: { updated: 3 } } })
	markAllRead(@Session() session: UserSession<typeof auth>) {
		return this.notificationService.markAllRead(session.user.id);
	}

	@Post()
	@Roles(["admin"])
	@ApiOperation({ summary: "Send a notification to a user (admin)" })
	@ApiOkResponse({ type: NotificationResponseDto })
	adminCreate(@Body() dto: CreateNotificationDto) {
		return this.notificationService.adminCreate(dto);
	}

	@Get("admin")
	@Roles(["admin"])
	@ApiOperation({ summary: "List notifications (admin)" })
	@ApiOkResponse({ type: PaginatedNotificationsResponseDto })
	adminList(@Query() query: ListNotificationsQuery) {
		return this.notificationService.adminList(query);
	}

	@Patch(":id/read")
	@ApiOperation({
		summary: "Mark one of the current user's notifications read",
	})
	@ApiOkResponse({ type: NotificationResponseDto })
	markRead(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.notificationService.markRead(session.user.id, id);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete one of the current user's notifications" })
	@ApiOkResponse({ schema: { example: { deleted: true } } })
	removeMine(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.notificationService.deleteMine(session.user.id, id);
	}
}
