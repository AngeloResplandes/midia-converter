import { useState, useRef, useEffect } from "react";
import type { FileJob } from "@/types/job";
import {
    Download,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    FileImage,
    FileVideo,
    MoreHorizontal,
    Eye,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatReduction(input: number, output: number): string {
    return ((1 - output / input) * 100).toFixed(1);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FileTypeIcon({ type }: { type: "image" | "video" }) {
    if (type === "image") {
        return (
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <FileImage className="w-5 h-5 text-purple-400" />
            </div>
        );
    }
    return (
        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <FileVideo className="w-5 h-5 text-indigo-400" />
        </div>
    );
}

function FileStatusIcon({ status }: { status: FileJob["status"] }) {
    switch (status) {
        case "done":
            return <CheckCircle2 className="w-4 h-4 text-green-400" />;
        case "error":
            return <AlertCircle className="w-4 h-4 text-red-400" />;
        case "converting":
            return <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />;
        default:
            return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />;
    }
}

function ActionMenu({
    file,
    onDownload,
    onDelete,
}: {
    file: FileJob;
    onDownload: () => void;
    onDelete: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, right: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (
                !menuRef.current?.contains(e.target as Node) &&
                !triggerRef.current?.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const handleToggle = () => {
        if (!open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
        }
        setOpen((prev) => !prev);
    };

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                onClick={handleToggle}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
            >
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>

            {open && (
                <div
                    ref={menuRef}
                    style={{ top: pos.top, right: pos.right }}
                    className="fixed z-50 bg-[#16162a] border border-gray-700/50 rounded-xl shadow-xl py-1 min-w-35"
                >
                    {file.status === "done" && (
                        <>
                            {file.previewUrl && (
                                <button
                                    onClick={() => { window.open(file.previewUrl, "_blank"); setOpen(false); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-indigo-500/20 hover:text-white transition-colors cursor-pointer"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    Visualizar
                                </button>
                            )}
                            <button
                                onClick={() => { onDownload(); setOpen(false); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-purple-500/20 hover:text-white transition-colors cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Download
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => { onDelete(); setOpen(false); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Deletar
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── FileItem ─────────────────────────────────────────────────────────────────

export function FileItem({
    file,
    onDelete,
    onDownload,
}: {
    file: FileJob;
    onDelete: (id: string) => void;
    onDownload: (id: string) => void;
}) {
    const progressColor =
        file.status === "done" ? "bg-green-500"
            : file.status === "error" ? "bg-red-500"
                : "bg-purple-500";

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a2e]/50 hover:bg-[#1a1a2e]/80 transition-colors group">
            <FileTypeIcon type={file.type} />

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1 gap-2">
                    <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-gray-200 truncate">
                            {file.originalName}
                        </p>
                        {file.status === "done" && file.outputName && (
                            <p className="text-xs font-medium text-green-400 truncate mt-0.5">
                                ↳ {file.outputName}
                            </p>
                        )}
                    </div>
                    <div className="shrink-0 mt-0.5">
                        <FileStatusIcon status={file.status} />
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-gray-400">{formatBytes(file.inputSize)}</span>
                    {file.status === "done" && file.outputSize && (
                        <>
                            <span className="text-xs text-gray-500">→</span>
                            <span className="text-xs text-green-400">{formatBytes(file.outputSize)}</span>
                            <span className="text-xs text-green-400/70">
                                (-{formatReduction(file.inputSize, file.outputSize)}%)
                            </span>
                        </>
                    )}
                    {file.status === "error" && (
                        <span className="text-xs text-red-400 truncate">{file.error}</span>
                    )}
                    {(file.status === "converting" || file.status === "uploading") && file.progress > 0 && (
                        <span className="text-xs text-purple-400">{file.progress}%</span>
                    )}
                </div>

                <div className="w-full h-1.5 rounded-full bg-gray-700/50 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                        style={{ width: `${file.status === "done" ? 100 : file.progress}%` }}
                    />
                </div>
            </div>

            <ActionMenu
                file={file}
                onDownload={() => onDownload(file.id)}
                onDelete={() => onDelete(file.id)}
            />
        </div>
    );
}
