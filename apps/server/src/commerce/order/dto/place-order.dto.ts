import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsMongoId, IsOptional, IsString } from "class-validator";

export class PlaceOrderDto {
	@ApiPropertyOptional({
		description:
			"Delivery address id. Defaults to the cart's address if omitted.",
	})
	@IsOptional()
	@IsMongoId()
	addressId?: string;

	@ApiPropertyOptional({
		description: "Contact phone for this order; defaults to the address phone.",
		example: "+919876543210",
	})
	@IsOptional()
	@IsString()
	phoneNumber?: string;
}
