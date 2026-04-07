import { useState, useRef, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

export default function ImageLightbox({ images, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const lastPan = useRef({ x: 0, y: 0 });

  // Reset zoom/pan when image changes
  useEffect(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, [index]);

  // Keyboard nav
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length]);

  function goNext() {
    setIndex(i => (i + 1) % images.length);
  }
  function goPrev() {
    setIndex(i => (i - 1 + images.length) % images.length);
  }

  function onWheel(e) {
    e.preventDefault();
    setScale(s => Math.min(5, Math.max(1, s - e.deltaY * 0.01)));
  }

  function onMouseDown(e) {
    if (scale === 1) return;
    setDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  }

  function onMouseMove(e) {
    if (!dragging || !dragStart.current) return;
    setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  }

  function onMouseUp() {
    setDragging(false);
  }

  // Touch support
  const lastTouchDist = useRef(null);
  function onTouchStart(e) {
    if (e.touches.length === 2) {
      lastTouchDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    } else if (e.touches.length === 1 && scale > 1) {
      dragStart.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
    }
  }
  function onTouchMove(e) {
    if (e.touches.length === 2 && lastTouchDist.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setScale(s => Math.min(5, Math.max(1, s * (dist / lastTouchDist.current))));
      lastTouchDist.current = dist;
    } else if (e.touches.length === 1 && dragStart.current && scale > 1) {
      setPan({ x: e.touches[0].clientX - dragStart.current.x, y: e.touches[0].clientY - dragStart.current.y });
    }
  }
  function onTouchEnd() {
    lastTouchDist.current = null;
  }

  const currentImage = images[index];

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ backgroundColor: "rgba(0,0,0,0.92)" }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScale(s => Math.min(5, s + 0.5))}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setScale(s => Math.max(1, s - 0.5))}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-white/40 text-xs">{Math.round(scale * 100)}%</span>
        </div>
        {images.length > 1 && (
          <span className="text-white/50 text-sm">{index + 1} / {images.length}</span>
        )}
        <button onClick={onClose} className="p-2 text-white/70 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main image area */}
      <div
        className="flex-1 relative overflow-hidden flex items-center justify-center"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "default" }}
      >
        <img
          src={currentImage}
          alt=""
          draggable={false}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            transform: `scale(${scale}) translate(${pan.x / scale}px, ${pan.y / scale}px)`,
            transition: dragging ? "none" : "transform 0.1s ease",
            userSelect: "none",
          }}
        />

        {/* Prev / Next arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-3 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 justify-center px-4 py-3 overflow-x-auto flex-shrink-0">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="flex-shrink-0 w-14 h-14 overflow-hidden transition-all"
              style={{
                outline: i === index ? "2px solid #C57A1F" : "2px solid transparent",
                outlineOffset: "2px",
                opacity: i === index ? 1 : 0.5,
              }}
            >
              <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}