import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles, Session, type UserSession } from "@thallesp/nestjs-better-auth";
import type { auth } from "../../common/auth";
import { ListSubOrdersQuery } from "./dto/list-suborders.query";
import { PaginatedSubOrdersResponseDto } from "./dto/responses/paginated-suborders.response";
import { SubOrderResponseDto } from "./dto/responses/suborder.response";
import { UpdateSubOrderDto } from "./dto/update-suborder.dto";
import { SubOrderService } from "./suborder.service";

@ApiTags("sub-orders")
@Controller("orders/suborders")
export class SubOrderController {
	constructor(private readonly subOrderService: SubOrderService) {}

	@Get("mine")
	@Roles(["seller"])
	@ApiOperation({ summary: "List sub-orders for the current seller's store" })
	@ApiOkResponse({ type: PaginatedSubOrdersResponseDto })
	listMine(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListSubOrdersQuery,
	) {
		return this.subOrderService.listMine(session.user.id, query);
	}

	@Patch(":id")
	@Roles(["seller"])
	@ApiOperation({
		summary: "Update fulfilment on one of the seller's sub-orders",
	})
	@ApiOkResponse({ type: SubOrderResponseDto })
	update(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
		@Body() dto: UpdateSubOrderDto,
	) {
		return this.subOrderService.update(session.user.id, id, dto);
	}
}
