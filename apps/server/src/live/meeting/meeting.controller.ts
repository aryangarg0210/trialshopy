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
import { CreateMeetingDto } from "./dto/create-meeting.dto";
import { ListMeetingsQuery } from "./dto/list-meetings.query";
import { UpdateMeetingDto } from "./dto/update-meeting.dto";
import { MeetingService } from "./meeting.service";

@ApiTags("meetings")
@Controller("meetings")
export class MeetingController {
	constructor(private readonly meetingService: MeetingService) {}

	@Post()
	@Roles(["seller"])
	@ApiOperation({ summary: "Schedule a live meeting (seller)" })
	create(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: CreateMeetingDto,
	) {
		return this.meetingService.create(session.user.id, dto);
	}

	@Get("mine")
	@Roles(["seller"])
	@ApiOperation({ summary: "List the current seller's meetings" })
	listMine(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListMeetingsQuery,
	) {
		return this.meetingService.listMine(session.user.id, query);
	}

	@Get("invited")
	@ApiOperation({ summary: "List meetings the current user is invited to" })
	listInvited(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListMeetingsQuery,
	) {
		return this.meetingService.listInvited(session.user.id, query);
	}

	@Get("invited/:id")
	@ApiOperation({ summary: "Get an invited meeting by id" })
	getInvitedOne(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.meetingService.getInvitedOne(session.user.id, id);
	}

	@Get("mine/:id")
	@Roles(["seller"])
	@ApiOperation({ summary: "Get one of the current seller's meetings" })
	getMineOne(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.meetingService.getMineOne(session.user.id, id);
	}

	@Patch("mine/:id")
	@Roles(["seller"])
	@ApiOperation({ summary: "Update one of the current seller's meetings" })
	updateMine(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
		@Body() dto: UpdateMeetingDto,
	) {
		return this.meetingService.updateMine(session.user.id, id, dto);
	}

	@Delete("mine/:id")
	@Roles(["seller"])
	@ApiOperation({ summary: "Delete one of the current seller's meetings" })
	@ApiOkResponse({ schema: { example: { deleted: true } } })
	deleteMine(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.meetingService.deleteMine(session.user.id, id);
	}
}
