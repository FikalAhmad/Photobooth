import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useCameraDevices } from "@/hooks/getDevices";
import { cn } from "@/lib/utils";
import { CapturedImage } from "@/types/global.types";
import {
  CassetteTapeIcon,
  DropletIcon,
  FilmIcon,
  FlaskRoundIcon,
  FlipHorizontalIcon,
  FullscreenIcon,
  RotateCcwIcon,
  SparklesIcon,
  SunIcon,
  CameraIcon,
  TimerIcon,
  Settings2Icon,
  Trash2Icon,
  ChevronRightIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Webcam from "react-webcam";

const Capture = () => {
  const webcamRef = useRef<Webcam>(null);
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [count, setCount] = useState<number>(0);
  const [totalPhoto, setTotalPhoto] = useState<number>(3);
  const [counting, setCounting] = useState<boolean>(false);
  const [countTicker, setCountTicker] = useState<number>(0);
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);

  const { devices, deviceId, setDeviceId, refreshDevices } = useCameraDevices();

  const [cameraSetting, setCameraSetting] = useState({
    mirrored: true,
    fitCamera: false,
    grayscale: [0],
    softFilter: [0],
    retroFilter: [0],
    brightness: [100],
    saturate: [100],
  });

  const handleCapture = () => {
    if (count > 0) {
      setCounting(true);
      let countdown = count;
      setCountTicker(countdown);

      timerRef.current = setInterval(() => {
        countdown -= 1;
        setCountTicker(countdown);

        if (countdown === 0) {
          // Selalu stop interval setelah 1 foto diambil
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setCounting(false);
          setCountTicker(0);

          if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
              const { fitCamera, mirrored, ...filters } = cameraSetting;
              setImages((prev) => [
                ...prev,
                {
                  src: imageSrc,
                  filters,
                  mirrored,
                  fitCamera,
                },
              ]);
            }
          }
        }
      }, 1000);
    } else {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          const { fitCamera, mirrored, ...filters } = cameraSetting;
          setImages((prev) => [
            ...prev,
            {
              src: imageSrc,
              filters,
              mirrored,
              fitCamera,
            },
          ]);
        }
      }
    }
  };

  const photoCountRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const autoCapture = () => {
    let newCount = count;

    if (count === 0) {
      newCount = 3;
      setCount(newCount);
    }

    setCounting(true);
    photoCountRef.current = images.length;
    let countdown = newCount;
    setCountTicker(countdown);

    timerRef.current = setInterval(() => {
      countdown -= 1;
      setCountTicker(countdown);

      if (countdown === 0) {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            photoCountRef.current += 1;

            if (photoCountRef.current > totalPhoto) {
              clearInterval(timerRef.current!);
              timerRef.current = null;
              setCounting(false);
              setCountTicker(0);
              return;
            }

            const { fitCamera, mirrored, ...filters } = cameraSetting;
            setImages((prev) => [
              ...prev,
              {
                src: imageSrc,
                filters,
                mirrored,
                fitCamera,
              },
            ]);

            if (photoCountRef.current >= totalPhoto) {
              clearInterval(timerRef.current!);
              timerRef.current = null;
              setCounting(false);
              setCountTicker(0);
              return;
            }
          }
        }

        countdown = newCount;
        setCountTicker(countdown);
      }
    }, 1000);
  };

  const stopAutoCapture = (): void => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setCounting(false);
      setCountTicker(0);
    }
  };

  const handleNext = () => {
    localStorage.setItem("images", JSON.stringify(images));
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* MAIN CAMERA SECTION (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* TOP TOOLBAR: Device & Quick Config */}
          <div className="flex flex-wrap items-center justify-between bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-maroon/10 p-2 rounded-xl">
                <CameraIcon className="text-maroon" size={20} />
              </div>
              <Select value={deviceId || undefined} onValueChange={(value) => setDeviceId(value)}>
                <SelectTrigger className="w-56 border-none bg-gray-50 focus:ring-0">
                  <SelectValue
                    placeholder={devices[0]?.label || "Select Camera"}
                    className="overflow-hidden text-ellipsis"
                  />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl">
                  <SelectGroup>
                    <SelectLabel>Available Cameras</SelectLabel>
                    {devices
                      ?.filter((d) => d.deviceId)
                      .map((device) => (
                        <SelectItem
                          key={device.deviceId}
                          value={device.deviceId}
                        >
                          {device.label || "Unknown Camera"}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 p-1 rounded-2xl gap-3">
                <Button
                  variant={cameraSetting.mirrored ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "rounded-xl transition-all",
                    cameraSetting.mirrored &&
                      "bg-white shadow-sm text-maroon hover:bg-maroon/50",
                  )}
                  onClick={() =>
                    setCameraSetting((prev) => ({
                      ...prev,
                      mirrored: !prev.mirrored,
                    }))
                  }
                >
                  <FlipHorizontalIcon size={16} className="text-maroon" />
                </Button>
                <Button
                  variant={cameraSetting.fitCamera ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "rounded-xl transition-all",
                    cameraSetting.fitCamera &&
                      "bg-white shadow-sm text-maroon hover:bg-maroon/50",
                  )}
                  onClick={() =>
                    setCameraSetting((prev) => ({
                      ...prev,
                      fitCamera: !prev.fitCamera,
                    }))
                  }
                >
                  <FullscreenIcon size={16} className="text-maroon" />
                </Button>
              </div>
            </div>
          </div>

          {/* CENTER: WEBCAM STAGE */}
          <div className="relative aspect-[4/3] w-full bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden border-[12px] border-white group">
            <Webcam
              key={deviceId || "initial"}
              audio={false}
              mirrored={cameraSetting.mirrored}
              onUserMedia={() => {
                setIsCameraReady(true);
                refreshDevices();
              }}
              onUserMediaError={() => setIsCameraReady(false)}
              videoConstraints={{
                deviceId: deviceId ? { exact: deviceId } : undefined,
                aspectRatio: 4 / 3,
              }}
              screenshotFormat="image/jpeg"
              ref={webcamRef}
              screenshotQuality={1}
              className={cn(
                "w-full h-full transition-all duration-300",
                cameraSetting.fitCamera ? "object-cover" : "object-contain",
              )}
              style={{
                filter: `grayscale(${cameraSetting.grayscale}%) brightness(${cameraSetting.brightness}%) sepia(${cameraSetting.retroFilter}%) saturate(${cameraSetting.saturate}%) blur(${cameraSetting.softFilter}px)`,
              }}
            />

            {/* OVERLAYS */}
            {!isCameraReady && (
              <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-100 z-30">
                <div className="w-16 h-16 border-4 border-maroon border-t-transparent rounded-full animate-spin" />
                <p className="mt-6 text-maroon font-bold animate-pulse tracking-wide">
                  Requesting Camera Access...
                </p>
                <p className="text-xs text-gray-500 px-10 text-center mt-2">
                  If your browser asks for permission, please click "Allow" to
                  start the booth!
                </p>
              </div>
            )}

            {counting && (
              <div className="absolute inset-0 flex justify-center items-center z-50 pointer-events-none bg-black/10">
                <div
                  key={countTicker}
                  className="w-40 h-40 bg-white/20 backdrop-blur-md border border-white/50 text-8xl font-black flex justify-center items-center rounded-full text-white shadow-2xl animate-in zoom-in-50 fade-in duration-300"
                >
                  {countTicker}
                </div>
              </div>
            )}

            {/* Status Indicator */}
            <div className="absolute bottom-8 left-8 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 z-20">
              <div
                className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isCameraReady ? "bg-green-400" : "bg-red-400",
                )}
              />
              <span className="text-white text-xs font-bold uppercase tracking-widest">
                {isCameraReady ? "Live" : "Offline"}
              </span>
            </div>
          </div>

          {/* BOTTOM: MAIN ACTIONS */}
          <div className="flex items-center justify-center gap-6">
            <Button
              onClick={() => setImages([])}
              disabled={images.length <= 0}
              variant="outline"
              size="icon"
              className="w-14 h-14 rounded-2xl border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95"
            >
              <RotateCcwIcon size={24} />
            </Button>

            <div className="flex bg-white p-2 rounded-[2rem] shadow-xl border border-gray-100 gap-2 items-center">
              {counting ? (
                <Button
                  onClick={stopAutoCapture}
                  className="h-16 px-10 rounded-[1.5rem] bg-red-500 hover:bg-red-600 text-white font-bold text-lg gap-2 shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                >
                  Stop
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleCapture}
                    disabled={images.length >= totalPhoto}
                    className="h-16 px-10 rounded-[1.5rem] bg-maroon hover:bg-maroon/90 text-white font-bold text-lg gap-3 shadow-lg shadow-maroon/20 active:scale-95 transition-all"
                  >
                    <CameraIcon size={24} /> Capture
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={autoCapture}
                    disabled={images.length >= totalPhoto}
                    className="h-16 px-6 font-bold rounded-[1.5rem] hover:bg-maroon/10 text-maroon transition-all flex items-center gap-2"
                  >
                    <TimerIcon size={22} /> Auto
                  </Button>
                </>
              )}
            </div>

            {images.length >= totalPhoto ? (
              <Button
                asChild
                onClick={handleNext}
                className="w-14 h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white shadow-xl shadow-green-500/20 animate-bounce active:scale-95 transition-all"
              >
                <Link to="/photostrip">
                  <ChevronRightIcon size={32} />
                </Link>
              </Button>
            ) : (
              <div className="w-14 h-14" />
            )}
          </div>
        </div>

        {/* SIDEBAR: GALLERY & MODE (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6 w-full">
          {/* SESSION INFO CARD */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-800 tracking-tight text-xl font-bold">
                SESSION OPTIONS
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Delay Timer
                </label>
                <Select
                  value={count.toString()}
                  onValueChange={(v) => setCount(parseInt(v))}
                >
                  <SelectTrigger className="rounded-2xl border-gray-100 bg-gray-50">
                    <SelectValue placeholder={`${count} Seconds`} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="0">Instant</SelectItem>
                    <SelectItem value="3">3 Seconds</SelectItem>
                    <SelectItem value="4">4 Seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Layout
                </label>
                <Select
                  value={totalPhoto.toString()}
                  onValueChange={(v) => setTotalPhoto(parseInt(v))}
                >
                  <SelectTrigger className="rounded-2xl border-gray-100 bg-gray-50">
                    <SelectValue placeholder={`${totalPhoto} Photos`} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="3">3 Photos</SelectItem>
                    <SelectItem value="4">4 Photos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* FILTER SETTINGS CARD */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-black text-gray-800 tracking-tight text-xl flex items-center gap-2">
              <Settings2Icon className="text-maroon" size={20} /> FILTERS
            </h3>

            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-12 border-gray-200"
                  >
                    <FlaskRoundIcon size={16} className="mr-2 text-gray-500" />{" "}
                    Noir
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4 rounded-2xl">
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Noir / Grayscale
                    </span>
                    <Slider
                      defaultValue={cameraSetting.grayscale}
                      max={100}
                      onValueChange={(v) =>
                        setCameraSetting((p) => ({ ...p, grayscale: v }))
                      }
                    />
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-12 border-gray-200"
                  >
                    <SunIcon size={16} className="mr-2 text-gray-500" /> Glow
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4 rounded-2xl">
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Brightness
                    </span>
                    <Slider
                      defaultValue={cameraSetting.brightness}
                      min={100}
                      max={200}
                      onValueChange={(v) =>
                        setCameraSetting((p) => ({ ...p, brightness: v }))
                      }
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-12 border-gray-200"
                  >
                    <FilmIcon size={16} className="mr-2 text-gray-500" /> Soft
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4 rounded-2xl">
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Soft Focus
                    </span>
                    <Slider
                      defaultValue={cameraSetting.softFilter}
                      min={0}
                      max={2}
                      step={0.1}
                      onValueChange={(v) =>
                        setCameraSetting((p) => ({ ...p, softFilter: v }))
                      }
                    />
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-12 border-gray-200"
                  >
                    <CassetteTapeIcon
                      size={16}
                      className="mr-2 text-gray-500"
                    />{" "}
                    Retro
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4 rounded-2xl">
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Vintage / Sepia
                    </span>
                    <Slider
                      defaultValue={cameraSetting.retroFilter}
                      max={100}
                      onValueChange={(v) =>
                        setCameraSetting((p) => ({ ...p, retroFilter: v }))
                      }
                    />
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-12 border-gray-200"
                  >
                    <DropletIcon size={16} className="mr-2 text-gray-500" />{" "}
                    Vivid
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4 rounded-2xl">
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Saturation
                    </span>
                    <Slider
                      defaultValue={cameraSetting.saturate}
                      min={100}
                      max={200}
                      onValueChange={(v) =>
                        setCameraSetting((p) => ({ ...p, saturate: v }))
                      }
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* FILM STRIP GALLERY */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col gap-4 flex-1">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-black text-gray-800 tracking-tight flex items-center gap-2">
                <SparklesIcon size={18} className="text-maroon" /> GALLERY
              </h3>
              <span className="text-[10px] font-bold px-2 py-1 bg-maroon/10 text-maroon rounded-lg">
                {images.length} / {totalPhoto}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[300px] pr-1 scrollbar-hidden">
              {images.length === 0 ? (
                <div className="col-span-2 flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-100 rounded-[1.5rem] text-gray-300">
                  <CameraIcon size={32} className="mb-2 opacity-20" />
                  <p className="text-xs font-semibold">No photos yet</p>
                </div>
              ) : (
                images.map((image, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]"
                  >
                    <img
                      src={image.src}
                      alt={`Shot ${idx + 1}`}
                      className={cn(
                        "w-full h-full",
                        cameraSetting.fitCamera
                          ? "object-cover"
                          : "object-contain",
                      )}
                      style={{
                        filter: `grayscale(${image.filters.grayscale}%) brightness(${image.filters.brightness}%) sepia(${image.filters.retroFilter}%) saturate(${image.filters.saturate}%) blur(${image.filters.softFilter}px)`,
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[10px] text-white font-bold">
                      #{idx + 1}
                    </div>
                    <button
                      onClick={() =>
                        setImages((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2Icon size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {images.length >= totalPhoto && (
              <div className="pt-4 mt-auto border-t border-gray-50">
                <Button
                  asChild
                  onClick={handleNext}
                  className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold gap-2"
                >
                  <Link
                    to="/photostrip"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    Build My Strip <SparklesIcon size={18} />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Capture;
