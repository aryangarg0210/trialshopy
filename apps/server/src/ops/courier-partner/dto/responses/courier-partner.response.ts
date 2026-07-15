import { ApiProperty } from "@nestjs/swagger";
import { CourierPreference } from "@repo/db";

export class CourierPartnerResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ enum: CourierPreference })
	preference!: CourierPreference;

	@ApiProperty({ example: "Delhivery" })
	courierPartner!: string;

	@ApiProperty({ example: 40 })
	reverseShippingCharge!: number;

	@ApiProperty({ example: 5 })
	avgReturnTimeDays!: number;

	@ApiProperty({ example: 12 })
	claimsRaised!: number;

	@ApiProperty({ example: 92.5 })
	claimApprovalPercentage!: number;

	@ApiProperty({ example: "2026-07-14T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-14T10:00:00.000Z" })
	updatedAt!: Date;
}
