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
  referenceSrc?: string;
  baseSrc?: string;
  isMissingBottom?: boolean;
  culturalWarningMsg?: string;
  onAutoEquipModestBottom?: () => void;
}

interface RecoloredLayerProps {
  item: WardrobeItem;
  targetHex?: string;
  brightness?: number;
  zIndex: number;
  isVisible: boolean;
}

const RecoloredLayer: React.FC<RecoloredLayerProps> = ({
  item,
  targetHex,
  brightness = 0,
  zIndex,
  isVisible,
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(item.src);

  useEffect(() => {
    let isCancelled = false;

    if (item.recolorable && targetHex) {
      recolorGarment(item.src, { targetHex, brightness })
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
  }, [item.src, item.recolorable, targetHex, brightness]);

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
  referenceSrc,
  baseSrc,
  isMissingBottom,
  culturalWarningMsg,
  onAutoEquipModestBottom,
}) => {
  return (
    <section className="flex flex-col items-center w-full">
      {/* Stage Frame Box */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-2.5 sm:p-3 shadow-md flex flex-col items-center border border-outline-variant/30 relative">
        {/* Stage Top HUD Controls - Icon-first and compact */}
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-1.5">
            {/* Compare 1:1 button (Icon-first) */}
            <button
              id="toggle-compare"
              type="button"
              onClick={onToggleCompare}
              className={`h-7 px-2 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                isComparing
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'bg-surface-container-high text-primary hover:bg-tertiary-fixed'
              }`}
              title="So sánh ảnh mẫu gốc 1:1"
            >
              <span className="material-symbols-outlined text-[15px]">compare</span>
              <span id="compare-text" className="hidden sm:inline">
                {isComparing ? 'Tắt Mẫu' : 'Mẫu 1:1'}
              </span>
            </button>

            {/* Reset Stage button (Icon-first) */}
            <button
              id="reset-stage-btn"
              type="button"
              onClick={onResetStage}
              className="h-7 w-7 sm:w-auto sm:px-2 rounded-lg bg-surface-container-high text-primary hover:bg-error-container hover:text-on-error-container text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="Đặt lại sàn thử về ban đầu"
            >
              <span className="material-symbols-outlined text-[15px]">restart_alt</span>
              <span className="hidden sm:inline">Đặt Lại</span>
            </button>
          </div>

          {/* Zoom Buttons (Icon-first) */}
          <div className="flex items-center gap-0.5 bg-surface-container rounded-lg p-0.5 border border-outline-variant/30">
            <button
              id="zoom-out"
              type="button"
              onClick={onZoomOut}
              className="w-6 h-6 rounded flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors cursor-pointer"
              title="Thu nhỏ (-15%)"
            >
              <span className="material-symbols-outlined text-[15px]">zoom_out</span>
            </button>
            <span
              id="zoom-level"
              className="px-1 text-on-surface-variant font-mono font-semibold text-[10.5px]"
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              id="zoom-in"
              type="button"
              onClick={onZoomIn}
              className="w-6 h-6 rounded flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors cursor-pointer"
              title="Phóng to (+15%)"
            >
              <span className="material-symbols-outlined text-[15px]">zoom_in</span>
            </button>
          </div>
        </div>

        {/* Main Stage Viewport (Pedestal) - Thích ứng thông minh cả trên mobile và desktop */}
        <div className="relative h-[44vh] sm:h-[54vh] lg:h-[66vh] max-h-[560px] min-h-[290px] sm:min-h-[400px] aspect-[9/16] rounded-xl overflow-hidden bg-[#FAF6EE] shadow-[inset_0_0_24px_rgba(4,21,46,0.06)] border border-[#E5E2DC] flex items-center justify-center mx-auto">
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
              src={baseSrc || BASE_MANNEQUIN_ITEM.src}
              alt="Người Mẫu Cơ Bản"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-[10]"
            />

            {/* Render các tầng y phục theo thứ tự Z-Index của LAYER_INSPECTOR_ORDER */}
            {LAYER_INSPECTOR_ORDER.map((category) => {
              if (category === 'base') return null;
              const item = equippedOutfit[category];
              if (!item) return null;

              const isVisible = Boolean(layerVisibility[category]);
              const targetHex = colorState[item.id] || item.defaultColor;
              const brightness = brightnessState[item.id] || 0;
              const zIndex = LAYER_MAP[category];

              return (
                <RecoloredLayer
                  key={`${item.id}-${category}`}
                  item={item}
                  targetHex={targetHex}
                  brightness={brightness}
                  zIndex={zIndex}
                  isVisible={isVisible}
                />
              );
            })}

            {/* Reference Full Look Layer for Comparison Overlay */}
            <img
              id="stage-reference-full"
              src={referenceSrc || REFERENCE_FULL_SAMPLE}
              alt="Mẫu Gốc Tiêu Chuẩn"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-[100] transition-opacity duration-300"
              style={{ opacity: isComparing ? 1 : 0 }}
            />
          </div>

          {/* Floating Cultural Modesty Warning Banner (Thuần Phong Mỹ Tục) */}
          {isMissingBottom && (
            <div
              id="cultural-modesty-banner"
              className="absolute bottom-3 left-3 right-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 bg-[#2d0905]/95 text-white p-2.5 rounded-xl border border-[#c59b27] shadow-[0_4px_20px_rgba(174,48,34,0.45)] backdrop-blur-xs flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 text-[#eec14b]">
                  <span className="material-symbols-outlined text-[17px]">gavel</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Thuần Phong Mỹ Tục
                  </span>
                </div>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#ae3022] text-white font-mono font-semibold">
                  Thiếu Quần
                </span>
              </div>
              <p className="text-[10px] sm:text-[10.5px] text-amber-100/90 leading-tight">
                {culturalWarningMsg ||
                  "Cổ phục Việt Nam tôn vinh nét đoan trang kín đáo. Tà áo bắt buộc phải đi cùng quần dài hoặc váy truyền thống để giữ gìn thuần phong mỹ tục!"}
              </p>
              {onAutoEquipModestBottom && (
                <button
                  type="button"
                  id="auto-equip-bottom-btn"
                  onClick={onAutoEquipModestBottom}
                  className="mt-0.5 py-1 px-2.5 rounded-lg bg-gradient-to-r from-[#c59b27] to-[#eec14b] text-[#1a2a44] hover:brightness-110 font-bold text-[10.5px] flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">check</span>
                  <span>Mặc Quần Phù Hợp Ngay</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
