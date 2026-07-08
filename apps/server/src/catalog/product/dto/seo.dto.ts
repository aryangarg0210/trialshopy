import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class SeoDto {
	@ApiPropertyOptional({ example: "Buy Sony WH-1000XM5 Headphones" })
	@IsOptional()
	@IsString()
	metaTitle?: string;

	@ApiPropertyOptional({
		type: [String],
		example: ["headphones", "sony", "anc"],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	metaKeywords?: string[];

	@ApiPropertyOptional({
		example: "Industry-leading noise cancelling headphones",
	})
	@IsOptional()
	@IsString()
	metaDescription?: string;
}
