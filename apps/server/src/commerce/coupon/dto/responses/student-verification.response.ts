import { ApiProperty } from "@nestjs/swagger";
import { CouponStatus, CouponType } from "@repo/db";
import { MediaDto } from "../../../../catalog/dto/media.dto";

export class StudentVerificationResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6260" })
	userId!: string;

	@ApiProperty({ enum: CouponType, example: CouponType.school })
	couponType!: CouponType;

	@ApiProperty({ type: MediaDto })
	document!: MediaDto;

	@ApiProperty({ enum: CouponStatus, example: CouponStatus.inactive })
	status!: CouponStatus;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	updatedAt!: Date;
}
