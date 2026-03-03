import { useState, useCallback, useRef } from "react";
import type { FileJob } from "@/types/job";

export type { FileJob };

// ─── Cloudinary helpers ───────────────────────────────────────────────────────

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

/**
 * Builds a Cloudinary transformation URL for download.
 * Images → WebP (quality 90).
 * Videos → H.264/MP4, capped at 1920×1080.
 */
function buildDownloadUrl(
    cloudName: string,
    publicId: string,
    resourceType: "image" | "video",
    outputName: string
): string {
    // fl_attachment requires an ASCII-safe filename
    const safeFilename = outputName.replace(/[^a-zA-Z0-9._-]/g, "_");

    if (resourceType === "image") {
        return `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_90,fl_attachment:${safeFilename}/${publicId}`;
    }
    return `https://res.cloudinary.com/${cloudName}/video/upload/vc_h264,q_auto:low,w_1920,h_1080,c_limit,fl_attachment:${safeFilename}/${publicId}.mp4`;
}

/**
 * Uploads a file directly to Cloudinary using XHR so progress can be tracked.
 */
function uploadToCloudinary(
    file: File,
    cloudName: string,
    uploadPreset: string,
    publicId: string,
    onProgress: (pct: number) => void
): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("public_id", publicId);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                // Cap at 95 % — last 5 % represents Cloudinary-side processing
                onProgress(Math.min(Math.round((e.loaded / e.total) * 95), 95));
            }
        };

        xhr.onload = () => {
            try {
                const data = JSON.parse(xhr.responseText) as CloudinaryUploadResult;
                if (xhr.status === 200) resolve(data);
                else reject(new Error(data.error?.message ?? `Erro no upload (${xhr.status})`));
            } catch {
                reject(new Error("Resposta inválida do Cloudinary"));
            }
        };

        xhr.onerror = () => reject(new Error("Erro de rede durante o upload"));

        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
        xhr.send(formData);
    });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useConverter(fileType?: "image" | "video") {
    const [files, setFiles] = useState<FileJob[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const configRef = useRef<CloudinaryConfig | null>(null);

    /** Fetches /api/config once and caches the result. */
    const getConfig = useCallback(async (): Promise<CloudinaryConfig> => {
        if (configRef.current) return configRef.current;
        const res = await fetch("/api/config");
        if (!res.ok) throw new Error("Não foi possível obter configuração do servidor");
        const cfg = (await res.json()) as CloudinaryConfig;
        if (!cfg.cloudName || !cfg.uploadPreset) {
            throw new Error("Cloudinary não configurado no servidor");
        }
        configRef.current = cfg;
        return cfg;
    }, []);

    const uploadFiles = useCallback(
        async (fileList: FileList | File[]) => {
            setIsUploading(true);

            // Collect valid files first
            const fileArray = Array.from(fileList).filter((file) => {
                const isImage = file.type.startsWith("image/");
                const isVideo = file.type.startsWith("video/");
                const type = isImage ? "image" : isVideo ? "video" : null;
                if (!type) return false;
                if (fileType && type !== fileType) return false;
                return true;
            });

            if (fileArray.length === 0) {
                setIsUploading(false);
                return;
            }

            // Add all files to the list immediately so the UI shows them right away
            const entries = fileArray.map((file) => {
                const isImage = file.type.startsWith("image/");
                return {
                    id: crypto.randomUUID(),
                    file,
                    type: (isImage ? "image" : "video") as "image" | "video",
                };
            });

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

            // Fetch config (after files are already visible in the list)
            let config: CloudinaryConfig;
            try {
                config = await getConfig();
            } catch (err) {
                // Mark all freshly added entries as error
                const ids = entries.map((e) => e.id);
                setFiles((prev) =>
                    prev.map((f) =>
                        ids.includes(f.id)
                            ? { ...f, status: "error", error: "Cloudinary não configurado" }
                            : f
                    )
                );
                console.error("Config error:", err);
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
                            (pct) => {
                                setFiles((prev) =>
                                    prev.map((f) => (f.id === id ? { ...f, progress: pct } : f))
                                );
                            }
                        );

                        const baseName =
                            file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
                        const outputName =
                            type === "image"
                                ? `${baseName}.webp`
                                : `${baseName}_compressed.mp4`;

                        const resourceType =
                            result.resource_type === "video" ? "video" : "image";

                        const downloadUrl = buildDownloadUrl(
                            config.cloudName,
                            result.public_id,
                            resourceType,
                            outputName
                        );

                        // Preview URL — same as download but without fl_attachment
                        const previewUrl =
                            resourceType === "image"
                                ? `https://res.cloudinary.com/${config.cloudName}/image/upload/f_webp,q_90/${result.public_id}`
                                : `https://res.cloudinary.com/${config.cloudName}/video/upload/vc_h264,q_auto:low,w_1920,h_1080,c_limit/${result.public_id}.mp4`;

                        setFiles((prev) =>
                            prev.map((f) =>
                                f.id === id
                                    ? { ...f, status: "done", progress: 100, outputName, downloadUrl, previewUrl }
                                    : f
                            )
                        );
                    } catch (err) {
                        setFiles((prev) =>
                            prev.map((f) =>
                                f.id === id
                                    ? { ...f, status: "error", error: String(err) }
                                    : f
                            )
                        );
                    }
                })
            );

            setIsUploading(false);
        },
        [fileType, getConfig]
    );

    const deleteFile = useCallback(async (id: string) => {
        // Remove from UI immediately, then clean up on Cloudinary
        setFiles((prev) => prev.filter((f) => f.id !== id));
        fetch(`/api/delete/${id}`, { method: "DELETE" }).catch(() => { });
    }, []);

    const clearAll = useCallback(async () => {
        const snapshot = [...files];
        setFiles([]);
        for (const file of snapshot) {
            fetch(`/api/delete/${file.id}`, { method: "DELETE" }).catch(() => { });
        }
    }, [files]);

    /** Fetches a cross-origin URL and triggers a real browser download via a blob. */
    const triggerDownload = useCallback(async (url: string, filename: string) => {
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
        } catch {
            // Fallback: open in new tab if fetch fails
            window.open(url, "_blank");
        }
    }, []);

    const downloadFile = useCallback(
        (id: string) => {
            const job = files.find((f) => f.id === id);
            if (!job?.downloadUrl) return;
            triggerDownload(job.downloadUrl, job.outputName ?? job.originalName);
        },
        [files, triggerDownload]
    );

    const downloadAll = useCallback(() => {
        const doneFiles = files.filter((f) => f.status === "done" && f.downloadUrl);
        doneFiles.forEach((file, i) => {
            setTimeout(() => {
                triggerDownload(file.downloadUrl!, file.outputName ?? file.originalName);
            }, i * 600);
        });
    }, [files, triggerDownload]);

    const convertingCount = files.filter(
        (f) => f.status === "converting" || f.status === "uploading"
    ).length;
    const doneCount = files.filter((f) => f.status === "done").length;
    const errorCount = files.filter((f) => f.status === "error").length;

    return {
        files,
        isUploading,
        uploadFiles,
        deleteFile,
        clearAll,
        downloadFile,
        downloadAll,
        convertingCount,
        doneCount,
        errorCount,
    };
}
