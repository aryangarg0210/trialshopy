import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Query,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "@thallesp/nestjs-better-auth";
import { CouponService } from "./coupon.service";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { ListCouponsQuery } from "./dto/list-coupons.query";
import { CouponResponseDto } from "./dto/responses/coupon.response";
import { CouponValidationResponseDto } from "./dto/responses/coupon-validation.response";
import { PaginatedCouponsResponseDto } from "./dto/responses/paginated-coupons.response";
import { UpdateCouponDto } from "./dto/update-coupon.dto";
import { ValidateCouponDto } from "./dto/validate-coupon.dto";

@ApiTags("coupons")
@Controller("coupons")
export class CouponController {
	constructor(private readonly couponService: CouponService) {}

	@Post("validate")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Validate a coupon code against a purchase amount" })
	@ApiOkResponse({ type: CouponValidationResponseDto })
	validate(@Body() dto: ValidateCouponDto) {
		return this.couponService.validate(dto);
	}

	@Post()
	@Roles(["admin"])
	@ApiOperation({ summary: "Create a coupon (admin)" })
	@ApiOkResponse({ type: CouponResponseDto })
	create(@Body() dto: CreateCouponDto) {
		return this.couponService.create(dto);
	}

	@Get()
	@Roles(["admin"])
	@ApiOperation({ summary: "List coupons (admin)" })
	@ApiOkResponse({ type: PaginatedCouponsResponseDto })
	list(@Query() query: ListCouponsQuery) {
		return this.couponService.list(query);
	}

	@Get(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Get a coupon by id (admin)" })
	@ApiOkResponse({ type: CouponResponseDto })
	getById(@Param("id") id: string) {
		return this.couponService.getById(id);
	}

	@Patch(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Update a coupon (admin)" })
	@ApiOkResponse({ type: CouponResponseDto })
	update(@Param("id") id: string, @Body() dto: UpdateCouponDto) {
		return this.couponService.update(id, dto);
	}

	@Delete(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Deactivate a coupon (admin)" })
	@ApiOkResponse({ schema: { example: { deleted: true } } })
	remove(@Param("id") id: string) {
		return this.couponService.softDelete(id);
	}
}
