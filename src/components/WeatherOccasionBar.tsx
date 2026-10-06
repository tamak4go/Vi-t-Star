// src/components/WeatherOccasionBar.tsx
// Thanh Cố Vấn Bối Cảnh & Thời Tiết (Audition Việt Phục Remix - Gen Z)
import React, { useState } from 'react';
import {
  WEATHER_SEASONS,
  OCCASIONS,
  recommendByWeatherAndOccasion,
  type WeatherSeason,
  type OccasionType,
} from '../services/culturalKnowledgeService';

export const OCCASION_TO_BACKDROP: Record<OccasionType, string> = {
  'ky-yeu': 'ky_yeu',
  'tet': 'tet',
  'dinh-lang': 'dinh_lang',
  'dam-cuoi': 'hy_su',
  'cafe-genz': 'ca_phe',
  'ngoai-giao': 'ngoai_giao',
};

export const BACKDROP_TO_OCCASION: Record<string, OccasionType> = {
  'ky_yeu': 'ky-yeu',
  'tet': 'tet',
  'dinh_lang': 'dinh-lang',
  'hy_su': 'dam-cuoi',
  'ca_phe': 'cafe-genz',
  'ngoai_giao': 'ngoai-giao',
};

interface WeatherOccasionBarProps {
  onApplyRecommendation: (setId: string, suggestedHex?: string) => void;
  onFilterCategory?: (tag: string) => void;
  currentBackdropId?: string;
  onSelectBackdrop?: (backdropId: string) => void;
}

export const WeatherOccasionBar: React.FC<WeatherOccasionBarProps> = ({
  onApplyRecommendation,
  currentBackdropId,
  onSelectBackdrop,
}) => {
  const [selectedSeason, setSelectedSeason] = useState<WeatherSeason>('autumn');
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionType>(() => {
    return (currentBackdropId && BACKDROP_TO_OCCASION[currentBackdropId]) || 'ky-yeu';
  });
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Đồng bộ hai chiều khi backdrop từ ngoài thay đổi
  React.useEffect(() => {
    if (currentBackdropId && BACKDROP_TO_OCCASION[currentBackdropId]) {
      const targetOcc = BACKDROP_TO_OCCASION[currentBackdropId];
      setSelectedOccasion(targetOcc);
    }
  }, [currentBackdropId]);

  const recommendation = recommendByWeatherAndOccasion(selectedSeason, selectedOccasion);

  const handleSelectOccasion = (occKey: OccasionType) => {
    setSelectedOccasion(occKey);
    const mappedBackdrop = OCCASION_TO_BACKDROP[occKey];
    if (mappedBackdrop && onSelectBackdrop) {
      onSelectBackdrop(mappedBackdrop);
    }
  };

  const handleApply = () => {
    const mappedBackdrop = OCCASION_TO_BACKDROP[selectedOccasion];
    if (mappedBackdrop && onSelectBackdrop) {
      onSelectBackdrop(mappedBackdrop);
    }
    if (recommendation.recommendedSetIds.length > 0) {
      const targetSetId = recommendation.recommendedSetIds[0];
      const targetHex = recommendation.recommendedColors[0]?.hex;
      onApplyRecommendation(targetSetId, targetHex);
    }
  };

  return (
    <section
      id="weather-occasion-advisor"
      className="w-full bg-[#FAF6EE] text-[#1a2a44] rounded-xl border border-[#C59B27]/40 shadow-sm p-2 sm:p-2.5 mb-2.5 transition-all"
    >
      {/* Top Header / Bar Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-6 h-6 rounded-md bg-[#AE3022] text-[#eed182] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#AE3022] shrink-0">
              Bối Cảnh
            </span>
            <span className="text-[10px] px-1.5 rounded-full bg-[#1a2a44] text-[#eed182] font-mono font-semibold shrink-0">
              {WEATHER_SEASONS[selectedSeason]?.icon} {WEATHER_SEASONS[selectedSeason]?.label}
            </span>
            <span className="text-[10px] px-1.5 rounded-full bg-[#AE3022]/10 text-[#AE3022] border border-[#AE3022]/30 font-semibold truncate max-w-[80px] sm:max-w-none">
              {OCCASIONS[selectedOccasion]?.icon} {OCCASIONS[selectedOccasion]?.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleApply}
            className="py-1 px-2.5 rounded-lg bg-gradient-to-r from-[#AE3022] to-[#C59B27] text-white hover:brightness-110 text-[10.5px] font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-all"
            title="Áp dụng gợi ý phục trang và màu sắc tức thì"
          >
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            <span>Phối Nhanh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-[#5c4a3e] hover:bg-[#e8ded0] transition-colors cursor-pointer"
            title={isExpanded ? 'Thu gọn' : 'Mở rộng bộ lọc bối cảnh'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      </div>

      {/* Expanded Controls: Season & Occasion Filter Chips */}
      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-[#C59B27]/20 flex flex-col gap-2 animate-in fade-in duration-150">
          {/* 1. Seasons Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-[10px] font-bold text-[#8b6914] uppercase tracking-wide shrink-0 mr-1">
              Thời tiết:
            </span>
            {(Object.keys(WEATHER_SEASONS) as WeatherSeason[]).map((seasonKey: WeatherSeason) => {
              const s = WEATHER_SEASONS[seasonKey];
              const isSelected = selectedSeason === seasonKey;
              return (
                <button
                  key={seasonKey}
                  type="button"
                  onClick={() => setSelectedSeason(seasonKey)}
                  className={`h-6 px-2 rounded-full text-[10.5px] font-semibold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1a2a44] text-[#eed182] shadow-xs'
                      : 'bg-white/80 text-[#5c4a3e] hover:bg-white border border-[#e2d8c6]'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* 2. Occasion Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-[10px] font-bold text-[#8b6914] uppercase tracking-wide shrink-0 mr-1">
              Dịp / Sự kiện:
            </span>
            {(Object.keys(OCCASIONS) as OccasionType[]).map((occKey: OccasionType) => {
              const o = OCCASIONS[occKey];
              const isSelected = selectedOccasion === occKey;
              return (
                <button
                  key={occKey}
                  type="button"
                  onClick={() => handleSelectOccasion(occKey)}
                  className={`h-6 px-2 rounded-full text-[10.5px] font-semibold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#AE3022] text-[#FAF6EE] shadow-xs'
                      : 'bg-white/80 text-[#5c4a3e] hover:bg-white border border-[#e2d8c6]'
                  }`}
                >
                  <span>{o.icon}</span>
                  <span>{o.label}</span>
                </button>
              );
            })}
          </div>

          {/* 3. Recommendation Insight Box */}
          <div className="p-2 rounded-lg bg-white/90 border border-[#C59B27]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px]">
            <div className="flex items-start sm:items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#AE3022] shrink-0 mt-0.5 sm:mt-0">
                lightbulb
              </span>
              <div>
                <span className="font-bold text-[#AE3022] mr-1">{recommendation.headline}:</span>
                <span className="text-[#3b322a] leading-tight">{recommendation.stylingAdvice}</span>
              </div>
            </div>

            {/* Suggested color swatches */}
            <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
              <span className="text-[9.5px] text-[#8b6914] font-semibold">Tông màu:</span>
              <div className="flex items-center gap-1">
                {recommendation.recommendedColors.map((c, idx: number) => (
                  <div
                    key={idx}
                    className="w-4 h-4 rounded-full border border-black/20 shadow-2xs"
                    style={{ backgroundColor: c.hex }}
                    title={`${c.name} (${c.element})`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
