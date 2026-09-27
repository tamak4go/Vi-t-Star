// src/components/WardrobePanel.tsx
import React, { useState } from 'react';
import {
  CATEGORY_LABELS,
  LAYER_MAP,
  WARDROBE_ITEMS,
  type Category,
  type ColorState,
  type EquippedOutfit,
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
}

type TabFilter = 'all' | 'outerTop' | 'innerTop' | 'bottom' | 'belt' | 'headwear' | 'shoes';

interface TabItem {
  id: TabFilter;
  label: string;
  icon: string;
}

const TABS: TabItem[] = [
  { id: 'all', label: 'Tất Cả', icon: 'grid_view' },
  { id: 'outerTop', label: 'Áo Ngoài', icon: 'checkroom' },
  { id: 'innerTop', label: 'Áo Trong', icon: 'layers' },
  { id: 'bottom', label: 'Váy / Quần', icon: 'dry_cleaning' },
  { id: 'belt', label: 'Nịt Lưng', icon: 'toll' },
  { id: 'headwear', label: 'Mũ (Khăn)', icon: 'face' },
  { id: 'shoes', label: 'Giày', icon: 'footprint' },
];

export const WardrobePanel: React.FC<WardrobePanelProps> = ({
  equippedOutfit,
  layerVisibility,
  colorState,
  activeCategory,
  onToggleEquipItem,
  onSelectColorLayer,
  onApplyPreset,
}) => {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  // Lọc trang phục theo tab (bỏ qua base mannequin)
  const displayItems = WARDROBE_ITEMS.filter((item) => {
    if (item.category === 'base') return false;
    if (activeTab === 'all') return true;
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

      {/* Preset Quick Styles Bar */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[9px] font-bold tracking-wider text-outline uppercase shrink-0">
          MẪU SẴN:
        </span>
        <button
          type="button"
          onClick={() => onApplyPreset('tu-than')}
          className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-variant text-primary text-[10px] font-medium shrink-0 flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[12px] text-secondary">spa</span> Tứ Thân
        </button>
        <button
          type="button"
          onClick={() => onApplyPreset('yem')}
          className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-variant text-primary text-[10px] font-medium shrink-0 flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[12px] text-secondary">local_florist</span> Áo Yếm
        </button>
        <button
          type="button"
          onClick={() => onApplyPreset('vang-mo')}
          className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-variant text-primary text-[10px] font-medium shrink-0 flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[12px] text-secondary">sunny</span> Vàng Mơ
        </button>
      </div>

      {/* Category Tabs: Bar with Icon + Label stacked, matching reference */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 bg-surface-container-low p-1 rounded-lg">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-md shrink-0 transition-all min-w-[50px] ${
                isActive
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] mb-0.5">
                {tab.icon}
              </span>
              <span className="text-[9px] font-medium leading-tight whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Garment Cards Grid: 2-column large visual showcase matching reference */}
      <div className="grid grid-cols-2 gap-2.5 max-h-[calc(100vh-250px)] overflow-y-auto no-scrollbar pr-1 pt-1">
        {displayItems.map((item) => {
          const isEquipped =
            equippedOutfit[item.category]?.id === item.id &&
            Boolean(layerVisibility[item.category]);
          const isCurrentActive = activeCategory === item.category;
          const currentColor = colorState[item.id] || item.defaultColor || '#AE3022';
          const zIndex = LAYER_MAP[item.category];

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
                  className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-200 pointer-events-none"
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
        })}
      </div>
    </section>
  );
};

