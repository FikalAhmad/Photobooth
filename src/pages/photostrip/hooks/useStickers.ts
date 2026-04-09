import { useCallback, useState } from "react";
import { StickerItem } from "../photostrip.types";

type UseStickersReturn = {
  stickers: StickerItem[];
  stickerSize: number;
  setStickerSize: (size: number) => void;
  addSticker: (emoji: string) => string;
  moveSticker: (id: string, x: number, y: number) => void;
  deleteSticker: (id: string) => void;
  updateStickerSize: (id: string, size: number) => void;
  updateStickerRotation: (id: string, rotation: number) => void;
};

export const useStickers = (): UseStickersReturn => {
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [stickerSize, setStickerSize] = useState(48);

  const addSticker = (emoji: string): string => {
    const id = `sticker-${Date.now()}`;
    setStickers((prev) => [
      ...prev,
      {
        id,
        emoji,
        x: 30 + Math.random() * 40,
        y: 20 + Math.random() * 60,
        size: stickerSize,
        rotation: (Math.random() - 0.5) * 20,
      },
    ]);
    return id;
  };

  const moveSticker = useCallback((id: string, x: number, y: number) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)));
  }, []);

  const deleteSticker = useCallback((id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateStickerSize = useCallback((id: string, size: number) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, size } : s)));
  }, []);

  const updateStickerRotation = useCallback((id: string, rotation: number) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, rotation } : s)));
  }, []);

  return {
    stickers,
    stickerSize,
    setStickerSize,
    addSticker,
    moveSticker,
    deleteSticker,
    updateStickerSize,
    updateStickerRotation,
  };
};
