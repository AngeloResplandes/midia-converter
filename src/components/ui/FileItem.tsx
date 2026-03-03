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

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatReduction(inputSize: number, outputSize: number): string {
    return ((1 - outputSize / inputSize) * 100).toFixed(1);
}

export function FileItem({
    file,
    onDelete,
    onDownload,
}: {
    file: FileJob;
    onDelete: (id: string) => void;
    onDownload: (id: string) => void;
}) {
    const [showMenu, setShowMenu] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on outside click — no backdrop needed (backdrop blocks scroll)
    useEffect(() => {
        if (!showMenu) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node)
            ) {
                setShowMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showMenu]);

    const handleToggleMenu = () => {
        if (!showMenu && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setMenuPos({
                top: rect.bottom + 4,
                right: window.innerWidth - rect.right,
            });
        }
        setShowMenu((prev) => !prev);
    };

    const getStatusIcon = () => {
        switch (file.status) {
            case "done":
                return <CheckCircle2 className="w-4 h-4 text-green-400" />;
            case "error":
                return <AlertCircle className="w-4 h-4 text-red-400" />;
            case "converting":
                return <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />;
            default:
                return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />;
        }
    };

    const getFileIcon = () => {
        if (file.type === "image") {
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
    };

    const progressColor =
        file.status === "done"
            ? "bg-green-500"
            : file.status === "error"
                ? "bg-red-500"
                : "bg-purple-500";

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a2e]/50 hover:bg-[#1a1a2e]/80 transition-colors group">
            {getFileIcon()}

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-200 truncate pr-2">
                        {file.originalName}
                    </p>
                    {getStatusIcon()}
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-gray-400">
                        {formatBytes(file.inputSize)}
                    </span>
                    {file.status === "done" && file.outputSize && (
                        <>
                            <span className="text-xs text-gray-500">→</span>
                            <span className="text-xs text-green-400">
                                {formatBytes(file.outputSize)}
                            </span>
                            <span className="text-xs text-green-400/70">
                                (-{formatReduction(file.inputSize, file.outputSize)}%)
                            </span>
                        </>
                    )}
                    {file.status === "error" && (
                        <span className="text-xs text-red-400 truncate">{file.error}</span>
                    )}
                    {(file.status === "converting" || file.status === "uploading") && file.progress > 0 && (
                        <span className="text-xs text-purple-400">
                            {file.progress}%
                        </span>
                    )}
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-gray-700/50 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                        style={{ width: `${file.status === "done" ? 100 : file.progress}%` }}
                    />
                </div>
            </div>

            {/* Action menu */}
            <div className="relative">
                <button
                    ref={triggerRef}
                    onClick={handleToggleMenu}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>

                {/* Dropdown: fixed position avoids overflow clipping and removes scroll-blocking backdrop */}
                {showMenu && (
                    <div
                        ref={menuRef}
                        style={{ top: menuPos.top, right: menuPos.right }}
                        className="fixed z-50 bg-[#16162a] border border-gray-700/50 rounded-xl shadow-xl py-1 min-w-35"
                    >
                        {file.status === "done" && (
                            <>
                                {file.previewUrl && (
                                    <button
                                        onClick={() => { window.open(file.previewUrl, "_blank"); setShowMenu(false); }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-indigo-500/20 hover:text-white transition-colors cursor-pointer"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Visualizar
                                    </button>
                                )}
                                <button
                                    onClick={() => { onDownload(file.id); setShowMenu(false); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-purple-500/20 hover:text-white transition-colors cursor-pointer"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Download
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => { onDelete(file.id); setShowMenu(false); }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Deletar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
