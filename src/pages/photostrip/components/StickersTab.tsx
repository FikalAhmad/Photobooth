import { MoveIcon, Trash2Icon } from "lucide-react";
import { StickerItem } from "../photostrip.types";
import { EMOJI_CATEGORIES } from "../photostrip.constants";

type StickersTabProps = {
  stickers: StickerItem[];
  stickerSize: number;
  selectedId: string | null;
  emojiCategory: string;
  onCategoryChange: (cat: string) => void;
  onAddSticker: (emoji: string) => void;
  onSelectSticker: (id: string) => void;
  onDeleteSticker: (id: string) => void;
  onSizeChange: (id: string, size: number) => void;
  onRotationChange: (id: string, rotation: number) => void;
};

const StickersTab = ({
  stickers,
  selectedId,
  emojiCategory,
  onCategoryChange,
  onAddSticker,
  onSelectSticker,
  onDeleteSticker,
  onSizeChange,
  onRotationChange,
}: StickersTabProps) => {
  const selectedSticker = stickers.find((s) => s.id === selectedId);

  return (
    <div className="space-y-4">
      {/* Category pills */}
      <div className="flex gap-1.5 flex-wrap">
        {Object.keys(EMOJI_CATEGORIES).map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`text-xs px-2.5 py-1.5 rounded-full border font-medium transition-all ${
              emojiCategory === cat
                ? "bg-maroon text-white border-maroon shadow-sm"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-maroon/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="grid grid-cols-6 gap-2">
        {EMOJI_CATEGORIES[emojiCategory].map((emoji) => (
          <button
            key={emoji}
            onClick={() => onAddSticker(emoji)}
            title={`Add ${emoji}`}
            className="text-2xl aspect-square flex items-center justify-center rounded-xl border border-gray-100 bg-gray-50 hover:bg-maroon/10 hover:border-maroon/30 transition-all hover:scale-110 active:scale-95"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Selected sticker controls */}
      {selectedSticker && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
              <MoveIcon size={13} /> Editing: {selectedSticker.emoji}
            </span>
            <button
              onClick={() => onDeleteSticker(selectedSticker.id)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <Trash2Icon size={14} />
            </button>
          </div>

          <div>
            <label className="text-xs text-amber-600 font-semibold block mb-1.5">Size</label>
            <input
              type="range" min={20} max={120} value={selectedSticker.size}
              onChange={(e) => onSizeChange(selectedSticker.id, Number(e.target.value))}
              className="w-full accent-maroon"
            />
            <div className="flex justify-between text-[10px] text-amber-500 mt-0.5">
              <span>Tiny</span><span>Huge</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-amber-600 font-semibold block mb-1.5">
              Rotation: {Math.round(selectedSticker.rotation)}°
            </label>
            <input
              type="range" min={-180} max={180} value={selectedSticker.rotation}
              onChange={(e) => onRotationChange(selectedSticker.id, Number(e.target.value))}
              className="w-full accent-maroon"
            />
          </div>
        </div>
      )}

      {stickers.length > 0 && !selectedSticker && (
        <p className="text-[11px] text-gray-400 text-center italic">
          👆 Click a sticker on the preview to select &amp; edit it
        </p>
      )}

      {/* Sticker chip list */}
      {stickers.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">Added Stickers</p>
          <div className="flex flex-wrap gap-2">
            {stickers.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSticker(s.id)}
                className={`text-lg px-2 py-1 rounded-lg border transition-all ${
                  selectedId === s.id
                    ? "border-maroon bg-maroon/10"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {s.emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StickersTab;
