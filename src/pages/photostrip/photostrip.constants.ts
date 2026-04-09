import { Frame } from "@/types/global.types";

export const CANVAS_CONFIG = { width: 295, height: 886 } as const;

/** Display width of the preview image (scaled down from canvas) */
export const PREVIEW_WIDTH = 240;

export const FRAME_LAYOUTS: Record<number, Frame[]> = {
  3: [
    { x: 20, y: 40, width: 255, height: 192 },
    { x: 20, y: 286, width: 255, height: 192 },
    { x: 21, y: 529, width: 255, height: 192 },
  ],
  4: [
    { x: 20, y: 19, width: 255, height: 172 },
    { x: 20, y: 211, width: 255, height: 172 },
    { x: 20, y: 403, width: 255, height: 172 },
    { x: 21, y: 595, width: 255, height: 172 },
  ],
};

export const STORAGE_KEY = "images";

export const EMOJI_CATEGORIES: Record<string, string[]> = {
  "Love 💕": ["❤️", "💕", "💖", "💗", "💘", "💝", "🌹", "💌", "😍", "🥰", "😘", "💏"],
  "Fun 🎉": ["🎉", "🎊", "✨", "🌟", "⭐", "🦋", "🌈", "🎈", "🎀", "🎁", "🥳", "🎆"],
  "Nature 🌸": ["🌸", "🌺", "🌻", "🌼", "🍀", "🌿", "🍃", "🌙", "☀️", "🌊", "🦋", "🌵"],
  "Kawaii 🐱": ["🐱", "🐶", "🐻", "🐼", "🐨", "🐸", "🐰", "🦊", "🐧", "🐹", "🦄", "🐝"],
  "Food 🍓": ["🍓", "🍒", "🍑", "🍇", "🍰", "🎂", "🍩", "🧁", "🍦", "🍫", "☕", "🧋"],
};

export const FONT_FAMILIES = [
  "Plus Jakarta Sans",
  "Georgia",
  "Courier New",
  "Arial",
  "Times New Roman",
  "Impact",
];

export const BG_COLORS = [
  "#ffffff", "#000000", "#fef2f2", "#eff6ff", "#f0fdf4",
  "#fff7ed", "#faf5ff", "#fff1f2", "#82201f", "#1e293b",
  "#475569", "#dc2626", "#2563eb", "#16a34a", "#ca8a04",
  "#ec4899", "#8b5cf6", "#0ea5e9", "#f97316", "#14b8a6",
];

export const TEXT_PRESET_COLORS = [
  "#ffffff", "#000000", "#ef4444", "#3b82f6",
  "#f59e0b", "#10b981", "#8b5cf6", "#ec4899",
];
