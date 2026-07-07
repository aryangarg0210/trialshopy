import { ApiProperty } from "@nestjs/swagger";
import { ProfileStatus } from "@repo/db";
import { MediaDto } from "../media.dto";

class KycDocumentResponseDto {
	@ApiProperty({ example: "pan_card" })
	name!: string;

	@ApiProperty({ example: "https://cdn.trialshopy.com/kyc/pan.jpg" })
	url!: string;
}

class KycResponseDto {
	@ApiProperty({ enum: ProfileStatus, example: ProfileStatus.pending })
	status!: ProfileStatus;

	@ApiProperty({ nullable: true, example: "123456789012" })
	aadharNumber!: string | null;

	@ApiProperty({ nullable: true, example: "ABCDE1234F" })
	panNumber!: string | null;

	@ApiProperty({ nullable: true, example: "29ABCDE1234F1Z5" })
	gstin!: string | null;

	@ApiProperty({ nullable: true, example: "HDFC0001234" })
	ifscCode!: string | null;

	@ApiProperty({ nullable: true, example: "50100123456789" })
	accountNumber!: string | null;

	@ApiProperty({ nullable: true, example: "Asha Rao" })
	fullName!: string | null;

	@ApiProperty({ type: [KycDocumentResponseDto] })
	documents!: KycDocumentResponseDto[];
}

export class SellerProfileResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6277" })
	id!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6264" })
	userId!: string;

	@ApiProperty({ nullable: true, example: "SELL-000123" })
	sellerCode!: string | null;

	@ApiProperty({ example: "Asha" })
	firstName!: string;

	@ApiProperty({ nullable: true, example: "Kumari" })
	middleName!: string | null;

	@ApiProperty({ example: "Rao" })
	lastName!: string;

	@ApiProperty({ nullable: true, example: "+919876543210" })
	alternatePhoneNumber!: string | null;

	@ApiProperty({ example: "1" })
	accessLevel!: string;

	@ApiProperty({ type: MediaDto, nullable: true })
	profilePic!: MediaDto | null;

	@ApiProperty({ type: [String], example: ["en", "hi"] })
	languages!: string[];

	@ApiProperty({ enum: ProfileStatus, example: ProfileStatus.active })
	status!: ProfileStatus;

	@ApiProperty({ type: KycResponseDto, nullable: true })
	kyc!: KycResponseDto | null;

	@ApiProperty({ example: false })
	isBlocked!: boolean;

	@ApiProperty({ nullable: true, example: null })
	qrCode!: string | null;

	@ApiProperty({ example: 0 })
	uniqueVisitors!: number;

	@ApiProperty({ example: 0 })
	totalVisitors!: number;

	@ApiProperty({ example: "2026-07-07T19:42:49.234Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-07T19:42:49.234Z" })
	updatedAt!: Date;
}
