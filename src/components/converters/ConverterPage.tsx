import { useCallback, useRef, useState } from "react";
import { useConverter } from "@/hooks/useConverter";
import { FileItem } from "@/components/ui/FileItem";
import { Upload, Download, X, Loader2, ArrowLeft, Archive } from "lucide-react";
import type { ConverterPageProps } from "@/types/components";
import {
    dropZone,
    statusColors,
    headerIcon,
    downloadBtn,
    emptyState
} from "@/services/converterPage";

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
        <div className="min-h-screen lg:h-screen bg-[#0a0a1a] flex flex-col lg:overflow-hidden pt-16 lg:pt-20">
            <div className="flex flex-col flex-1 min-h-0 max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 lg:py-6">

                <div className="flex items-center justify-between mb-3 lg:mb-6 shrink-0">
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

                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 lg:min-h-0">
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
              lg:w-[42%] min-h-37.5 lg:min-h-0 shrink-0 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
              flex flex-col items-center justify-center gap-4 px-6 py-6 lg:py-0
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
                            <p className="hidden sm:block text-gray-500 text-sm mt-1">{formatHint}</p>
                            {type === "video" && (
                                <p className="text-yellow-500/70 text-xs mt-2 font-medium">
                                    Tamanho máximo: 100 MB por arquivo
                                </p>
                            )}
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

                    <div className="flex-1 flex flex-col min-h-75 lg:min-h-0">
                        {files.length > 0 ? (
                            <div className="flex flex-col h-full min-h-0 gap-3">

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

                                {doneCount > 0 && (
                                    <button
                                        onClick={downloadAll}
                                        className={`shrink-0 w-full py-4 rounded-2xl text-white font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${downloadBtn[color]}`}
                                    >
                                        {doneCount > 1
                                            ? <><Archive className="w-5 h-5" /> BAIXAR .ZIP {downloadLabel(doneCount)}</>
                                            : <><Download className="w-5 h-5" /> DOWNLOAD {downloadLabel(doneCount)}</>}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center rounded-2xl border border-dashed border-gray-700/40 bg-[#12122a]/20">
                                <div className="text-center">
                                    <div className={`w-20 h-20 rounded-3xl ${es.bg} flex items-center justify-center mx-auto mb-4`}>
                                        <Icon className={`w-10 h-10 ${es.icon}`} />
                                    </div>
                                    <p className="text-gray-500 text-sm">{emptyMessage}</p>
                                    <p className="text-gray-600 text-xs mt-1">Selecione ou arraste arquivos</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
