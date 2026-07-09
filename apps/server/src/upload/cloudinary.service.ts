import { Readable } from "node:stream";
import {
	Injectable,
	InternalServerErrorException,
	Logger,
	ServiceUnavailableException,
} from "@nestjs/common";
import axios from "axios";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { config } from "../common/config";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

@Injectable()
export class CloudinaryService {
	private readonly logger = new Logger(CloudinaryService.name);
	private configured = false;

	private configure() {
		if (this.configured) return;
		cloudinary.config({
			cloud_name: config.cloudinary.cloudName,
			api_key: config.cloudinary.apiKey,
			api_secret: config.cloudinary.apiSecret,
		});
		this.configured = true;
		this.logger.log("Cloudinary SDK configured.");
	}

	signUpload(folder = "trialshopy") {
		if (!config.cloudinary.apiKey || !config.cloudinary.apiSecret)
			throw new ServiceUnavailableException("Media uploads are not configured");

		this.configure();

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

	async uploadBase64Image(
		base64DataUri: string,
		folder = "virtual_tryon/persons",
		publicIdPrefix = "person",
	): Promise<string> {
		this.configure();

		const base64Data = base64DataUri.replace(/^data:image\/\w+;base64,/, "");
		const imageBuffer = Buffer.from(base64Data, "base64");

		for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
			try {
				this.logger.log(`Cloudinary upload attempt ${attempt}/${MAX_RETRIES}…`);

				const result = await this.streamUpload(imageBuffer, {
					folder,
					resource_type: "image",
					public_id: `${publicIdPrefix}_${Date.now()}`,
					timeout: 120_000,
				});

				if (!result?.secure_url) {
					throw new Error("Cloudinary response missing secure_url.");
				}

				this.logger.log(
					`Upload successful on attempt ${attempt}: ${result.secure_url}`,
				);
				return result.secure_url;
			} catch (err: unknown) {
				const errMessage =
					err instanceof Error ? err.message : JSON.stringify(err);
				this.logger.error(
					`Cloudinary upload attempt ${attempt} failed: ${errMessage}`,
				);

				if (attempt < MAX_RETRIES) {
					this.logger.log(`Retrying in ${RETRY_DELAY_MS / 1000}s…`);
					await this.delay(RETRY_DELAY_MS);
				} else {
					throw new InternalServerErrorException(
						"Failed to upload person image after multiple attempts. " +
							"Please check your connection and try again.",
					);
				}
			}
		}

		throw new InternalServerErrorException("Upload failed unexpectedly.");
	}

	async uploadExternalImage(
		url: string,
		folder = "virtual_tryon/results",
		publicIdPrefix = "result",
	): Promise<string> {
		this.configure();

		for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
			try {
				this.logger.log(
					`Downloading external image for Cloudinary upload: ${url}`,
				);

				const response = await axios.get(url, {
					responseType: "arraybuffer",
					timeout: 15_000,
				});
				const imageBuffer = Buffer.from(response.data);

				this.logger.log(
					`Uploading downloaded buffer to Cloudinary (attempt ${attempt}/${MAX_RETRIES})…`,
				);

				const result = await this.streamUpload(imageBuffer, {
					folder,
					resource_type: "image",
					public_id: `${publicIdPrefix}_${Date.now()}`,
					timeout: 120_000,
				});

				if (!result?.secure_url) {
					throw new Error("Cloudinary response missing secure_url.");
				}

				this.logger.log(
					`Upload successful on attempt ${attempt}: ${result.secure_url}`,
				);
				return result.secure_url;
			} catch (err: unknown) {
				const errMessage =
					err instanceof Error ? err.message : JSON.stringify(err);
				this.logger.error(
					`Cloudinary external upload attempt ${attempt} failed: ${errMessage}`,
				);

				if (attempt < MAX_RETRIES) {
					await this.delay(RETRY_DELAY_MS);
				} else {
					throw new InternalServerErrorException(
						"Failed to upload external image to Cloudinary.",
					);
				}
			}
		}

		throw new InternalServerErrorException("Upload failed unexpectedly.");
	}

	async uploadVideo(
		buffer: Buffer,
		folder = "reels",
		publicIdPrefix = "reel",
	): Promise<string> {
		this.configure();

		for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
			try {
				this.logger.log(
					`Cloudinary video upload attempt ${attempt}/${MAX_RETRIES}…`,
				);

				const result = await this.streamUpload(buffer, {
					folder,
					resource_type: "video",
					public_id: `${publicIdPrefix}_${Date.now()}`,
					timeout: 300_000,
				});

				if (!result?.secure_url) {
					throw new Error("Cloudinary response missing secure_url.");
				}

				this.logger.log(
					`Video upload successful on attempt ${attempt}: ${result.secure_url}`,
				);
				return result.secure_url;
			} catch (err: unknown) {
				const errMessage =
					err instanceof Error ? err.message : JSON.stringify(err);
				this.logger.error(
					`Cloudinary video upload attempt ${attempt} failed: ${errMessage}`,
				);

				if (attempt < MAX_RETRIES) {
					this.logger.log(`Retrying in ${RETRY_DELAY_MS / 1000}s…`);
					await this.delay(RETRY_DELAY_MS);
				} else {
					throw new InternalServerErrorException(
						"Failed to upload video after multiple attempts. " +
							"Please check your connection and try again.",
					);
				}
			}
		}

		throw new InternalServerErrorException("Upload failed unexpectedly.");
	}

	private streamUpload(
		buffer: Buffer,
		options: Record<string, unknown>,
	): Promise<UploadApiResponse> {
		return new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				// biome-ignore lint/suspicious/noExplicitAny: cloudinary SDK types require any here
				options as any,
				(error, result) => {
					if (error) return reject(error);
					if (!result) return reject(new Error("Empty Cloudinary result"));
					resolve(result);
				},
			);

			const readable = new Readable();
			readable.push(buffer);
			readable.push(null);
			readable.pipe(uploadStream);
		});
	}

	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
