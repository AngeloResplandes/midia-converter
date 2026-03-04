import type React from "react";

export interface LandingPageProps {
    onNavigate: (page: string) => void;
}

export interface NavbarProps {
    currentPage: string;
    onNavigate: (page: string) => void;
}

export interface ConverterConfig {
    type: "image" | "video";
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    color: "purple" | "indigo";
    accept: string;
    formatHint: string;
    dragMessage: string;
    emptyMessage: string;
    convertingLabel: (n: number) => string;
    doneLabel: (n: number) => string;
    downloadLabel: (n: number) => string;
}

export interface ConverterPageProps {
    config: ConverterConfig;
    onNavigate: (page: string) => void;
}
