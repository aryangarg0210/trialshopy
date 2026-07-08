import { ApiProperty } from "@nestjs/swagger";
import { AddressOwnerType, AddressType, GenericStatus } from "@repo/db";

export class AddressResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6260" })
	ownerId!: string;

	@ApiProperty({ enum: AddressOwnerType, example: AddressOwnerType.user })
	ownerType!: AddressOwnerType;

	@ApiProperty({ enum: AddressType, nullable: true, example: AddressType.home })
	type!: AddressType | null;

	@ApiProperty({ enum: GenericStatus, example: GenericStatus.active })
	status!: GenericStatus;

	@ApiProperty({ nullable: true, example: "Asha Rao" })
	fullName!: string | null;

	@ApiProperty({ nullable: true, example: "+919876543210" })
	phoneNumber!: string | null;

	@ApiProperty({ nullable: true, example: "+919876543211" })
	alternatePhone!: string | null;

	@ApiProperty({ nullable: true, example: "12 MG Road, Apt 4B" })
	addressLine!: string | null;

	@ApiProperty({ example: "Bengaluru" })
	city!: string;

	@ApiProperty({ example: "560001" })
	pincode!: string;

	@ApiProperty({ nullable: true, example: "Near Trinity Metro" })
	landmark!: string | null;

	@ApiProperty({ example: "Karnataka" })
	state!: string;

	@ApiProperty({ example: "India" })
	country!: string;

	@ApiProperty({ nullable: true, example: "2026-07-09T10:00:00.000Z" })
	lastUsedAt!: Date | null;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	updatedAt!: Date;
}
