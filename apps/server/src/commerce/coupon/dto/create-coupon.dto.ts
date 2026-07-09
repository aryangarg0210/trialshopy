import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsDateString,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min,
} from "class-validator";

export class CreateCouponDto {
	@ApiProperty({ example: "MONSOON20" })
	@IsString()
	@IsNotEmpty()
	code!: string;

	@ApiPropertyOptional({
		description: "Freeform label or notes for the coupon",
	})
	@IsOptional()
	@IsString()
	data?: string;

	@ApiProperty({ example: 20, minimum: 0, maximum: 100 })
	@IsNumber()
	@Min(0)
	@Max(100)
	discount!: number;

	@ApiPropertyOptional({ example: 500, minimum: 0, default: 0 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	minimumPurchaseAmount?: number;

	@ApiProperty({ example: "2026-07-01T00:00:00.000Z" })
	@IsDateString()
	validFrom!: string;

	@ApiProperty({ example: "2026-07-31T23:59:59.000Z" })
	@IsDateString()
	validTo!: string;
}
