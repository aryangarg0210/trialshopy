import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsMongoId, IsNumber, IsOptional, Min } from "class-validator";

export class CreatePaymentDto {
	@ApiProperty({ description: "Store this payout belongs to" })
	@IsMongoId()
	storeId!: string;

	@ApiPropertyOptional({ description: "Sub-order this payout settles" })
	@IsOptional()
	@IsMongoId()
	suborderId?: string;

	@ApiPropertyOptional({ example: 12, minimum: 0 })
	@IsOptional()
	@IsInt()
	@Min(0)
	totalItems?: number;

	@ApiPropertyOptional({
		description: "Amount still owed to the store",
		example: 1500,
	})
	@IsOptional()
	@IsNumber()
	balance?: number;

	@ApiPropertyOptional({ example: 5000, minimum: 0 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	totalRevenue?: number;

	@ApiPropertyOptional({ example: 4700, minimum: 0 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	finalPrice?: number;

	@ApiPropertyOptional({ example: 150, minimum: 0 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	sgst?: number;

	@ApiPropertyOptional({ example: 150, minimum: 0 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	cgst?: number;
}
