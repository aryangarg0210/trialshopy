import { Module } from "@nestjs/common";
import { AddressController } from "./address/address.controller";
import { AddressService } from "./address/address.service";
import { CartController } from "./cart/cart.controller";
import { CartService } from "./cart/cart.service";

@Module({
	controllers: [AddressController, CartController],
	providers: [AddressService, CartService],
})
export class CommerceModule {}
