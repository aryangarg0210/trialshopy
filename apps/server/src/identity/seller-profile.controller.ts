import { Body, Controller, Get, Patch, Post, Put } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import type { auth } from "../common/auth";
import { RegisterSellerDto } from "./dto/register-seller.dto";
import { SubmitKycDto } from "./dto/submit-kyc.dto";
import { UpdateSellerProfileDto } from "./dto/update-seller-profile.dto";
import { SellerProfileService } from "./seller-profile.service";

@ApiTags("seller-profile")
@Controller("users/me")
export class SellerProfileController {
	constructor(private readonly sellerProfileService: SellerProfileService) {}

	@Post("seller-registration")
	@ApiOperation({
		summary: "Register as a seller (creates profile, sets role)",
	})
	register(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: RegisterSellerDto,
	) {
		return this.sellerProfileService.register(session.user.id, dto);
	}

	@Get("seller-profile")
	@ApiOperation({ summary: "Get current user's seller profile" })
	get(@Session() session: UserSession<typeof auth>) {
		return this.sellerProfileService.get(session.user.id);
	}

	@Patch("seller-profile")
	@ApiOperation({ summary: "Update current user's seller profile" })
	update(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: UpdateSellerProfileDto,
	) {
		return this.sellerProfileService.update(session.user.id, dto);
	}

	@Put("seller-profile/kyc")
	@ApiOperation({ summary: "Submit or replace seller KYC details" })
	submitKyc(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: SubmitKycDto,
	) {
		return this.sellerProfileService.submitKyc(session.user.id, dto);
	}
}
