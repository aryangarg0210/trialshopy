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
import { CreateLiveDemoDto } from "./dto/create-live-demo.dto";
import { ListLiveDemosQuery } from "./dto/list-live-demos.query";
import { UpdateLiveDemoItemsDto } from "./dto/update-live-demo-items.dto";
import { LiveDemoService } from "./live-demo.service";

@ApiTags("live-demos")
@Controller("live-demos")
export class LiveDemoController {
	constructor(private readonly liveDemoService: LiveDemoService) {}

	@Post()
	@ApiOperation({ summary: "Start a live demo session (customer)" })
	start(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: CreateLiveDemoDto,
	) {
		return this.liveDemoService.start(session.user.id, dto);
	}

	@Get("mine")
	@ApiOperation({ summary: "List the current user's demo sessions" })
	listMine(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListLiveDemosQuery,
	) {
		return this.liveDemoService.listMine(session.user.id, query);
	}

	@Get("mine/:id")
	@ApiOperation({ summary: "Get one of the current user's demo sessions" })
	getMineOne(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.liveDemoService.getMineOne(session.user.id, id);
	}

	@Patch("mine/:id/items")
	@ApiOperation({ summary: "Replace the items in a demo session" })
	setItems(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
		@Body() dto: UpdateLiveDemoItemsDto,
	) {
		return this.liveDemoService.setItems(session.user.id, id, dto.itemIds);
	}

	@Patch("mine/:id/end")
	@ApiOperation({ summary: "End a demo session" })
	end(@Session() session: UserSession<typeof auth>, @Param("id") id: string) {
		return this.liveDemoService.end(session.user.id, id);
	}
}
