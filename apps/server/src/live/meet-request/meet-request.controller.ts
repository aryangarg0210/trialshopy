import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles, Session, type UserSession } from "@thallesp/nestjs-better-auth";
import type { auth } from "../../common/auth";
import { CreateMeetRequestDto } from "./dto/create-meet-request.dto";
import { ListMeetRequestsQuery } from "./dto/list-meet-requests.query";
import { UpdateMeetRequestStatusDto } from "./dto/update-meet-request-status.dto";
import { MeetRequestService } from "./meet-request.service";

@ApiTags("meet-requests")
@Controller("meet-requests")
export class MeetRequestController {
	constructor(private readonly meetRequestService: MeetRequestService) {}

	@Post()
	@ApiOperation({ summary: "Request a live meeting with a store (customer)" })
	create(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: CreateMeetRequestDto,
	) {
		return this.meetRequestService.create(session.user.id, dto);
	}

	@Get("mine")
	@ApiOperation({ summary: "List the current user's meeting requests" })
	listMine(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListMeetRequestsQuery,
	) {
		return this.meetRequestService.listMine(session.user.id, query);
	}

	@Patch("mine/:id/cancel")
	@ApiOperation({
		summary: "Cancel one of the current user's meeting requests",
	})
	cancelMine(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.meetRequestService.cancelMine(session.user.id, id);
	}

	@Get("incoming")
	@Roles(["seller"])
	@ApiOperation({ summary: "List meeting requests for the seller's store" })
	listIncoming(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListMeetRequestsQuery,
	) {
		return this.meetRequestService.listIncoming(session.user.id, query);
	}

	@Patch(":id/status")
	@Roles(["seller"])
	@ApiOperation({ summary: "Confirm or cancel a meeting request (seller)" })
	updateStatus(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
		@Body() dto: UpdateMeetRequestStatusDto,
	) {
		return this.meetRequestService.updateStatus(
			session.user.id,
			id,
			dto.status,
		);
	}
}
