import { Body, Controller, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CloudinaryService } from "./cloudinary.service";
import { UploadSignatureResponseDto } from "./dto/responses/upload-signature.response";
import { SignUploadDto } from "./dto/sign-upload.dto";

@ApiTags("uploads")
@Controller("uploads")
export class UploadController {
	constructor(private readonly cloudinary: CloudinaryService) {}

	@Post("signature")
	@ApiOperation({
		summary: "Get a signed payload for a direct-to-Cloudinary upload",
	})
	@ApiOkResponse({ type: UploadSignatureResponseDto })
	sign(@Body() dto: SignUploadDto) {
		return this.cloudinary.signUpload(dto.folder);
	}
}
