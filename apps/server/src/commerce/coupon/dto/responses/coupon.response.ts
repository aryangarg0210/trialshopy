import { ApiProperty } from "@nestjs/swagger";
import { CouponStatus } from "@repo/db";

export class CouponResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ example: "MONSOON20" })
	code!: string;

	@ApiProperty({ nullable: true, example: "Flat 20% off" })
	data!: string | null;

	@ApiProperty({ example: 20 })
	discount!: number;

	@ApiProperty({ example: 500 })
	minimumPurchaseAmount!: number;

	@ApiProperty({ example: "2026-07-01T00:00:00.000Z" })
	validFrom!: Date;

	@ApiProperty({ example: "2026-07-31T23:59:59.000Z" })
	validTo!: Date;

	@ApiProperty({ enum: CouponStatus, example: CouponStatus.active })
	status!: CouponStatus;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	updatedAt!: Date;
}
