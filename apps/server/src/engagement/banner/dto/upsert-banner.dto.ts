import { ApiProperty } from "@nestjs/swagger";
import { IsUrl } from "class-validator";

export class UpsertBannerDto {
	@ApiProperty({
		example: "https://cdn.trialshopy.com/banners/electronics.jpg",
	})
	@IsUrl()
	url!: string;
}
