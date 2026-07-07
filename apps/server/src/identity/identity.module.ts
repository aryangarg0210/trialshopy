import { Module } from "@nestjs/common";
import { CustomerProfileController } from "./customer-profile.controller";
import { CustomerProfileService } from "./customer-profile.service";
import { SellerProfileController } from "./seller-profile.controller";
import { SellerProfileService } from "./seller-profile.service";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
	controllers: [
		UserController,
		CustomerProfileController,
		SellerProfileController,
	],
	providers: [UserService, CustomerProfileService, SellerProfileService],
})
export class IdentityModule {}
