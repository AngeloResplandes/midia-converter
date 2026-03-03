import {
    Image,
    Video,
    ArrowRight,
    FileImage,
    FileVideo,
    Sparkles,
} from "lucide-react";
import type { LandingPageProps } from "@/types/components";

export function LandingPage({ onNavigate }: LandingPageProps) {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden">
                {/* Left side - Hero */}
                <div className="relative w-full lg:w-[50%] bg-linear-to-br from-purple-700 via-purple-600 to-indigo-700 p-8 lg:p-16 flex flex-col justify-center min-h-screen">
                    {/* Animated background shapes */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl animate-float" />
                        <div className="absolute bottom-20 -left-20 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl animate-float-delayed" />
                        <div className="absolute top-1/2 right-10 w-48 h-48 bg-yellow-400/10 rounded-3xl rotate-12 blur-2xl animate-float-slow" />

                        {/* Geometric decorations */}
                        <div className="absolute top-24 right-24 w-28 h-28 border-2 border-white/10 rounded-2xl rotate-12 animate-spin-slow" />
                        <div className="absolute bottom-32 right-36 w-20 h-20 border-2 border-white/10 rounded-xl -rotate-6 animate-spin-slow-reverse" />
                        <div className="absolute top-32 left-24 w-3 h-3 bg-yellow-400 rounded-full animate-pulse-glow" />
                        <div className="absolute top-56 right-44 w-2 h-2 bg-pink-400 rounded-full animate-pulse-glow-delayed" />
                        <div className="absolute bottom-48 left-44 w-4 h-4 bg-green-400 rounded-full animate-pulse-glow" />
                        <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-blue-300 rounded-full animate-pulse-glow-delayed" />

                        {/* Floating squares */}
                        <div className="absolute top-[20%] right-[15%] w-6 h-6 border border-white/20 rotate-45 animate-float" />
                        <div className="absolute bottom-[30%] left-[10%] w-4 h-4 bg-white/10 rotate-12 animate-float-delayed" />
                        <div className="absolute top-[60%] right-[30%] w-8 h-8 border border-purple-300/20 rounded-lg rotate-[-15deg] animate-float-slow" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-lg">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-yellow-300" />
                                <span className="text-white/90 text-sm font-medium">Rápido &amp; Gratuito</span>
                            </div>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                            CONVERTA{" "}
                            <br className="hidden sm:block" />
                            SUAS{" "}
                            <span className="relative inline-block">
                                <span className="relative z-10 px-3 py-1">MÍDIAS</span>
                                <span className="absolute inset-0 bg-white/20 rounded-lg backdrop-blur-sm -skew-x-3" />
                            </span>
                            <br />
                            <span className="bg-linear-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                                DE FORMA FÁCIL
                            </span>
                        </h1>

                        <p className="text-white/60 text-lg max-w-md mb-10 leading-relaxed">
                            Suporta <strong className="text-white/80">JPG / PNG / GIF → WebP</strong> e{" "}
                            <strong className="text-white/80">MP4 / MOV / MKV / AVI / WEBM → H.264</strong> comprimido.
                            Máximo de 30 arquivos por vez.
                        </p>

                        {/* Format badges */}
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                                <Image className="w-4 h-4 text-purple-200" />
                                <span className="text-white/70 text-sm">Imagens → WebP</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                                <Video className="w-4 h-4 text-indigo-200" />
                                <span className="text-white/70 text-sm">Vídeos → H.264</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - CTA Cards */}
                <div className="flex-1 bg-[#0a0a1a] p-8 lg:p-16 flex flex-col justify-center">
                    <div className="max-w-lg mx-auto w-full space-y-5">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Escolha o tipo de conversão
                        </h2>
                        <p className="text-gray-500 text-sm mb-6">
                            Selecione abaixo para começar a converter seus arquivos
                        </p>

                        {/* Image Converter Card */}
                        <button
                            onClick={() => onNavigate("image")}
                            className="w-full group cursor-pointer"
                        >
                            <div className="relative p-6 rounded-2xl border border-purple-500/20 bg-linear-to-br from-purple-900/30 to-purple-800/10 hover:from-purple-900/50 hover:to-purple-700/20 hover:border-purple-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
                                <div className="flex items-start gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-purple-500 to-purple-700 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
                                        <FileImage className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                            Converter Imagens
                                            <ArrowRight className="w-4 h-4 text-purple-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-3">
                                            Converta suas imagens para o formato WebP com alta qualidade e menor tamanho
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {["JPG", "PNG", "GIF", "TIFF", "BMP", "AVIF"].map((fmt) => (
                                                <span key={fmt} className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 text-xs font-medium">
                                                    {fmt}
                                                </span>
                                            ))}
                                            <span className="px-2 py-0.5 rounded-md bg-green-500/15 text-green-300 text-xs font-medium">
                                                → WebP
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Video Converter Card */}
                        <button
                            onClick={() => onNavigate("video")}
                            className="w-full group cursor-pointer"
                        >
                            <div className="relative p-6 rounded-2xl border border-indigo-500/20 bg-linear-to-br from-indigo-900/30 to-indigo-800/10 hover:from-indigo-900/50 hover:to-indigo-700/20 hover:border-indigo-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1">
                                <div className="flex items-start gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                                        <FileVideo className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                            Comprimir Vídeos
                                            <ArrowRight className="w-4 h-4 text-indigo-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-3">
                                            Comprima seus vídeos com codec H.264 mantendo a qualidade visual
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {["MP4", "MOV", "MKV", "AVI", "WEBM"].map((fmt) => (
                                                <span key={fmt} className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 text-xs font-medium">
                                                    {fmt}
                                                </span>
                                            ))}
                                            <span className="px-2 py-0.5 rounded-md bg-green-500/15 text-green-300 text-xs font-medium">
                                                → H.264
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
