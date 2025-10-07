import { Button } from "@/components/ui/button";
import { photostrip } from "@/lib/photostrip";
import { CapturedImage, FilterSettings, Frame } from "@/types/global.types";
import { useCallback, useEffect, useRef, useState } from "react";
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
  image: CapturedImage
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

        // Apply filters
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
 * Validate hex color format
 */
const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

/**
 * Get appropriate frame layout based on number of images
 */
const getFrameLayout = (imageCount: number): Frame[] => {
  // Return layout for exact count, or fallback to 3-photo layout
  return FRAME_LAYOUTS[imageCount] || FRAME_LAYOUTS[3];
};

/**
 * Calculate dimensions for object-fit: cover behavior
 * Ensures image fills the frame while maintaining aspect ratio
 */
const calculateCoverDimensions = (
  imgWidth: number,
  imgHeight: number,
  frameWidth: number,
  frameHeight: number
) => {
  const imgRatio = imgWidth / imgHeight;
  const frameRatio = frameWidth / frameHeight;

  let sourceWidth = imgWidth;
  let sourceHeight = imgHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (imgRatio > frameRatio) {
    // Image is wider than frame - crop sides
    sourceWidth = imgHeight * frameRatio;
    sourceX = (imgWidth - sourceWidth) / 2;
  } else {
    // Image is taller than frame - crop top/bottom
    sourceHeight = imgWidth / frameRatio;
    sourceY = (imgHeight - sourceHeight) / 2;
  }

  return {
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
  };
};

const PhotoStripGenerator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [images, setImages] = useState<CapturedImage[]>([]);
  const [pickstrip, setPickstrip] = useState<string>("");
  const [bgColor, setBgColor] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load images from localStorage on mount
  useEffect(() => {
    const storedImages = getStoredImages();
    setImages(storedImages);
  }, []);

  // Render canvas whenever dependencies change
  useEffect(() => {
    let isMounted = true;

    const renderCanvas = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      setError(null);

      try {
        // Set canvas dimensions
        canvas.width = CANVAS_CONFIG.width;
        canvas.height = CANVAS_CONFIG.height;

        // Get appropriate frame layout based on image count
        const frames = getFrameLayout(images.length);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background color if selected
        if (bgColor) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Load all images with filters
        const imagePromises = images.map((image) =>
          loadImageWithFilters(image)
        );

        const results = await Promise.allSettled(imagePromises);

        // Filter successful results
        const loadedImages = results
          .filter(
            (result): result is PromiseFulfilledResult<HTMLCanvasElement> =>
              result.status === "fulfilled"
          )
          .map((result) => result.value);

        // Log any failed images
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(`Failed to load image ${index}:`, result.reason);
          }
        });

        // Draw images to their frames with object-fit: cover behavior
        loadedImages.forEach((imgCanvas, index) => {
          const frame = frames[index];
          if (frame) {
            const { sourceX, sourceY, sourceWidth, sourceHeight } =
              calculateCoverDimensions(
                imgCanvas.width,
                imgCanvas.height,
                frame.width,
                frame.height
              );

            // Draw cropped image to fit frame (object-fit: cover)
            ctx.drawImage(
              imgCanvas,
              sourceX, // source x (crop from here)
              sourceY, // source y (crop from here)
              sourceWidth, // source width (crop this much)
              sourceHeight, // source height (crop this much)
              frame.x, // destination x
              frame.y, // destination y
              frame.width, // destination width
              frame.height // destination height
            );
          }
        });

        // Draw template overlay if selected
        if (pickstrip) {
          const template = await loadTemplateImage(pickstrip);
          ctx.drawImage(template, 0, 0, canvas.width, canvas.height);
        }

        // Set preview only if component is still mounted
        if (isMounted) {
          setPreview(canvas.toDataURL("image/png"));
        }
      } catch (err) {
        console.error("Error rendering canvas:", err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to render canvas"
          );
        }
      }
    };

    renderCanvas();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [images, pickstrip, bgColor]);

  // Handle background/template selection
  const handlePickstrip = useCallback((background: string) => {
    if (!background) {
      console.warn("Empty background value provided");
      return;
    }

    if (background.startsWith("#")) {
      // Validate hex color
      if (!isValidHexColor(background)) {
        console.error("Invalid hex color format:", background);
        setError("Invalid color format. Please use #RRGGBB format.");
        return;
      }
      setBgColor(background);
      setPickstrip("");
    } else {
      setPickstrip(background);
      setBgColor(null);
    }

    setError(null);
  }, []);

  // Download the photo strip
  const downloadPhotoStrip = useCallback(() => {
    if (!preview) {
      console.warn("No preview available to download");
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = preview;
      link.download = `photostrip-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download photo strip:", err);
      setError("Failed to download photo strip");
    }
  }, [preview]);

  if (error) {
    return error;
  }
  return (
    <div className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-0 items-center md:items-stretch mx-10 md:mx-32 my-10">
      <div className="flex flex-col gap-3">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Fotoboothgaksi</h2>
          <span className="text-[1px]"> Created by Suka Kopi Manis ☕</span>
        </div>
        <div className="flex gap-5">
          <Button asChild>
            <Link to={"/capture"}>Retake</Link>
          </Button>
          <Button onClick={downloadPhotoStrip} className="bg-green-600">
            Save your Photo
          </Button>
        </div>

        <div>
          <div className="text-sm">Color Background</div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-md">
              <input
                type="color"
                className="w-32 h-20 cursor-pointer rounded-md"
                onChange={(e) => handlePickstrip(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm my-3"></div>
          <div className="grid grid-cols-3 gap-3">
            {images.length === 3
              ? photostrip
                  .filter((item) => !item.src.startsWith("/4-"))
                  .map((photo, idx) => {
                    return (
                      <Button
                        key={`photostrip-${idx}`}
                        onClick={() => handlePickstrip(photo.src)}
                        className="h-20 hover:brightness-75"
                        style={{
                          backgroundImage: `url(${photo.src})`,
                          backgroundSize: "cover",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "bottom",
                        }}
                      >
                        {photo.label}
                      </Button>
                    );
                  })
              : photostrip
                  .filter((item) => item.src.startsWith("/4-"))
                  .map((photo, idx) => {
                    return (
                      <Button
                        key={`photostrip-${idx}`}
                        onClick={() => handlePickstrip(photo.src)}
                        className="h-20 hover:brightness-75"
                        style={{
                          backgroundImage: `url(${photo.src})`,
                          backgroundSize: "cover",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "bottom",
                        }}
                      >
                        {photo.label}
                      </Button>
                    );
                  })}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center text-center p-4 h-[750px] max-h-fit">
        {preview && (
          <img
            src={preview}
            alt="Photo Strip Preview"
            className="shadow-2xl h-4/5"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        )}

        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
};

export default PhotoStripGenerator;
