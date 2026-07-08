import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsMongoId, IsOptional, IsString } from "class-validator";

export class RemoveCartItemDto {
	@ApiProperty({ description: "Product id" })
	@IsMongoId()
	productId!: string;

	@ApiPropertyOptional({ description: "Variant id of the line to remove" })
	@IsOptional()
	@IsMongoId()
	variantId?: string;

	@ApiPropertyOptional({ example: "M" })
	@IsOptional()
	@IsString()
	size?: string;
}
