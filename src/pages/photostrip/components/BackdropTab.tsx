import { CheckIcon, PaletteIcon, SparklesIcon } from "lucide-react";
import { BG_COLORS } from "../photostrip.constants";

type BackdropTabProps = {
  bgColor: string | null;
  onSelectColor: (color: string) => void;
};

const BackdropTab = ({ bgColor, onSelectColor }: BackdropTabProps) => (
  <div className="space-y-5">
    <div>
      <label className="text-xs font-semibold text-gray-600 mb-3 block">Background Color</label>
      <div className="grid grid-cols-5 gap-2.5">
        {BG_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onSelectColor(color)}
            title={color}
            className={`w-full aspect-square rounded-full border-2 transition-all hover:scale-110 relative ${
              bgColor === color
                ? "border-maroon shadow-md ring-2 ring-maroon/20"
                : "border-gray-200"
            }`}
            style={{ backgroundColor: color }}
          >
            {bgColor === color && (
              <span className="absolute inset-0 flex items-center justify-center">
                <CheckIcon
                  size={12}
                  className={
                    color === "#ffffff" || color.startsWith("#f")
                      ? "text-gray-600"
                      : "text-white"
                  }
                />
              </span>
            )}
          </button>
        ))}

        {/* Custom color picker */}
        <div className="relative w-full aspect-square rounded-full border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 hover:border-maroon transition-all hover:scale-110">
          <PaletteIcon size={16} className="text-gray-500 pointer-events-none" />
          <input
            type="color"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            onChange={(e) => onSelectColor(e.target.value)}
            title="Custom color"
          />
        </div>
      </div>
    </div>

    <div className="bg-maroon/5 rounded-2xl p-3.5 border border-maroon/10">
      <p className="text-xs text-gray-500 flex items-start gap-2 italic">
        <SparklesIcon size={13} className="text-maroon mt-0.5 flex-shrink-0" />
        Tip: Solid backdrop colors pair beautifully with minimalist themes to let your photos shine.
      </p>
    </div>
  </div>
);

export default BackdropTab;
