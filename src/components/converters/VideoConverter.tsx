import { FileVideo } from "lucide-react";
import { ConverterPage } from "@/components/converters/ConverterPage";
import type { ConverterConfig } from "@/types/components";

const config: ConverterConfig = {
    type: "video",
    title: "Comprimir Vídeos",
    subtitle: "MP4, MOV, MKV, AVI, WEBM → H.264",
    icon: FileVideo,
    color: "indigo",
    accept: "video/mp4,video/quicktime,video/x-matroska,video/avi,video/webm",
    formatHint: "MP4, MOV, MKV, AVI, WEBM",
    dragMessage: "Arraste e solte seus vídeos aqui",
    emptyMessage: "Nenhum vídeo adicionado ainda",
    convertingLabel: (n) => `${n} ${n === 1 ? "vídeo sendo comprimido" : "vídeos sendo comprimidos"}`,
    doneLabel: (n) => `${n} ${n === 1 ? "vídeo comprimido" : "vídeos comprimidos"}`,
    downloadLabel: (n) => n > 1 ? `TODOS OS ${n} VÍDEOS` : "VÍDEO",
};

export function VideoConverter({ onNavigate }: { onNavigate: (page: string) => void }) {
    return <ConverterPage config={config} onNavigate={onNavigate} />;
}
