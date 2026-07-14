import { Module } from "@nestjs/common";
import { BannerController } from "./banner/banner.controller";
import { BannerService } from "./banner/banner.service";
import { ContactUsController } from "./contact-us/contact-us.controller";
import { ContactUsService } from "./contact-us/contact-us.service";
import { FaqController } from "./faq/faq.controller";
import { FaqService } from "./faq/faq.service";
import { HeaderController } from "./header/header.controller";
import { HeaderService } from "./header/header.service";
import { NotificationController } from "./notification/notification.controller";
import { NotificationService } from "./notification/notification.service";
import { ReviewController } from "./review/review.controller";
import { ReviewService } from "./review/review.service";
import { SponsoredProductController } from "./sponsored-product/sponsored-product.controller";
import { SponsoredProductService } from "./sponsored-product/sponsored-product.service";
import { StoreReviewController } from "./store-review/store-review.controller";
import { StoreReviewService } from "./store-review/store-review.service";

@Module({
	controllers: [
		ReviewController,
		StoreReviewController,
		NotificationController,
		FaqController,
		ContactUsController,
		HeaderController,
		SponsoredProductController,
		BannerController,
	],
	providers: [
		ReviewService,
		StoreReviewService,
		NotificationService,
		FaqService,
		ContactUsService,
		HeaderService,
		SponsoredProductService,
		BannerService,
	],
})
export class EngagementModule {}
