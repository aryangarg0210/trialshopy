import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsMongoId, IsNumber, Max, Min } from "class-validator";

export class CreateCommissionDto {
	@ApiProperty({ description: "Product this commission rate applies to" })
	@IsMongoId()
	productId!: string;

	@ApiProperty({
		description: "Commission percentage the platform takes",
		example: 10,
		minimum: 0,
		maximum: 100,
	})
	@IsNumber()
	@Min(0)
	@Max(100)
	commission!: number;

	@ApiProperty({ example: "2026-07-01T00:00:00.000Z" })
	@IsDateString()
	datedFrom!: string;

	@ApiProperty({ example: "2026-12-31T23:59:59.000Z" })
	@IsDateString()
	datedTo!: string;
}
