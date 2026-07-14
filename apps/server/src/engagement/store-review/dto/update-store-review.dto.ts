import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateStoreReviewDto } from "./create-store-review.dto";

export class UpdateStoreReviewDto extends PartialType(
	OmitType(CreateStoreReviewDto, ["storeId"] as const),
) {}
