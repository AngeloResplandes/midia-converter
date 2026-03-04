export const dropZone = {
    purple: {
        dragging: "border-purple-400 bg-purple-500/10 scale-[1.02]",
        idle: "border-gray-600/50 bg-[#12122a]/50 hover:border-purple-500/50 hover:bg-[#12122a]/80",
        iconDragging: "bg-purple-500/30",
        iconIdle: "bg-purple-500/10",
        uploadDragging: "text-purple-400",
        uploadIdle: "text-purple-500/60",
    },
    indigo: {
        dragging: "border-indigo-400 bg-indigo-500/10 scale-[1.02]",
        idle: "border-gray-600/50 bg-[#12122a]/50 hover:border-indigo-500/50 hover:bg-[#12122a]/80",
        iconDragging: "bg-indigo-500/30",
        iconIdle: "bg-indigo-500/10",
        uploadDragging: "text-indigo-400",
        uploadIdle: "text-indigo-500/60",
    },
};

export const statusColors = {
    purple: { text: "text-purple-400", dot: "bg-purple-400" },
    indigo: { text: "text-indigo-400", dot: "bg-indigo-400" },
};

export const headerIcon = {
    purple: "bg-linear-to-br from-purple-500 to-purple-700 shadow-purple-500/20",
    indigo: "bg-linear-to-br from-indigo-500 to-indigo-700 shadow-indigo-500/20",
};

export const downloadBtn = {
    purple:
        "bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/20 hover:shadow-purple-500/40",
    indigo:
        "bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/20 hover:shadow-indigo-500/40",
};

export const emptyState = {
    purple: { bg: "bg-purple-500/10", icon: "text-purple-500/40" },
    indigo: { bg: "bg-indigo-500/10", icon: "text-indigo-500/40" },
};
