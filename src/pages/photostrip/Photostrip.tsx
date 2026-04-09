import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DownloadIcon,
  LayoutIcon,
  PaletteIcon,
  RotateCcwIcon,
  SparklesIcon,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { CANVAS_CONFIG, PREVIEW_WIDTH } from "./photostrip.constants";
import { usePhotoStripCanvas } from "./hooks/usePhotoStripCanvas";
import { useStickers } from "./hooks/useStickers";
import { useTextItems } from "./hooks/useTextItems";

import DraggableOverlay from "./components/DraggableOverlay";
import ThemesTab from "./components/ThemesTab";
import BackdropTab from "./components/BackdropTab";
import StickersTab from "./components/StickersTab";
import TextTab from "./components/TextTab";

const TABS = [
  { value: "themes", icon: <LayoutIcon size={15} />, label: "Themes" },
  { value: "backdrop", icon: <PaletteIcon size={15} />, label: "Color" },
  // { value: "stickers", icon: <SmileIcon size={15} />, label: "Stickers" },
  // { value: "text", icon: <TypeIcon size={15} />, label: "Text" },
];

const PhotoStripGenerator = () => {
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // ── Backdrop / theme state ──
  const [pickstrip, setPickstrip] = useState("");
  const [bgColor, setBgColor] = useState<string | null>("#ffffff");
  const [activeTab, setActiveTab] = useState("themes");

  // ── Stickers ──
  const {
    stickers,
    stickerSize,
    setStickerSize,
    addSticker,
    moveSticker,
    deleteSticker,
    updateStickerSize,
    updateStickerRotation,
  } = useStickers();

  // ── Text items ──
  const {
    texts,
    form,
    editingTextId,
    setTextInput,
    setTextColor,
    setTextSize,
    setTextFont,
    setTextBold,
    addText,
    startEditText,
    commitTextEdit,
    cancelTextEdit,
    moveText,
    deleteText,
    updateTextRotation,
  } = useTextItems();

  // ── Sticker emoji category ──
  const [emojiCategoryState, setEmojiCategoryState] = useState("Love 💕");

  // ── Unified selection ──
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectItem = useCallback((id: string) => setSelectedId(id), []);
  const clearSelection = () => setSelectedId(null);

  // ── Canvas rendering ──
  const { canvasRef, images, preview, isRendering, error, downloadPhotoStrip } =
    usePhotoStripCanvas({ pickstrip, bgColor, stickers, texts });

  // ── Backdrop helpers ──
  const handlePickstrip = (background: string) => {
    if (background.startsWith("#")) {
      setBgColor(background);
      setPickstrip("");
    } else {
      setPickstrip(background);
      setBgColor(null);
    }
  };

  // ── Unified move (works for both stickers and texts) ──
  const moveItem = useCallback(
    (id: string, x: number, y: number) => {
      moveSticker(id, x, y);
      moveText(id, x, y);
    },
    [moveSticker, moveText],
  );

  // ── Delete by id (sticker or text) ──
  const deleteItem = useCallback(
    (id: string) => {
      deleteSticker(id);
      deleteText(id);
      setSelectedId((prev) => (prev === id ? null : prev));
    },
    [deleteSticker, deleteText],
  );

  // ── Add sticker & auto-select ──
  const handleAddSticker = (emoji: string) => {
    const id = addSticker(emoji);
    setSelectedId(id);
  };

  // ── Add text & auto-select ──
  const handleAddText = () => {
    const id = addText();
    if (id) setSelectedId(id);
  };

  // ── Start edit text & sync selection ──
  const handleStartEditText = (id: string) => {
    startEditText(id);
    setSelectedId(id);
  };

  if (error)
    return <div className="text-center p-20 text-red-500">{error}</div>;

  return (
    <div
      className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 md:p-8"
      style={{
        background:
          "linear-gradient(135deg, #fdf4f4 0%, #f9f0ff 50%, #f0f4ff 100%)",
      }}
      onClick={clearSelection}
    >
      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-8 items-start">
        {/* ════════════  LEFT: PREVIEW  ════════════ */}
        <div className="w-full lg:w-auto flex-shrink-0 flex flex-col items-center gap-4">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isRendering ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`}
            />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {isRendering ? "Rendering…" : "Live Preview"}
            </span>
          </div>

          {/* Preview + draggable overlays */}
          <div
            ref={previewContainerRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "fit-content",
              boxShadow:
                "0 25px 50px -12px rgba(130,32,31,0.25), 0 0 0 1px rgba(0,0,0,0.04)",
              borderRadius: 16,
              overflow: "hidden",
              background: bgColor || "transparent",
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="Photo Strip Preview"
                style={{
                  display: "block",
                  width: PREVIEW_WIDTH,
                  height: "auto",
                }}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
            ) : (
              <div
                style={{
                  width: PREVIEW_WIDTH,
                  height: 720,
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9ca3af",
                  fontSize: 14,
                }}
              >
                Generating…
              </div>
            )}

            {/* Sticker overlays */}
            {stickers.map((s) => (
              <DraggableOverlay
                key={s.id}
                id={s.id}
                x={s.x}
                y={s.y}
                selected={selectedId === s.id}
                containerRef={previewContainerRef}
                onMove={moveItem}
                onDelete={deleteItem}
                onSelect={(id) => {
                  selectItem(id);
                  cancelTextEdit();
                }}
              >
                <span
                  style={{
                    fontSize: `${(s.size / CANVAS_CONFIG.width) * PREVIEW_WIDTH}px`,
                    display: "block",
                    transform: `rotate(${s.rotation}deg)`,
                    filter:
                      selectedId === s.id
                        ? "drop-shadow(0 0 6px rgba(130,32,31,0.8))"
                        : "none",
                    lineHeight: 1,
                  }}
                >
                  {s.emoji}
                </span>
              </DraggableOverlay>
            ))}

            {/* Text overlays */}
            {texts.map((t) => (
              <DraggableOverlay
                key={t.id}
                id={t.id}
                x={t.x}
                y={t.y}
                selected={selectedId === t.id}
                containerRef={previewContainerRef}
                onMove={moveItem}
                onDelete={deleteItem}
                onSelect={(id) => {
                  selectItem(id);
                  cancelTextEdit();
                }}
              >
                <span
                  style={{
                    fontSize: `${(t.size / CANVAS_CONFIG.width) * PREVIEW_WIDTH}px`,
                    fontFamily: t.fontFamily,
                    fontWeight: t.bold ? "bold" : "normal",
                    color: t.color,
                    whiteSpace: "nowrap",
                    display: "block",
                    transform: `rotate(${t.rotation}deg)`,
                    textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                    filter:
                      selectedId === t.id
                        ? "drop-shadow(0 0 6px rgba(130,32,31,0.8))"
                        : "none",
                  }}
                  onDoubleClick={() => handleStartEditText(t.id)}
                >
                  {t.text}
                </span>
              </DraggableOverlay>
            ))}
          </div>

          {/* Action buttons */}
          <div
            className="flex gap-3 w-full"
            style={{ maxWidth: PREVIEW_WIDTH }}
          >
            <Button
              asChild
              variant="outline"
              className="flex-1 h-11 rounded-xl border-maroon/40 text-maroon hover:bg-maroon/5 text-sm"
            >
              <Link to="/capture" className="flex items-center gap-2">
                <RotateCcwIcon size={16} /> Retake
              </Link>
            </Button>
            <Button
              onClick={downloadPhotoStrip}
              disabled={!preview || isRendering}
              className="flex-1 h-11 rounded-xl bg-maroon hover:bg-maroon/80 text-white shadow-lg text-sm"
            >
              <DownloadIcon size={16} className="mr-1" /> Save
            </Button>
          </div>
        </div>

        {/* ════════════  RIGHT: CONTROLS  ════════════ */}
        <div
          className="flex-1 w-full rounded-3xl border border-gray-100 overflow-hidden flex flex-col"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px)",
            boxShadow:
              "0 8px 32px rgba(130,32,31,0.08), 0 0 0 1px rgba(130,32,31,0.04)",
          }}
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
              <SparklesIcon size={20} className="text-maroon" />
              Canvas Editor
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">
              Customize themes, colors, stickers &amp; text
            </p>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="grid grid-cols-4 bg-gray-50/70 p-1.5 h-auto rounded-none border-b border-gray-100 gap-1">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-lg py-2 text-xs flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-maroon font-medium"
                >
                  {tab.icon} {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div
              className="overflow-y-auto flex-1 p-5"
              style={{ maxHeight: "calc(100vh - 340px)" }}
            >
              <TabsContent value="themes" className="mt-0 outline-none">
                <ThemesTab
                  images={images}
                  pickstrip={pickstrip}
                  onSelectTheme={handlePickstrip}
                  onClearTheme={() => {
                    setPickstrip("");
                    setBgColor("#ffffff");
                  }}
                />
              </TabsContent>

              <TabsContent value="backdrop" className="mt-0 outline-none">
                <BackdropTab
                  bgColor={bgColor}
                  onSelectColor={handlePickstrip}
                />
              </TabsContent>

              <TabsContent value="stickers" className="mt-0 outline-none">
                <StickersTab
                  stickers={stickers}
                  stickerSize={stickerSize}
                  selectedId={selectedId}
                  emojiCategory={emojiCategoryState}
                  onCategoryChange={setEmojiCategoryState}
                  onAddSticker={handleAddSticker}
                  onSelectSticker={selectItem}
                  onDeleteSticker={deleteItem}
                  onSizeChange={(id, size) => {
                    updateStickerSize(id, size);
                    setStickerSize(size);
                  }}
                  onRotationChange={updateStickerRotation}
                />
              </TabsContent>

              <TabsContent value="text" className="mt-0 outline-none">
                <TextTab
                  texts={texts}
                  selectedId={selectedId}
                  editingTextId={editingTextId}
                  textInput={form.textInput}
                  textColor={form.textColor}
                  textSize={form.textSize}
                  textFont={form.textFont}
                  textBold={form.textBold}
                  onTextInputChange={setTextInput}
                  onColorChange={setTextColor}
                  onSizeChange={setTextSize}
                  onFontChange={setTextFont}
                  onBoldToggle={setTextBold}
                  onAddText={handleAddText}
                  onCommitEdit={commitTextEdit}
                  onCancelEdit={cancelTextEdit}
                  onStartEdit={handleStartEditText}
                  onSelectText={selectItem}
                  onDeleteText={deleteItem}
                  onRotationChange={updateTextRotation}
                />
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex gap-2 items-center">
              {stickers.length > 0 && (
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                  {stickers.length} sticker{stickers.length > 1 ? "s" : ""}
                </span>
              )}
              {texts.length > 0 && (
                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                  {texts.length} text{texts.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-300 italic">
              Fotoboothgaksi © 2026
            </p>
          </div>
        </div>
      </div>

      {/* Hidden canvas for final render */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default PhotoStripGenerator;
