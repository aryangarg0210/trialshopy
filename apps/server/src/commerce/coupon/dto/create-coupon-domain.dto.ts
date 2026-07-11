import { ApiProperty } from "@nestjs/swagger";
import { CouponType } from "@repo/db";
import {
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsString,
	Max,
	Min,
} from "class-validator";

export class CreateCouponDomainDto {
	@ApiProperty({ enum: CouponType, example: CouponType.college })
	@IsEnum(CouponType)
	couponType!: CouponType;

	@ApiProperty({
		description: "Email domain that qualifies",
		example: "mit.edu",
	})
	@IsString()
	@IsNotEmpty()
	domain!: string;

	@ApiProperty({ example: 15, minimum: 0, maximum: 100 })
	@IsNumber()
	@Min(0)
	@Max(100)
	discount!: number;
}
