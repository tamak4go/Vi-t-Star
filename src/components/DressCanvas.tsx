// src/components/DressCanvas.tsx
import React, { useEffect, useState } from 'react';
import {
  BASE_MANNEQUIN_ITEM,
  LAYER_INSPECTOR_ORDER,
  LAYER_MAP,
  REFERENCE_FULL_SAMPLE,
  type BrightnessState,
  type ColorState,
  type EquippedOutfit,
  type LayerStateMap,
  type WardrobeItem,
} from '../data/dressroomConfig';
import { recolorGarment } from '../services/recolorService';

interface DressCanvasProps {
  equippedOutfit: EquippedOutfit;
  layerVisibility: LayerStateMap;
  colorState: ColorState;
  brightnessState: BrightnessState;
  isComparing: boolean;
  onToggleCompare: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetStage: () => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

interface RecoloredLayerProps {
  item: WardrobeItem;
  customHex?: string;
  brightness?: number;
  zIndex: number;
  isVisible: boolean;
}

const RecoloredLayer: React.FC<RecoloredLayerProps> = ({
  item,
  customHex,
  brightness = 0,
  zIndex,
  isVisible,
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(item.src);

  useEffect(() => {
    let isCancelled = false;

    // CHỈ recolor khi người dùng CÓ NHU CẦU (chọn màu mới qua customHex hoặc chỉnh độ sáng khác 0)
    // Mặc định: Giữ nguyên 100% màu sắc và chi tiết sắc nét nguyên bản của ảnh PNG
    if (item.recolorable && (customHex || brightness !== 0)) {
      recolorGarment(item.src, {
        targetHex: customHex || item.defaultColor || '#AE3022',
        brightness,
      })
        .then((dataUrl) => {
          if (!isCancelled) {
            setCurrentSrc(dataUrl);
          }
        })
        .catch((err) => {
          console.error(`Không thể recolor ${item.name}:`, err);
          if (!isCancelled) {
            setCurrentSrc(item.src);
          }
        });
    } else {
      setCurrentSrc(item.src);
    }

    return () => {
      isCancelled = true;
    };
  }, [item.src, item.recolorable, item.defaultColor, customHex, brightness]);

  return (
    <img
      id={`stage-layer-${item.category}`}
      src={currentSrc}
      alt={item.name}
      className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none transition-opacity duration-200"
      style={{
        zIndex,
        opacity: isVisible ? 1 : 0,
      }}
    />
  );
};

export const DressCanvas: React.FC<DressCanvasProps> = ({
  equippedOutfit,
  layerVisibility,
  colorState,
  brightnessState,
  isComparing,
  onToggleCompare,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetStage,
  canvasRef,
}) => {
  return (
    <section className="flex flex-col items-center w-full">
      {/* Stage Frame Box */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-3 shadow-md flex flex-col items-center border border-outline-variant/30">
        {/* Stage Top HUD Controls */}
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-space-xs">
            {/* Compare 1:1 button */}
            <button
              id="toggle-compare"
              type="button"
              onClick={onToggleCompare}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                isComparing
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'bg-surface-container-high text-primary hover:bg-tertiary-fixed'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">compare</span>
              <span id="compare-text">
                {isComparing ? 'Tắt So Sánh' : 'So Sánh (1:1)'}
              </span>
            </button>

            {/* Reset Stage button */}
            <button
              id="reset-stage-btn"
              type="button"
              onClick={onResetStage}
              className="px-2.5 py-1 rounded-lg bg-surface-container-high text-primary hover:bg-error-container hover:text-on-error-container text-[11px] font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">restart_alt</span>
              <span>Đặt Lại</span>
            </button>
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 bg-surface-container rounded-lg p-0.5 border border-outline-variant/30">
            <button
              id="zoom-out"
              type="button"
              onClick={onZoomOut}
              className="w-6 h-6 rounded flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
              title="Thu nhỏ"
            >
              <span className="material-symbols-outlined text-[15px]">zoom_out</span>
            </button>
            <span
              id="zoom-level"
              className="px-1.5 text-on-surface-variant font-mono font-semibold text-[11px]"
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              id="zoom-in"
              type="button"
              onClick={onZoomIn}
              className="w-6 h-6 rounded flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
              title="Phóng to"
            >
              <span className="material-symbols-outlined text-[15px]">zoom_in</span>
            </button>
          </div>
        </div>

        {/* Main Stage Viewport (Pedestal) - Thu nhỏ gọn vừa vặn màn hình */}
        <div className="relative h-[66vh] max-h-[560px] min-h-[420px] aspect-[9/16] rounded-xl overflow-hidden bg-[#FAF6EE] shadow-[inset_0_0_24px_rgba(4,21,46,0.06)] border border-[#E5E2DC] flex items-center justify-center mx-auto">
          {/* Traditional Parchment Pattern subtle watermark */}
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#C59B27_0.75px,transparent_0.75px)] [background-size:16px_16px]" />

          {/* Archaic Dynasty Red Seal Stamp (Top Left) */}
          <div className="absolute top-4 left-4 z-50 pointer-events-none flex flex-col items-center justify-center w-14 h-14 rounded-sm bg-secondary text-surface-container-lowest p-1 shadow-md border border-[#c59b27]/30">
            <span className="font-headline-sm text-[10px] leading-tight text-center uppercase tracking-widest font-bold">
              Việt Phục
            </span>
            <span className="material-symbols-outlined text-[18px] my-[-2px]">verified</span>
            <span className="text-[8px] tracking-tighter uppercase font-semibold">Bảo Chứng</span>
          </div>


          {/* Zoom & Pan Layer Container */}
          <div
            ref={canvasRef}
            id="mannequin-scaler"
            className="relative w-full h-full transition-transform duration-200 origin-center flex items-center justify-center"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* Stack 10: Base Mannequin (Undergarment) - Luôn hiển thị ở tầng đáy */}
            <img
              id="stage-layer-base"
              src={BASE_MANNEQUIN_ITEM.src}
              alt="Người Mẫu Cơ Bản"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-[10]"
            />

            {/* Render các tầng y phục theo thứ tự Z-Index của LAYER_INSPECTOR_ORDER */}
            {LAYER_INSPECTOR_ORDER.map((category) => {
              if (category === 'base') return null;
              const item = equippedOutfit[category];
              if (!item) return null;

              const isVisible = Boolean(layerVisibility[category]);
              const customHex = colorState[item.id];
              const brightness = brightnessState[item.id] || 0;
              const zIndex = LAYER_MAP[category];

              return (
                <RecoloredLayer
                  key={`${item.id}-${category}`}
                  item={item}
                  customHex={customHex}
                  brightness={brightness}
                  zIndex={zIndex}
                  isVisible={isVisible}
                />
              );
            })}

            {/* Reference Full Look Layer for Comparison Overlay */}
            <img
              id="stage-reference-full"
              src={REFERENCE_FULL_SAMPLE}
              alt="Mẫu Gốc Tiêu Chuẩn"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-[100] transition-opacity duration-300"
              style={{ opacity: isComparing ? 1 : 0 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
