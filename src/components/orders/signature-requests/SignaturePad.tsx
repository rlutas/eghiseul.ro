'use client';

/**
 * Signature canvas (finger on phone, mouse on desktop). Same drawing as the
 * completion page; exposes the PNG data URL through `onChange` (null = empty).
 */

import { useEffect, useRef, useState } from 'react';
import { Eraser, PenLine } from 'lucide-react';

export function SignaturePad({ onChange, disabled }: { onChange: (dataUrl: string | null) => void; disabled?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  // Ref, not state: `end` must see the ink drawn during the same stroke.
  const inkRef = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    e.preventDefault();
    drawing.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    inkRef.current = true;
    setHasInk(true);
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (canvasRef.current && inkRef.current) onChange(canvasRef.current.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    inkRef.current = false;
    onChange(null);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-secondary-900 flex items-center gap-1.5">
          <PenLine className="h-4 w-4 text-primary-600" />
          Semnătura ta
        </p>
        {hasInk && (
          <button type="button" onClick={clear} className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700">
            <Eraser className="h-3.5 w-3.5" /> Șterge și semnează din nou
          </button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        aria-label="Spațiu pentru semnătură"
        className="w-full h-40 rounded-lg border-2 border-dashed border-primary-300 bg-white touch-none"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <p className="text-[11px] text-neutral-500">Semnează cu degetul (pe telefon) sau cu mouse-ul (pe calculator).</p>
    </div>
  );
}
