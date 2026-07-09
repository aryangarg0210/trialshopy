import { ApiProperty } from "@nestjs/swagger";
import { CouponStatus, CouponType } from "@repo/db";

export class CouponDomainResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ enum: CouponType, example: CouponType.college })
	couponType!: CouponType;

	@ApiProperty({ example: "mit.edu" })
	domain!: string;

	@ApiProperty({ example: 15 })
	discount!: number;

	@ApiProperty({ enum: CouponStatus, example: CouponStatus.active })
	status!: CouponStatus;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	updatedAt!: Date;
}
