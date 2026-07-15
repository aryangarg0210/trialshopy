import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsMongoId } from "class-validator";

export class UpdateLiveDemoItemsDto {
	@ApiProperty({ type: [String], example: ["6a4d564507ba0a597bdc6276"] })
	@IsArray()
	@IsMongoId({ each: true })
	itemIds!: string[];
}
