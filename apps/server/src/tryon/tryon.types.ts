/**
 * Virtual Try-On — Shared Types & Constants
 *
 * Centralises all queue names, job payloads, WebSocket event names,
 * and status enums used across the try-on module.
 */

// ── BullMQ ────────────────────────────────────────────────────────────────────

/** Name of the BullMQ queue that processes try-on jobs. */
export const TRYON_QUEUE = "virtual-try-on";

/** Name of the single job type inside the queue. */
export const TRYON_JOB = "process-tryon";

/** Payload stored in the BullMQ job. */
export interface TryOnJobPayload {
  /** Prisma VirtualTryOnSession._id */
  sessionId: string;

  /** Public Cloudinary URL of the person image */
  personImageUrl: string;

  /** Public URL of the garment image */
  garmentImageUrl: string;

  /** Garment type hint (upper | lower | overall) */
  clothType: string;
}

// ── Socket.io Events ──────────────────────────────────────────────────────────

/**
 * Socket.io events emitted by the SERVER to the CLIENT.
 *
 * The client must join the session room via `TRYON_JOIN_SESSION` before
 * it will receive any of these events.
 */
export const TRYON_EVENTS = {
  /** Client requests: join the session room for live status updates. */
  JOIN_SESSION: "tryon:join_session",

  /** Server emits: job was accepted and queued in BullMQ. */
  QUEUED: "tryon:queued",

  /** Server emits: Python bridge accepted the request; inference running. */
  RUNNING: "tryon:running",

  /** Server emits: try-on finished successfully; includes resultUrl. */
  COMPLETED: "tryon:completed",

  /** Server emits: an error occurred; includes an error message. */
  FAILED: "tryon:failed",

  /** Server emits: intermediate position-in-queue / ETA update. */
  PROGRESS: "tryon:progress",
} as const;

// ── Internal event (EventEmitter) ─────────────────────────────────────────────

/**
 * Internal NestJS EventEmitter event key.
 * Fired by the BullMQ processor once a session is updated so the Gateway
 * can push the change over WebSocket without coupling to BullMQ directly.
 */
export const TRYON_SESSION_UPDATED_EVENT = "tryon.session.updated";

export interface TryOnSessionUpdatedPayload {
  sessionId: string;
  status: "queued" | "running" | "completed" | "failed";
  resultUrl?: string;
  errorMessage?: string;
  /** Optional ETA / rank info from the Python bridge */
  progress?: { rank?: number; rankEta?: number; msg?: string };
}

// ── Python Bridge API types ───────────────────────────────────────────────────

/** Response from POST /trial/api/join_queue/ */
export interface BridgeJoinQueueResponse {
  event_id: string;
}

/** Response from POST /trial/api/queue_data/ */
export interface BridgePollResponse {
  msg:
    | "estimation"
    | "queue"
    | "process_starts"
    | "process_generating"
    | "process_completed"
    | "process_errored"
    | "queue_full"
    | string;
  rank?: number;
  rank_eta?: number;
  output?: {
    data?: unknown[];
  };
  error?: string;
}
