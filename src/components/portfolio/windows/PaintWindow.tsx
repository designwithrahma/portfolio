import { useRef, useState, useEffect } from "react";
import { Eraser, Trash2, Check, Sparkles, Paintbrush } from "lucide-react";

const COLORS = [
  "#000000",
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#ffffff",
];

const STORAGE_KEY = "rahma-guestbook-doodles";

export function PaintWindow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const isDrawingRef = useRef(false);
  const [savedCount, setSavedCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill white background initially
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load saved count
    try {
      const existing: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setSavedCount(Array.isArray(existing) ? existing.length : 0);
    } catch {}
  }, []);

  const pixelRatio = Math.min(3, Math.max(1, window.devicePixelRatio || 1));

  const pointOnCanvas = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const point = pointOnCanvas(event);
    if (!canvas || !point) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.setPointerCapture?.(event.pointerId);

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = isEraser ? "#ffffff" : color;
    ctx.lineWidth = brushSize * pixelRatio;
    isDrawingRef.current = true;
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const point = pointOnCanvas(event);
    if (!canvas || !point) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const stopDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const existing: { date: string; data: string }[] = Array.isArray(parsed) ? parsed : [];
      const next = [...existing, { date: new Date().toISOString(), data: dataUrl }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSavedCount(next.length);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="h-full flex flex-col bg-[#f5f4f0] text-ink p-4 sm:p-6 overflow-hidden select-none">
      {/* Tool Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-ink/10 shadow-sm mb-3">
        {/* Colors */}
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setIsEraser(false);
              }}
              aria-label={`Select brush color ${c}`}
              style={{ backgroundColor: c }}
              className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                color === c && !isEraser ? "scale-110 border-ink ring-2 ring-ink/20" : "border-ink/10"
              }`}
            />
          ))}
        </div>

        {/* Brush Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEraser(false)}
            aria-label="Brush tool"
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
              !isEraser ? "bg-ink text-white border-ink" : "border-ink/15 text-ink hover:bg-ink/5"
            }`}
          >
            <Paintbrush size={13} />
            <span className="hidden sm:inline">Brush</span>
          </button>

          <button
            onClick={() => setIsEraser(true)}
            aria-label="Eraser tool"
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
              isEraser ? "bg-ink text-white border-ink" : "border-ink/15 text-ink hover:bg-ink/5"
            }`}
          >
            <Eraser size={13} />
            <span className="hidden sm:inline">Eraser</span>
          </button>

          <div className="flex items-center gap-1.5 pl-2 border-l border-ink/10">
            <span className="text-[10px] font-mono text-ink/40">Size:</span>
            <input
              type="range"
              min="1"
              max="24"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-16 h-1 bg-ink/20 rounded-lg appearance-none cursor-pointer accent-ink"
            />
          </div>

          <button
            onClick={clearCanvas}
            aria-label="Clear canvas"
            className="p-1.5 rounded-lg border border-ink/15 text-ink/60 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Action button */}
        <button
          onClick={saveSignature}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer"
        >
          {copied ? <Check size={13} /> : <Sparkles size={13} />}
          <span>{copied ? "Signed & Saved!" : "Sign Guestbook"}</span>
        </button>
      </div>

      {/* Main Canvas — fixed 8:5 frame so strokes never stretch with the
         window; tall mobile layouts letterbox instead of distorting. */}
      <div className="flex-1 relative rounded-xl border border-ink/15 overflow-hidden shadow-inner bg-white flex items-center justify-center p-3">
        <canvas
          ref={canvasRef}
          width={Math.round(800 * pixelRatio)}
          height={Math.round(500 * pixelRatio)}
          style={{ touchAction: "none" }}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onLostPointerCapture={() => { isDrawingRef.current = false; }}
          className="aspect-[8/5] max-h-full w-auto max-w-full cursor-crosshair"
        />
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between text-[11px] font-mono text-ink/50 pt-2 px-1">
        <span>Draw a signature, doodle or note on Rahma's digital canvas.</span>
        <span>{savedCount} guestbook signatures saved</span>
      </div>
    </div>
  );
}
