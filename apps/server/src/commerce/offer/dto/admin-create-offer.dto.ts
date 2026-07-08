import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsMongoId, IsOptional } from "class-validator";
import { CreateOfferDto } from "./create-offer.dto";

export class AdminCreateOfferDto extends CreateOfferDto {
	@ApiPropertyOptional({ description: "Target store id (store-wide offer)" })
	@IsOptional()
	@IsMongoId()
	storeId?: string;

	@ApiPropertyOptional({ description: "Target brand id (brand-wide offer)" })
	@IsOptional()
	@IsMongoId()
	brandId?: string;
}
