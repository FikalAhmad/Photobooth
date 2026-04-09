import { Button } from "@/components/ui/button";
import { CheckIcon, MoveIcon, PaletteIcon, Trash2Icon, TypeIcon } from "lucide-react";
import { TextItem } from "../photostrip.types";
import { FONT_FAMILIES, TEXT_PRESET_COLORS } from "../photostrip.constants";

type TextTabProps = {
  texts: TextItem[];
  selectedId: string | null;
  editingTextId: string | null;
  textInput: string;
  textColor: string;
  textSize: number;
  textFont: string;
  textBold: boolean;
  onTextInputChange: (v: string) => void;
  onColorChange: (v: string) => void;
  onSizeChange: (v: number) => void;
  onFontChange: (v: string) => void;
  onBoldToggle: (v: boolean) => void;
  onAddText: () => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onStartEdit: (id: string) => void;
  onSelectText: (id: string) => void;
  onDeleteText: (id: string) => void;
  onRotationChange: (id: string, rotation: number) => void;
};

const TextTab = ({
  texts, selectedId, editingTextId,
  textInput, textColor, textSize, textFont, textBold,
  onTextInputChange, onColorChange, onSizeChange, onFontChange, onBoldToggle,
  onAddText, onCommitEdit, onCancelEdit, onStartEdit, onSelectText, onDeleteText,
  onRotationChange,
}: TextTabProps) => {
  const selectedText = texts.find((t) => t.id === selectedId);

  return (
    <div className="space-y-4">
      {/* ── Form ── */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">Text Content</label>
          <input
            type="text"
            value={textInput}
            onChange={(e) => onTextInputChange(e.target.value)}
            placeholder="Enter your text..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-maroon/60 focus:ring-2 focus:ring-maroon/10 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Font</label>
            <select
              value={textFont}
              onChange={(e) => onFontChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none focus:border-maroon/60 bg-white"
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Size: {textSize}px
            </label>
            <input
              type="range" min={14} max={80} value={textSize}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className="w-full mt-2 accent-maroon"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Color</label>
            <div className="flex gap-2 flex-wrap">
              {TEXT_PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => onColorChange(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                    textColor === c ? "border-maroon scale-110" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              {/* Custom color */}
              <div className="relative w-6 h-6 rounded-full border-2 border-dashed border-gray-300 overflow-hidden hover:border-maroon">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <PaletteIcon size={12} className="absolute inset-0 m-auto text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="ml-auto">
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Style</label>
            <button
              onClick={() => onBoldToggle(!textBold)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                textBold
                  ? "bg-maroon text-white border-maroon"
                  : "bg-gray-50 text-gray-600 border-gray-200"
              }`}
            >
              Bold
            </button>
          </div>
        </div>

        {/* Preview swatch */}
        <div
          className="rounded-xl p-3 text-center text-sm font-semibold border"
          style={{
            fontFamily: textFont,
            color: textColor,
            fontWeight: textBold ? "bold" : "normal",
            background: textColor === "#ffffff" ? "#1e1e2e" : "#f9f9f9",
            borderColor: "rgba(0,0,0,0.08)",
            fontSize: Math.min(textSize, 24),
          }}
        >
          {textInput || "Preview text"}
        </div>

        {/* Add / Update buttons */}
        {editingTextId ? (
          <div className="flex gap-2">
            <Button
              onClick={onCommitEdit}
              className="flex-1 rounded-xl bg-maroon text-white h-10 text-sm"
            >
              <CheckIcon size={15} className="mr-1" /> Update Text
            </Button>
            <Button
              onClick={onCancelEdit}
              variant="outline"
              className="rounded-xl h-10 text-sm border-gray-200"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            onClick={onAddText}
            disabled={!textInput.trim()}
            className="w-full rounded-xl bg-maroon hover:bg-maroon/80 text-white h-10 text-sm shadow-md"
          >
            <TypeIcon size={15} className="mr-2" /> Add Text to Strip
          </Button>
        )}
      </div>

      {/* ── Selected text rotation control ── */}
      {selectedText && !editingTextId && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 flex items-center gap-1.5">
              <MoveIcon size={13} /> Selected: "{selectedText.text}"
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onStartEdit(selectedText.id)}
                className="text-purple-500 text-xs font-semibold hover:text-purple-700"
              >
                Edit
              </button>
              <button
                onClick={() => onDeleteText(selectedText.id)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2Icon size={14} />
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-purple-600 font-semibold block mb-1.5">
              Rotation: {Math.round(selectedText.rotation)}°
            </label>
            <input
              type="range" min={-180} max={180} value={selectedText.rotation}
              onChange={(e) => onRotationChange(selectedText.id, Number(e.target.value))}
              className="w-full accent-maroon"
            />
          </div>
        </div>
      )}

      {/* ── Text list ── */}
      {texts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">Added Texts</p>
          <div className="space-y-1.5">
            {texts.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectText(t.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all border ${
                  selectedId === t.id
                    ? "border-maroon/40 bg-maroon/5"
                    : "border-gray-100 hover:border-gray-200 bg-gray-50"
                }`}
              >
                <span
                  className="text-xs truncate"
                  style={{
                    fontFamily: t.fontFamily,
                    color: t.color === "#ffffff" ? "#555" : t.color,
                    fontWeight: t.bold ? "bold" : "normal",
                  }}
                >
                  {t.text}
                </span>
                <div className="flex gap-1.5 ml-2 flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); onStartEdit(t.id); }}
                    className="text-gray-400 hover:text-purple-500"
                  >
                    <TypeIcon size={13} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteText(t.id); }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2Icon size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {texts.length === 0 && (
        <p className="text-[11px] text-gray-400 text-center italic">
          Add a text and drag it anywhere on the preview
        </p>
      )}
    </div>
  );
};

export default TextTab;
