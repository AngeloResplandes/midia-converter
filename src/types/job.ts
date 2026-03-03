/**
 * Shared job types — used by both the server (index.ts / jobs.ts)
 * and the frontend hook (useConverter.ts).
 */

export type JobStatus = "uploading" | "converting" | "done" | "error";

/** Server-side job — includes the raw output buffer (never sent to client). */
export interface Job {
    id: string;
    originalName: string;
    type: "image" | "video";
    status: JobStatus;
    progress: number;
    inputSize: number;
    outputSize?: number;
    outputName?: string;
    outputBuffer?: Buffer;
    error?: string;
}

/** Frontend-facing job — no buffer, safe to store in React state. */
export interface FileJob {
    id: string;
    originalName: string;
    type: "image" | "video";
    status: JobStatus;
    progress: number;
    inputSize: number;
    outputSize?: number;
    outputName?: string;
    /** Direct Cloudinary transformation URL for download (with fl_attachment). */
    downloadUrl?: string;
    /** Direct Cloudinary transformation URL for inline preview. */
    previewUrl?: string;
    error?: string;
}
