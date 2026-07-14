import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";

export class CreateSponsoredProductDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	@IsMongoId()
	productId!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6260" })
	@IsMongoId()
	categoryId!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6268" })
	@IsMongoId()
	subcategoryId!: string;
}
