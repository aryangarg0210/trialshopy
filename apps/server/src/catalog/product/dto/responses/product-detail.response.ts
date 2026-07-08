import { ApiProperty } from "@nestjs/swagger";
import { ProductResponseDto } from "./product.response";
import { VariantResponseDto } from "./variant.response";

export class ProductDetailResponseDto extends ProductResponseDto {
	@ApiProperty({ type: [VariantResponseDto] })
	variants!: VariantResponseDto[];
}
