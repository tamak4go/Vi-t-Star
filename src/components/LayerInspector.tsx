// src/components/LayerInspector.tsx
import React from 'react';
import {
  CATEGORY_LABELS,
  LAYER_INSPECTOR_ORDER,
  LAYER_MAP,
  type Category,
  type ColorState,
  type EquippedOutfit,
  type LayerStateMap,
} from '../data/dressroomConfig';

interface LayerInspectorProps {
  equippedOutfit: EquippedOutfit;
  layerVisibility: LayerStateMap;
  colorState: ColorState;
  activeColorLayer: Category;
  onToggleLayer: (category: Category) => void;
  onSelectColorLayer: (category: Category) => void;
}

export const LayerInspector: React.FC<LayerInspectorProps> = ({
  equippedOutfit,
  layerVisibility,
  colorState,
  activeColorLayer,
  onToggleLayer,
  onSelectColorLayer,
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm flex flex-col gap-1.5 border border-outline-variant/30">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-outline-variant/30">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-secondary text-[18px]">sort</span>
          <h3 className="font-headline-sm text-[15px] text-primary font-semibold">
            Kiểm Tra Xếp Lớp
          </h3>
        </div>
        <span className="text-[10px] font-semibold bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded" title="Tầng hiển thị Z-Index">
          Z-Index
        </span>
      </div>

      {/* Vertical Layer Stack */}
      <div className="flex flex-col gap-1">
        {LAYER_INSPECTOR_ORDER.map((category) => {
          const zIndex = LAYER_MAP[category];
          const label = CATEGORY_LABELS[category];
          const isBase = category === 'base';
          const equippedItem = equippedOutfit[category];
          const isVisible = isBase ? true : Boolean(layerVisibility[category]);
          const isColorActive = activeColorLayer === category;
          const currentColor = equippedItem
            ? colorState[equippedItem.id] || equippedItem.defaultColor || '#AE3022'
            : undefined;

          if (isBase) {
            return (
              <div
                key={category}
                className="flex items-center justify-between p-1.5 rounded bg-surface-container-high opacity-85 border border-outline-variant/20"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-outline-variant text-on-surface">
                    {zIndex}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[12px] text-on-surface leading-tight">
                      {label}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">
                      Cơ thể mẫu chuẩn
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[15px] text-outline px-1.5" title="Cố định">
                  lock
                </span>
              </div>
            );
          }

          return (
            <div
              key={category}
              className={`inspector-row flex items-center justify-between p-1.5 rounded-lg transition-colors border ${
                isColorActive
                  ? 'bg-surface-container-low border-secondary/50 ring-1 ring-secondary/30'
                  : 'bg-surface border-outline-variant/30 hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary text-on-primary">
                  {zIndex}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-primary flex items-center gap-1 text-[12px] leading-tight truncate">
                    {equippedItem ? equippedItem.name : `Chưa mặc (${label})`}
                    {currentColor && (
                      <span
                        className="w-2 h-2 rounded-full border border-black/20 inline-block shrink-0 shadow-2xs"
                        style={{ backgroundColor: currentColor }}
                        title={`Màu: ${currentColor}`}
                      />
                    )}
                  </span>
                  <span className="text-[10px] text-on-surface-variant truncate">
                    {label} {equippedItem?.recolorable ? '• Vải trơn' : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Palette button */}
                {equippedItem && (
                  <button
                    type="button"
                    onClick={() => onSelectColorLayer(category)}
                    className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
                      isColorActive
                        ? 'bg-secondary text-on-secondary shadow-xs'
                        : 'text-on-surface-variant hover:text-secondary hover:bg-surface-variant'
                    }`}
                    title={`Chỉnh màu ${equippedItem.name}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">palette</span>
                  </button>
                )}

                {/* Eye toggle button */}
                <button
                  type="button"
                  onClick={() => onToggleLayer(category)}
                  disabled={!equippedItem}
                  className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
                    !equippedItem
                      ? 'text-outline/40 cursor-not-allowed'
                      : isVisible
                      ? 'text-primary hover:bg-surface-variant'
                      : 'text-outline hover:bg-surface-variant'
                  }`}
                  title={isVisible ? 'Ẩn lớp này' : 'Hiện lớp này'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isVisible && equippedItem ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
