import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CourierPreference } from "@repo/db";
import {
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min,
} from "class-validator";

export class CreateCourierPartnerDto {
	@ApiPropertyOptional({
		enum: CourierPreference,
		default: CourierPreference.recommended,
	})
	@IsOptional()
	@IsEnum(CourierPreference)
	preference?: CourierPreference;

	@ApiProperty({ example: "Delhivery" })
	@IsString()
	@IsNotEmpty()
	courierPartner!: string;

	@ApiPropertyOptional({ example: 40, minimum: 0 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	reverseShippingCharge?: number;

	@ApiPropertyOptional({ example: 5, minimum: 0 })
	@IsOptional()
	@IsInt()
	@Min(0)
	avgReturnTimeDays?: number;

	@ApiPropertyOptional({ example: 12, minimum: 0 })
	@IsOptional()
	@IsInt()
	@Min(0)
	claimsRaised?: number;

	@ApiProperty({ example: 92.5, minimum: 0, maximum: 100 })
	@IsNumber()
	@Min(0)
	@Max(100)
	claimApprovalPercentage!: number;
}
