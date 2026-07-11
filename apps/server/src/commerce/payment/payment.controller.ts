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
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { ListPaymentsQuery } from "./dto/list-payments.query";
import { PaginatedPaymentsResponseDto } from "./dto/responses/paginated-payments.response";
import { PaymentResponseDto } from "./dto/responses/payment.response";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { PaymentService } from "./payment.service";

@ApiTags("payments")
@Controller("payments")
export class PaymentController {
	constructor(private readonly paymentService: PaymentService) {}

	@Get("mine")
	@Roles(["seller"])
	@ApiOperation({ summary: "List the current seller's store payouts" })
	@ApiOkResponse({ type: PaginatedPaymentsResponseDto })
	listMine(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListPaymentsQuery,
	) {
		return this.paymentService.listMine(session.user.id, query);
	}

	@Get("mine/:id")
	@Roles(["seller"])
	@ApiOperation({ summary: "Get one of the current seller's store payouts" })
	@ApiOkResponse({ type: PaymentResponseDto })
	getMineOne(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.paymentService.getMineOne(session.user.id, id);
	}

	@Post()
	@Roles(["admin"])
	@ApiOperation({ summary: "Create a store payout record (admin)" })
	@ApiOkResponse({ type: PaymentResponseDto })
	create(@Body() dto: CreatePaymentDto) {
		return this.paymentService.create(dto);
	}

	@Get()
	@Roles(["admin"])
	@ApiOperation({ summary: "List store payouts (admin)" })
	@ApiOkResponse({ type: PaginatedPaymentsResponseDto })
	list(@Query() query: ListPaymentsQuery) {
		return this.paymentService.list(query);
	}

	@Get(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Get a store payout by id (admin)" })
	@ApiOkResponse({ type: PaymentResponseDto })
	getById(@Param("id") id: string) {
		return this.paymentService.getById(id);
	}

	@Patch(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Update a store payout (admin)" })
	@ApiOkResponse({ type: PaymentResponseDto })
	update(@Param("id") id: string, @Body() dto: UpdatePaymentDto) {
		return this.paymentService.update(id, dto);
	}

	@Delete(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Deactivate a store payout (admin)" })
	@ApiOkResponse({ schema: { example: { deleted: true } } })
	remove(@Param("id") id: string) {
		return this.paymentService.softDelete(id);
	}
}
