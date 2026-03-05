import { useState, useCallback, useRef } from "react";
import type { FileJob } from "@/types/job";

export type { FileJob };

const CHUNK_SIZE = 50 * 1024 * 1024;       // 50 MB per chunk
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;  // 100 MB unsigned upload limit
const CHUNK_TIMEOUT = 300_000;             // 5 min per chunk

interface CloudinaryConfig {
    cloudName: string;
    uploadPreset: string;
}

interface CloudinaryUploadResult {
    public_id: string;
    resource_type: "image" | "video" | "raw";
    original_filename: string;
    bytes: number;
    error?: { message: string };
}

type ResourceType = "image" | "video";

function buildDownloadUrl(publicId: string, resourceType: ResourceType, outputName: string): string {
    const params = new URLSearchParams({ publicId, type: resourceType, filename: outputName });
    return `/api/download?${params.toString()}`;
}

function buildPreviewUrl(cloudName: string, publicId: string, resourceType: ResourceType): string {
    return resourceType === "image"
        ? `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_90/${publicId}`
        : `https://res.cloudinary.com/${cloudName}/video/upload/vc_h264,q_auto:low,w_1920,h_1080,c_limit/${publicId}.mp4`;
}

function buildOutputName(originalName: string, type: ResourceType): string {
    const base = originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
    return type === "image" ? `${base}.webp` : `${base}_compressed.mp4`;
}

function sendChunk(
    chunk: Blob,
    start: number,
    total: number,
    formDataBase: FormData,
    uploadUrl: string,
    uniqueUploadId: string,
    onProgress: (loaded: number) => void
): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.timeout = CHUNK_TIMEOUT;

        const fd = new FormData();
        for (const [key, value] of formDataBase.entries()) fd.append(key, value);
        fd.append("file", chunk);

        xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded); };

        xhr.onload = () => {
            try {
                const data = JSON.parse(xhr.responseText) as CloudinaryUploadResult;
                if (xhr.status === 200 || xhr.status === 308) {
                    resolve(data);
                } else {
                    const msg = data.error?.message ?? `Cloudinary ${xhr.status}`;
                    console.error("[upload] chunk rejeitado:", msg);
                    reject(new Error(msg));
                }
            } catch {
                reject(new Error("Resposta inválida do Cloudinary"));
            }
        };

        xhr.onerror = () => reject(new Error(`Erro de rede no upload (bytes ${start}–${start + chunk.size - 1})`));
        xhr.ontimeout = () => reject(new Error("Tempo limite excedido durante o upload"));
        xhr.onabort = () => reject(new Error("Upload cancelado"));

        xhr.open("POST", uploadUrl);

        if (total > CHUNK_SIZE) {
            xhr.setRequestHeader("X-Unique-Upload-Id", uniqueUploadId);
            xhr.setRequestHeader("Content-Range", `bytes ${start}-${start + chunk.size - 1}/${total}`);
        }

        xhr.send(fd);
    });
}

async function uploadToCloudinary(
    file: File,
    cloudName: string,
    uploadPreset: string,
    publicId: string,
    onProgress: (pct: number) => void
): Promise<CloudinaryUploadResult> {
    if (!cloudName) throw new Error("cloudName ausente — verifique as variáveis de ambiente");

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
    const uploadId = crypto.randomUUID();
    const totalSize = file.size;
    const chunkCount = Math.ceil(totalSize / CHUNK_SIZE);
    const bytesPerChunk = new Array<number>(chunkCount).fill(0);

    const fd = new FormData();
    fd.append("upload_preset", uploadPreset);
    fd.append("public_id", publicId);

    let lastResult!: CloudinaryUploadResult;

    for (let i = 0; i < chunkCount; i++) {
        const start = i * CHUNK_SIZE;
        const chunk = file.slice(start, start + CHUNK_SIZE);

        lastResult = await sendChunk(chunk, start, totalSize, fd, uploadUrl, uploadId, (loaded) => {
            bytesPerChunk[i] = loaded;
            const totalLoaded = bytesPerChunk.reduce((a, b) => a + b, 0);
            onProgress(Math.min(Math.round((totalLoaded / totalSize) * 95), 95));
        });
    }

    return lastResult;
}

async function fetchConfig(): Promise<CloudinaryConfig> {
    const res = await fetch("/api/config");
    if (!res.ok) throw new Error("Não foi possível obter configuração do servidor");
    const cfg = (await res.json()) as CloudinaryConfig;
    if (!cfg.cloudName || !cfg.uploadPreset) throw new Error("Cloudinary não configurado no servidor");
    return cfg;
}

async function fetchOutputSize(publicId: string, resourceType: ResourceType): Promise<number | undefined> {
    try {
        const params = new URLSearchParams({ publicId, type: resourceType });
        const res = await fetch(`/api/filesize?${params.toString()}`);
        if (!res.ok) return undefined;
        const { bytes } = (await res.json()) as { bytes?: number };
        return bytes ?? undefined;
    } catch {
        return undefined;
    }
}

function triggerBlobDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function useConverter(fileType?: ResourceType) {
    const [files, setFiles] = useState<FileJob[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const configRef = useRef<CloudinaryConfig | null>(null);

    const getConfig = useCallback(async (): Promise<CloudinaryConfig> => {
        if (!configRef.current) configRef.current = await fetchConfig();
        return configRef.current;
    }, []);

    const updateFile = useCallback((id: string, patch: Partial<FileJob>) => {
        setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    }, []);

    const uploadFiles = useCallback(async (fileList: FileList | File[]) => {
        setIsUploading(true);

        const oversized: { name: string; size: number }[] = [];
        const valid = Array.from(fileList).filter((file) => {
            const isImage = file.type.startsWith("image/");
            const isVideo = file.type.startsWith("video/");
            const type: ResourceType | null = isImage ? "image" : isVideo ? "video" : null;
            if (!type || (fileType && type !== fileType)) return false;
            if (type === "video" && file.size > MAX_VIDEO_SIZE) {
                oversized.push({ name: file.name, size: file.size });
                return false;
            }
            return true;
        });

        if (oversized.length > 0) {
            setFiles((prev) => [
                ...prev,
                ...oversized.map(({ name, size }) => ({
                    id: crypto.randomUUID(),
                    originalName: name,
                    type: "video" as const,
                    status: "error" as const,
                    progress: 0,
                    inputSize: size,
                    error: "Arquivo muito grande. O limite para vídeos é 100 MB.",
                })),
            ]);
        }

        if (valid.length === 0) {
            setIsUploading(false);
            return;
        }

        const entries = valid.map((file) => ({
            id: crypto.randomUUID(),
            file,
            type: (file.type.startsWith("image/") ? "image" : "video") as ResourceType,
        }));

        setFiles((prev) => [
            ...prev,
            ...entries.map(({ id, file, type }) => ({
                id,
                originalName: file.name,
                type,
                status: "uploading" as const,
                progress: 0,
                inputSize: file.size,
            })),
        ]);

        let config: CloudinaryConfig;
        try {
            config = await getConfig();
        } catch (err) {
            const ids = entries.map((e) => e.id as string);
            setFiles((prev) =>
                prev.map((f) =>
                    ids.includes(f.id) ? { ...f, status: "error", error: "Cloudinary não configurado" } : f
                )
            );
            console.error("[useConverter] config error:", err);
            setIsUploading(false);
            return;
        }

        await Promise.all(
            entries.map(async ({ id, file, type }) => {
                try {
                    const result = await uploadToCloudinary(
                        file,
                        config.cloudName,
                        config.uploadPreset,
                        id,
                        (pct) => updateFile(id, {
                            progress: pct,
                            status: pct >= 95 ? "converting" : "uploading",
                        })
                    );

                    const resourceType: ResourceType = result.resource_type === "video" ? "video" : "image";
                    const outputName = buildOutputName(file.name, type);
                    const downloadUrl = buildDownloadUrl(result.public_id, resourceType, outputName);
                    const previewUrl = buildPreviewUrl(config.cloudName, result.public_id, resourceType);
                    const outputSize = await fetchOutputSize(result.public_id, resourceType);

                    updateFile(id, { status: "done", progress: 100, outputName, outputSize, downloadUrl, previewUrl });
                } catch (err) {
                    updateFile(id, { status: "error", error: String(err) });
                }
            })
        );

        setIsUploading(false);
    }, [fileType, getConfig, updateFile]);

    const deleteFile = useCallback((id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        fetch(`/api/delete/${id}`, { method: "DELETE" }).catch(() => { });
    }, []);

    const clearAll = useCallback(() => {
        const snapshot = [...files];
        setFiles([]);
        snapshot.forEach(({ id }) => fetch(`/api/delete/${id}`, { method: "DELETE" }).catch(() => { }));
    }, [files]);

    const triggerDownload = useCallback((url: string, filename: string) => {
        fetch(url)
            .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.blob(); })
            .then((blob) => triggerBlobDownload(blob, filename))
            .catch((err) => console.error("[download] erro:", err));
    }, []);

    const downloadFile = useCallback((id: string) => {
        const job = files.find((f) => f.id === id);
        if (job?.downloadUrl) triggerDownload(job.downloadUrl, job.outputName ?? job.originalName);
    }, [files, triggerDownload]);

    const downloadAll = useCallback(() => {
        const done = files.filter((f) => f.status === "done" && f.downloadUrl);
        if (done.length === 0) return;

        if (done.length === 1) {
            const [file] = done;
            triggerDownload(file!.downloadUrl!, file!.outputName ?? file!.originalName);
            return;
        }

        fetch("/api/download-zip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                files: done.map((f) => ({ publicId: f.id, type: f.type, filename: f.outputName ?? f.originalName })),
            }),
        })
            .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.blob(); })
            .then((blob) => triggerBlobDownload(blob, "convertidos.zip"))
            .catch((err) => console.error("[downloadAll] erro ao gerar ZIP:", err));
    }, [files, triggerDownload]);

    const convertingCount = files.filter((f) => f.status === "uploading" || f.status === "converting").length;
    const doneCount = files.filter((f) => f.status === "done").length;
    const errorCount = files.filter((f) => f.status === "error").length;

    return { files, isUploading, uploadFiles, deleteFile, clearAll, downloadFile, downloadAll, convertingCount, doneCount, errorCount };
}
