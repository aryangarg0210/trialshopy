import { ApiProperty } from "@nestjs/swagger";
import { CatalogStatus } from "@repo/db";
import { MediaDto } from "../../../dto/media.dto";
import { CategoryAttributeDto } from "../category-attribute.dto";

export class CategoryResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ example: "Electronics" })
	name!: string;

	@ApiProperty({ nullable: true, example: "Phones, laptops and accessories" })
	description!: string | null;

	@ApiProperty({ type: MediaDto, nullable: true })
	image!: MediaDto | null;

	@ApiProperty({ example: false })
	featured!: boolean;

	@ApiProperty({ example: 0 })
	discount!: number;

	@ApiProperty({ enum: CatalogStatus, example: CatalogStatus.active })
	status!: CatalogStatus;

	@ApiProperty({ type: [CategoryAttributeDto] })
	attributes!: CategoryAttributeDto[];

	@ApiProperty({ nullable: true, example: null })
	parentId!: string | null;

	@ApiProperty({ example: "2026-07-08T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-08T10:00:00.000Z" })
	updatedAt!: Date;
}

export class CategoryDetailResponseDto extends CategoryResponseDto {
	@ApiProperty({ type: CategoryResponseDto, nullable: true })
	parent!: CategoryResponseDto | null;

	@ApiProperty({ type: [CategoryResponseDto] })
	children!: CategoryResponseDto[];
}

export class CategoryTreeNodeResponseDto extends CategoryResponseDto {
	@ApiProperty({ type: [CategoryTreeNodeResponseDto] })
	children!: CategoryTreeNodeResponseDto[];
}
