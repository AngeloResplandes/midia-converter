import { ConverterPage } from "@/components/converters/ConverterPage";
import { config } from "@/services/videoConverter";

export function VideoConverter({ onNavigate }: { onNavigate: (page: string) => void }) {
    return <ConverterPage config={config} onNavigate={onNavigate} />;
}
