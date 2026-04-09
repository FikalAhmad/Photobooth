import { CapturedImage, FilterSettings } from "@/types/global.types";
import { StickerItem, TextItem } from "../photostrip.types";
import { CANVAS_CONFIG, FRAME_LAYOUTS, STORAGE_KEY } from "../photostrip.constants";

/* ───────── localStorage ───────── */
export const getStoredImages = (): CapturedImage[] => {
  try {
    const dataImage = localStorage.getItem(STORAGE_KEY);
    if (!dataImage) return [];
    const parsed = JSON.parse(dataImage);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/* ───────── CSS filter string ───────── */
export const buildFilterString = (filters: FilterSettings): string =>
  `grayscale(${filters.grayscale}%) brightness(${filters.brightness}%) sepia(${filters.retroFilter}%) saturate(${filters.saturate}%) blur(${filters.softFilter}px)`;

/* ───────── Load photo with filters pre-applied ───────── */
export const loadImageWithFilters = (image: CapturedImage): Promise<HTMLCanvasElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) { reject(new Error("Canvas context not available")); return; }
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx.filter = buildFilterString(image.filters);
        tempCtx.drawImage(img, 0, 0);
        resolve(tempCanvas);
      } catch (err) { reject(err); }
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${image.src}`));
    img.src = image.src;
  });

/* ───────── Load overlay/template image ───────── */
export const loadTemplateImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const template = new Image();
    template.crossOrigin = "anonymous";
    template.onload = () => resolve(template);
    template.onerror = () => reject(new Error(`Failed to load template: ${src}`));
    template.src = src;
  });

/* ───────── object-fit: cover calc ───────── */
export const calculateCoverDimensions = (
  imgWidth: number, imgHeight: number,
  frameWidth: number, frameHeight: number,
) => {
  const imgRatio = imgWidth / imgHeight;
  const frameRatio = frameWidth / frameHeight;
  let sourceWidth = imgWidth, sourceHeight = imgHeight, sourceX = 0, sourceY = 0;
  if (imgRatio > frameRatio) {
    sourceWidth = imgHeight * frameRatio;
    sourceX = (imgWidth - sourceWidth) / 2;
  } else {
    sourceHeight = imgWidth / frameRatio;
    sourceY = (imgHeight - sourceHeight) / 2;
  }
  return { sourceX, sourceY, sourceWidth, sourceHeight };
};

/* ───────── Draw sticker emoji ───────── */
export const drawEmojiOnCanvas = (
  ctx: CanvasRenderingContext2D,
  sticker: StickerItem,
  canvasW: number,
  canvasH: number,
) => {
  const cx = (sticker.x / 100) * canvasW;
  const cy = (sticker.y / 100) * canvasH;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((sticker.rotation * Math.PI) / 180);
  ctx.font = `${sticker.size}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(sticker.emoji, 0, 0);
  ctx.restore();
};

/* ───────── Draw text item ───────── */
export const drawTextOnCanvas = (
  ctx: CanvasRenderingContext2D,
  item: TextItem,
  canvasW: number,
  canvasH: number,
) => {
  const cx = (item.x / 100) * canvasW;
  const cy = (item.y / 100) * canvasH;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((item.rotation * Math.PI) / 180);
  ctx.font = `${item.bold ? "bold" : "normal"} ${item.size}px "${item.fontFamily}"`;
  ctx.fillStyle = item.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.strokeText(item.text, 0, 0);
  ctx.fillText(item.text, 0, 0);
  ctx.restore();
};

/* ───────── Full canvas render ───────── */
type RenderParams = {
  canvas: HTMLCanvasElement;
  images: CapturedImage[];
  bgColor: string | null;
  pickstrip: string;
  stickers: StickerItem[];
  texts: TextItem[];
};

export const renderPhotoStripCanvas = async ({
  canvas, images, bgColor, pickstrip, stickers, texts,
}: RenderParams): Promise<string> => {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  canvas.width = CANVAS_CONFIG.width;
  canvas.height = CANVAS_CONFIG.height;
  const frames = FRAME_LAYOUTS[images.length] ?? FRAME_LAYOUTS[3];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const results = await Promise.allSettled(images.map(loadImageWithFilters));
  results
    .filter((r): r is PromiseFulfilledResult<HTMLCanvasElement> => r.status === "fulfilled")
    .map((r) => r.value)
    .forEach((imgCanvas, index) => {
      const frame = frames[index];
      if (!frame) return;
      const { sourceX, sourceY, sourceWidth, sourceHeight } =
        calculateCoverDimensions(imgCanvas.width, imgCanvas.height, frame.width, frame.height);
      ctx.drawImage(imgCanvas, sourceX, sourceY, sourceWidth, sourceHeight, frame.x, frame.y, frame.width, frame.height);
    });

  if (pickstrip) {
    const template = await loadTemplateImage(pickstrip);
    ctx.drawImage(template, 0, 0, canvas.width, canvas.height);
  }

  stickers.forEach((s) => drawEmojiOnCanvas(ctx, s, canvas.width, canvas.height));
  texts.forEach((t) => drawTextOnCanvas(ctx, t, canvas.width, canvas.height));

  return canvas.toDataURL("image/png");
};
