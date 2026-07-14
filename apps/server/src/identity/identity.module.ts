import { Module } from "@nestjs/common";
import { CustomerProfileController } from "./customer-profile.controller";
import { CustomerProfileService } from "./customer-profile.service";
import { SellerKycAdminController } from "./seller-kyc-admin.controller";
import { SellerProfileController } from "./seller-profile.controller";
import { SellerProfileService } from "./seller-profile.service";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
	controllers: [
		UserController,
		CustomerProfileController,
		SellerProfileController,
		SellerKycAdminController,
	],
	providers: [UserService, CustomerProfileService, SellerProfileService],
})
export class IdentityModule {}
