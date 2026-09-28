// src/App.tsx
import { useRef, useState } from 'react';
import { ColorTuningPanel } from './components/ColorTuningPanel';
import { DressCanvas } from './components/DressCanvas';
import { LayerInspector } from './components/LayerInspector';
import { SnapshotModal } from './components/SnapshotModal';
import { WardrobePanel } from './components/WardrobePanel';
import {
  BASE_MANNEQUIN_ITEM,
  INITIAL_BRIGHTNESS_STATE,
  INITIAL_COLOR_STATE,
  INITIAL_LAYER_STATE,
  TRADITIONAL_PALETTE,
  WARDROBE_ITEMS,
  DEFAULT_EQUIPPED_OUTFIT,
  Y2K_EQUIPPED_OUTFIT,
  type BrightnessState,
  type Category,
  type ColorState,
  type EquippedOutfit,
  type LayerStateMap,
  type WardrobeItem,
} from './data/dressroomConfig';

export function App() {
  // Trạng thái y phục đang mặc: Khởi đầu bằng người mẫu mộc, không tự động mặc đồ
  const [equippedOutfit, setEquippedOutfit] = useState<EquippedOutfit>({
    base: BASE_MANNEQUIN_ITEM,
  });

  // Trạng thái ẩn/hiện từng tầng y phục
  const [layerVisibility, setLayerVisibility] = useState<LayerStateMap>(INITIAL_LAYER_STATE);

  // Bảng mã màu đang nhuộm HSL cho từng item (key = item.id)
  const [colorState, setColorState] = useState<ColorState>(INITIAL_COLOR_STATE);

  // Bảng độ sáng / đậm nhạt (-1..1) cho từng item (key = item.id)
  const [brightnessState, setBrightnessState] = useState<BrightnessState>(INITIAL_BRIGHTNESS_STATE);

  // Tầng y phục đang được chọn để chỉnh màu tại panel bên phải
  const [activeCategory, setActiveCategory] = useState<Category>('innerTop');

  // Điều khiển sàn thử đồ
  const [isComparing, setIsComparing] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 2200);
  };

  // Mặc / Cởi trang phục từ Tủ Đồ
  const handleToggleEquipItem = (item: WardrobeItem) => {
    const isEquipped =
      equippedOutfit[item.category]?.id === item.id &&
      Boolean(layerVisibility[item.category]);

    if (isEquipped) {
      // Cởi lớp này ra (tắt hiển thị)
      setLayerVisibility((prev) => ({
        ...prev,
        [item.category]: false,
      }));
      showToast(`Đã cởi: ${item.name}`);
    } else {
      // Mặc đồ vào & đảm bảo layer được bật
      setEquippedOutfit((prev) => ({
        ...prev,
        [item.category]: item,
      }));
      setLayerVisibility((prev) => ({
        ...prev,
        [item.category]: true,
      }));
      setActiveCategory(item.category);
      showToast(`Đã mặc: ${item.name}`);
    }
  };

  // Ẩn/Hiện từng tầng từ Layer Inspector
  const handleToggleLayer = (category: Category) => {
    if (category === 'base') return; // Body gốc không ẩn
    setLayerVisibility((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Đổi màu HSL cho trang phục
  const handleChangeColor = (itemId: string, hex: string) => {
    setColorState((prev) => ({
      ...prev,
      [itemId]: hex,
    }));
    showToast(`Đã nhuộm sắc ${hex} cho y phục!`);
  };

  // Chỉnh độ sáng tối của trang phục
  const handleChangeBrightness = (itemId: string, brightness: number) => {
    setBrightnessState((prev) => ({
      ...prev,
      [itemId]: brightness,
    }));
  };

  // Khôi phục màu gốc ban đầu của trang phục
  const handleResetColor = (itemId: string) => {
    setColorState((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    setBrightnessState((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    showToast('Đã khôi phục sắc phục nguyên bản');
  };

  // Áp dụng bộ phối sẵn
  const handleApplyPreset = (presetName: string) => {
    if (presetName === 'y2k') {
      setEquippedOutfit({ ...Y2K_EQUIPPED_OUTFIT });
      setLayerVisibility({
        base: true,
        shoes: true,
        innerTop: true,
        bottom: true,
        outerTop: true,
        belt: true,
        neckwear: true,
        handheld: false,
        headwear: true,
      });
      setColorState(INITIAL_COLOR_STATE);
      setBrightnessState(INITIAL_BRIGHTNESS_STATE);
      setActiveCategory('outerTop');
      showToast('Đã áp dụng mẫu Y2K Hiện Đại');
    } else if (presetName === 'tu-than') {
      setEquippedOutfit({ ...DEFAULT_EQUIPPED_OUTFIT });
      setLayerVisibility(INITIAL_LAYER_STATE);
      setColorState(INITIAL_COLOR_STATE);
      setBrightnessState(INITIAL_BRIGHTNESS_STATE);
      setActiveCategory('outerTop');
      showToast('Đã áp dụng mẫu Tứ Thân Kinh Bắc');
    } else if (presetName === 'yem') {
      setEquippedOutfit({ ...DEFAULT_EQUIPPED_OUTFIT });
      setLayerVisibility({
        base: true,
        shoes: true,
        innerTop: true,
        bottom: true,
        outerTop: false, // cởi áo ngoài để lộ áo yếm
        belt: true,
        neckwear: true,
        headwear: false,
        handheld: true,
      });
      setActiveCategory('innerTop');
      showToast('Đã áp dụng mẫu Yếm Dạo Hội');
    } else if (presetName === 'vang-mo') {
      setEquippedOutfit({ ...DEFAULT_EQUIPPED_OUTFIT });
      setLayerVisibility(INITIAL_LAYER_STATE);
      setColorState({
        'ao-yem-do-tham': '#E3A857', // Yếm vàng mơ
        'nit-lung-luc-tham': '#2F4B6E', // Dải nịt chàm lam
      });
      setActiveCategory('innerTop');
      showToast('Đã áp dụng bộ phối Sắc Vàng Mơ & Chàm Lam');
    } else if (presetName === 'clear') {
      handleResetStage();
    }
  };

  // Phối ngẫu nhiên màu cho các trang phục vải trơn (recolorable)
  const handleRandomize = () => {
    const recolorableItems = WARDROBE_ITEMS.filter((it) => it.recolorable);
    const newColors: ColorState = {};
    const shuffled = [...TRADITIONAL_PALETTE].sort(() => 0.5 - Math.random());

    recolorableItems.forEach((it, idx) => {
      const swatch = shuffled[idx % shuffled.length];
      newColors[it.id] = swatch.hex;
    });

    setColorState(newColors);
    showToast('Đã tạo diện mạo phối sắc ngẫu nhiên!');
  };

  // Đặt lại toàn bộ sàn thử (Cởi hết trang phục, về người mẫu mộc)
  const handleResetStage = () => {
    setEquippedOutfit({ base: BASE_MANNEQUIN_ITEM });
    setLayerVisibility(INITIAL_LAYER_STATE);
    setColorState(INITIAL_COLOR_STATE);
    setBrightnessState(INITIAL_BRIGHTNESS_STATE);
    setIsComparing(false);
    setZoom(1.0);
    showToast('Đã cởi hết y phục, trở về người mẫu mộc');
  };

  // Đếm số lượng món đang mặc
  const activeCount = Object.entries(equippedOutfit).filter(
    ([cat, it]) => cat !== 'base' && Boolean(it) && Boolean(layerVisibility[cat as Category])
  ).length;

  return (
    <div className="bg-background text-on-surface font-body-md text-body-md min-h-screen selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Fixed Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary text-on-primary shadow-[0_4px_20px_rgba(4,21,46,0.25)]">
        <div className="h-14 w-full px-4 md:px-6 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-space-lg shrink-0">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded bg-[#2a261c] text-tertiary-fixed-dim border border-tertiary-fixed/30 flex items-center justify-center shadow-[inset_0_0_8px_rgba(238,193,75,0.2)]">
                <span className="material-symbols-outlined text-[22px] text-tertiary-fixed-dim">
                  spa
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-surface tracking-wider font-semibold uppercase">
                  Việt Phục Các
                </span>
                <span className="font-label-sm text-[10px] text-outline-variant tracking-widest uppercase">
                  Studio Thử Đồ Tự Do · Nhuộm Vải HSL
                </span>
              </div>
            </div>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1 ml-space-md">
              <a
                className="px-space-md py-1.5 rounded-lg bg-surface-tint/30 text-white font-label-md font-semibold flex items-center gap-1.5 transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-[18px]">checkroom</span>
                <span>Phòng Thử</span>
              </a>
              <a
                className="px-space-md py-1.5 rounded-lg text-outline-variant hover:text-white hover:bg-surface-tint/20 font-label-md font-medium transition-colors"
                href="#"
              >
                Kho Cổ Phục
              </a>
              <a
                className="px-space-md py-1.5 rounded-lg text-outline-variant hover:text-white hover:bg-surface-tint/20 font-label-md font-medium transition-colors"
                href="#"
              >
                Bảo Chứng Di Sản
              </a>
            </nav>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-space-sm shrink-0">
            <button
              type="button"
              onClick={handleRandomize}
              className="h-9 px-space-sm rounded-lg bg-primary-container text-outline-variant hover:text-white hover:bg-surface-tint/40 transition-colors flex items-center gap-1.5 text-label-sm font-medium shadow-sm"
              title="Phối ngẫu nhiên màu truyền thống"
            >
              <span className="material-symbols-outlined text-[18px]">casino</span>
              <span className="hidden xl:inline">Ngẫu Nhiên</span>
            </button>

            <button
              id="header-reset-btn"
              type="button"
              onClick={handleResetStage}
              className="h-9 px-space-sm rounded-lg bg-primary-container text-outline-variant hover:text-white hover:bg-surface-tint/40 transition-colors flex items-center gap-1.5 text-label-sm font-medium shadow-sm"
              title="Đặt Lại Ban Đầu"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              <span className="hidden xl:inline">Đặt Lại</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSnapshotOpen(true)}
              className="h-9 px-space-md rounded-lg bg-secondary text-on-secondary hover:bg-on-secondary-container hover:text-on-secondary shadow-[0_2px_10px_rgba(174,48,34,0.35)] transition-all flex items-center gap-1.5 font-label-sm font-semibold cursor-pointer"
              title="Xuất Chứng Thư & Chụp Ảnh"
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              <span>Xuất Ảnh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full pt-14 pb-2 bg-surface min-h-[calc(100vh-40px)]">
        <div className="flex flex-col w-full">
          <div className="w-full px-3 md:px-5 py-2">
            {/* Top Studio Context Bar */}
            <div className="w-full bg-surface-container-low rounded-lg px-3 py-1.5 mb-2.5 flex flex-wrap items-center justify-between gap-2 shadow-xs border border-outline-variant/20">
              <div className="flex items-center gap-2 text-secondary">
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  palette
                </span>
                <span className="text-[13px] text-primary tracking-wide font-semibold">
                  Xưởng Giả Lập Phục Chế Cổ Phục · Bắc Bộ
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-surface-container-highest px-2.5 py-0.5 rounded-full text-[10px] text-on-surface-variant font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Canvas HSL Shading (Bảo Toàn Bóng Vải)</span>
                </div>
                <div className="bg-primary text-on-primary px-2.5 py-0.5 rounded text-[10px] font-semibold">
                  <span id="equipped-badge">Đang mặc: {activeCount} món</span>
                </div>
              </div>
            </div>

            {/* 3-Column Interactive Atelier Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
              {/* LEFT COLUMN: Tủ Đồ (lg:col-span-3 xl:col-span-3) */}
              <div className="lg:col-span-3 xl:col-span-3">
                <WardrobePanel
                  equippedOutfit={equippedOutfit}
                  layerVisibility={layerVisibility}
                  colorState={colorState}
                  activeCategory={activeCategory}
                  onToggleEquipItem={handleToggleEquipItem}
                  onSelectColorLayer={(cat) => setActiveCategory(cat)}
                  onApplyPreset={handleApplyPreset}
                />
              </div>

              {/* CENTER COLUMN: Sàn Thử Đồ Trung Tâm (lg:col-span-6 xl:col-span-6) */}
              <div className="lg:col-span-6 xl:col-span-6 flex justify-center">
                <DressCanvas
                  equippedOutfit={equippedOutfit}
                  layerVisibility={layerVisibility}
                  colorState={colorState}
                  brightnessState={brightnessState}
                  isComparing={isComparing}
                  onToggleCompare={() => setIsComparing((prev) => !prev)}
                  zoom={zoom}
                  onZoomIn={() => setZoom((prev) => Math.min(prev + 0.15, 1.4))}
                  onZoomOut={() => setZoom((prev) => Math.max(prev - 0.15, 0.8))}
                  onResetStage={handleResetStage}
                  canvasRef={canvasRef}
                />
              </div>

              {/* RIGHT COLUMN: Layer Inspector & Color Studio (lg:col-span-3 xl:col-span-3) */}
              <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-2 max-h-[calc(100vh-125px)] overflow-y-auto no-scrollbar pr-1">
                <LayerInspector
                  equippedOutfit={equippedOutfit}
                  layerVisibility={layerVisibility}
                  colorState={colorState}
                  activeColorLayer={activeCategory}
                  onToggleLayer={handleToggleLayer}
                  onSelectColorLayer={(category) => setActiveCategory(category)}
                />

                <ColorTuningPanel
                  activeCategory={activeCategory}
                  equippedOutfit={equippedOutfit}
                  colorState={colorState}
                  brightnessState={brightnessState}
                  onChangeColor={handleChangeColor}
                  onChangeBrightness={handleChangeBrightness}
                  onResetLayerColor={handleResetColor}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Compact Footer */}
      <footer className="w-full bg-surface-container py-1.5 border-t border-outline-variant/30">
        <div className="w-full px-4 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-on-surface-variant">
          <div className="flex items-center gap-1.5 font-semibold text-primary">
            <span className="material-symbols-outlined text-tertiary text-[16px]">account_balance</span>
            <span>Việt Phục Các</span>
          </div>
          <div className="text-on-surface-variant/80">
            <span>Thời Lê · Trần · Nguyễn · Tiền Triều © 2025 Bảo Tàng Cổ Phục Đại Việt</span>
          </div>
        </div>
      </footer>

      {/* Snapshot Modal */}
      <SnapshotModal
        isOpen={isSnapshotOpen}
        onClose={() => setIsSnapshotOpen(false)}
        canvasRef={canvasRef}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-[#04152e] text-[#ffdf98] px-4 py-2.5 rounded-xl shadow-xl border border-[#c59b27]/60 flex items-center gap-2 text-xs font-semibold">
            <span className="material-symbols-outlined text-[18px] text-[#eec14b]">info</span>
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
