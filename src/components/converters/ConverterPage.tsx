import { useCallback, useRef, useState } from "react";
import { useConverter } from "@/hooks/useConverter";
import { FileItem } from "@/components/ui/FileItem";
import { Upload, Download, X, Loader2, ArrowLeft } from "lucide-react";
import type { ConverterPageProps } from "@/types/components";

// ─── Static color maps (must stay as literals for Tailwind to include them) ──

const dropZone = {
    purple: {
        dragging: "border-purple-400 bg-purple-500/10 scale-[1.02]",
        idle: "border-gray-600/50 bg-[#12122a]/50 hover:border-purple-500/50 hover:bg-[#12122a]/80",
        iconDragging: "bg-purple-500/30",
        iconIdle: "bg-purple-500/10",
        uploadDragging: "text-purple-400",
        uploadIdle: "text-purple-500/60",
    },
    indigo: {
        dragging: "border-indigo-400 bg-indigo-500/10 scale-[1.02]",
        idle: "border-gray-600/50 bg-[#12122a]/50 hover:border-indigo-500/50 hover:bg-[#12122a]/80",
        iconDragging: "bg-indigo-500/30",
        iconIdle: "bg-indigo-500/10",
        uploadDragging: "text-indigo-400",
        uploadIdle: "text-indigo-500/60",
    },
};

const statusColors = {
    purple: { text: "text-purple-400", dot: "bg-purple-400" },
    indigo: { text: "text-indigo-400", dot: "bg-indigo-400" },
};

const headerIcon = {
    purple: "bg-linear-to-br from-purple-500 to-purple-700 shadow-purple-500/20",
    indigo: "bg-linear-to-br from-indigo-500 to-indigo-700 shadow-indigo-500/20",
};

const downloadBtn = {
    purple:
        "bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/20 hover:shadow-purple-500/40",
    indigo:
        "bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/20 hover:shadow-indigo-500/40",
};

const emptyState = {
    purple: { bg: "bg-purple-500/10", icon: "text-purple-500/40" },
    indigo: { bg: "bg-indigo-500/10", icon: "text-indigo-500/40" },
};

// ─── Shared converter page layout ─────────────────────────────────────────────

export function ConverterPage({ config, onNavigate }: ConverterPageProps) {
    const { type, title, subtitle, icon: Icon, color, accept, formatHint,
        dragMessage, emptyMessage, convertingLabel, doneLabel, downloadLabel } = config;

    const {
        files, uploadFiles, deleteFile, clearAll,
        downloadFile, downloadAll, convertingCount, doneCount,
    } = useConverter(type);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
    }, [uploadFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            uploadFiles(e.target.files);
            e.target.value = "";
        }
    }, [uploadFiles]);

    const dz = dropZone[color];
    const sc = statusColors[color];
    const es = emptyState[color];

    return (
        <div className="h-screen bg-[#0a0a1a] flex flex-col overflow-hidden pt-20">
            <div className="flex flex-col flex-1 min-h-0 max-w-6xl mx-auto w-full px-6 py-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onNavigate("")}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer group"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${headerIcon[color]}`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">{title}</h1>
                                <p className="text-gray-500 text-xs">{subtitle}</p>
                            </div>
                        </div>
                    </div>
                    {files.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                            Limpar tudo
                        </button>
                    )}
                </div>

                {/* Side-by-side layout */}
                <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

                    {/* Left — Drop zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
              lg:w-[42%] shrink-0 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
              flex flex-col items-center justify-center gap-4 px-6
              ${isDragging ? dz.dragging : dz.idle}
            `}
                    >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? dz.iconDragging : dz.iconIdle}`}>
                            <Upload className={`w-8 h-8 ${isDragging ? dz.uploadDragging : dz.uploadIdle}`} />
                        </div>
                        <div className="text-center">
                            <p className="text-gray-300 font-medium">
                                {isDragging ? "Solte os arquivos aqui" : dragMessage}
                            </p>
                            <p className="text-gray-500 text-sm mt-1">{formatHint}</p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={accept}
                            onChange={handleFileInput}
                            className="hidden"
                        />
                    </div>

                    {/* Right — File list or empty state */}
                    <div className="flex-1 flex flex-col min-h-0">
                        {files.length > 0 ? (
                            <div className="flex flex-col h-full min-h-0 gap-3">

                                {/* Status bar */}
                                <div className="flex items-center justify-between px-1 shrink-0">
                                    <div className="flex items-center gap-2">
                                        {convertingCount > 0 && (
                                            <div className={`flex items-center gap-2 text-sm ${sc.text}`}>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                <span>{convertingLabel(convertingCount)}</span>
                                                <span className="inline-flex gap-0.5">
                                                    <span className={`w-1 h-1 rounded-full ${sc.dot} animate-bounce`} style={{ animationDelay: "0ms" }} />
                                                    <span className={`w-1 h-1 rounded-full ${sc.dot} animate-bounce`} style={{ animationDelay: "150ms" }} />
                                                    <span className={`w-1 h-1 rounded-full ${sc.dot} animate-bounce`} style={{ animationDelay: "300ms" }} />
                                                </span>
                                            </div>
                                        )}
                                        {convertingCount === 0 && doneCount > 0 && (
                                            <span className="text-sm text-green-400">{doneLabel(doneCount)}</span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {files.length} {files.length === 1 ? "arquivo" : "arquivos"}
                                    </span>
                                </div>

                                {/* Scrollable file list */}
                                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-0">
                                    {files.map((file) => (
                                        <FileItem
                                            key={file.id}
                                            file={file}
                                            onDelete={deleteFile}
                                            onDownload={downloadFile}
                                        />
                                    ))}
                                </div>

                                {/* Download all */}
                                {doneCount > 0 && (
                                    <button
                                        onClick={downloadAll}
                                        className={`shrink-0 w-full py-4 rounded-2xl text-white font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${downloadBtn[color]}`}
                                    >
                                        <Download className="w-5 h-5" />
                                        DOWNLOAD {downloadLabel(doneCount)}
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* Empty state */
                            <div className="flex-1 flex items-center justify-center rounded-2xl border border-dashed border-gray-700/40 bg-[#12122a]/20">
                                <div className="text-center">
                                    <div className={`w-20 h-20 rounded-3xl ${es.bg} flex items-center justify-center mx-auto mb-4`}>
                                        <Icon className={`w-10 h-10 ${es.icon}`} />
                                    </div>
                                    <p className="text-gray-500 text-sm">{emptyMessage}</p>
                                    <p className="text-gray-600 text-xs mt-1">Selecione ou arraste arquivos ao lado</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
