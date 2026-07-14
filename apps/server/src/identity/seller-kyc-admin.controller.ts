import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "@thallesp/nestjs-better-auth";
import { ListKycQuery } from "./dto/list-kyc.query";
import { SellerProfileResponseDto } from "./dto/responses/seller-profile.response";
import { UpdateKycStatusDto } from "./dto/update-kyc-status.dto";
import { SellerProfileService } from "./seller-profile.service";

@ApiTags("admin-seller-kyc")
@Controller("admin/sellers")
@Roles(["admin"])
export class SellerKycAdminController {
	constructor(private readonly sellerProfileService: SellerProfileService) {}

	@Get("kyc")
	@ApiOperation({ summary: "List seller KYC submissions (admin)" })
	list(@Query() query: ListKycQuery) {
		return this.sellerProfileService.adminListKyc(query);
	}

	@Get(":id/kyc")
	@ApiOperation({ summary: "Get a seller's KYC by seller profile id (admin)" })
	@ApiOkResponse({ type: SellerProfileResponseDto })
	get(@Param("id") id: string) {
		return this.sellerProfileService.adminGetKyc(id);
	}

	@Patch(":id/kyc/status")
	@ApiOperation({ summary: "Approve or reject a seller's KYC (admin)" })
	@ApiOkResponse({ type: SellerProfileResponseDto })
	setStatus(@Param("id") id: string, @Body() dto: UpdateKycStatusDto) {
		return this.sellerProfileService.adminSetKycStatus(id, dto.status);
	}
}
