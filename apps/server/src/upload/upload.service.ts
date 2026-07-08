import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../common/config";

@Injectable()
export class UploadService {
	constructor() {
		cloudinary.config({
			cloud_name: config.cloudinary.cloudName,
			api_key: config.cloudinary.apiKey,
			api_secret: config.cloudinary.apiSecret,
		});
	}

	signUpload(folder = "trialshopy") {
		if (!config.cloudinary.apiKey || !config.cloudinary.apiSecret)
			throw new ServiceUnavailableException("Media uploads are not configured");

		const timestamp = Math.round(Date.now() / 1000);
		const signature = cloudinary.utils.api_sign_request(
			{ timestamp, folder },
			config.cloudinary.apiSecret,
		);

		return {
			cloudName: config.cloudinary.cloudName,
			apiKey: config.cloudinary.apiKey,
			timestamp,
			folder,
			signature,
		};
	}
}
