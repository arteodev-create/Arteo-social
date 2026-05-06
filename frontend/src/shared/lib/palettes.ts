/**
 * ND781 Official AI Palette Registry
 * Curated high-fidelity gradients for Arteo 2.0 Identity Verification.
 * These are noise and mesh compatible color sets.
 */

export interface AIPalette {
    id: string;
    name: string;
    colors: string[]; // 3-4 colors for mesh/complex gradients
    textColor: string;
}

export const ALL_PALETTES: AIPalette[] = [
    { id: "X1", name: "Electric Indigo", colors: ["#6366f1", "#a855f7", "#ec4899"], textColor: "#ffffff" },
    { id: "X2", name: "Cyber Emerald", colors: ["#10b981", "#3b82f6", "#06b6d4"], textColor: "#ffffff" },
    { id: "X3", name: "Solar Amber", colors: ["#f59e0b", "#ef4444", "#db2777"], textColor: "#ffffff" },
    { id: "X4", name: "Midnight Aurora", colors: ["#1e1b4b", "#4338ca", "#a855f7"], textColor: "#ffffff" },
    { id: "X5", name: "Arctic Rose", colors: ["#fb7185", "#818cf8", "#c084fc"], textColor: "#ffffff" },
    { id: "X6", name: "Deep Ocean", colors: ["#0f172a", "#334155", "#64748b"], textColor: "#ffffff" },
    { id: "X7", name: "Neon Forest", colors: ["#064e3b", "#059669", "#34d399"], textColor: "#ffffff" },
    { id: "X8", name: "Crimson Cloud", colors: ["#7f1d1d", "#dc2626", "#f87171"], textColor: "#ffffff" },
    { id: "X9", name: "Plasma Gold", colors: ["#facc15", "#f97316", "#dc2626"], textColor: "#ffffff" },
    { id: "X10", name: "Deep Amethyst", colors: ["#4c1d95", "#7c3aed", "#c084fc"], textColor: "#ffffff" },
    { id: "X11", name: "Boreal Night", colors: ["#0f172a", "#1e3a8a", "#0ea5e9"], textColor: "#ffffff" },
    { id: "X12", name: "Volcanic Ash", colors: ["#18181b", "#3f3f46", "#71717a"], textColor: "#ffffff" },
    { id: "X13", name: "Lagoon Mist", colors: ["#134e4a", "#0f766e", "#2dd4bf"], textColor: "#ffffff" },
    { id: "X14", name: "Sunset Mirage", colors: ["#9a3412", "#c2410c", "#ea580c"], textColor: "#ffffff" },
    { id: "X15", name: "Frosty Mint", colors: ["#ecfdf5", "#a7f3d0", "#34d399"], textColor: "#000000" },
    { id: "X16", name: "Cosmic Nebula", colors: ["#581c87", "#9333ea", "#d946ef"], textColor: "#ffffff" },
    { id: "X17", name: "Electric Lime", colors: ["#bef264", "#84cc16", "#4d7c0f"], textColor: "#000000" },
    { id: "X18", name: "Shadow Velvet", colors: ["#450a0a", "#7f1d1d", "#991b1b"], textColor: "#ffffff" },
    { id: "X19", name: "Titanium Steel", colors: ["#334155", "#475569", "#94a3b8"], textColor: "#ffffff" },
    { id: "X20", name: "Neon Coral", colors: ["#fda4af", "#fb7185", "#f43f5e"], textColor: "#ffffff" },
    { id: "X21", name: "Glacial Blue", colors: ["#e0f2fe", "#7dd3fc", "#0ea5e9"], textColor: "#000000" },
    { id: "X22", name: "Obsidian Purple", colors: ["#2e1065", "#4c1d95", "#6d28d9"], textColor: "#ffffff" },
    { id: "X23", name: "Wild Tangerine", colors: ["#ffedd5", "#fdba74", "#f97316"], textColor: "#000000" },
    { id: "X24", name: "Forest Canopy", colors: ["#064e3b", "#065f46", "#047857"], textColor: "#ffffff" },
    { id: "X25", name: "Royal Sapphire", colors: ["#1e3a8a", "#1d4ed8", "#2563eb"], textColor: "#ffffff" },
    { id: "X26", name: "Candy Orchid", colors: ["#fae8ff", "#f5d0fe", "#e879f9"], textColor: "#000000" },
    { id: "X27", name: "Desert Sand", colors: ["#fef3c7", "#fde68a", "#fbbf24"], textColor: "#000000" },
    { id: "X28", name: "Ozone Layer", colors: ["#f0f9ff", "#bae6fd", "#7dd3fc"], textColor: "#000000" },
    { id: "X29", name: "Bonsai Green", colors: ["#f0fdf4", "#bbf7d0", "#4ade80"], textColor: "#000000" },
    { id: "X30", name: "Magma Core", colors: ["#450a0a", "#991b1b", "#dc2626"], textColor: "#ffffff" },
    { id: "X31", name: "Zen Lavender", colors: ["#f5f3ff", "#ddd6fe", "#a78bfa"], textColor: "#000000" },
    { id: "X32", name: "Chrome Silver", colors: ["#f8fafc", "#e2e8f0", "#94a3b8"], textColor: "#000000" },
    { id: "X33", name: "Holographic Teal", colors: ["#ccfbf1", "#5eead4", "#14b8a6"], textColor: "#000000" },
    { id: "X34", name: "Peach Blossom", colors: ["#fff1f2", "#fecdd3", "#fb7185"], textColor: "#000000" },
    { id: "X35", name: "Dusk Sky", colors: ["#312e81", "#4338ca", "#6366f1"], textColor: "#ffffff" },
    { id: "X36", name: "Lime Sorbet", colors: ["#f7fee7", "#d9f99d", "#a3e635"], textColor: "#000000" },
    { id: "X37", name: "Shadow Rose", colors: ["#500724", "#831843", "#be185d"], textColor: "#ffffff" },
    { id: "X38", name: "Electric Sky Blue", colors: ["#0284c7", "#0ea5e9", "#38bdf8"], textColor: "#ffffff" },
    { id: "X39", name: "Golden Aura", colors: ["#854d0e", "#a16207", "#ca8a04"], textColor: "#ffffff" },
    { id: "X40", name: "Infrared Night", colors: ["#45062e", "#701a75", "#a21caf"], textColor: "#ffffff" },
    { id: "X41", name: "Coastal Teal", colors: ["#042f2e", "#0d9488", "#2dd4bf"], textColor: "#ffffff" },
    { id: "X42", name: "Umber Earth", colors: ["#431407", "#78350f", "#b45309"], textColor: "#ffffff" },
    { id: "X43", name: "Nebula Pink", colors: ["#fdf2f8", "#fbcfe8", "#f472b6"], textColor: "#000000" },
    { id: "X44", name: "Neon Grape", colors: ["#2d054e", "#6b21a8", "#a855f7"], textColor: "#ffffff" },
    { id: "X45", name: "Cyan Spark", colors: ["#ecfeff", "#a5f3fc", "#22d3ee"], textColor: "#000000" },
    { id: "X46", name: "Ochre Dust", colors: ["#451a03", "#92400e", "#d97706"], textColor: "#ffffff" },
    { id: "X47", name: "Velvet Indigo", colors: ["#1e1b4b", "#312e81", "#3730a3"], textColor: "#ffffff" },
    { id: "X48", name: "Matcha Mist", colors: ["#ecfdf5", "#d1fae5", "#10b981"], textColor: "#000000" },
    { id: "X49", name: "Solar Flare", colors: ["#fff7ed", "#ffedd5", "#f97316"], textColor: "#000000" },
    { id: "X50", name: "Deep Maroon", colors: ["#4c0519", "#881337", "#9f1239"], textColor: "#ffffff" },
    { id: "X51", name: "Vivid Aqua", colors: ["#06b6d4", "#22d3ee", "#67e8f9"], textColor: "#ffffff" },
    { id: "X52", name: "Royal Emerald", colors: ["#064e3b", "#065f46", "#059669"], textColor: "#ffffff" },
    { id: "X53", name: "Midnight Purple", colors: ["#3b0764", "#581c87", "#7e22ce"], textColor: "#ffffff" },
    { id: "X54", name: "Electric Teal", colors: ["#0f766e", "#14b8a6", "#2dd4bf"], textColor: "#ffffff" },
    { id: "X55", name: "Lava Orange", colors: ["#7c2d12", "#9a3412", "#ea580c"], textColor: "#ffffff" },
    { id: "X56", name: "Icy Cyan", colors: ["#cffafe", "#a5f3fc", "#67e8f9"], textColor: "#000000" },
    { id: "X57", name: "Rose Gold", colors: ["#fce7f3", "#fbcfe8", "#f9a8d4"], textColor: "#000000" },
    { id: "X58", name: "Zen Slate", colors: ["#0f172a", "#334155", "#475569"], textColor: "#ffffff" }
];

