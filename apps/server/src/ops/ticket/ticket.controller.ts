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
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { ListTicketsQuery } from "./dto/list-tickets.query";
import { RespondTicketDto } from "./dto/respond-ticket.dto";
import { PaginatedTicketsResponseDto } from "./dto/responses/paginated-tickets.response";
import { TicketResponseDto } from "./dto/responses/ticket.response";
import { TicketService } from "./ticket.service";

@ApiTags("tickets")
@Controller("tickets")
export class TicketController {
	constructor(private readonly ticketService: TicketService) {}

	@Post()
	@Roles(["seller"])
	@ApiOperation({ summary: "Raise a support ticket (seller)" })
	@ApiOkResponse({ type: TicketResponseDto })
	create(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: CreateTicketDto,
	) {
		return this.ticketService.create(session.user.id, session.user.name, dto);
	}

	@Get("mine")
	@Roles(["seller"])
	@ApiOperation({ summary: "List the current seller's tickets" })
	@ApiOkResponse({ type: PaginatedTicketsResponseDto })
	listMine(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListTicketsQuery,
	) {
		return this.ticketService.listMine(session.user.id, query);
	}

	@Get("mine/:id")
	@Roles(["seller"])
	@ApiOperation({ summary: "Get one of the current seller's tickets" })
	@ApiOkResponse({ type: TicketResponseDto })
	getMineOne(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.ticketService.getMineOne(session.user.id, id);
	}

	@Patch("mine/:id/cancel")
	@Roles(["seller"])
	@ApiOperation({ summary: "Cancel one of the current seller's tickets" })
	@ApiOkResponse({ type: TicketResponseDto })
	cancelMine(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.ticketService.cancelMine(session.user.id, id);
	}

	@Get()
	@Roles(["admin"])
	@ApiOperation({ summary: "List tickets (admin)" })
	@ApiOkResponse({ type: PaginatedTicketsResponseDto })
	list(@Query() query: ListTicketsQuery) {
		return this.ticketService.list(query);
	}

	@Get(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Get a ticket by id (admin)" })
	@ApiOkResponse({ type: TicketResponseDto })
	getById(@Param("id") id: string) {
		return this.ticketService.getById(id);
	}

	@Patch(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Respond to and resolve a ticket (admin)" })
	@ApiOkResponse({ type: TicketResponseDto })
	respond(@Param("id") id: string, @Body() dto: RespondTicketDto) {
		return this.ticketService.respond(id, dto);
	}
}
