// src/components/ColorTuningPanel.tsx
import React from 'react';
import {
  CATEGORY_LABELS,
  LAYER_MAP,
  TRADITIONAL_PALETTE,
  type BrightnessState,
  type Category,
  type ColorState,
  type EquippedOutfit,
} from '../data/dressroomConfig';

interface ColorTuningPanelProps {
  activeCategory: Category;
  equippedOutfit: EquippedOutfit;
  colorState: ColorState;
  brightnessState: BrightnessState;
  onChangeColor: (itemId: string, color: string) => void;
  onChangeBrightness: (itemId: string, brightness: number) => void;
  onResetLayerColor: (itemId: string) => void;
}

export const ColorTuningPanel: React.FC<ColorTuningPanelProps> = ({
  activeCategory,
  equippedOutfit,
  colorState,
  brightnessState,
  onChangeColor,
  onChangeBrightness,
  onResetLayerColor,
}) => {
  const currentItem = equippedOutfit[activeCategory];
  const zIndex = LAYER_MAP[activeCategory];
  const categoryLabel = CATEGORY_LABELS[activeCategory];

  if (!currentItem) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm flex flex-col gap-1.5 border border-outline-variant/30 text-center py-4">
        <span className="material-symbols-outlined text-[24px] text-outline mx-auto">palette</span>
        <h3 className="font-semibold text-primary text-[13px]">Bảng Sắc Phục Cổ</h3>
        <p className="text-[11px] text-on-surface-variant px-3">
          Hãy chọn hoặc mặc một trang phục ở tầng <span className="font-bold text-primary">{categoryLabel}</span> để điều chỉnh sắc độ.
        </p>
      </div>
    );
  }

  const currentColor = colorState[currentItem.id] || currentItem.defaultColor || '#AE3022';
  const currentBrightness = brightnessState[currentItem.id] || 0;
  const isCustomized = Boolean(colorState[currentItem.id] && colorState[currentItem.id] !== currentItem.defaultColor);

  return (
    <div
      id="color-tuning-panel"
      className="bg-surface-container-lowest rounded-xl p-3 shadow-sm flex flex-col gap-1.5 border border-outline-variant/30"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-outline-variant/30">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-secondary text-[18px]">palette</span>
          <h3 className="font-headline-sm text-[15px] text-primary font-semibold">
            Bảng Sắc Phục Cổ
          </h3>
        </div>
        <span
          id="active-color-layer-name"
          className="text-[10px] bg-secondary text-on-secondary px-2 py-0.5 rounded-full font-medium"
        >
          {currentItem.name} (Tầng {zIndex})
        </span>
      </div>

      {currentItem.recolorable ? (
        <>
          {/* Traditional Preset Pigments */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-wider text-outline uppercase">
              Sắc Độ Truyền Thống:
            </span>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {TRADITIONAL_PALETTE.map((item) => {
                const isSelected = currentColor.toUpperCase() === item.hex.toUpperCase();
                return (
                  <button
                    key={item.hex}
                    type="button"
                    onClick={() => onChangeColor(currentItem.id, item.hex)}
                    className={`traditional-color-chip flex items-center gap-2 p-1.5 rounded-lg border transition-all text-left ${
                      isSelected
                        ? 'border-secondary bg-surface-container-low shadow-2xs ring-1 ring-secondary/40'
                        : 'border-outline-variant/30 hover:bg-surface-container-low'
                    }`}
                    title={item.name}
                  >
                    <span
                      className="w-4 h-4 rounded-full shrink-0 shadow-sm border border-black/10"
                      style={{ backgroundColor: item.hex }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-semibold text-primary leading-tight truncate">
                        {item.name}
                      </span>
                      <span className="text-[9px] text-outline font-mono truncate">{item.hex}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Picker & Brightness Slider */}
          <div className="bg-surface-container-low rounded-lg p-2.5 flex flex-col gap-2 border border-outline-variant/20 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-secondary">colorize</span>{' '}
                Tự Chọn Mã Màu Hex
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  id="custom-color-picker"
                  value={currentColor}
                  onChange={(e) => onChangeColor(currentItem.id, e.target.value)}
                  className="w-7 h-7 rounded border border-outline-variant cursor-pointer p-0 bg-transparent"
                />
                <span
                  id="custom-hex-label"
                  className="font-mono text-[11px] font-medium text-primary bg-surface px-1.5 py-0.5 rounded border border-outline-variant/30 uppercase"
                >
                  {currentColor}
                </span>
              </div>
            </div>

            {/* Brightness adjustment slider (-0.35 đến 0.35) */}
            <div className="flex flex-col gap-1 pt-1 border-t border-outline-variant/20">
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-medium">
                <span>Độ Sáng / Đậm Nhạt Vải</span>
                <span id="brightness-val" className="font-mono font-semibold">
                  {Math.round((currentBrightness + 1) * 100)}%
                </span>
              </div>
              <input
                type="range"
                id="brightness-slider"
                min={-0.35}
                max={0.35}
                step={0.02}
                value={currentBrightness}
                onChange={(e) =>
                  onChangeBrightness(currentItem.id, parseFloat(e.target.value))
                }
                className="w-full accent-secondary h-1.5 bg-surface-variant rounded-lg cursor-pointer"
              />
            </div>

            {/* Fast reset default color */}
            <div className="flex items-center justify-between pt-1 border-t border-outline-variant/30">
              <span className="text-[10px] text-on-surface-variant">Sắc phục nguyên bản:</span>
              <button
                type="button"
                id="reset-color-btn"
                disabled={!isCustomized && currentBrightness === 0}
                onClick={() => onResetLayerColor(currentItem.id)}
                className={`text-[11px] font-medium flex items-center gap-0.5 transition-colors ${
                  isCustomized || currentBrightness !== 0
                    ? 'text-secondary hover:underline cursor-pointer'
                    : 'text-outline/50 cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">refresh</span> Khôi phục gốc
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 flex flex-col gap-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-amber-800 font-semibold text-[13px]">
            <span className="material-symbols-outlined text-[18px]">lock</span>
            <span>Hoa Văn Cổ Định Sắc</span>
          </div>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Trang phục này ({currentItem.name}) sở hữu nẹp viền và hoa văn thêu/dệt đa sắc truyền thống. Hệ thống giữ nguyên bản gốc để tránh làm mờ mất các đường nét chi tiết tinh xảo.
          </p>
        </div>
      )}
    </div>
  );
};
