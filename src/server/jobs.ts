/**
 * In-memory job store and shared server helpers.
 * Extracted from index.ts to keep the server entry-point focused on routing.
 */

import type { Job } from "@/types/job";

export type { Job };
export { type JobStatus } from "@/types/job";

// ─── Job store ───────────────────────────────────────────────────────────────
// Output buffers live here until the user downloads or deletes them.
// No files are ever written to the project directory.

export const jobs = new Map<string, Job>();

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Shorthand for a typed JSON response. */
export const json = (data: unknown, status = 200) =>
    Response.json(data, { status });

/** Returns the job without the internal outputBuffer (safe to send to client). */
export const toPublic = (job: Job) => ({
    id: job.id,
    originalName: job.originalName,
    type: job.type,
    status: job.status,
    progress: job.progress,
    inputSize: job.inputSize,
    outputSize: job.outputSize,
    outputName: job.outputName,
    error: job.error,
});

/**
 * Builds a Content-Disposition header value safe for HTTP.
 * Non-ASCII chars (é, ã, ç …) are encoded per RFC 5987.
 */
export function contentDisposition(
    type: "attachment" | "inline",
    filename: string
): string {
    const ascii = filename.replace(/[^\x00-\x7F]/g, "_");
    const encoded = encodeURIComponent(filename).replace(/'/g, "%27");
    return `${type}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}
