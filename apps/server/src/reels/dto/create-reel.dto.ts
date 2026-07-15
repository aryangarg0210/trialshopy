import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsMongoId,
	IsOptional,
	IsString,
	IsUrl,
	MaxLength,
} from "class-validator";

export class CreateReelDto {
	@ApiProperty({
		description: "Cloudinary URL of the uploaded video (via signed upload)",
		example: "https://res.cloudinary.com/demo/video/upload/reel.mp4",
	})
	@IsUrl()
	video!: string;

	@ApiPropertyOptional({ maxLength: 500, example: "New drop is live!" })
	@IsOptional()
	@IsString()
	@MaxLength(500)
	caption?: string;

	@ApiPropertyOptional({
		description: "Attach the reel to one of the seller's own stores",
		example: "6a4d564507ba0a597bdc6268",
	})
	@IsOptional()
	@IsMongoId()
	storeId?: string;
}
