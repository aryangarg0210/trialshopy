import { ApiProperty } from "@nestjs/swagger";
import { CatalogStatus, StoreVerification } from "@repo/db";
import { MediaDto } from "../../../dto/media.dto";
import { GeoPointDto } from "../geo-point.dto";
import { OpeningHourDto } from "../opening-hour.dto";

class RatingResponseDto {
	@ApiProperty({ example: 0 })
	count!: number;

	@ApiProperty({ example: 0 })
	average!: number;
}

export class StoreResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({
		description: "Owning seller profile id",
		example: "6a4d564507ba0a597bdc6264",
	})
	sellerId!: string;

	@ApiProperty({ example: "Asha Electronics" })
	storeName!: string;

	@ApiProperty({ nullable: true, example: "Your neighbourhood gadget shop" })
	storeDescription!: string | null;

	@ApiProperty({ nullable: true, example: "29ABCDE1234F1Z5" })
	gstId!: string | null;

	@ApiProperty({ type: [MediaDto] })
	images!: MediaDto[];

	@ApiProperty({ enum: CatalogStatus, example: CatalogStatus.active })
	status!: CatalogStatus;

	@ApiProperty({
		enum: StoreVerification,
		example: StoreVerification.submitted,
	})
	verification!: StoreVerification;

	@ApiProperty({ type: [String], example: ["6a4d564507ba0a597bdc6276"] })
	categoryIds!: string[];

	@ApiProperty({ type: RatingResponseDto, nullable: true })
	rating!: RatingResponseDto | null;

	@ApiProperty({ example: 0 })
	reviewCount!: number;

	@ApiProperty({ example: 0 })
	followerCount!: number;

	@ApiProperty({ type: [String], example: [] })
	followerIds!: string[];

	@ApiProperty({ type: [OpeningHourDto] })
	openingHours!: OpeningHourDto[];

	@ApiProperty({ type: GeoPointDto, nullable: true })
	location!: GeoPointDto | null;

	@ApiProperty({ nullable: true, example: "12 MG Road" })
	addressLine!: string | null;

	@ApiProperty({ nullable: true, example: "Bengaluru" })
	city!: string | null;

	@ApiProperty({ nullable: true, example: "560001" })
	pincode!: string | null;

	@ApiProperty({ nullable: true, example: "Near Trinity Metro" })
	landmark!: string | null;

	@ApiProperty({ nullable: true, example: "Karnataka" })
	state!: string | null;

	@ApiProperty({ nullable: true, example: "India" })
	country!: string | null;

	@ApiProperty({ example: "2026-07-08T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-08T10:00:00.000Z" })
	updatedAt!: Date;
}
