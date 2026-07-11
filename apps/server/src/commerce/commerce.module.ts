import { Module } from "@nestjs/common";
import { AddressController } from "./address/address.controller";
import { AddressService } from "./address/address.service";
import { CartController } from "./cart/cart.controller";
import { CartService } from "./cart/cart.service";
import { CommissionController } from "./commission/commission.controller";
import { CommissionService } from "./commission/commission.service";
import { OfferController } from "./offer/offer.controller";
import { OfferService } from "./offer/offer.service";
import { OrderController } from "./order/order.controller";
import { OrderService } from "./order/order.service";
import { SubOrderController } from "./order/suborder.controller";
import { SubOrderService } from "./order/suborder.service";
import { PaymentController } from "./payment/payment.controller";
import { PaymentService } from "./payment/payment.service";

@Module({
	controllers: [
		AddressController,
		CartController,
		SubOrderController,
		OrderController,
		OfferController,
		PaymentController,
		CommissionController,
	],
	providers: [
		AddressService,
		CartService,
		OrderService,
		SubOrderService,
		OfferService,
		PaymentService,
		CommissionService,
	],
})
export class CommerceModule {}
