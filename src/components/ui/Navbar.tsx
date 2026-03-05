import faviconUrl from "@/assets/favicon.svg";
import type { NavbarProps } from "@/types/components";

// ─── NavButton ────────────────────────────────────────────────────────────────

function NavButton({
    label,
    page,
    currentPage,
    onClick,
    size = "default",
}: {
    label: string;
    page: string;
    currentPage: string;
    onClick: () => void;
    size?: "default" | "sm";
}) {
    const isActive = currentPage === page;

    if (size === "sm") {
        return (
            <button
                onClick={onClick}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${isActive ? "bg-purple-500/20 text-purple-300" : "text-gray-400 hover:text-white"
                    }`}
            >
                {label}
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${isActive ? "bg-purple-500/20 text-purple-300" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
        >
            {label}
        </button>
    );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-3 sm:py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between backdrop-blur-xl bg-[#0a0a1a]/70 border border-white/10 rounded-2xl px-3 sm:px-6 py-2.5 sm:py-3 shadow-2xl shadow-purple-900/10">
                <button
                    onClick={() => onNavigate("")}
                    className="flex items-center gap-2.5 group cursor-pointer"
                >
                    <img src={faviconUrl} alt="MídiaConv" className="w-9 h-9" />
                    <span className="text-white font-bold text-lg tracking-wide">
                        MÍDIA<span className="text-purple-400">CONV</span>
                    </span>
                </button>

                <div className="hidden md:flex items-center gap-1">
                    <NavButton label="Início" page="" currentPage={currentPage} onClick={() => onNavigate("")} />
                    <NavButton label="Imagens" page="image" currentPage={currentPage} onClick={() => onNavigate("image")} />
                    <NavButton label="Vídeos" page="video" currentPage={currentPage} onClick={() => onNavigate("video")} />
                </div>

                <div className="flex md:hidden items-center gap-2">
                    <NavButton label="Imagens" page="image" currentPage={currentPage} onClick={() => onNavigate("image")} size="sm" />
                    <NavButton label="Vídeos" page="video" currentPage={currentPage} onClick={() => onNavigate("video")} size="sm" />
                </div>
            </div>
        </nav>
    );
}
