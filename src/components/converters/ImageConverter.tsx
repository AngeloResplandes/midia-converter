import { ConverterPage } from "@/components/converters/ConverterPage";
import { config } from "@/services/imageConverter";

export function ImageConverter({ onNavigate }: { onNavigate: (page: string) => void }) {
    return <ConverterPage config={config} onNavigate={onNavigate} />;
}
