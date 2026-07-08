import { ApiProperty } from "@nestjs/swagger";

export class UploadSignatureResponseDto {
	@ApiProperty({ example: "trialshopy-prod" })
	cloudName!: string;

	@ApiProperty({ example: "123456789012345" })
	apiKey!: string;

	@ApiProperty({
		description: "Unix seconds; include verbatim in the upload",
		example: 1783538400,
	})
	timestamp!: number;

	@ApiProperty({ example: "products" })
	folder!: string;

	@ApiProperty({
		description: "Cloudinary upload signature; send with the direct upload",
		example: "a1b2c3d4e5f6...",
	})
	signature!: string;
}
