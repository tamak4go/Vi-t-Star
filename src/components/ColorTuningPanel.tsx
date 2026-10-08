// src/components/ColorTuningPanel.tsx
import React, { useState } from 'react';
import {
  CATEGORY_LABELS,
  TRADITIONAL_PALETTE,
  type BrightnessState,
  type Category,
  type ColorState,
  type EquippedOutfit,
} from '../data/dressroomConfig';
import { analyzeEquippedOutfitHarmony } from '../services/culturalKnowledgeService';

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
  const categoryLabel = CATEGORY_LABELS[activeCategory];

  const [copied, setCopied] = useState(false);

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

  const handleCopyHex = () => {
    navigator.clipboard.writeText(currentColor.toUpperCase()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };

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
        <div className="flex items-center gap-1.5">
          {/* Live swatch */}
          <span
            className="w-5 h-5 rounded-full border border-black/15 shadow-sm shrink-0 transition-colors duration-150"
            style={{ backgroundColor: currentColor }}
            title={currentColor}
          />
          <span
            id="active-color-layer-name"
            className="text-[10px] bg-secondary text-on-secondary px-2 py-0.5 rounded-full font-medium"
          >
            {currentItem.name}
          </span>
        </div>
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
                <button
                  type="button"
                  id="copy-hex-btn"
                  onClick={handleCopyHex}
                  className="font-mono text-[11px] font-medium text-primary bg-surface px-1.5 py-0.5 rounded border border-outline-variant/30 uppercase hover:bg-surface-container hover:border-secondary/50 transition-colors cursor-pointer flex items-center gap-1"
                  title="Nhấn để sao chép mã màu"
                >
                  {currentColor}
                  <span className="material-symbols-outlined text-[11px] text-outline">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                </button>
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

      {/* Ngũ Hành & Color Harmony Engine Section */}
      <ColorHarmonySection equippedOutfit={equippedOutfit} colorState={colorState} />
    </div>
  );
};

// Sub-component phân tích ngũ hành và độ hài hòa màu sắc di sản
const ColorHarmonySection: React.FC<{
  equippedOutfit: EquippedOutfit;
  colorState: ColorState;
}> = ({ equippedOutfit, colorState }) => {
  const harmony = analyzeEquippedOutfitHarmony(equippedOutfit, colorState);

  // Chọn màu sắc hiển thị theo ngũ hành chủ đạo
  const elementColorMap: Record<string, string> = {
    Kim: '#E0DCD3',
    Mộc: '#2E5339',
    Thủy: '#2F4B6E',
    Hỏa: '#AE3022',
    Thổ: '#C59B27',
  };

  return (
    <div className="mt-2 pt-2 border-t border-outline-variant/30 flex flex-col gap-1.5 bg-[#FAF6EE] p-2.5 rounded-xl border border-[#C59B27]/40 shadow-inner">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[#1a2a44]">
          <span className="material-symbols-outlined text-[17px] text-[#AE3022]">balance</span>
          <span className="text-[11.5px] font-bold uppercase tracking-wider">
            Ngũ Hành & Hài Hòa Sắc Phục
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-mono font-bold text-[12px] text-[#AE3022]">
            {harmony.score}
          </span>
          <span className="text-[10px] text-on-surface-variant font-mono">/100</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="w-full bg-[#e8ded0] h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#AE3022] via-[#C59B27] to-[#2E5339] rounded-full transition-all duration-300"
          style={{ width: `${harmony.score}%` }}
        />
      </div>

      {/* Relationship Badge & Elements */}
      <div className="flex items-center justify-between flex-wrap gap-1 mt-0.5">
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#1a2a44] text-[#eed182] font-semibold">
          {harmony.relationship}
        </span>
        <div className="flex items-center gap-1">
          {harmony.elementsPresent.map((el) => (
            <span
              key={el}
              className="text-[9px] px-1.5 py-0.2 rounded font-bold border border-black/10"
              style={{
                backgroundColor: elementColorMap[el] || '#fff',
                color: el === 'Kim' || el === 'Thổ' ? '#1a2a44' : '#fff',
              }}
            >
              Hành {el}
            </span>
          ))}
        </div>
      </div>

      {/* Philosophical advice */}
      <p className="text-[10.5px] text-[#3b322a] leading-tight mt-0.5 italic">
        "{harmony.commentary}"
      </p>
    </div>
  );
};
