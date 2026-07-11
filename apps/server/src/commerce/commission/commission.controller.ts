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
import { CommissionService } from "./commission.service";
import { CreateCommissionDto } from "./dto/create-commission.dto";
import { ListCommissionsQuery } from "./dto/list-commissions.query";
import { CommissionResponseDto } from "./dto/responses/commission.response";
import { PaginatedCommissionsResponseDto } from "./dto/responses/paginated-commissions.response";
import { UpdateCommissionDto } from "./dto/update-commission.dto";

@ApiTags("commissions")
@Controller("commissions")
export class CommissionController {
	constructor(private readonly commissionService: CommissionService) {}

	@Get("mine")
	@Roles(["seller"])
	@ApiOperation({
		summary: "List commissions on the current seller's products",
	})
	@ApiOkResponse({ type: PaginatedCommissionsResponseDto })
	listMine(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListCommissionsQuery,
	) {
		return this.commissionService.listMine(session.user.id, query);
	}

	@Get("mine/:id")
	@Roles(["seller"])
	@ApiOperation({
		summary: "Get one commission on the current seller's products",
	})
	@ApiOkResponse({ type: CommissionResponseDto })
	getMineOne(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.commissionService.getMineOne(session.user.id, id);
	}

	@Post()
	@Roles(["admin"])
	@ApiOperation({ summary: "Create a product commission (admin)" })
	@ApiOkResponse({ type: CommissionResponseDto })
	create(@Body() dto: CreateCommissionDto) {
		return this.commissionService.create(dto);
	}

	@Get()
	@Roles(["admin"])
	@ApiOperation({ summary: "List commissions (admin)" })
	@ApiOkResponse({ type: PaginatedCommissionsResponseDto })
	list(@Query() query: ListCommissionsQuery) {
		return this.commissionService.list(query);
	}

	@Get(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Get a commission by id (admin)" })
	@ApiOkResponse({ type: CommissionResponseDto })
	getById(@Param("id") id: string) {
		return this.commissionService.getById(id);
	}

	@Patch(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Update a commission (admin)" })
	@ApiOkResponse({ type: CommissionResponseDto })
	update(@Param("id") id: string, @Body() dto: UpdateCommissionDto) {
		return this.commissionService.update(id, dto);
	}

	@Delete(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Deactivate a commission (admin)" })
	@ApiOkResponse({ schema: { example: { deleted: true } } })
	remove(@Param("id") id: string) {
		return this.commissionService.softDelete(id);
	}
}
