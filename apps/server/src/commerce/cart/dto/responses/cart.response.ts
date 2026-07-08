import { ApiProperty } from "@nestjs/swagger";

class CartItemResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6270" })
	productId!: string;

	@ApiProperty({ nullable: true, example: "6a4d564507ba0a597bdc6271" })
	variantId!: string | null;

	@ApiProperty({ example: 2 })
	quantity!: number;

	@ApiProperty({ nullable: true, example: "M" })
	size!: string | null;
}

export class CartResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6260" })
	customerId!: string;

	@ApiProperty({ nullable: true, example: "6a4d564507ba0a597bdc6280" })
	addressId!: string | null;

	@ApiProperty({ type: [CartItemResponseDto] })
	items!: CartItemResponseDto[];

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	updatedAt!: Date;
}
