import { ApiProperty } from "@nestjs/swagger";
import { CatalogStatus } from "@repo/db";
import { MediaDto } from "../../../dto/media.dto";
import { ComplianceDto } from "../compliance.dto";
import { DimensionsDto } from "../dimensions.dto";
import { KeyValueDto } from "../key-value.dto";
import { SeoDto } from "../seo.dto";

class ProductRatingResponseDto {
	@ApiProperty({ example: 0 })
	count!: number;

	@ApiProperty({ example: 0 })
	average!: number;
}

export class ProductResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6270" })
	id!: string;

	@ApiProperty({ nullable: true, example: "6a4d564507ba0a597bdc6260" })
	storeId!: string | null;

	@ApiProperty({ nullable: true, example: "6a4d564507ba0a597bdc6264" })
	sellerId!: string | null;

	@ApiProperty({ nullable: true, example: "6a4d564507ba0a597bdc6268" })
	brandId!: string | null;

	@ApiProperty({ nullable: true, example: "6a4d564507ba0a597bdc6276" })
	categoryId!: string | null;

	@ApiProperty({ type: [String], example: [] })
	categoryIds!: string[];

	@ApiProperty({ example: "Sony WH-1000XM5 Wireless Headphones" })
	productName!: string;

	@ApiProperty({
		nullable: true,
		example: "Industry-leading noise cancellation",
	})
	shortDescription!: string | null;

	@ApiProperty({ nullable: true })
	fullDescription!: string | null;

	@ApiProperty({ enum: CatalogStatus, example: CatalogStatus.active })
	status!: CatalogStatus;

	@ApiProperty({ type: [String], example: ["audio", "wireless"] })
	tags!: string[];

	@ApiProperty({ type: [MediaDto] })
	media!: MediaDto[];

	@ApiProperty({ example: 29990 })
	basePrice!: number;

	@ApiProperty({ nullable: true, example: 34990 })
	mrp!: number | null;

	@ApiProperty({ example: 10 })
	discount!: number;

	@ApiProperty({ example: true })
	isDiscount!: boolean;

	@ApiProperty({ example: true })
	inStock!: boolean;

	@ApiProperty({ example: 100 })
	stock!: number;

	@ApiProperty({ nullable: true, example: 1 })
	orderMinQuantity!: number | null;

	@ApiProperty({ nullable: true, example: 10 })
	orderMaxQuantity!: number | null;

	@ApiProperty({ example: false })
	forRent!: boolean;

	@ApiProperty({ example: 0 })
	rentPerHour!: number;

	@ApiProperty({ nullable: true, example: "Sony India" })
	manufacturer!: string | null;

	@ApiProperty({ nullable: true, example: "Sony Corporation" })
	manufacturerDrop!: string | null;

	@ApiProperty({ nullable: true, example: "Japan" })
	countryOfOrigin!: string | null;

	@ApiProperty({ nullable: true, example: "Plastic, leather" })
	material!: string | null;

	@ApiProperty({ nullable: true, example: "Black" })
	color!: string | null;

	@ApiProperty({ nullable: true, example: "85183000" })
	hsnCode!: string | null;

	@ApiProperty({ type: ComplianceDto, nullable: true })
	compliance!: ComplianceDto | null;

	@ApiProperty({ nullable: true, example: "Penguin Books" })
	publisher!: string | null;

	@ApiProperty({ nullable: true, example: "English" })
	language!: string | null;

	@ApiProperty({ type: [String], example: [] })
	features!: string[];

	@ApiProperty({ type: [KeyValueDto] })
	attributes!: KeyValueDto[];

	@ApiProperty({ type: [KeyValueDto] })
	specifications!: KeyValueDto[];

	@ApiProperty({ type: DimensionsDto, nullable: true })
	dimensions!: DimensionsDto | null;

	@ApiProperty({ type: SeoDto, nullable: true })
	seo!: SeoDto | null;

	@ApiProperty({ type: ProductRatingResponseDto, nullable: true })
	rating!: ProductRatingResponseDto | null;

	@ApiProperty({ example: 0 })
	shippingCharge!: number;

	@ApiProperty({ nullable: true, example: "2026-01-01T00:00:00.000Z" })
	manufactureDate!: Date | null;

	@ApiProperty({ nullable: true, example: "2028-01-01T00:00:00.000Z" })
	expireDate!: Date | null;

	@ApiProperty({ nullable: true, example: "2026-07-01T00:00:00.000Z" })
	availableFrom!: Date | null;

	@ApiProperty({ nullable: true, example: "2026-12-31T00:00:00.000Z" })
	availableTo!: Date | null;

	@ApiProperty({ example: false })
	showOnHome!: boolean;

	@ApiProperty({ example: false })
	markNew!: boolean;

	@ApiProperty({ example: true })
	reviewAllowed!: boolean;

	@ApiProperty({ example: false })
	isNewWeekly!: boolean;

	@ApiProperty({ type: [String], example: [] })
	relatedProductIds!: string[];

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	updatedAt!: Date;
}
