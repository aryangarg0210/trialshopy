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
import { ListOrdersQuery } from "./dto/list-orders.query";
import { PlaceOrderDto } from "./dto/place-order.dto";
import { OrderResponseDto } from "./dto/responses/order.response";
import { PaginatedOrdersResponseDto } from "./dto/responses/paginated-orders.response";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrderService } from "./order.service";

@ApiTags("orders")
@Controller("orders")
export class OrderController {
	constructor(private readonly orderService: OrderService) {}

	@Post()
	@ApiOperation({ summary: "Place an order from the current user's cart" })
	@ApiOkResponse({ type: OrderResponseDto })
	place(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: PlaceOrderDto,
	) {
		return this.orderService.place(session.user.id, dto);
	}

	@Get("mine")
	@ApiOperation({ summary: "List the current user's orders" })
	@ApiOkResponse({ type: PaginatedOrdersResponseDto })
	listMine(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListOrdersQuery,
	) {
		return this.orderService.listMine(session.user.id, query);
	}

	@Get("mine/:id")
	@ApiOperation({ summary: "Get one of the current user's orders" })
	@ApiOkResponse({ type: OrderResponseDto })
	getMineOne(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.orderService.getMineOne(session.user.id, id);
	}

	@Patch("mine/:id/cancel")
	@ApiOperation({ summary: "Cancel one of the current user's orders" })
	@ApiOkResponse({ type: OrderResponseDto })
	cancelMine(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.orderService.cancelMine(session.user.id, id);
	}

	@Get()
	@Roles(["admin"])
	@ApiOperation({ summary: "List orders (admin)" })
	@ApiOkResponse({ type: PaginatedOrdersResponseDto })
	list(@Query() query: ListOrdersQuery) {
		return this.orderService.list(query);
	}

	@Get(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Get an order by id (admin)" })
	@ApiOkResponse({ type: OrderResponseDto })
	getById(@Param("id") id: string) {
		return this.orderService.getById(id);
	}

	@Patch(":id/status")
	@Roles(["admin"])
	@ApiOperation({ summary: "Set an order's status (admin)" })
	@ApiOkResponse({ type: OrderResponseDto })
	setStatus(@Param("id") id: string, @Body() dto: UpdateOrderStatusDto) {
		return this.orderService.setStatus(id, dto.status);
	}
}
