import { CheckIcon, XIcon } from "lucide-react";
import { CapturedImage } from "@/types/global.types";
import { photostrip } from "@/lib/photostrip";

type ThemesTabProps = {
  images: CapturedImage[];
  pickstrip: string;
  onSelectTheme: (src: string) => void;
  onClearTheme: () => void;
};

const ThemesTab = ({ images, pickstrip, onSelectTheme, onClearTheme }: ThemesTabProps) => {
  const templates = photostrip.filter((item) =>
    images.length === 3 ? !item.src.startsWith("/4-") : item.src.startsWith("/4-"),
  );

  return (
    <>
      <p className="text-xs text-gray-400 mb-3 font-medium">Select a template overlay</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {/* "None" option */}
        <button
          onClick={onClearTheme}
          title="No Theme"
          className={`group relative aspect-[1/3] border-2 rounded-xl overflow-hidden transition-all hover:scale-105 flex items-center justify-center bg-gray-50 ${
            !pickstrip
              ? "border-maroon shadow-md ring-2 ring-maroon/20"
              : "border-transparent hover:border-gray-200"
          }`}
        >
          <XIcon size={20} className="text-gray-300" />
          <span className="absolute bottom-1 text-[9px] font-semibold text-gray-400">None</span>
          {!pickstrip && (
            <div className="absolute top-1.5 right-1.5 bg-maroon text-white rounded-full p-0.5">
              <CheckIcon size={8} />
            </div>
          )}
        </button>

        {templates.map((item, idx) => (
          <button
            key={`template-${idx}`}
            onClick={() => onSelectTheme(item.src)}
            title={item.label}
            className={`group relative aspect-[1/3] border-2 rounded-xl overflow-hidden transition-all hover:scale-105 ${
              pickstrip === item.src
                ? "border-maroon shadow-md ring-2 ring-maroon/20"
                : "border-transparent hover:border-gray-200"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${item.src})` }}
            />
            <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-[9px] text-white text-center font-medium truncate">{item.label}</p>
            </div>
            {pickstrip === item.src && (
              <div className="absolute top-1.5 right-1.5 bg-maroon text-white rounded-full p-0.5 border border-white">
                <CheckIcon size={8} />
              </div>
            )}
          </button>
        ))}
      </div>
    </>
  );
};

export default ThemesTab;
