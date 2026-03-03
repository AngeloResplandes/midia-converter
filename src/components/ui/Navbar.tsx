import { Sparkles } from "lucide-react";
import type { NavbarProps } from "@/types/components";

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-3 sm:py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between backdrop-blur-xl bg-[#0a0a1a]/70 border border-white/10 rounded-2xl px-3 sm:px-6 py-2.5 sm:py-3 shadow-2xl shadow-purple-900/10">
                {/* Logo */}
                <button
                    onClick={() => onNavigate("")}
                    className="flex items-center gap-2.5 group cursor-pointer"
                >
                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-bold text-lg tracking-wide">
                        MÍDIA<span className="text-purple-400">CONV</span>
                    </span>
                </button>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-1">
                    <button
                        onClick={() => onNavigate("")}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${currentPage === ""
                            ? "bg-purple-500/20 text-purple-300"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        Início
                    </button>
                    <button
                        onClick={() => onNavigate("image")}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${currentPage === "image"
                            ? "bg-purple-500/20 text-purple-300"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        Imagens
                    </button>
                    <button
                        onClick={() => onNavigate("video")}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${currentPage === "video"
                            ? "bg-purple-500/20 text-purple-300"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        Vídeos
                    </button>
                </div>

                {/* Mobile menu */}
                <div className="flex md:hidden items-center gap-2">
                    <button
                        onClick={() => onNavigate("image")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${currentPage === "image"
                            ? "bg-purple-500/20 text-purple-300"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Imagens
                    </button>
                    <button
                        onClick={() => onNavigate("video")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${currentPage === "video"
                            ? "bg-purple-500/20 text-purple-300"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Vídeos
                    </button>
                </div>
            </div>
        </nav>
    );
}
