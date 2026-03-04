import type { Job } from "@/types/job";

export type { Job };
export { type JobStatus } from "@/types/job";

export const jobs = new Map<string, Job>();

export const json = (data: unknown, status = 200) =>
    Response.json(data, { status });

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

export function contentDisposition(
    type: "attachment" | "inline",
    filename: string
): string {
    const ascii = filename.replace(/[^\x00-\x7F]/g, "_");
    const encoded = encodeURIComponent(filename).replace(/'/g, "%27");
    return `${type}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}
