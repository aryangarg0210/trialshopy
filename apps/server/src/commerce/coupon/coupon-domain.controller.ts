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
import { CouponDomainService } from "./coupon-domain.service";
import { CreateCouponDomainDto } from "./dto/create-coupon-domain.dto";
import { DomainEligibilityQuery } from "./dto/domain-eligibility.query";
import { ListCouponDomainsQuery } from "./dto/list-coupon-domains.query";
import { CouponDomainResponseDto } from "./dto/responses/coupon-domain.response";
import { DomainEligibilityResponseDto } from "./dto/responses/domain-eligibility.response";
import { PaginatedCouponDomainsResponseDto } from "./dto/responses/paginated-coupon-domains.response";
import { UpdateCouponDomainDto } from "./dto/update-coupon-domain.dto";

@ApiTags("coupon-domains")
@Controller("coupon-domains")
export class CouponDomainController {
	constructor(private readonly domainService: CouponDomainService) {}

	@Get("eligibility")
	@ApiOperation({
		summary:
			"Check if the current user's email domain qualifies for a discount",
	})
	@ApiOkResponse({ type: DomainEligibilityResponseDto })
	eligibility(
		@Session() session: UserSession<typeof auth>,
		@Query() query: DomainEligibilityQuery,
	) {
		return this.domainService.checkEligibility(
			session.user.email,
			query.couponType,
		);
	}

	@Post()
	@Roles(["admin"])
	@ApiOperation({ summary: "Create an email-domain discount (admin)" })
	@ApiOkResponse({ type: CouponDomainResponseDto })
	create(@Body() dto: CreateCouponDomainDto) {
		return this.domainService.create(dto);
	}

	@Get()
	@Roles(["admin"])
	@ApiOperation({ summary: "List email-domain discounts (admin)" })
	@ApiOkResponse({ type: PaginatedCouponDomainsResponseDto })
	list(@Query() query: ListCouponDomainsQuery) {
		return this.domainService.list(query);
	}

	@Get(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Get an email-domain discount by id (admin)" })
	@ApiOkResponse({ type: CouponDomainResponseDto })
	getById(@Param("id") id: string) {
		return this.domainService.getById(id);
	}

	@Patch(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Update an email-domain discount (admin)" })
	@ApiOkResponse({ type: CouponDomainResponseDto })
	update(@Param("id") id: string, @Body() dto: UpdateCouponDomainDto) {
		return this.domainService.update(id, dto);
	}

	@Delete(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Deactivate an email-domain discount (admin)" })
	@ApiOkResponse({ schema: { example: { deleted: true } } })
	remove(@Param("id") id: string) {
		return this.domainService.softDelete(id);
	}
}
