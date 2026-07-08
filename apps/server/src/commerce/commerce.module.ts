import { Module } from "@nestjs/common";
import { AddressController } from "./address/address.controller";
import { AddressService } from "./address/address.service";
import { CartController } from "./cart/cart.controller";
import { CartService } from "./cart/cart.service";
import { OrderController } from "./order/order.controller";
import { OrderService } from "./order/order.service";
import { SubOrderController } from "./order/suborder.controller";
import { SubOrderService } from "./order/suborder.service";

@Module({
	controllers: [
		AddressController,
		CartController,
		SubOrderController,
		OrderController,
	],
	providers: [AddressService, CartService, OrderService, SubOrderService],
})
export class CommerceModule {}
