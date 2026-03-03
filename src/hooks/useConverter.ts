import { useState, useCallback, useRef, useEffect } from "react";
import type { FileJob } from "@/types/job";

export type { FileJob };

export function useConverter(fileType?: "image" | "video") {
    const [files, setFiles] = useState<FileJob[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const uploadFiles = useCallback(async (fileList: FileList | File[]) => {
        setIsUploading(true);
        const formData = new FormData();
        const fileArray = Array.from(fileList);

        for (const file of fileArray) {
            formData.append("files", file);
        }

        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();

            if (data.files) {
                // Filter by type if fileType is specified
                const filtered = fileType
                    ? data.files.filter((f: any) => f.type === fileType)
                    : data.files;

                const newJobs: FileJob[] = filtered.map((f: any) => ({
                    id: f.id,
                    originalName: f.name,
                    type: f.type,
                    status: "uploading" as const,
                    progress: 0,
                    inputSize: f.size,
                }));

                setFiles((prev) => [...prev, ...newJobs]);

                // Start conversion immediately
                const ids = filtered.map((f: any) => f.id);
                if (ids.length > 0) {
                    await fetch("/api/convert", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ids }),
                    });
                }
            }
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    }, [fileType]);

    // Poll for status updates
    useEffect(() => {
        const activeIds = files
            .filter((f) => f.status !== "done" && f.status !== "error")
            .map((f) => f.id);

        if (activeIds.length === 0) {
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
            return;
        }

        if (pollRef.current) clearInterval(pollRef.current);

        pollRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/api/status?ids=${activeIds.join(",")}`);
                const data = await res.json();

                if (data.jobs) {
                    setFiles((prev) =>
                        prev.map((f) => {
                            const updated = data.jobs.find((j: FileJob) => j.id === f.id);
                            return updated ? { ...f, ...updated } : f;
                        })
                    );
                }
            } catch { }
        }, 800);

        return () => {
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        };
    }, [files]);

    const deleteFile = useCallback(async (id: string) => {
        try {
            await fetch(`/api/delete/${id}`, { method: "DELETE" });
            setFiles((prev) => prev.filter((f) => f.id !== id));
        } catch { }
    }, []);

    const clearAll = useCallback(async () => {
        try {
            await fetch("/api/clear", { method: "POST" });
            setFiles([]);
        } catch { }
    }, []);

    const downloadFile = useCallback((id: string) => {
        window.open(`/api/download/${id}`, "_blank");
    }, []);

    const downloadAll = useCallback(() => {
        const doneFiles = files.filter((f) => f.status === "done");
        for (const file of doneFiles) {
            // Stagger downloads
            setTimeout(() => {
                const a = document.createElement("a");
                a.href = `/api/download/${file.id}`;
                a.download = file.outputName || file.originalName;
                a.click();
            }, 200);
        }
    }, [files]);

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
