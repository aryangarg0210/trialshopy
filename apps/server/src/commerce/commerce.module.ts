import { Module } from "@nestjs/common";
import { AddressController } from "./address/address.controller";
import { AddressService } from "./address/address.service";
import { CartController } from "./cart/cart.controller";
import { CartService } from "./cart/cart.service";
import { CouponController } from "./coupon/coupon.controller";
import { CouponService } from "./coupon/coupon.service";
import { CouponDomainController } from "./coupon/coupon-domain.controller";
import { CouponDomainService } from "./coupon/coupon-domain.service";
import { StudentVerificationController } from "./coupon/student-verification.controller";
import { StudentVerificationService } from "./coupon/student-verification.service";
import { OfferController } from "./offer/offer.controller";
import { OfferService } from "./offer/offer.service";
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
		OfferController,
		CouponController,
		CouponDomainController,
		StudentVerificationController,
	],
	providers: [
		AddressService,
		CartService,
		OrderService,
		SubOrderService,
		OfferService,
		CouponService,
		CouponDomainService,
		StudentVerificationService,
	],
})
export class CommerceModule {}
