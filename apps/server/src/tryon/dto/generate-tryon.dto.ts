import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsIn,
	IsOptional,
	IsString,
	IsUrl,
	Matches,
	MaxLength,
	MinLength,
} from "class-validator";

/**
 * DTO for POST /api/tryon/generate
 *
 * Accepts:
 *  - personImage  : Base64 data URI (data:image/...) OR a public URL
 *  - garmentImage : Public URL of the garment/product image
 *  - clothType    : Optional garment zone hint (upper | lower | overall)
 *  - productId    : Optional product reference for history linkage
 */
export class GenerateTryOnDto {
	@ApiProperty({
		description:
			"Person image as a Base64 data URI (data:image/jpeg|png|webp;base64,...) or a public HTTPS URL.",
		example: "data:image/jpeg;base64,/9j/4AAQSkZJRgAB...",
	})
	@IsString()
	@MinLength(10)
	personImage: string;

	@ApiProperty({
		description: "Public HTTPS URL of the garment image.",
		example: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
	})
	@IsString()
	@MinLength(10)
	garmentImage: string;

	@ApiPropertyOptional({
		description:
			"Garment zone hint sent to the AI model. Defaults to 'upper'.",
		enum: ["upper", "lower", "overall"],
		default: "upper",
	})
	@IsOptional()
	@IsIn(["upper", "lower", "overall"])
	clothType?: string = "upper";

	@ApiPropertyOptional({
		description:
			"Optional product ID to associate this try-on session with a catalogue entry.",
	})
	@IsOptional()
	@IsString()
	productId?: string;
}
