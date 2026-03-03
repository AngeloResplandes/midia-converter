import type React from "react";

/** Props for the LandingPage component. */
export interface LandingPageProps {
    onNavigate: (page: string) => void;
}

/** Props for the Navbar component. */
export interface NavbarProps {
    currentPage: string;
    onNavigate: (page: string) => void;
}

/**
 * Configuration object that drives the shared ConverterPage layout.
 * Pass a config with this shape to ImageConverter / VideoConverter.
 */
export interface ConverterConfig {
    /** Determines which useConverter hook filter is applied. */
    type: "image" | "video";
    /** Page heading. */
    title: string;
    /** Short subtitle shown under the heading (e.g. "JPG → WebP"). */
    subtitle: string;
    /** Lucide icon component rendered in the header and drop zone. */
    icon: React.ComponentType<{ className?: string }>;
    /** Accent color palette used throughout the page. */
    color: "purple" | "indigo";
    /** HTML accept attribute for the hidden file input. */
    accept: string;
    /** Text shown inside the drop zone listing supported formats. */
    formatHint: string;
    /** Drop zone label when NOT dragging. */
    dragMessage: string;
    /** Empty state primary message. */
    emptyMessage: string;
    /** Returns the "N items converting" label. */
    convertingLabel: (n: number) => string;
    /** Returns the "N items done" label. */
    doneLabel: (n: number) => string;
    /** Returns the download-all button suffix (e.g. "TODAS AS 5 IMAGENS"). */
    downloadLabel: (n: number) => string;
}

/** Props for the shared ConverterPage layout component. */
export interface ConverterPageProps {
    config: ConverterConfig;
    onNavigate: (page: string) => void;
}
