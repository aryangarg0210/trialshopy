import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { Readable } from "node:stream";
import axios from "axios";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * CloudinaryService
 *
 * Encapsulates all interactions with the Cloudinary API.
 * Configured from environment variables at bootstrap (config lazy-initialised
 * on first call so the module loads even when env vars are absent in test).
 *
 * Responsibilities:
 *  - Configure the SDK from env vars once.
 *  - Upload a Base64 data-URI person image with retry logic.
 *  - Provide a helper to validate / passthrough existing public URLs.
 */
@Injectable()
export class CloudinaryService {
	private readonly logger = new Logger(CloudinaryService.name);
	private configured = false;

	private configure() {
		if (this.configured) return;
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
		});
		this.configured = true;
		this.logger.log("Cloudinary SDK configured.");
	}

	/**
	 * Converts a Base64 data-URI to a public Cloudinary URL.
	 * Uses stream-based upload to avoid memory spikes with large images.
	 * Retries up to MAX_RETRIES times on transient network errors.
	 *
	 * @param base64DataUri   Full data URI e.g. "data:image/jpeg;base64,..."
	 * @param folder          Cloudinary folder path
	 * @param publicIdPrefix  Optional prefix for the public_id
	 * @returns               Secure HTTPS URL of the uploaded asset
	 */
	async uploadBase64Image(
		base64DataUri: string,
		folder = "virtual_tryon/persons",
		publicIdPrefix = "person",
	): Promise<string> {
		this.configure();

		// Strip the data URI header to get raw base64 bytes
		const base64Data = base64DataUri.replace(/^data:image\/\w+;base64,/, "");
		const imageBuffer = Buffer.from(base64Data, "base64");

		for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
			try {
				this.logger.log(
					`Cloudinary upload attempt ${attempt}/${MAX_RETRIES}…`,
				);

				const result = await this.streamUpload(imageBuffer, {
					folder,
					resource_type: "image",
					public_id: `${publicIdPrefix}_${Date.now()}`,
					timeout: 120_000, // 2-min timeout
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
					this.logger.log(
						`Retrying in ${RETRY_DELAY_MS / 1000}s…`,
					);
					await this.delay(RETRY_DELAY_MS);
				} else {
					throw new InternalServerErrorException(
						"Failed to upload person image after multiple attempts. " +
						"Please check your connection and try again.",
					);
				}
			}
		}

		// Unreachable — TypeScript satisfaction
		throw new InternalServerErrorException("Upload failed unexpectedly.");
	}

	/**
	 * Downloads an image from an external URL and uploads it to Cloudinary.
	 * Useful for saving temporary results from the Python bridge permanently.
	 */
	async uploadExternalImage(
		url: string,
		folder = "virtual_tryon/results",
		publicIdPrefix = "result",
	): Promise<string> {
		this.configure();

		for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
			try {
				this.logger.log(`Downloading external image for Cloudinary upload: ${url}`);
				
				// Download the image as a buffer
				const response = await axios.get(url, { responseType: "arraybuffer", timeout: 15_000 });
				const imageBuffer = Buffer.from(response.data);

				this.logger.log(`Uploading downloaded buffer to Cloudinary (attempt ${attempt}/${MAX_RETRIES})…`);

				const result = await this.streamUpload(imageBuffer, {
					folder,
					resource_type: "image",
					public_id: `${publicIdPrefix}_${Date.now()}`,
					timeout: 120_000,
				});

				if (!result?.secure_url) {
					throw new Error("Cloudinary response missing secure_url.");
				}

				this.logger.log(`Upload successful on attempt ${attempt}: ${result.secure_url}`);
				return result.secure_url;
			} catch (err: unknown) {
				const errMessage = err instanceof Error ? err.message : JSON.stringify(err);
				this.logger.error(`Cloudinary external upload attempt ${attempt} failed: ${errMessage}`);

				if (attempt < MAX_RETRIES) {
					await this.delay(RETRY_DELAY_MS);
				} else {
					throw new InternalServerErrorException("Failed to upload external image to Cloudinary.");
				}
			}
		}

		throw new InternalServerErrorException("Upload failed unexpectedly.");
	}

	/**
	 * Uploads a video buffer directly to Cloudinary.
	 * Retries up to MAX_RETRIES times on transient network errors.
	 */
	async uploadVideo(
		buffer: Buffer,
		folder = "reels",
		publicIdPrefix = "reel",
	): Promise<string> {
		this.configure();

		for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
			try {
				this.logger.log(`Cloudinary video upload attempt ${attempt}/${MAX_RETRIES}…`);

				const result = await this.streamUpload(buffer, {
					folder,
					resource_type: "video",
					public_id: `${publicIdPrefix}_${Date.now()}`,
					timeout: 300_000, // 5-min timeout for videos
				});

				if (!result?.secure_url) {
					throw new Error("Cloudinary response missing secure_url.");
				}

				this.logger.log(`Video upload successful on attempt ${attempt}: ${result.secure_url}`);
				return result.secure_url;
			} catch (err: unknown) {
				const errMessage = err instanceof Error ? err.message : JSON.stringify(err);
				this.logger.error(`Cloudinary video upload attempt ${attempt} failed: ${errMessage}`);

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

	/**
	 * Wraps cloudinary.uploader.upload_stream in a Promise.
	 */
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
