import { FileImage } from "lucide-react";
import { ConverterPage } from "@/components/converters/ConverterPage";
import type { ConverterConfig } from "@/types/components";

const config: ConverterConfig = {
    type: "image",
    title: "Converter Imagens",
    subtitle: "JPG, PNG, GIF, TIFF, BMP, AVIF → WebP",
    icon: FileImage,
    color: "purple",
    accept: "image/jpeg,image/png,image/gif,image/tiff,image/bmp,image/avif",
    formatHint: "JPG, JPEG, PNG, GIF, TIFF, BMP, AVIF",
    dragMessage: "Arraste e solte suas imagens aqui",
    emptyMessage: "Nenhuma imagem adicionada ainda",
    convertingLabel: (n) => `${n} ${n === 1 ? "imagem sendo convertida" : "imagens sendo convertidas"}`,
    doneLabel: (n) => `${n} ${n === 1 ? "imagem convertida" : "imagens convertidas"}`,
    downloadLabel: (n) => n > 1 ? `TODAS AS ${n} IMAGENS` : "IMAGEM",
};

export function ImageConverter({ onNavigate }: { onNavigate: (page: string) => void }) {
    return <ConverterPage config={config} onNavigate={onNavigate} />;
}
