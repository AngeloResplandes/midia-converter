export type JobStatus = "uploading" | "converting" | "done" | "error";

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

export interface FileJob {
    id: string;
    originalName: string;
    type: "image" | "video";
    status: JobStatus;
    progress: number;
    inputSize: number;
    outputSize?: number;
    outputName?: string;
    downloadUrl?: string;
    previewUrl?: string;
    error?: string;
}
