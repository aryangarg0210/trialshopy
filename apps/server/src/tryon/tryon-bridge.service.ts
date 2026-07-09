import {
	Injectable,
	InternalServerErrorException,
	Logger,
	ServiceUnavailableException,
} from "@nestjs/common";
import axios, { type AxiosError } from "axios";
import { randomUUID } from "node:crypto";
import type {
	BridgeJoinQueueResponse,
	BridgePollResponse,
} from "./tryon.types";

/** Maximum polling attempts (72 × 5 s = 6 min). */
const MAX_POLL_ATTEMPTS = 72;
/** Interval between polls in milliseconds. */
const POLL_INTERVAL_MS = 5_000;

/**
 * TryOnBridgeService
 *
 * Handles all HTTP communication with the Python Flask bridge server
 * (Trialshopy-tryon / tryon_server.py).
 *
 * The bridge exposes three endpoints:
 *   GET  /health                — liveness check
 *   POST /trial/api/join_queue/ — submit a job, get event_id
 *   POST /trial/api/queue_data/ — poll job status
 *   GET  /trial/result/:job_id  — download result image
 *
 * This service abstracts the full submit → poll → resolve cycle.
 */
@Injectable()
export class TryOnBridgeService {
	private readonly logger = new Logger(TryOnBridgeService.name);

	/** Base URL of the Python bridge server. */
	private get baseUrl(): string {
		const url =
			process.env.VIRTUAL_TRYON_API ||
			(process.env.RENDER
				? "https://trialshopy-tryon.onrender.com"
				: "http://127.0.0.1:8000");
		return url.replace(/\/$/, "");
	}

	private get isLocal(): boolean {
		return (
			this.baseUrl.includes("127.0.0.1") ||
			this.baseUrl.includes("localhost")
		);
	}

	// ── Health Check ────────────────────────────────────────────────────────

	/**
	 * Pings /health on the Python bridge.
	 * Throws ServiceUnavailableException if unreachable.
	 */
	async healthCheck(): Promise<void> {
		try {
			await axios.get(`${this.baseUrl}/health`, {
				timeout: this.isLocal ? 5_000 : 15_000,
			});
			this.logger.log(`Bridge health OK at ${this.baseUrl}`);
		} catch {
			const hint = this.isLocal
				? "Start the local tryon_server.py (python tryon_server.py) and try again."
				: `Ensure the Try-On service is running at ${this.baseUrl}.`;
			throw new ServiceUnavailableException(
				`Virtual Try-On bridge is unreachable. ${hint}`,
			);
		}
	}

	// ── Submit & Poll ───────────────────────────────────────────────────────

	/**
	 * Runs the full try-on pipeline synchronously:
	 *  1. Health-check the bridge
	 *  2. POST join_queue — receive event_id
	 *  3. Poll queue_data until completed or failed
	 *  4. Extract and return the result URL
	 *
	 * @param personImageUrl  Public URL of the person image
	 * @param garmentImageUrl Public URL of the garment image
	 * @param onProgress      Optional callback invoked on each poll cycle with queue info
	 * @returns               Public URL of the generated try-on image
	 */
	async generate(
		personImageUrl: string,
		garmentImageUrl: string,
		onProgress?: (status: {
			msg: string;
			rank?: number;
			rankEta?: number;
		}) => void,
	): Promise<string> {
		// Step 0: Health check
		await this.healthCheck();

		// Step 1: Join queue
		const eventId = await this.joinQueue(personImageUrl, garmentImageUrl);

		// Step 2: Poll until done
		const resultUrl = await this.pollUntilDone(eventId, onProgress);
		return resultUrl;
	}

	// ── Private Helpers ─────────────────────────────────────────────────────

	private async joinQueue(
		personImageUrl: string,
		garmentImageUrl: string,
	): Promise<string> {
		const sessionHash = randomUUID().replace(/-/g, "").substring(0, 11);
		const triggerId = Math.floor(Math.random() * 10_000);

		const payload = {
			data: [
				personImageUrl, // person image URL
				garmentImageUrl, // garment image URL
				true, // enable auto-masking
				true, // enable auto-resize
			],
			event_data: null,
			fn_index: 0,
			trigger_id: triggerId,
			session_hash: sessionHash,
		};

		this.logger.log(
			`Joining queue. session_hash=${sessionHash} trigger_id=${triggerId}`,
		);

		try {
			const res = await axios.post<BridgeJoinQueueResponse>(
				`${this.baseUrl}/trial/api/join_queue/`,
				payload,
				{
					headers: { "Content-Type": "application/json" },
					timeout: 15_000,
				},
			);

			const eventId = res.data?.event_id;
			if (!eventId) {
				this.logger.error(
					`join_queue response missing event_id: ${JSON.stringify(res.data)}`,
				);
				throw new InternalServerErrorException(
					"No event_id received from the try-on server.",
				);
			}

			this.logger.log(`Queue joined. event_id=${eventId}`);
			return eventId;
		} catch (err: unknown) {
			if (err instanceof InternalServerErrorException) throw err;
			const detail =
				(err as AxiosError)?.response?.data ?? (err as Error).message;
			this.logger.error(`join_queue error: ${JSON.stringify(detail)}`);
			throw new ServiceUnavailableException(
				"Could not connect to the Virtual Try-On service. Please try again later.",
			);
		}
	}

	private async pollUntilDone(
		eventId: string,
		onProgress?: (status: {
			msg: string;
			rank?: number;
			rankEta?: number;
		}) => void,
	): Promise<string> {
		const pollPayload = { event_id: eventId };

		this.logger.log(`Starting polling for event_id=${eventId}`);

		for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
			await this.delay(POLL_INTERVAL_MS);

			let pollData: BridgePollResponse;
			try {
				const res = await axios.post<BridgePollResponse>(
					`${this.baseUrl}/trial/api/queue_data/`,
					pollPayload,
					{
						headers: { "Content-Type": "application/json" },
						timeout: 10_000,
					},
				);
				pollData = res.data;
			} catch (err: unknown) {
				const detail =
					(err as AxiosError)?.response?.data ?? (err as Error).message;
				this.logger.warn(
					`Poll attempt ${attempt} failed: ${JSON.stringify(detail)}`,
				);
				continue; // Non-fatal — keep retrying
			}

			const msg = pollData?.msg ?? "";
			this.logger.log(
				`Poll ${attempt}/${MAX_POLL_ATTEMPTS} — msg=${msg}`,
			);

			// Notify caller of progress
			if (onProgress) {
				onProgress({
					msg,
					rank: pollData?.rank,
					rankEta: pollData?.rank_eta,
				});
			}

			switch (msg) {
				case "queue_full":
					throw new ServiceUnavailableException(
						"The try-on server is currently busy. Please try again in a moment.",
					);

				case "estimation":
				case "queue":
					this.logger.log(
						`Position in queue: ${pollData?.rank}, ETA: ${pollData?.rank_eta}s`,
					);
					continue;

				case "process_starts":
				case "process_generating":
					continue;

				case "process_completed": {
					const outputData =
						pollData?.output?.data ?? [];
					const resultUrl = this.extractResultUrl(outputData);

					if (resultUrl) {
						this.logger.log(
							`Processing complete. resultUrl=${resultUrl}`,
						);
						return resultUrl;
					}

					this.logger.error(
						`process_completed but no result URL found: ${JSON.stringify(outputData)}`,
					);
					throw new InternalServerErrorException(
						"Virtual Try-On completed but no output image was returned.",
					);
				}

				case "process_errored": {
					const serverErr = pollData?.error || "";
					this.logger.error(
						`Server reported process_errored: ${JSON.stringify(pollData)}`,
					);
					throw new InternalServerErrorException(
						serverErr
							? `Virtual Try-On failed: ${serverErr}`
							: "The Virtual Try-On model encountered an error. Please try again.",
					);
				}

				default:
					continue;
			}
		}

		throw new InternalServerErrorException(
			"Virtual Try-On timed out after 6 minutes. The server may be overloaded — please try again.",
		);
	}

	/**
	 * Extracts the first usable image URL from the Gradio-style output data array.
	 * Handles: plain string URL, { url: "..." } object, { path: "..." } object.
	 */
	private extractResultUrl(outputData: unknown): string | null {
		if (!outputData) return null;

		const arr: unknown[] = Array.isArray(outputData)
			? outputData
			: [outputData];

		for (const item of arr) {
			if (!item) continue;

			// Plain string URL
			if (
				typeof item === "string" &&
				(item.startsWith("http") || item.startsWith("/"))
			) {
				return item;
			}

			// { url: "..." } object
			if (
				typeof item === "object" &&
				item !== null &&
				"url" in item &&
				typeof (item as Record<string, unknown>).url === "string"
			) {
				return (item as Record<string, unknown>).url as string;
			}

			// { path: "..." } object (gradio file path)
			if (
				typeof item === "object" &&
				item !== null &&
				"path" in item &&
				typeof (item as Record<string, unknown>).path === "string"
			) {
				return (item as Record<string, unknown>).path as string;
			}
		}

		return null;
	}

	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
