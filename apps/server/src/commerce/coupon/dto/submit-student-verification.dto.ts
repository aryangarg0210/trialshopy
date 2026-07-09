import { ApiProperty } from "@nestjs/swagger";
import { CouponType } from "@repo/db";
import { Type } from "class-transformer";
import { IsEnum, ValidateNested } from "class-validator";
import { MediaDto } from "../../../catalog/dto/media.dto";

export class SubmitStudentVerificationDto {
	@ApiProperty({ enum: CouponType, example: CouponType.school })
	@IsEnum(CouponType)
	couponType!: CouponType;

	@ApiProperty({ type: MediaDto, description: "Uploaded student ID document" })
	@ValidateNested()
	@Type(() => MediaDto)
	document!: MediaDto;
}
