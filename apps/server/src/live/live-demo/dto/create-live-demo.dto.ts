import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsMongoId, IsOptional } from "class-validator";

export class CreateLiveDemoDto {
	@ApiPropertyOptional({ example: "6a4d564507ba0a597bdc6268" })
	@IsOptional()
	@IsMongoId()
	storeId?: string;

	@ApiPropertyOptional({ type: [String], example: [] })
	@IsOptional()
	@IsArray()
	@IsMongoId({ each: true })
	itemIds?: string[];
}
