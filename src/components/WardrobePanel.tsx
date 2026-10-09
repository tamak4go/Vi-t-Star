// src/components/WardrobePanel.tsx
import React, { useState } from 'react';
import {
  CATEGORY_LABELS,
  HERITAGE_REGIONS,
  LAYER_MAP,
  OUTFIT_PRESETS,
  WARDROBE_ITEMS,
  getSetRegion,
  type Category,
  type ColorState,
  type EquippedOutfit,
  type HeritageRegion,
  type LayerId,
  type LayerStateMap,
  type WardrobeItem,
} from '../data/dressroomConfig';

interface WardrobePanelProps {
  equippedOutfit: EquippedOutfit;
  layerVisibility: LayerStateMap;
  colorState: ColorState;
  activeCategory: Category;
  onToggleEquipItem: (item: WardrobeItem) => void;
  onSelectColorLayer: (category: Category) => void;
  onApplyPreset: (presetName: string) => void;
  onOpenAIStylist?: () => void;
  isMissingBottom?: boolean;
  onOpenCulturalStory?: (item: WardrobeItem) => void;
  layerMap?: Record<LayerId, number>;
}

type TabFilter = 'all' | 'outerTop' | 'innerTop' | 'bottom' | 'belt' | 'headwear' | 'shoes' | 'accessories';

interface TabItem {
  id: TabFilter;
  label: string;
  icon: string;
}

const TABS: TabItem[] = [
  { id: 'all', label: 'Tất Cả', icon: 'grid_view' },
  { id: 'outerTop', label: 'Áo Ngoài', icon: 'checkroom' },
  { id: 'innerTop', label: 'Áo Trong', icon: 'layers' },
  { id: 'bottom', label: 'Quần / Váy', icon: 'dry_cleaning' },
  { id: 'belt', label: 'Nịt Lưng', icon: 'toll' },
  { id: 'headwear', label: 'Mũ / Khăn Đội', icon: 'face' },
  { id: 'shoes', label: 'Giày', icon: 'footprint' },
  { id: 'accessories', label: 'Phụ Kiện', icon: 'diamond' },
];

// Bản đồ điểm neo thông minh theo danh mục giúp phóng to 150% mà không bị cắt xén viền
const CATEGORY_TRANSFORM_ORIGIN: Record<Category, string> = {
  headwear: 'center 8%',
  neckwear: 'center 22%',
  innerTop: 'center 32%',
  outerTop: 'center 32%',
  belt: 'center 48%',
  bottom: 'center 68%',
  shoes: 'center 95%',
  handheld: 'center 52%',
  base: 'center center',
};

export const WardrobePanel: React.FC<WardrobePanelProps> = ({
  equippedOutfit,
  layerVisibility,
  colorState,
  activeCategory,
  onToggleEquipItem,
  onSelectColorLayer,
  onApplyPreset,
  onOpenAIStylist,
  isMissingBottom,
  onOpenCulturalStory,
  layerMap,
}) => {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [selectedRegion, setSelectedRegion] = useState<HeritageRegion>('all');

  // Lọc trang phục theo cả tab danh mục VÀ vùng miền địa phương
  const displayItems = WARDROBE_ITEMS.filter((item) => {
    if (item.category === 'base') return false;

    // Lọc theo vùng miền / địa phương (Tiêu chí đề thi Audition)
    if (selectedRegion !== 'all') {
      const itemRegion = getSetRegion(item.setId);
      if (itemRegion !== selectedRegion) return false;
    }

    if (activeTab === 'all') return true;
    if (activeTab === 'accessories') {
      return item.category === 'neckwear' || item.category === 'handheld';
    }
    return item.category === activeTab;
  });


  return (
    <section className="flex flex-col gap-2 bg-surface-container-lowest rounded-xl p-3 shadow-sm w-full border border-outline-variant/30">
      {/* Wardrobe Header & Counter */}
      <div className="flex items-center justify-between pb-1.5 border-b border-outline-variant/30">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-secondary text-[22px]">checkroom</span>
          <h2 className="font-headline-sm text-[16px] text-primary font-semibold tracking-tight">
            Tủ Đồ Việt Phục
          </h2>
        </div>
        <span className="text-[10px] font-medium bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full">
          {displayItems.length} phục trang
        </span>
      </div>

      {/* AI Stylist Callout Banner */}
      {onOpenAIStylist && (
        <button
          type="button"
          onClick={onOpenAIStylist}
          className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[#1a2a44] via-[#2d1b1a] to-[#b93829] text-white flex items-center justify-between text-xs font-semibold shadow-xs hover:opacity-95 transition-all border border-[#c59b27]/40 cursor-pointer group"
          title="Mở Cố Vấn Phối Đồ AI & Studio Poster Stitch"
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#c59b27] text-[#1a2a44] flex items-center justify-center text-[12px] font-bold shadow-xs">
              ✨
            </span>
            <div className="text-left">
              <div className="text-white text-[11.5px] font-bold leading-tight flex items-center gap-1.5">
                Cố Vấn AI & Stitch Studio
                <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-[#b93829] text-white uppercase font-mono tracking-wider">
                  Audition
                </span>
              </div>
              <div className="text-[9.5px] text-slate-300 font-normal leading-tight">
                Phối theo bối cảnh & Tạo Poster AI
              </div>
            </div>
          </div>
          <span className="material-symbols-outlined text-[15px] text-[#c59b27] group-hover:translate-x-0.5 transition-transform">
            arrow_forward
          </span>
        </button>
      )}

      {/* Preset Quick Styles Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <span className="text-[9px] font-bold tracking-wider text-outline uppercase shrink-0">
          MẪU SẴN ({OUTFIT_PRESETS.length}):
        </span>
        {OUTFIT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onApplyPreset(preset.id)}
            className="px-2.5 py-1 rounded-md bg-surface-container-high hover:bg-surface-variant text-primary text-[10.5px] font-medium shrink-0 flex items-center gap-1.5 transition-colors border border-outline-variant/30 hover:border-secondary/40 shadow-2xs"
            title={preset.name}
          >
            <span className="material-symbols-outlined text-[13px] text-secondary">{preset.icon}</span>
            <span>{preset.shortName}</span>
          </button>
        ))}
        <button
          type="button"
          id="btn-clear-outfit"
          onClick={() => onApplyPreset('clear')}
          className="px-2.5 py-1 rounded-md bg-rose-900/10 hover:bg-rose-900/20 text-rose-900 border border-rose-900/30 text-[10.5px] font-semibold shrink-0 flex items-center gap-1.5 transition-colors shadow-2xs"
          title="Cởi hết y phục, trở về người mẫu mộc"
        >
          <span className="material-symbols-outlined text-[13px]">do_not_disturb_on</span>
          <span>Cởi Hết</span>
        </button>
      </div>

      {/* Heritage Region Filter Bar (Tiêu chí Đề thi Audition: Khám phá & Phối theo Địa Phương) */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 px-1.5 bg-[#FAF6EE] rounded-lg border border-[#C59B27]/30 shadow-2xs">
        <span className="text-[9px] font-bold tracking-wider text-[#AE3022] uppercase shrink-0 flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">explore</span>
          <span>ĐỊA PHƯƠNG:</span>
        </span>
        {HERITAGE_REGIONS.map((region) => {
          const isSelected = selectedRegion === region.id;
          return (
            <button
              key={region.id}
              type="button"
              id={`region-filter-${region.id}`}
              onClick={() => setSelectedRegion(region.id)}
              className={`px-2 py-0.5 rounded text-[10.5px] shrink-0 flex items-center gap-1 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#1a2a44] text-[#eed182] font-bold shadow-xs'
                  : 'bg-white hover:bg-surface-container text-[#4a3d34] border border-[#e2d8c6]'
              }`}
              title={region.description}
            >
              <span className="material-symbols-outlined text-[12px]">{region.icon}</span>
              <span>{region.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Category Tabs: Grid 4x2 so all 8 tabs fit completely without cutoffs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-surface-container-low rounded-lg">

        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const isBottomAlert = tab.id === 'bottom' && isMissingBottom;
          const count = WARDROBE_ITEMS.filter((item) => {
            if (item.category === 'base') return false;
            if (tab.id === 'all') return true;
            if (tab.id === 'accessories') {
              return item.category === 'neckwear' || item.category === 'handheld';
            }
            return item.category === tab.id;
          }).length;

          return (
            <button
              key={tab.id}
              type="button"
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-md transition-all relative cursor-pointer ${
                isActive
                  ? 'bg-primary text-on-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
              } ${isBottomAlert ? 'ring-1 ring-amber-500 bg-amber-50/60' : ''}`}
            >
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">
                  {tab.icon}
                </span>
                {count > 0 && (
                  <span
                    className={`text-[8px] px-1 py-0.2 rounded-full font-bold leading-none ${
                      isActive
                        ? 'bg-secondary text-white'
                        : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-medium leading-tight text-center mt-0.5 whitespace-nowrap">
                {tab.label}
              </span>

              {/* Pulsing modesty alert on bottom tab if upper garment equipped without pants */}
              {isBottomAlert && (
                <span
                  className="absolute -top-1 -right-0.5 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-xs animate-bounce"
                  title="Đang thiếu quần/váy theo chuẩn thuần phong mỹ tục"
                >
                  !
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Garment Cards Grid: 2-column large visual showcase matching reference */}
      <div className="grid grid-cols-2 gap-2.5 max-h-[calc(100vh-250px)] overflow-y-auto no-scrollbar pr-1 pt-1 min-h-[140px]">
        {displayItems.length === 0 ? (
          <div className="col-span-2 py-10 text-center text-outline text-[12px] flex flex-col items-center justify-center gap-2 bg-[#FAF7F0] rounded-xl border border-dashed border-outline-variant/40">
            <span className="material-symbols-outlined text-[28px] text-outline/60">inventory_2</span>
            <span className="font-medium text-on-surface-variant">Chưa có phục trang trong mục này</span>
            <span className="text-[10px] text-outline">Hãy chọn tab khác hoặc xem mục Tất Cả</span>
          </div>
        ) : (
          displayItems.map((item) => {
            const isEquipped =
              equippedOutfit[item.category]?.id === item.id &&
              Boolean(layerVisibility[item.category]);
            const isCurrentActive = activeCategory === item.category;
            const currentColor = colorState[item.id] || item.defaultColor || '#AE3022';
            const zIndex = (layerMap && layerMap[item.category]) ?? LAYER_MAP[item.category];

            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelectColorLayer(item.category);
                }}
                className={`group garment-card rounded-xl p-2 border transition-all flex flex-col justify-between bg-[#FAF7F0] ${
                  isEquipped
                    ? 'border-[#8B281B]/40 ring-1 ring-[#8B281B]/20 shadow-xs'
                    : 'border-[#E8E2D5] hover:border-outline-variant hover:shadow-xs'
                } ${isCurrentActive ? 'ring-2 ring-secondary/60' : ''}`}
              >
              {/* Large Image Showcase Container */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleEquipItem(item);
                }}
                className="w-full h-36 bg-[#F4EFE6]/70 rounded-lg overflow-hidden flex items-center justify-center p-2 mb-2 relative cursor-pointer"
                title="Nhấn để mặc / cởi"
              >
                <img
                  src={item.src}
                  alt={item.name}
                  style={{
                    transformOrigin: CATEGORY_TRANSFORM_ORIGIN[item.category] || 'center center',
                  }}
                  className="w-full h-full object-contain filter drop-shadow-sm scale-[1.5] group-hover:scale-[1.6] transition-transform duration-200 pointer-events-none"
                />
              </div>

              {/* Tag + Color Dot + Title */}
              <div className="flex flex-col mb-2 px-0.5">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-[9px] font-bold text-[#963020] uppercase tracking-wider truncate">
                    {CATEGORY_LABELS[item.category]} · TẦNG {zIndex}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                    style={{ backgroundColor: currentColor }}
                    title={`Màu hiện tại: ${currentColor} (Chỉnh ở bảng bên phải)`}
                  />
                </div>

                <div className="flex items-center justify-between gap-1">
                  <h3
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleEquipItem(item);
                    }}
                    className="text-[12px] font-bold text-primary truncate leading-tight cursor-pointer hover:text-secondary transition-colors"
                    title={item.name}
                  >
                    {item.name}
                  </h3>
                  {onOpenCulturalStory && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCulturalStory(item);
                      }}
                      className="w-5 h-5 rounded flex items-center justify-center text-[#8b6914] hover:text-[#AE3022] hover:bg-[#e8ded0] transition-colors shrink-0"
                      title="Xem điển tích lịch sử & ý nghĩa biểu tượng"
                    >
                      <span className="material-symbols-outlined text-[14px]">auto_stories</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Action Button: Đang Mặc / Mặc Thử */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleEquipItem(item);
                }}
                className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 shadow-2xs transition-all ${
                  isEquipped
                    ? 'bg-[#8B281B] hover:bg-[#782216] text-white shadow-xs'
                    : 'bg-[#EAE5DC] hover:bg-[#DFD8CD] text-[#4A453E] hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isEquipped ? 'check' : 'add'}
                </span>
                <span>{isEquipped ? 'Đang Mặc' : 'Mặc Thử'}</span>
              </button>
            </div>
          );
        }))}
      </div>
    </section>
  );
};

