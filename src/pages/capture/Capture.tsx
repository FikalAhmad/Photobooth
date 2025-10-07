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

  const { devices, deviceId, setDeviceId } = useCameraDevices();

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

      const timer = setInterval(() => {
        countdown -= 1;
        setCountTicker(countdown);

        if (countdown === 0) {
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
              photoCountRef.current += 1;
            }
          }

          if (photoCountRef.current >= totalPhoto) {
            clearInterval(timer);
            setCounting(false);
            setCountTicker(0);
          } else {
            countdown = count;
            setCountTicker(countdown);
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
    photoCountRef.current = images.length; // ✅ UBAH: Mulai dari jumlah foto yang sudah ada
    let countdown = newCount;
    setCountTicker(countdown);

    timerRef.current = setInterval(() => {
      countdown -= 1;
      setCountTicker(countdown);

      if (countdown === 0) {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            photoCountRef.current += 1; // ✅ Increment SEBELUM cek

            // ✅ Cek dulu sebelum menambah ke state
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

            // ✅ Cek lagi setelah menambah foto
            if (photoCountRef.current >= totalPhoto) {
              clearInterval(timerRef.current!);
              timerRef.current = null;
              setCounting(false);
              setCountTicker(0);
              return;
            }
          }
        }

        // Reset countdown untuk foto berikutnya
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
    <div className="mx-20 md:mx-10 my-9 flex gap-32  flex-col lg:flex-row items-center lg:items-stretch">
      <div className="flex gap-8">
        <div className="flex flex-col gap-5">
          <div className="flex justify-between">
            <Select onValueChange={(value) => setDeviceId(value)}>
              <SelectTrigger className="w-64">
                <SelectValue
                  placeholder={devices[0]?.label}
                  className="overflow-hidden text-ellipsis"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Camera Available</SelectLabel>
                  {devices?.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setCount(parseInt(value))}>
              <SelectTrigger className="w-40">
                <SelectValue
                  defaultValue={`${count} Seconds`}
                  placeholder={`${count} Seconds`}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Count</SelectLabel>
                  <SelectItem value="0">No Count</SelectItem>
                  <SelectItem value="3">3 Seconds</SelectItem>
                  <SelectItem value="4">4 Seconds</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setTotalPhoto(parseInt(value))}>
              <SelectTrigger className="w-40">
                <SelectValue
                  defaultValue={`${totalPhoto} Photos`}
                  placeholder={`${totalPhoto} Photos`}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Photostrip Layout</SelectLabel>
                  <SelectItem value="3">3 Photos</SelectItem>
                  <SelectItem value="4">4 Photos</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* WEBCAM */}
          <div className="relative">
            <Webcam
              key={deviceId}
              audio={false}
              mirrored={cameraSetting.mirrored}
              videoConstraints={{
                deviceId: deviceId ? { exact: deviceId } : undefined,
              }}
              screenshotFormat="image/jpeg"
              ref={webcamRef}
              screenshotQuality={1}
              className={`w-[672px] h-[502px] border border-gray-300 rounded-lg ${
                cameraSetting.fitCamera ? "object-cover" : "object-contain"
              }`}
              style={{
                filter: `grayscale(${cameraSetting.grayscale}%) brightness(${cameraSetting.brightness}%) sepia(${cameraSetting.retroFilter}%) saturate(${cameraSetting.saturate}%) blur(${cameraSetting.softFilter}px)`,
              }}
            />
            {!counting ? null : (
              <div className="absolute inset-0 flex justify-center items-center">
                <div className="w-28 h-28 bg-white/50 text-5xl flex justify-center items-center rounded-full animate-ping duration-1000">
                  {countTicker}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              {images.length >= totalPhoto ? (
                <Button
                  className="px-10 py-5 bg-green-600"
                  asChild
                  onClick={handleNext}
                >
                  <Link to={"/photostrip"}>
                    Next <SparklesIcon size={64} />
                  </Link>
                </Button>
              ) : (
                <Button onClick={handleCapture}>Capture Image</Button>
              )}
              {counting ? (
                <Button size={"default"} onClick={stopAutoCapture}>
                  Stop
                </Button>
              ) : (
                <Button
                  size={"default"}
                  disabled={images.length >= totalPhoto}
                  onClick={autoCapture}
                >
                  Auto Capture
                </Button>
              )}
              <Button
                size={"icon"}
                onClick={() => setImages([])}
                disabled={images.length <= 0}
              >
                <RotateCcwIcon size={64} />
              </Button>
            </div>
            <div className="px-2 py-1 h-max rounded-full text-xs bg-maroon text-white font-bold">
              Captured Image: {images.length} / {totalPhoto}
            </div>
          </div>
        </div>

        {/* MENU SETTING CAMERA     */}
        <div className="flex flex-col gap-3">
          <Button
            size={"icon"}
            onClick={() =>
              setCameraSetting({
                ...cameraSetting,
                mirrored: !cameraSetting.mirrored,
              })
            }
          >
            <FlipHorizontalIcon />
          </Button>
          <Button
            size={"icon"}
            onClick={() =>
              setCameraSetting({
                ...cameraSetting,
                fitCamera: !cameraSetting.fitCamera,
              })
            }
          >
            <FullscreenIcon />
          </Button>

          {/* FILTER */}
          <Popover>
            <PopoverTrigger asChild>
              <Button size={"icon"}>
                <FlaskRoundIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 flex flex-col gap-1">
              <div className="flex flex-col gap-2 text-sm">
                <div className="font-bold">Grayscale Intensity:</div>
                <div className="flex justify-between text-[5px]">
                  <div>Off</div>
                  <div>50%</div>
                  <div>100%</div>
                </div>
              </div>
              <Slider
                defaultValue={cameraSetting.grayscale}
                max={100}
                step={1}
                className="w-44"
                onValueChange={(value) =>
                  setCameraSetting({
                    ...cameraSetting,
                    grayscale: value,
                  })
                }
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button size={"icon"}>
                <FilmIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 flex flex-col gap-1">
              <div className="flex flex-col gap-2 text-sm">
                <div className="font-bold">Soft Filter Intensity:</div>
                <div className="flex justify-between text-[5px]">
                  <div>Off</div>
                  <div>50%</div>
                  <div>100%</div>
                </div>
              </div>
              <Slider
                defaultValue={cameraSetting.softFilter}
                min={0}
                max={2}
                step={0.1}
                className="w-44"
                onValueChange={(value) =>
                  setCameraSetting({
                    ...cameraSetting,
                    softFilter: value,
                  })
                }
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button size={"icon"}>
                <CassetteTapeIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 flex flex-col gap-1">
              <div className="flex flex-col gap-2 text-sm">
                <div className="font-bold">Retro Filter Intensity:</div>
                <div className="flex justify-between text-[5px]">
                  <div>Off</div>
                  <div>50%</div>
                  <div>100%</div>
                </div>
              </div>
              <Slider
                defaultValue={cameraSetting.retroFilter}
                max={100}
                step={1}
                className="w-44"
                onValueChange={(value) =>
                  setCameraSetting({
                    ...cameraSetting,
                    retroFilter: value,
                  })
                }
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button size={"icon"}>
                <SunIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 flex flex-col gap-1">
              <div className="flex flex-col gap-2 text-sm">
                <div className="font-bold">Brightness Intensity:</div>
                <div className="flex justify-between text-[5px]">
                  <div>Off</div>
                  <div>50%</div>
                  <div>100%</div>
                </div>
              </div>
              <Slider
                defaultValue={cameraSetting.brightness}
                min={100}
                max={200}
                step={1}
                className="w-44"
                onValueChange={(value) =>
                  setCameraSetting({
                    ...cameraSetting,
                    brightness: value,
                  })
                }
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button size={"icon"}>
                <DropletIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 flex flex-col gap-1">
              <div className="flex flex-col gap-2 text-sm">
                <div className="font-bold">Saturate Intensity:</div>
                <div className="flex justify-between text-[5px]">
                  <div>Off</div>
                  <div>50%</div>
                  <div>100%</div>
                </div>
              </div>
              <Slider
                defaultValue={cameraSetting.saturate}
                min={100}
                max={200}
                step={1}
                className="w-40"
                onValueChange={(value) =>
                  setCameraSetting({
                    ...cameraSetting,
                    saturate: value,
                  })
                }
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* PREVIEW PHOTO */}
      <div className="flex flex-col gap-2">
        {images.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={`Photostrip ${index}`}
            className={cn(
              "w-[253px] h-[190px] border border-gray-300 rounded-md object-contain",
              {
                "object-cover": cameraSetting.fitCamera,
              }
            )}
            style={{
              filter: `grayscale(${image.filters.grayscale}%) brightness(${image.filters.brightness}%) sepia(${image.filters.retroFilter}%) saturate(${image.filters.saturate}%) blur(${image.filters.softFilter}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Capture;
