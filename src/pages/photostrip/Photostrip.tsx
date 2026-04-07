import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { photostrip } from "@/lib/photostrip";
import { CapturedImage, FilterSettings, Frame } from "@/types/global.types";
import {
  DownloadIcon,
  RotateCcwIcon,
  PaletteIcon,
  LayoutIcon,
  SparklesIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const CANVAS_CONFIG = {
  width: 295,
  height: 886,
} as const;

const FRAME_LAYOUTS: Record<number, Frame[]> = {
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

const STORAGE_KEY = "images";

/**
 * Safely parse JSON from localStorage
 */
const getStoredImages = (): CapturedImage[] => {
  try {
    const dataImage = localStorage.getItem(STORAGE_KEY);
    if (!dataImage) return [];
    const parsed = JSON.parse(dataImage);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse stored images:", error);
    return [];
  }
};

/**
 * Apply CSS filters to canvas context
 */
const applyFilters = (filters: FilterSettings): string => {
  return `grayscale(${filters.grayscale}%) brightness(${filters.brightness}%) sepia(${filters.retroFilter}%) saturate(${filters.saturate}%) blur(${filters.softFilter}px)`;
};

/**
 * Load image with filters applied
 */
const loadImageWithFilters = (
  image: CapturedImage,
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) {
          reject(new Error("Canvas context not available"));
          return;
        }
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx.filter = applyFilters(image.filters);
        tempCtx.drawImage(img, 0, 0);
        resolve(tempCanvas);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${image.src}`));
    img.src = image.src;
  });
};

/**
 * Load template/overlay image
 */
const loadTemplateImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const template = new Image();
    template.crossOrigin = "anonymous";
    template.onload = () => resolve(template);
    template.onerror = () =>
      reject(new Error(`Failed to load template: ${src}`));
    template.src = src;
  });
};

/**
 * Calculate dimensions for object-fit: cover behavior
 */
const calculateCoverDimensions = (
  imgWidth: number,
  imgHeight: number,
  frameWidth: number,
  frameHeight: number,
) => {
  const imgRatio = imgWidth / imgHeight;
  const frameRatio = frameWidth / frameHeight;
  let sourceWidth = imgWidth;
  let sourceHeight = imgHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (imgRatio > frameRatio) {
    sourceWidth = imgHeight * frameRatio;
    sourceX = (imgWidth - sourceWidth) / 2;
  } else {
    sourceHeight = imgWidth / frameRatio;
    sourceY = (imgHeight - sourceHeight) / 2;
  }
  return { sourceX, sourceY, sourceWidth, sourceHeight };
};

const PhotoStripGenerator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [pickstrip, setPickstrip] = useState<string>("");
  const [bgColor, setBgColor] = useState<string | null>("#ffffff");
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedImages = getStoredImages();
    setImages(storedImages);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const renderCanvas = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      setError(null);

      try {
        canvas.width = CANVAS_CONFIG.width;
        canvas.height = CANVAS_CONFIG.height;
        const frames = FRAME_LAYOUTS[images.length] || FRAME_LAYOUTS[3];

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (bgColor) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const imagePromises = images.map((image) =>
          loadImageWithFilters(image),
        );
        const results = await Promise.allSettled(imagePromises);
        const loadedImages = results
          .filter(
            (res): res is PromiseFulfilledResult<HTMLCanvasElement> =>
              res.status === "fulfilled",
          )
          .map((res) => res.value);

        loadedImages.forEach((imgCanvas, index) => {
          const frame = frames[index];
          if (frame) {
            const { sourceX, sourceY, sourceWidth, sourceHeight } =
              calculateCoverDimensions(
                imgCanvas.width,
                imgCanvas.height,
                frame.width,
                frame.height,
              );
            ctx.drawImage(
              imgCanvas,
              sourceX,
              sourceY,
              sourceWidth,
              sourceHeight,
              frame.x,
              frame.y,
              frame.width,
              frame.height,
            );
          }
        });

        if (pickstrip) {
          const template = await loadTemplateImage(pickstrip);
          ctx.drawImage(template, 0, 0, canvas.width, canvas.height);
        }

        if (isMounted) setPreview(canvas.toDataURL("image/png"));
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to render canvas");
      }
    };
    renderCanvas();
    return () => {
      isMounted = false;
    };
  }, [images, pickstrip, bgColor]);

  const handlePickstrip = (background: string) => {
    if (background.startsWith("#")) {
      setBgColor(background);
      setPickstrip("");
    } else {
      setPickstrip(background);
      setBgColor(null);
    }
  };

  const downloadPhotoStrip = () => {
    if (!preview) return;
    const link = document.createElement("a");
    link.href = preview;
    link.download = `photostrip-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error)
    return <div className="text-center p-20 text-red-500">{error}</div>;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFTSIDE: PREVIEW AREA */}
        <div className="w-full lg:w-[450px] flex-shrink-0 flex flex-col items-center gap-6">
          <div className="relative group p-4 bg-white rounded-2xl shadow-xl overflow-hidden">
            {preview ? (
              <img
                src={preview || "/placeholder.svg"}
                alt="Photo Strip Preview"
                className="w-full max-h-[85vh] object-contain rounded-lg transition-transform duration-500 group-hover:scale-[1.02]"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
            ) : (
              <div className="w-[295px] h-[886px] animate-pulse bg-gray-100 flex items-center justify-center text-gray-400">
                Generating Preview...
              </div>
            )}

            {/* Action floating buttons for desktop hover? Optional... let's keep it clean */}
          </div>

          <div className="flex gap-4 w-full">
            <Button
              asChild
              variant="outline"
              className="flex-1 h-12 rounded-xl text-maroon border-maroon hover:bg-maroon/5"
            >
              <Link to="/capture" className="flex items-center gap-2">
                <RotateCcwIcon size={20} /> Retake
              </Link>
            </Button>
            <Button
              onClick={downloadPhotoStrip}
              className="flex-1 h-12 rounded-xl bg-maroon hover:bg-maroon/80 text-white shadow-lg"
            >
              <DownloadIcon size={20} className="mr-2" /> Download
            </Button>
          </div>
        </div>

        {/* RIGHTSIDE: CONTROLS */}
        <div className="flex-1 w-full bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-white">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
              <SparklesIcon className="text-maroon" /> Customize Your Strip
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Choose a theme or color to make it yours.
            </p>
          </div>

          <Tabs defaultValue="themes" className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-gray-50/50 p-2 h-auto rounded-none border-b border-gray-100">
              <TabsTrigger
                value="themes"
                className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <LayoutIcon size={18} className="mr-2" /> Themes
              </TabsTrigger>
              <TabsTrigger
                value="backdrop"
                className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <PaletteIcon size={18} className="mr-2" /> Backdrop
              </TabsTrigger>
            </TabsList>

            <div className="p-6 overflow-y-auto max-h-[600px]">
              <TabsContent value="themes" className="mt-0 outline-none">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {photostrip
                    .filter((item) =>
                      images.length === 3
                        ? !item.src.startsWith("/4-")
                        : item.src.startsWith("/4-"),
                    )
                    .map((item, idx) => (
                      <button
                        key={`template-${idx}`}
                        onClick={() => handlePickstrip(item.src)}
                        className={`group relative aspect-[1/3] border-2 rounded-xl overflow-hidden transition-all hover:scale-105 ${
                          pickstrip === item.src
                            ? "border-orange-500 shadow-md ring-2 ring-orange-500/20"
                            : "border-transparent hover:border-gray-200"
                        }`}
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${item.src})` }}
                        />
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[10px] text-white text-center font-medium truncate">
                            {item.label}
                          </p>
                        </div>
                        {pickstrip === item.src && (
                          <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1 border border-white">
                            <SparklesIcon size={10} />
                          </div>
                        )}
                      </button>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="backdrop" className="mt-0 outline-none">
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-4 block">
                      Pick a Color
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {[
                        "#ffffff",
                        "#000000",
                        "#fef2f2",
                        "#eff6ff",
                        "#f0fdf4",
                        "#fff7ed",
                        "#faf5ff",
                        "#fff1f2",
                        "#82201f",
                        "#1e293b",
                        "#475569",
                        "#dc2626",
                        "#2563eb",
                        "#16a34a",
                        "#ca8a04",
                      ].map((color) => (
                        <button
                          key={color}
                          onClick={() => handlePickstrip(color)}
                          className={`w-full aspect-square rounded-full border-2 transition-transform hover:scale-110 ${
                            bgColor === color
                              ? "border-orange-500 shadow-md ring-2 ring-orange-500/20"
                              : "border-gray-200"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}

                      <div className="relative group w-full aspect-square rounded-full border-2 border-gray-200 overflow-hidden flex items-center justify-center bg-white hover:border-orange-500 transition-all">
                        <PaletteIcon
                          size={24}
                          className="text-gray-400 group-hover:text-orange-500"
                        />
                        <input
                          type="color"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={(e) => handlePickstrip(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mt-8">
                    <p className="text-xs text-gray-500 flex items-center gap-2 italic">
                      <SparklesIcon size={14} className="text-orange-400" />
                      Pro tip: Using a solid backdrop color works best when you
                      want to keep the focus on your photos.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="p-6 mt-auto bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Format
              </span>
              <span className="text-sm font-bold text-gray-600">
                Premium PNG
              </span>
            </div>
            <p className="text-xs text-gray-300 italic">
              Fotoboothgaksi © 2026
            </p>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default PhotoStripGenerator;
