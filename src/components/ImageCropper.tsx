import { useEffect, useRef, useState, useCallback } from 'react';
import { useI18n } from '../i18n';

interface ImageCropperProps {
  file: File;
  targetSize?: number;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}

interface CropRect {
  x: number;
  y: number;
  size: number;
}

const MIN_SIZE = 40;

export default function ImageCropper({ file, targetSize = 1024, onConfirm, onCancel }: ImageCropperProps) {
  const { t } = useI18n();
  const [imageUrl, setImageUrl] = useState('');
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, size: 0 });
  const [loading, setLoading] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ mode: 'move' | 'resize'; startX: number; startY: number; origin: CropRect } | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setNatural({ w, h });
      const maxW = 480;
      const maxH = 360;
      const scale = Math.min(maxW / w, maxH / h);
      const sw = Math.round(w * scale);
      const sh = Math.round(h * scale);
      setStage({ w: sw, h: sh });
      const size = Math.max(MIN_SIZE, Math.min(sw, sh));
      setCrop({ x: Math.floor((sw - size) / 2), y: Math.floor((sh - size) / 2), size });
    };
    img.src = URL.createObjectURL(file);
    return () => URL.revokeObjectURL(img.src);
  }, [file]);

  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const isInside = px >= crop.x && px <= crop.x + crop.size && py >= crop.y && py <= crop.y + crop.size;
    const isHandle = px >= crop.x + crop.size - 20 && px <= crop.x + crop.size + 20 &&
                     py >= crop.y + crop.size - 20 && py <= crop.y + crop.size + 20;

    if (!isInside) return;

    dragRef.current = {
      mode: isHandle ? 'resize' : 'move',
      startX: px,
      startY: py,
      origin: { ...crop },
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const dx = px - drag.startX;
    const dy = py - drag.startY;

    setCrop((prev) => {
      if (drag.mode === 'resize') {
        const size = clamp(drag.origin.size + Math.max(dx, dy), MIN_SIZE, Math.min(stage.w - drag.origin.x, stage.h - drag.origin.y));
        return { x: drag.origin.x, y: drag.origin.y, size };
      }
      return {
        x: clamp(drag.origin.x + dx, 0, stage.w - prev.size),
        y: clamp(drag.origin.y + dy, 0, stage.h - prev.size),
        size: prev.size,
      };
    });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleConfirm = useCallback(async () => {
    if (!natural.w || !natural.h || !crop.size) return;
    setLoading(true);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('load error'));
        img.src = URL.createObjectURL(file);
      });
      const scale = natural.w / stage.w;
      const sx = crop.x * scale;
      const sy = crop.y * scale;
      const sSize = crop.size * scale;

      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no canvas context');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, targetSize, targetSize);

      const isPng = file.type.includes('png');
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), isPng ? 'image/png' : 'image/jpeg', 0.92);
      });
      const ext = isPng ? 'png' : 'jpg';
      const out = new File([blob], `cropped-${Date.now()}.${ext}`, { type: blob.type });
      onConfirm(out);
    } catch {
      alert(t('crop.error'));
      setLoading(false);
    }
  }, [crop, natural, stage, file, targetSize, onConfirm, t]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-lg w-full">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{t('crop.title')}</h3>
        <p className="text-sm text-gray-500 mb-4">{t('crop.hint')}</p>

        <div className="flex items-center justify-center bg-gray-900 rounded-xl overflow-hidden" style={{ height: 380 }}>
          <div
            ref={stageRef}
            className="relative select-none"
            style={{ width: stage.w, height: stage.h }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {imageUrl && (
              <img src={imageUrl} alt="" className="block w-full h-full object-fill" draggable={false} />
            )}

            {/* 裁剪框外遮罩 */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-black/60" style={{ clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${crop.x}px ${crop.y}px, ${crop.x}px ${crop.y + crop.size}px, ${crop.x + crop.size}px ${crop.y + crop.size}px, ${crop.x + crop.size}px ${crop.y}px, ${crop.x}px ${crop.y}px)` }} />
            </div>

            {/* 裁剪框 */}
            <div
              className="absolute border-2 border-white box-content cursor-move"
              style={{ left: crop.x, top: crop.y, width: crop.size, height: crop.size }}
            >
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-white border-2 border-gray-400 rounded-full cursor-se-resize" />
              <span className="absolute inset-0" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.3)' }} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">{t('crop.output', { size: targetSize })}</span>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium"
            >
              {t('crop.cancel')}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? t('crop.processing') : t('crop.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
