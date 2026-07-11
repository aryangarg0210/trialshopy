import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class ValidateCouponDto {
	@ApiProperty({ example: "MONSOON20" })
	@IsString()
	@IsNotEmpty()
	code!: string;

	@ApiProperty({ example: 1200, minimum: 0 })
	@IsNumber()
	@Min(0)
	purchaseAmount!: number;
}
