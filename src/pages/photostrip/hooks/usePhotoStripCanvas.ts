import { useCallback, useEffect, useRef, useState } from "react";
import { CapturedImage } from "@/types/global.types";
import { StickerItem, TextItem } from "../photostrip.types";
import { getStoredImages, renderPhotoStripCanvas } from "../utils/canvasUtils";

type UsePhotoStripCanvasReturn = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  images: CapturedImage[];
  preview: string | null;
  isRendering: boolean;
  error: string | null;
  downloadPhotoStrip: () => void;
};

type Props = {
  pickstrip: string;
  bgColor: string | null;
  stickers: StickerItem[];
  texts: TextItem[];
};

export const usePhotoStripCanvas = ({
  pickstrip,
  bgColor,
  stickers,
  texts,
}: Props): UsePhotoStripCanvasReturn => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load images from localStorage once on mount
  useEffect(() => {
    setImages(getStoredImages());
  }, []);

  // Re-render canvas whenever any dependency changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    setIsRendering(true);
    setError(null);

    renderPhotoStripCanvas({ canvas, images, bgColor, pickstrip, stickers, texts })
      .then((dataUrl) => { if (!cancelled) setPreview(dataUrl); })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError("Failed to render canvas");
      })
      .finally(() => { if (!cancelled) setIsRendering(false); });

    return () => { cancelled = true; };
  }, [images, pickstrip, bgColor, stickers, texts]);

  const downloadPhotoStrip = useCallback(() => {
    if (!preview) return;
    const link = document.createElement("a");
    link.href = preview;
    link.download = `photostrip-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [preview]);

  return { canvasRef, images, preview, isRendering, error, downloadPhotoStrip };
};
