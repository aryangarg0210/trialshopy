import { ApiProperty } from "@nestjs/swagger";
import { Gender, PaymentMethod, ProfileStatus } from "@repo/db";
import { MediaDto } from "../media.dto";

class PaymentDetailsResponseDto {
	@ApiProperty({ nullable: true, example: "HDFC Bank" })
	bankName!: string | null;

	@ApiProperty({ nullable: true, example: "MG Road, Bengaluru" })
	bankAddress!: string | null;

	@ApiProperty({ nullable: true, example: "50100123456789" })
	accountNumber!: string | null;

	@ApiProperty({ nullable: true, example: "HDFC0001234" })
	ifscCode!: string | null;

	@ApiProperty({ nullable: true, example: "asha@hdfcbank" })
	custId!: string | null;

	@ApiProperty({
		enum: PaymentMethod,
		nullable: true,
		example: PaymentMethod.upi,
	})
	method!: PaymentMethod | null;
}

export class CustomerProfileResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6264" })
	userId!: string;

	@ApiProperty({ enum: Gender, nullable: true, example: Gender.female })
	gender!: Gender | null;

	@ApiProperty({ nullable: true, example: "1995-06-01" })
	dateOfBirth!: string | null;

	@ApiProperty({ type: MediaDto, nullable: true })
	profilePic!: MediaDto | null;

	@ApiProperty({ type: [String], example: ["en", "hi"] })
	languages!: string[];

	@ApiProperty({ enum: ProfileStatus, example: ProfileStatus.active })
	status!: ProfileStatus;

	@ApiProperty({ type: PaymentDetailsResponseDto, nullable: true })
	paymentDetails!: PaymentDetailsResponseDto | null;

	@ApiProperty({ example: false })
	thirdParty!: boolean;

	@ApiProperty({ type: [String], example: [] })
	wishlistIds!: string[];

	@ApiProperty({ example: "2026-07-07T19:42:49.176Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-07T19:42:49.176Z" })
	updatedAt!: Date;
}
