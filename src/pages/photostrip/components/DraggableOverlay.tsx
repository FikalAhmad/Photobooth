import { XIcon } from "lucide-react";
import { useRef, MouseEvent as ReactMouseEvent } from "react";

export type DraggableOverlayProps = {
  id: string;
  x: number;
  y: number;
  selected: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onMove: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  children: React.ReactNode;
};

const DraggableOverlay = ({
  id, x, y, selected, containerRef, onMove, onDelete, onSelect, children,
}: DraggableOverlayProps) => {
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: ReactMouseEvent) => {
    e.stopPropagation();
    onSelect(id);
    dragging.current = true;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left - (x / 100) * rect.width,
      y: e.clientY - rect.top - (y / 100) * rect.height,
    };

    const onMouseMove = (me: globalThis.MouseEvent) => {
      if (!dragging.current) return;
      const r = container.getBoundingClientRect();
      onMove(
        id,
        Math.max(0, Math.min(100, ((me.clientX - r.left - offset.current.x) / r.width) * 100)),
        Math.max(0, Math.min(100, ((me.clientY - r.top - offset.current.y) / r.height) * 100)),
      );
    };
    const onMouseUp = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    onSelect(id);
    dragging.current = true;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const touch = e.touches[0];
    offset.current = {
      x: touch.clientX - rect.left - (x / 100) * rect.width,
      y: touch.clientY - rect.top - (y / 100) * rect.height,
    };

    const onTouchMove = (me: TouchEvent) => {
      if (!dragging.current) return;
      const r = container.getBoundingClientRect();
      const t = me.touches[0];
      onMove(
        id,
        Math.max(0, Math.min(100, ((t.clientX - r.left - offset.current.x) / r.width) * 100)),
        Math.max(0, Math.min(100, ((t.clientY - r.top - offset.current.y) / r.height) * 100)),
      );
    };
    const onTouchEnd = () => {
      dragging.current = false;
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
  };

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        cursor: "move",
        userSelect: "none",
        zIndex: selected ? 20 : 10,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {children}
      {selected && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(id); }}
          style={{
            position: "absolute",
            top: "-12px",
            right: "-12px",
            background: "#ef4444",
            borderRadius: "50%",
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid white",
            color: "white",
            cursor: "pointer",
            padding: 0,
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
        >
          <XIcon size={11} />
        </button>
      )}
    </div>
  );
};

export default DraggableOverlay;
