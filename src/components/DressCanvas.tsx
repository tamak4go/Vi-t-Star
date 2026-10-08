// src/components/DressCanvas.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  BASE_MANNEQUIN_ITEM,
  LAYER_INSPECTOR_ORDER,
  LAYER_MAP,
  REFERENCE_FULL_SAMPLE,
  STAGE_BACKDROPS,
  type BrightnessState,
  type ColorState,
  type EquippedOutfit,
  type LayerId,
  type LayerStateMap,
  type WardrobeItem,
} from '../data/dressroomConfig';
import { recolorGarment } from '../services/recolorService';

export interface DressCanvasProps {
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
  // Audition Remix Features:
  onOpenCulturalStory?: (item: WardrobeItem | null) => void;
  isABMode?: boolean;
  onToggleABMode?: () => void;
  outfitSetA?: { outfit: EquippedOutfit; colors: ColorState } | null;
  outfitSetB?: { outfit: EquippedOutfit; colors: ColorState } | null;
  onSaveToSetA?: () => void;
  onSaveToSetB?: () => void;
  activeSlot?: 'A' | 'B';
  onSwitchSlot?: (slot: 'A' | 'B') => void;
  // Bối cảnh sàn diễn sống động:
  backdropId?: string;
  onSelectBackdrop?: (backdropId: string) => void;
  // Cảnh báo lệch chuẩn văn hóa:
  onOpenAuthenticityModal?: () => void;
  authenticityNoticeCount?: number;
  // Thứ tự layer tùy chỉnh linh hoạt:
  layerOrder?: LayerId[];
  layerMap?: Record<LayerId, number>;
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
  onOpenCulturalStory,
  isABMode,
  onToggleABMode,
  outfitSetA,
  outfitSetB,
  onSaveToSetA,
  onSaveToSetB,
  activeSlot = 'A',
  onSwitchSlot,
  backdropId = 'parchment',
  onSelectBackdrop,
  onOpenAuthenticityModal,
  authenticityNoticeCount = 0,
  layerOrder,
  layerMap,
}) => {

  const [isBackdropOpen, setIsBackdropOpen] = useState(false);
  const backdropMenuRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (backdropMenuRef.current && !backdropMenuRef.current.contains(e.target as Node)) {
        setIsBackdropOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentBackdrop = STAGE_BACKDROPS.find((b) => b.id === (backdropId || 'parchment')) || STAGE_BACKDROPS[0];

  return (
    <section className="flex flex-col items-center w-full">
      {/* Stage Frame Box */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-2.5 sm:p-3 shadow-md flex flex-col items-center border border-outline-variant/30 relative">
        {/* Stage Top HUD Controls - Icon-first and compact */}
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/20 flex-wrap gap-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
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

            {/* A/B Comparator Toggle Button */}
            {onToggleABMode && (
              <button
                id="toggle-ab-mode"
                type="button"
                onClick={onToggleABMode}
                className={`h-8 px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  isABMode
                    ? 'bg-[#1a2a44] text-[#eed182] shadow-xs ring-1 ring-[#c59b27]'
                    : 'bg-surface-container-high text-primary hover:bg-surface-container'
                }`}
                title="Bật/Tắt chế độ đối chiếu hai bản phối A / B"
              >
                <span className="material-symbols-outlined text-[16px]">splitscreen</span>
                <span className="hidden sm:inline">{isABMode ? 'Đang So A/B' : 'So Sánh A/B'}</span>
              </button>
            )}

            {/* Backdrop Switcher Button */}
            {onSelectBackdrop && (
              <div className="relative" ref={backdropMenuRef}>
                <button
                  id="toggle-backdrop-btn"
                  type="button"
                  onClick={() => setIsBackdropOpen(!isBackdropOpen)}
                  className={`h-8 px-2 sm:px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer border ${
                    currentBackdrop?.src
                      ? 'bg-[#1a2a44] text-[#eed182] border-[#c59b27]/60 shadow-xs'
                      : 'bg-surface-container-high text-primary border-outline-variant/30 hover:bg-surface-container'
                  }`}
                  title="Thay đổi bối cảnh sàn diễn"
                >
                  <span className="text-[13px]">{currentBackdrop?.icon || '🖼️'}</span>
                  <span className="hidden md:inline">{currentBackdrop?.shortName || 'Bối Cảnh'}</span>
                  <span className="material-symbols-outlined text-[13px] text-outline">
                    {isBackdropOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {isBackdropOpen && (
                  <div
                    id="backdrop-dropdown-popup"
                    className="absolute top-full left-0 mt-1 z-30 w-56 sm:w-60 bg-surface-container-lowest rounded-xl shadow-xl border border-[#C59B27]/40 p-1.5 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
                  >
                    <div className="px-2 py-1 text-[10px] font-bold text-outline uppercase tracking-wider border-b border-outline-variant/20 flex items-center justify-between">
                      <span>Bối Cảnh Sàn Diễn</span>
                      <span className="text-[#AE3022] font-mono text-[9.5px]">7 Bối Cảnh</span>
                    </div>
                    {STAGE_BACKDROPS.map((bg) => {
                      const isSelected = bg.id === (backdropId || 'parchment');
                      return (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => {
                            onSelectBackdrop(bg.id);
                            setIsBackdropOpen(false);
                          }}
                          className={`w-full px-2 py-1.5 rounded-lg text-left text-[11px] font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#1a2a44] text-[#eed182] font-bold shadow-xs'
                              : 'hover:bg-surface-container text-primary'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-[14px] shrink-0">{bg.icon}</span>
                            <span className="truncate">{bg.name}</span>
                          </div>
                          {isSelected && (
                            <span className="material-symbols-outlined text-[14px] text-[#eed182] shrink-0">
                              check
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Reset Stage button (Icon-first) */}
            <button
              id="reset-stage-btn"
              type="button"
              onClick={onResetStage}
              className="h-8 w-8 sm:w-auto sm:px-2.5 rounded-lg bg-surface-container-high text-primary hover:bg-error-container hover:text-on-error-container text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="Đặt lại sàn thử về ban đầu"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span className="hidden sm:inline">Đặt Lại</span>
            </button>
          </div>

          {/* Zoom Buttons (Icon-first) */}
          <div className="flex items-center gap-0.5 bg-surface-container rounded-lg p-0.5 border border-outline-variant/30">
            <button
              id="zoom-out"
              type="button"
              onClick={onZoomOut}
              className="w-7 h-7 rounded flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors cursor-pointer"
              title="Thu nhỏ (-15%)"
            >
              <span className="material-symbols-outlined text-[16px]">zoom_out</span>
            </button>
            <span
              id="zoom-level"
              className="px-1.5 text-on-surface-variant font-mono font-semibold text-[10.5px]"
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              id="zoom-in"
              type="button"
              onClick={onZoomIn}
              className="w-7 h-7 rounded flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors cursor-pointer"
              title="Phóng to (+15%)"
            >
              <span className="material-symbols-outlined text-[16px]">zoom_in</span>
            </button>
          </div>
        </div>

        {/* A/B Comparator Sub-Bar when A/B mode is active */}
        {isABMode && (
          <div className="w-full bg-[#1a2a44] text-[#FAF6EE] px-2.5 py-1.5 rounded-lg mb-2 flex items-center justify-between gap-2 text-[11px] border border-[#c59b27]/40 shadow-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-[#eed182] uppercase">
                Đối Chiếu:
              </span>
              <button
                type="button"
                onClick={() => onSwitchSlot?.('A')}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  activeSlot === 'A'
                    ? 'bg-[#AE3022] text-white shadow-xs ring-1 ring-[#eed182]'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                Bản A {outfitSetA ? '✓' : ''}
              </button>
              <button
                type="button"
                onClick={() => onSwitchSlot?.('B')}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  activeSlot === 'B'
                    ? 'bg-[#AE3022] text-white shadow-xs ring-1 ring-[#eed182]'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                Bản B {outfitSetB ? '✓' : ''}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onSaveToSetA}
                className="px-2 py-0.5 rounded bg-white/15 hover:bg-white/25 text-[#eed182] font-semibold text-[10px] cursor-pointer"
                title="Lưu bộ đang mặc vào Bản A"
              >
                💾 Lưu A
              </button>
              <button
                type="button"
                onClick={onSaveToSetB}
                className="px-2 py-0.5 rounded bg-white/15 hover:bg-white/25 text-[#eed182] font-semibold text-[10px] cursor-pointer"
                title="Lưu bộ đang mặc vào Bản B"
              >
                💾 Lưu B
              </button>
            </div>
          </div>
        )}

        {/* Main Stage Viewport (Pedestal) - Thích ứng thông minh cả trên mobile và desktop */}
        <div className="relative h-[44vh] sm:h-[54vh] lg:h-[66vh] max-h-[560px] min-h-[290px] sm:min-h-[400px] aspect-[9/16] rounded-xl overflow-hidden bg-[#FAF6EE] shadow-[inset_0_0_24px_rgba(4,21,46,0.06)] border border-[#E5E2DC] flex items-center justify-center mx-auto">
          {/* Traditional Parchment Pattern subtle watermark */}
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#C59B27_0.75px,transparent_0.75px)] [background-size:16px_16px]" />

          {/* Archaic Dynasty Red Seal Stamp (Top Left) - Clickable to open Cultural Story (Icon-only, no text) */}
          <button
            type="button"
            onClick={() => onOpenCulturalStory?.(null)}
            className="absolute top-3 left-3 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-[#AE3022] text-[#FAF6EE] flex items-center justify-center shadow-md border border-[#C59B27]/70 ring-1 ring-inset ring-[#C59B27]/40 hover:scale-105 hover:brightness-110 active:scale-95 transition-all cursor-pointer group"
            title="Xem điển tích & ý nghĩa văn hóa của bộ trang phục này (Bảo chứng Việt phục)"
            aria-label="Xem điển tích & ý nghĩa văn hóa trang phục"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[22px] text-[#FAF6EE] drop-shadow-xs group-hover:rotate-6 transition-transform">
              verified
            </span>
          </button>

          {/* Zoom & Pan Layer Container */}
          <div
            ref={canvasRef}
            id="mannequin-scaler"
            className="relative w-full h-full transition-transform duration-200 origin-center flex items-center justify-center overflow-hidden"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* Stack 5: Stage Backdrop Image (Bối Cảnh Sàn Diễn 9:16) */}
            {currentBackdrop?.src ? (
              <div
                id="stage-backdrop-container"
                className="absolute inset-0 w-full h-full pointer-events-none select-none z-[5] overflow-hidden"
              >
                <img
                  src={currentBackdrop.src}
                  alt={currentBackdrop.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                {/* Lớp phủ điện ảnh & bóng nền chân mannequin */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20" />
                <div className="absolute bottom-[3.5%] left-1/2 -translate-x-1/2 w-48 h-7 bg-black/55 rounded-full blur-md" />
              </div>
            ) : (
              /* Nền hoa văn giấy dó cổ mộc truyền thống */
              <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#C59B27_0.75px,transparent_0.75px)] [background-size:16px_16px] z-[5]" />
            )}

            {/* Stack 10: Base Mannequin (Undergarment) - Luôn hiển thị ở tầng đáy */}
            <img
              id="stage-layer-base"
              src={baseSrc || BASE_MANNEQUIN_ITEM.src}
              alt="Người Mẫu Cơ Bản"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-[10]"
            />

            {/* Render các tầng y phục theo thứ tự Z-Index tùy chỉnh của người dùng */}
            {(layerOrder || LAYER_INSPECTOR_ORDER).map((category) => {
              if (category === 'base') return null;
              const item = equippedOutfit[category];
              if (!item) return null;

              const isVisible = Boolean(layerVisibility[category]);
              const targetHex = colorState[item.id] || item.defaultColor;
              const brightness = brightnessState[item.id] || 0;
              const zIndex = (layerMap && layerMap[category]) ?? LAYER_MAP[category];

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
              className="absolute bottom-3 left-3 right-3 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200 bg-[#2d0905]/95 text-white p-2.5 rounded-xl border border-[#c59b27] shadow-[0_4px_20px_rgba(174,48,34,0.45)] backdrop-blur-xs flex flex-col gap-1.5"
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

          {/* Floating Cultural Authenticity Notice Pill (Khi có cảnh báo lệch chuẩn văn hóa khác) */}
          {!isMissingBottom && authenticityNoticeCount > 0 && onOpenAuthenticityModal && (
            <button
              type="button"
              id="cultural-authenticity-pill"
              onClick={onOpenAuthenticityModal}
              className="absolute bottom-3 left-3 right-3 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200 bg-[#2d1b1a]/95 text-amber-100 p-2 sm:p-2.5 rounded-xl border border-amber-500/70 shadow-[0_4px_16px_rgba(217,119,6,0.35)] backdrop-blur-xs flex items-center justify-between gap-2 hover:bg-[#3d2524] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs text-left truncate">
                <span className="material-symbols-outlined text-[17px] text-amber-400 shrink-0">info</span>
                <span className="truncate text-[10.5px] sm:text-[11.5px] font-medium text-amber-100">
                  Phát hiện {authenticityNoticeCount} điểm cần lưu ý về văn hóa khi phối đồ
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 shrink-0 hover:bg-amber-500/30">
                Xem Lời Khuyên
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

