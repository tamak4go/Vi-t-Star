// src/App.tsx
import { useRef, useState } from 'react';
import { AIStylistModal } from './components/AIStylistModal';
import { ColorTuningPanel } from './components/ColorTuningPanel';
import { DressCanvas } from './components/DressCanvas';
import { LayerInspector } from './components/LayerInspector';
import { SnapshotModal } from './components/SnapshotModal';
import { WardrobePanel } from './components/WardrobePanel';
import { checkCulturalEtiquette } from './services/aiStylistService';
import {
  BASE_MANNEQUIN_ITEM,
  INITIAL_BRIGHTNESS_STATE,
  INITIAL_COLOR_STATE,
  INITIAL_LAYER_STATE,
  OUTFIT_PRESETS,
  REFERENCE_FULL_SAMPLE,
  TRADITIONAL_PALETTE,
  WARDROBE_ITEMS,
  buildEquippedFromPreset,
  type BrightnessState,
  type Category,
  type ColorState,
  type EquippedOutfit,
  type LayerStateMap,
  type OutfitPreset,
  type WardrobeItem,
} from './data/dressroomConfig';

export function App() {
  // Trạng thái y phục đang mặc (mỗi category giữ tối đa 1 item)
  const [equippedOutfit, setEquippedOutfit] = useState<EquippedOutfit>(() =>
    buildEquippedFromPreset('sample1')
  );

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
  const [isAIStylistOpen, setIsAIStylistOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'wardrobe' | 'color' | 'layers'>('wardrobe');
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
    if (presetName === 'clear') {
      setEquippedOutfit({ base: BASE_MANNEQUIN_ITEM });
      setColorState(INITIAL_COLOR_STATE);
      setBrightnessState(INITIAL_BRIGHTNESS_STATE);
      showToast('Đã cởi hết y phục, trở về người mẫu mộc');
      return;
    }

    const preset = OUTFIT_PRESETS.find((p) => p.id === presetName);
    if (preset) {
      setEquippedOutfit(buildEquippedFromPreset(preset.id));
      setLayerVisibility(INITIAL_LAYER_STATE);
      setColorState(INITIAL_COLOR_STATE);
      setBrightnessState(INITIAL_BRIGHTNESS_STATE);
      showToast(`Đã áp dụng: ${preset.name}`);
    }
  };

  // Áp dụng bộ phối kèm màu đề xuất từ Cố vấn AI
  const handleApplyPresetWithColors = (preset: OutfitPreset, customColors: Record<string, string>) => {
    setEquippedOutfit(buildEquippedFromPreset(preset.id));
    setLayerVisibility(INITIAL_LAYER_STATE);
    setColorState(customColors || INITIAL_COLOR_STATE);
    setBrightnessState(INITIAL_BRIGHTNESS_STATE);
    showToast(`✨ Đã áp dụng: ${preset.name}!`);
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

  // Đặt lại toàn bộ sàn thử
  const handleResetStage = () => {
    setEquippedOutfit(buildEquippedFromPreset('sample1'));
    setLayerVisibility(INITIAL_LAYER_STATE);
    setColorState(INITIAL_COLOR_STATE);
    setBrightnessState(INITIAL_BRIGHTNESS_STATE);
    setIsComparing(false);
    setZoom(1.0);
    showToast('Đã đặt lại sàn thử đồ về mặc định');
  };

  // Tự động nhận diện giày cao gót để đổi phom chân kiễng chuẩn 1:1, không lòi ngón chân trần
  const isHighHeels =
    equippedOutfit.shoes?.id.includes('sample9') ||
    equippedOutfit.shoes?.id.includes('sample10');
  const baseSrc = isHighHeels ? '/assets/base/naked_heels.png' : BASE_MANNEQUIN_ITEM.src;

  // Tự động nhận diện bộ phục trang đang mặc để cập nhật ảnh mẫu gốc đối chiếu 1:1
  const currentSetId =
    Object.values(equippedOutfit).find((it) => it && it.setId && it.setId !== 'base')?.setId || 'sample1';
  const currentPreset = OUTFIT_PRESETS.find((p) => p.setId === currentSetId) || OUTFIT_PRESETS[0];
  const referenceSrc = currentPreset?.referenceImg || REFERENCE_FULL_SAMPLE;

  // Kiểm tra thuần phong mỹ tục: Cổ phục Việt Nam không được thiếu hạ y (quần/váy)
  const culturalCheck = checkCulturalEtiquette(equippedOutfit, layerVisibility);

  // Mặc nhanh hạ y (quần/váy) phù hợp để đảm bảo thuần phong mỹ tục
  const handleAutoEquipModestBottom = () => {
    const bottomToEquip =
      culturalCheck.suggestedBottomItem ||
      WARDROBE_ITEMS.find((it) => it.id === 'sample1-vay') ||
      WARDROBE_ITEMS.find((it) => it.category === 'bottom');

    if (bottomToEquip) {
      setEquippedOutfit((prev) => ({
        ...prev,
        bottom: bottomToEquip,
      }));
      setLayerVisibility((prev) => ({
        ...prev,
        bottom: true,
      }));
      setActiveCategory('bottom');
      showToast(`✨ Đã mặc bổ sung: ${bottomToEquip.name} chuẩn thuần phong mỹ tục!`);
    }
  };

  // Đếm số lượng món đang mặc
  const activeCount = Object.entries(equippedOutfit).filter(
    ([cat, it]) => cat !== 'base' && Boolean(it) && Boolean(layerVisibility[cat as Category])
  ).length;

  return (
    <div className="bg-background text-on-surface font-body-md text-body-md min-h-screen selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Fixed Top Header - Compact & Responsive for Mobile and Desktop */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary text-on-primary shadow-[0_4px_20px_rgba(4,21,46,0.25)]">
        <div className="h-13 sm:h-14 w-full px-2.5 sm:px-4 md:px-6 flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-space-md shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded bg-[#2a261c] text-tertiary-fixed-dim border border-tertiary-fixed/30 flex items-center justify-center shadow-[inset_0_0_8px_rgba(238,193,75,0.2)]">
                <span className="material-symbols-outlined text-[19px] sm:text-[22px] text-tertiary-fixed-dim">
                  spa
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-xs sm:text-headline-sm text-surface tracking-wider font-semibold uppercase leading-tight">
                  Việt Phục Các
                </span>
                <span className="font-label-sm text-[8.5px] sm:text-[10px] text-outline-variant tracking-widest uppercase hidden xs:inline leading-tight">
                  Studio Thử Đồ Tự Do · HSL
                </span>
              </div>
            </div>

            {/* Nav links (Desktop only) */}
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

          {/* Quick Header Actions - Icon-first on Mobile */}
          <div className="flex items-center gap-1 sm:gap-space-sm shrink-0">
            <button
              type="button"
              onClick={handleRandomize}
              className="h-8 sm:h-9 px-2 sm:px-space-sm rounded-lg bg-primary-container text-outline-variant hover:text-white hover:bg-surface-tint/40 transition-colors flex items-center gap-1 text-label-sm font-medium shadow-sm cursor-pointer"
              title="Phối ngẫu nhiên màu truyền thống"
            >
              <span className="material-symbols-outlined text-[17px] sm:text-[18px]">casino</span>
              <span className="hidden xl:inline">Ngẫu Nhiên</span>
            </button>

            <button
              id="header-reset-btn"
              type="button"
              onClick={handleResetStage}
              className="h-8 sm:h-9 px-2 sm:px-space-sm rounded-lg bg-primary-container text-outline-variant hover:text-white hover:bg-surface-tint/40 transition-colors flex items-center gap-1 text-label-sm font-medium shadow-sm cursor-pointer"
              title="Đặt Lại Ban Đầu"
            >
              <span className="material-symbols-outlined text-[17px] sm:text-[18px]">restart_alt</span>
              <span className="hidden xl:inline">Đặt Lại</span>
            </button>

            <button
              id="header-ai-stylist-btn"
              type="button"
              onClick={() => setIsAIStylistOpen(true)}
              className="h-8 sm:h-9 px-2 sm:px-space-md rounded-lg bg-gradient-to-r from-[#b93829] to-[#c59b27] text-white hover:opacity-95 shadow-[0_2px_12px_rgba(185,56,41,0.35)] transition-all flex items-center gap-1 font-label-sm font-semibold cursor-pointer"
              title="Cố Vấn Phối Đồ AI & Studio Poster Stitch"
            >
              <span className="material-symbols-outlined text-[17px] sm:text-[18px]">auto_awesome</span>
              <span className="hidden sm:inline">Cố Vấn AI</span>
              <span className="sm:hidden text-[11px] font-bold">AI</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSnapshotOpen(true)}
              className="h-8 sm:h-9 px-2 sm:px-space-md rounded-lg bg-secondary text-on-secondary hover:bg-on-secondary-container hover:text-on-secondary shadow-[0_2px_10px_rgba(174,48,34,0.35)] transition-all flex items-center gap-1 font-label-sm font-semibold cursor-pointer"
              title="Xuất Chứng Thư & Chụp Ảnh"
            >
              <span className="material-symbols-outlined text-[17px] sm:text-[18px]">photo_camera</span>
              <span className="hidden xs:inline text-[11px] sm:text-xs">Xuất Ảnh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full pt-13 sm:pt-14 pb-2 bg-surface min-h-[calc(100vh-40px)]">
        <div className="flex flex-col w-full">
          <div className="w-full px-2 sm:px-4 md:px-5 py-1.5 sm:py-2">
            {/* Top Studio Context Bar - Responsive One-Line or Compact Two-Lines */}
            <div className="w-full bg-surface-container-low rounded-lg px-2.5 sm:px-3 py-1 sm:py-1.5 mb-2 flex items-center justify-between gap-1.5 shadow-2xs border border-outline-variant/20 text-xs">
              <div className="flex items-center gap-1.5 text-secondary truncate">
                <span
                  className="material-symbols-outlined text-[16px] shrink-0"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  palette
                </span>
                <span className="text-[11px] sm:text-[13px] text-primary tracking-wide font-semibold truncate">
                  Xưởng Cổ Phục Bắc Bộ
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {culturalCheck.isMissingBottom && (
                  <button
                    type="button"
                    onClick={handleAutoEquipModestBottom}
                    className="flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-semibold cursor-pointer animate-pulse transition-all shadow-2xs"
                    title={culturalCheck.warningMessage}
                  >
                    <span className="material-symbols-outlined text-[13px] text-rose-600">warning</span>
                    <span className="hidden sm:inline">Thiếu hạ y:</span>
                    <span className="underline font-bold">Mặc quần</span>
                  </button>
                )}
                <div className="hidden sm:flex items-center gap-1.5 bg-surface-container-highest px-2 py-0.5 rounded-full text-[10px] text-on-surface-variant font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>HSL Shading</span>
                </div>
                <div className="bg-primary text-on-primary px-2 py-0.5 rounded text-[10px] font-semibold">
                  <span id="equipped-badge">{activeCount} món</span>
                </div>
              </div>
            </div>

            {/* MOBILE ONLY SEGMENTED CONTROLLER (< lg screens) */}
            <div className="lg:hidden flex items-center justify-between gap-1 p-1 bg-surface-container-low rounded-xl border border-outline-variant/30 mb-2 shadow-2xs">
              <button
                type="button"
                onClick={() => setMobileTab('wardrobe')}
                className={`flex-1 py-1.5 px-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  mobileTab === 'wardrobe'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">checkroom</span>
                <span>Tủ Đồ</span>
                {culturalCheck.isMissingBottom && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Thiếu hạ y" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setMobileTab('color')}
                className={`flex-1 py-1.5 px-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  mobileTab === 'color'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">palette</span>
                <span>Nhuộm Màu</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileTab('layers')}
                className={`flex-1 py-1.5 px-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  mobileTab === 'layers'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">layers</span>
                <span>Tầng Lớp</span>
              </button>
            </div>

            {/* ADAPTIVE WORKSPACE: Mobile Studio View vs Desktop 3-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 items-start">
              {/* DESKTOP: LEFT COLUMN (3 cols) | MOBILE: Shows when mobileTab === 'wardrobe' */}
              <div className={`lg:col-span-3 lg:order-1 ${mobileTab === 'wardrobe' ? 'order-2' : 'hidden lg:block'}`}>
                <WardrobePanel
                  equippedOutfit={equippedOutfit}
                  layerVisibility={layerVisibility}
                  colorState={colorState}
                  activeCategory={activeCategory}
                  onToggleEquipItem={handleToggleEquipItem}
                  onSelectColorLayer={(cat) => {
                    setActiveCategory(cat);
                    // Trên mobile tự động trỏ sang tab chỉnh màu
                    if (window.innerWidth < 1024) {
                      setMobileTab('color');
                    }
                  }}
                  onApplyPreset={handleApplyPreset}
                  onOpenAIStylist={() => setIsAIStylistOpen(true)}
                  isMissingBottom={culturalCheck.isMissingBottom}
                />
              </div>

              {/* CENTER COLUMN: Sàn Thử Đồ (Desktop 6 cols | Mobile: Luôn hiển thị ở trên cùng order-1) */}
              <div className="lg:col-span-6 lg:order-2 order-1 flex justify-center w-full">
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
                  referenceSrc={referenceSrc}
                  baseSrc={baseSrc}
                  isMissingBottom={culturalCheck.isMissingBottom}
                  culturalWarningMsg={culturalCheck.warningMessage}
                  onAutoEquipModestBottom={handleAutoEquipModestBottom}
                />
              </div>

              {/* DESKTOP: RIGHT COLUMN (3 cols) | MOBILE: Shows based on mobileTab */}
              <div className={`lg:col-span-3 lg:order-3 order-3 flex flex-col gap-2 max-h-[calc(100vh-125px)] overflow-y-auto no-scrollbar pr-1 ${
                mobileTab === 'color' || mobileTab === 'layers' ? 'block' : 'hidden lg:flex'
              }`}>
                {/* Layer Inspector (Hiện khi chọn tab layers trên mobile hoặc luôn hiện trên desktop) */}
                <div className={`${mobileTab === 'layers' ? 'block' : 'hidden lg:block'}`}>
                  <LayerInspector
                    equippedOutfit={equippedOutfit}
                    layerVisibility={layerVisibility}
                    colorState={colorState}
                    activeColorLayer={activeCategory}
                    onToggleLayer={handleToggleLayer}
                    onSelectColorLayer={(category) => setActiveCategory(category)}
                  />
                </div>

                {/* Color Studio (Hiện khi chọn tab color trên mobile hoặc luôn hiện trên desktop) */}
                <div className={`${mobileTab === 'color' ? 'block' : 'hidden lg:block'}`}>
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
        isMissingBottom={culturalCheck.isMissingBottom}
        outfitName={currentPreset?.name || "Cổ Phục Đại Việt"}
        onAutoEquipModestBottom={handleAutoEquipModestBottom}
      />

      {/* AI Stylist & Stitch Poster Modal */}
      <AIStylistModal
        isOpen={isAIStylistOpen}
        onClose={() => setIsAIStylistOpen(false)}
        equippedOutfit={equippedOutfit}
        colorState={colorState}
        onApplyPresetWithColors={handleApplyPresetWithColors}
        showToast={showToast}
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
