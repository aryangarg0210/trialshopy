import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import type { auth } from "../common/auth";
import { CustomerProfileService } from "./customer-profile.service";
import { UpdateCustomerProfileDto } from "./dto/update-customer-profile.dto";

@ApiTags("customer-profile")
@Controller("users/me/customer-profile")
export class CustomerProfileController {
	constructor(
		private readonly customerProfileService: CustomerProfileService,
	) {}

	@Get()
	@ApiOperation({ summary: "Get current user's customer profile" })
	get(@Session() session: UserSession<typeof auth>) {
		return this.customerProfileService.get(session.user.id);
	}

	@Patch()
	@ApiOperation({ summary: "Create or update current user's customer profile" })
	upsert(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: UpdateCustomerProfileDto,
	) {
		return this.customerProfileService.upsert(session.user.id, dto);
	}
}
