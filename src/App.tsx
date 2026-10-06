// src/App.tsx
import { useEffect, useRef, useState } from 'react';
import { AIStylistModal } from './components/AIStylistModal';
import { AuditionDossierModal } from './components/AuditionDossierModal';
import { ColorTuningPanel } from './components/ColorTuningPanel';
import { CulturalAuthenticityModal } from './components/CulturalAuthenticityModal';
import { CulturalStoryModal } from './components/CulturalStoryModal';
import { DressCanvas } from './components/DressCanvas';
import { LayerInspector } from './components/LayerInspector';
import { SnapshotModal } from './components/SnapshotModal';
import { WardrobePanel } from './components/WardrobePanel';
import { WeatherOccasionBar } from './components/WeatherOccasionBar';
import { checkCulturalEtiquette } from './services/aiStylistService';
import { checkCulturalAuthenticity, getItemCulturalStory } from './services/culturalKnowledgeService';

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

  // Bối cảnh sàn thử đồ: mặc định Giấy Dó Truyền Thống mộc nguyên bản
  const [selectedBackdrop, setSelectedBackdrop] = useState<string>('parchment');

  // Điều khiển sàn thử đồ
  const [isComparing, setIsComparing] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);
  const [isAIStylistOpen, setIsAIStylistOpen] = useState(false);
  const [aiStylistInitialTab, setAiStylistInitialTab] = useState<'stylist' | 'stitch'>('stylist');
  const [aiStylistInitialFaceMode, setAiStylistInitialFaceMode] = useState<'default' | 'custom'>('default');
  const [mobileTab, setMobileTab] = useState<'wardrobe' | 'color' | 'layers'>('wardrobe');
  const [toast, setToast] = useState<string | null>(null);

  // Master Plan Audition Features:

  // 2. Hộp thoại điển tích văn hóa (Stage 1 & 3)
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedStoryItem, setSelectedStoryItem] = useState<WardrobeItem | null>(null);

  // 3. Bộ so sánh bản phối A / B (Stage 4) - Lưu trữ bền vững vào localStorage
  const [isABMode, setIsABMode] = useState(false);
  const [outfitSetA, setOutfitSetA] = useState<{ outfit: EquippedOutfit; colors: ColorState } | null>(() => {
    try {
      const saved = localStorage.getItem('vietstar_outfit_slot_a');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [outfitSetB, setOutfitSetB] = useState<{ outfit: EquippedOutfit; colors: ColorState } | null>(() => {
    try {
      const saved = localStorage.getItem('vietstar_outfit_slot_b');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');

  // 4. Hộp thoại Đề Án Audition & Thẩm định chuẩn mực văn hóa (Tiêu chí Đề thi Audition)
  const [isAuditionDossierOpen, setIsAuditionDossierOpen] = useState(false);
  const [isAuthenticityModalOpen, setIsAuthenticityModalOpen] = useState(false);

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

  // Đặt lại toàn bộ sàn thử: Cởi hết toàn bộ y phục, đưa về người mẫu mộc & nền giấy dó mộc nguyên bản
  const handleResetStage = () => {
    setEquippedOutfit({ base: BASE_MANNEQUIN_ITEM });
    setLayerVisibility(INITIAL_LAYER_STATE);
    setColorState(INITIAL_COLOR_STATE);
    setBrightnessState(INITIAL_BRIGHTNESS_STATE);
    setSelectedBackdrop('parchment');
    setIsComparing(false);
    setZoom(1.0);
    showToast('Đã cởi hết trang phục, đưa sàn thử về người mẫu mộc & nền giấy dó!');
  };

  // Handler mở hộp thoại điển tích văn hóa
  const handleOpenCulturalStory = (item: WardrobeItem | null) => {
    setSelectedStoryItem(item);
    setIsStoryModalOpen(true);
  };

  // Handler áp dụng gợi ý thời tiết & bối cảnh
  const handleApplyWeatherRecommendation = (setId: string, suggestedHex?: string) => {
    const preset = OUTFIT_PRESETS.find((p) => p.setId === setId || p.id === setId);
    if (preset) {
      const newEquipped = buildEquippedFromPreset(preset.id);
      setEquippedOutfit(newEquipped);
      setLayerVisibility(INITIAL_LAYER_STATE);
      if (suggestedHex) {
        const recolorableItem = Object.values(newEquipped).find((it) => it?.recolorable);
        if (recolorableItem) {
          setColorState({ [recolorableItem.id]: suggestedHex });
        } else {
          setColorState(INITIAL_COLOR_STATE);
        }
      } else {
        setColorState(INITIAL_COLOR_STATE);
      }
      setBrightnessState(INITIAL_BRIGHTNESS_STATE);
      showToast(`✨ Đã phối theo bối cảnh: ${preset.name}!`);
    }
  };

  // Handlers cho bộ so sánh A / B (A/B Comparator)
  const handleSaveToSetA = () => {
    const data = { outfit: { ...equippedOutfit }, colors: { ...colorState } };
    setOutfitSetA(data);
    try {
      localStorage.setItem('vietstar_outfit_slot_a', JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
    showToast('💾 Đã lưu bộ hiện tại vào Bản Phối A!');
  };

  const handleSaveToSetB = () => {
    const data = { outfit: { ...equippedOutfit }, colors: { ...colorState } };
    setOutfitSetB(data);
    try {
      localStorage.setItem('vietstar_outfit_slot_b', JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
    showToast('💾 Đã lưu bộ hiện tại vào Bản Phối B!');
  };

  const handleSwitchSlot = (slot: 'A' | 'B') => {
    setActiveSlot(slot);
    const target = slot === 'A' ? outfitSetA : outfitSetB;
    if (target) {
      setEquippedOutfit(target.outfit);
      setColorState(target.colors);
      showToast(`Đã chuyển sang xem Bản Phối ${slot}`);
    } else {
      showToast(`Bản Phối ${slot} đang trống. Hãy nhấn "Lưu ${slot}" để lưu bộ hiện tại!`);
    }
  };

  const handleToggleABMode = () => {
    setIsABMode((prev) => {
      const next = !prev;
      if (next && !outfitSetA) {
        // Tự động snapshot bộ hiện tại vào Slot A khi vừa bật
        const data = { outfit: { ...equippedOutfit }, colors: { ...colorState } };
        setOutfitSetA(data);
        try {
          localStorage.setItem('vietstar_outfit_slot_a', JSON.stringify(data));
        } catch {}
      }
      return next;
    });
  };

  // ⚡ Gen Z Remix: Mix & Match Cổ Phục Di Sản x Streetwear & Y2K Hiện Đại
  const handleGenZRemix = () => {
    const heritageTops = ['sample6-ao', 'sample2-ao', 'sample1-yem', 'sample3-ao', 'sample4-ao', 'sample7-ao'];
    const modernBottoms = ['sample10-quan', 'sample11-vay', 'sample9-vay'];
    const modernShoes = ['sample11-bot', 'sample10-giay', 'sample9-giay'];
    const modernAccessories = ['sample11-headphone', 'sample11-choker', 'sample9-vi', 'sample9-bong-tai'];

    const chosenTopId = heritageTops[Math.floor(Math.random() * heritageTops.length)];
    const chosenBottomId = modernBottoms[Math.floor(Math.random() * modernBottoms.length)];
    const chosenShoesId = modernShoes[Math.floor(Math.random() * modernShoes.length)];
    const chosenAccId = modernAccessories[Math.floor(Math.random() * modernAccessories.length)];

    const topItem = WARDROBE_ITEMS.find((it) => it.id === chosenTopId);
    const bottomItem = WARDROBE_ITEMS.find((it) => it.id === chosenBottomId);
    const shoesItem = WARDROBE_ITEMS.find((it) => it.id === chosenShoesId);
    const accItem = WARDROBE_ITEMS.find((it) => it.id === chosenAccId);

    const newEquipped: EquippedOutfit = {
      base: BASE_MANNEQUIN_ITEM,
    };
    if (topItem) newEquipped[topItem.category] = topItem;
    if (bottomItem) newEquipped[bottomItem.category] = bottomItem;
    if (shoesItem) newEquipped[shoesItem.category] = shoesItem;
    if (accItem) newEquipped[accItem.category] = accItem;

    // Phối màu ngẫu nhiên hài hòa cho các món recolorable
    const newColors: ColorState = {};
    const shuffled = [...TRADITIONAL_PALETTE].sort(() => 0.5 - Math.random());
    let colorIdx = 0;
    Object.values(newEquipped).forEach((item) => {
      if (item && item.recolorable) {
        newColors[item.id] = shuffled[colorIdx % shuffled.length].hex;
        colorIdx++;
      }
    });

    setEquippedOutfit(newEquipped);
    setLayerVisibility(INITIAL_LAYER_STATE);
    setColorState(newColors);
    setBrightnessState(INITIAL_BRIGHTNESS_STATE);

    // Chuyển background sang 'ca_phe' (Cà phê dạo phố Gen Z) nếu đang ở backdrop cổ điển
    if (selectedBackdrop === 'parchment' || selectedBackdrop === 'dinh_lang') {
      setSelectedBackdrop('ca_phe');
    }

    showToast('⚡ Gen Z Remix: Cổ Phục x Streetwear & Y2K!');
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

  // Thẩm định chuẩn mực di sản & phát hiện sai lệch đặc trưng văn hóa (Tiêu chí đề thi Audition)
  const BACKDROP_TO_OCCASION_MAP: Record<string, string> = {
    parchment: 'ky-yeu',
    hue_palace: 'tet',
    ancient_town: 'dinh-lang',
    studio_gold: 'dam-cuoi',
    lotus_pond: 'ky-yeu',
    minimal_gray: 'cafe-genz',
    bamboo_screen: 'dinh-lang',
    hy_su: 'dam-cuoi',
    ca_phe: 'cafe-genz',
    ngoai_giao: 'ngoai-giao',
  };
  const activeOccasionId = BACKDROP_TO_OCCASION_MAP[selectedBackdrop] || 'ky-yeu';
  const authenticityAssessment = checkCulturalAuthenticity(equippedOutfit, activeOccasionId);


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

  const snapshotOutfitName = activeCount === 0 ? 'Người Mẫu Mộc' : currentPreset?.name || 'Cổ Phục Đại Việt';
  const snapshotEraName = activeCount === 0 ? 'Mộc Thể Nguyên Bản' : getItemCulturalStory(null, currentSetId).era;

  // Phím tắt bàn phím toàn cục (Keyboard Shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === 'Escape') {
        setIsSnapshotOpen(false);
        setIsAIStylistOpen(false);
        setIsStoryModalOpen(false);
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRandomize();
      } else if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        handleGenZRemix();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setIsSnapshotOpen(true);
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleToggleABMode();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleResetStage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [equippedOutfit, colorState, selectedBackdrop]);

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
              onClick={handleGenZRemix}
              className="h-8 sm:h-9 px-2 sm:px-space-sm rounded-lg bg-gradient-to-r from-purple-700 to-pink-600 text-white hover:opacity-95 transition-all flex items-center gap-1 text-label-sm font-semibold shadow-xs cursor-pointer"
              title="Phối ngẫu hứng Cổ Phục x Y2K Hiện Đại (Phím X)"
            >
              <span className="material-symbols-outlined text-[17px] sm:text-[18px]">bolt</span>
              <span className="hidden xl:inline">Gen Z Remix</span>
            </button>

            <button
              type="button"
              onClick={handleRandomize}
              className="h-8 sm:h-9 px-2 sm:px-space-sm rounded-lg bg-primary-container text-outline-variant hover:text-white hover:bg-surface-tint/40 transition-colors flex items-center gap-1 text-label-sm font-medium shadow-sm cursor-pointer"
              title="Phối ngẫu nhiên màu truyền thống (Phím R)"
            >
              <span className="material-symbols-outlined text-[17px] sm:text-[18px]">casino</span>
              <span className="hidden xl:inline">Ngẫu Nhiên</span>
            </button>

            <button
              id="header-reset-btn"
              type="button"
              onClick={handleResetStage}
              className="h-8 sm:h-9 px-2 sm:px-space-sm rounded-lg bg-primary-container text-outline-variant hover:text-white hover:bg-surface-tint/40 transition-colors flex items-center gap-1 text-label-sm font-medium shadow-sm cursor-pointer"
              title="Đặt Lại Ban Đầu / Cởi Hết (Phím Delete)"
            >
              <span className="material-symbols-outlined text-[17px] sm:text-[18px]">restart_alt</span>
              <span className="hidden xl:inline">Đặt Lại</span>
            </button>

            <button
              id="header-ai-stylist-btn"
              type="button"
              onClick={() => {
                setAiStylistInitialTab('stylist');
                setAiStylistInitialFaceMode('default');
                setIsAIStylistOpen(true);
              }}
              className="h-8 sm:h-9 px-2 sm:px-space-md rounded-lg bg-gradient-to-r from-[#b93829] to-[#c59b27] text-white hover:opacity-95 shadow-[0_2px_12px_rgba(185,56,41,0.35)] transition-all flex items-center gap-1 font-label-sm font-semibold cursor-pointer"
              title="Cố Vấn Phối Đồ AI"
            >
              <span className="material-symbols-outlined text-[17px] sm:text-[18px]">auto_awesome</span>
              <span className="hidden sm:inline">Cố Vấn AI</span>
              <span className="sm:hidden text-[11px] font-bold">AI</span>
            </button>

            {/* Nút Hồ Sơ Đề Án Audition - Trình bày mục tiêu, Persona Gen Z & Triết lý văn hóa */}
            <button
              id="header-audition-dossier-btn"
              type="button"
              onClick={() => setIsAuditionDossierOpen(true)}
              className="h-8 sm:h-9 px-2 sm:px-2.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-primary border border-[#c59b27]/40 shadow-2xs transition-all flex items-center gap-1 font-label-sm font-semibold cursor-pointer"
              title="Xem Hồ Sơ Đề Án Audition (Phương pháp luận & Bảo chứng di sản)"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[17px] text-[#AE3022]">menu_book</span>
              <span className="hidden md:inline">Đề Án Audition</span>
              <span className="md:hidden">Đề Án</span>
            </button>

            {/* Nút Tạo Poster Mặt Bạn - Mở trực tiếp Stitch Studio và khung tải ảnh chân dung */}
            <button
              id="header-upload-face-poster-btn"
              type="button"
              onClick={() => {
                setAiStylistInitialTab('stitch');
                setAiStylistInitialFaceMode('custom');
                setIsAIStylistOpen(true);
              }}
              className="h-8 sm:h-9 px-2 sm:px-space-md rounded-lg bg-gradient-to-r from-amber-600 via-rose-600 to-[#b93829] text-white hover:opacity-95 shadow-[0_2px_12px_rgba(217,119,6,0.35)] transition-all flex items-center gap-1.5 font-label-sm font-bold cursor-pointer ring-1 ring-amber-300/50"
              title="Tải ảnh chân dung & Dùng Stitch AI tạo Poster Lookbook mang khuôn mặt bạn"
            >
              <span className="material-symbols-outlined text-[17px] sm:text-[18px] text-amber-200">add_a_photo</span>
              <span className="hidden md:inline">Tải Mặt Sinh Poster</span>
              <span className="md:hidden hidden xs:inline">Tải Mặt</span>
              <span className="xs:hidden text-[11px] font-bold">Mặt</span>
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
                <span className="text-[11px] sm:text-[12.5px] text-primary tracking-wide font-semibold truncate">
                  Xưởng Cổ Phục {currentPreset?.shortName || 'Việt Star'}
                </span>

                {/* Huy Hiệu Thẩm Định Chuẩn Mực Văn Hóa (Audition: Cảnh báo sai lệch đặc trưng văn hóa) */}
                <button
                  type="button"
                  id="context-bar-authenticity-badge"
                  onClick={() => setIsAuthenticityModalOpen(true)}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[10.5px] font-bold cursor-pointer transition-all shadow-2xs hover:brightness-105 shrink-0 ${authenticityAssessment.badgeColorClass}`}
                  title="Nhấn để xem phân tích chuẩn mực di sản & cảnh báo sai lệch văn hóa"
                >
                  <span className="material-symbols-outlined text-[13px] sm:text-[14px]">
                    {authenticityAssessment.badgeIcon}
                  </span>
                  <span>{authenticityAssessment.badgeTitle}</span>
                  <span className="opacity-80 font-mono text-[9px]">({authenticityAssessment.score}đ)</span>
                </button>
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

            {/* Thanh Cố Vấn Bối Cảnh & Thời Tiết (Audition Gen Z) */}
            <WeatherOccasionBar
              currentBackdropId={selectedBackdrop}
              onSelectBackdrop={setSelectedBackdrop}
              onApplyRecommendation={handleApplyWeatherRecommendation}
            />

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
                  onOpenCulturalStory={handleOpenCulturalStory}
                />
              </div>

              {/* CENTER COLUMN: Sàn Thử Đồ (Desktop 6 cols | Mobile: Luôn hiển thị ở trên cùng order-1) */}
              <div className="lg:col-span-6 lg:order-2 order-1 flex justify-center w-full">
                <DressCanvas
                  backdropId={selectedBackdrop}
                  onSelectBackdrop={setSelectedBackdrop}
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
                  onOpenCulturalStory={handleOpenCulturalStory}
                  isABMode={isABMode}
                  onToggleABMode={handleToggleABMode}
                  outfitSetA={outfitSetA}
                  outfitSetB={outfitSetB}
                  onSaveToSetA={handleSaveToSetA}
                  onSaveToSetB={handleSaveToSetB}
                  activeSlot={activeSlot}
                  onSwitchSlot={handleSwitchSlot}
                  onOpenAuthenticityModal={() => setIsAuthenticityModalOpen(true)}
                  authenticityNoticeCount={authenticityAssessment.conflicts.length}
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
        outfitName={snapshotOutfitName}
        eraName={snapshotEraName}
        colorState={colorState}
        equippedOutfit={equippedOutfit}
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
        initialTab={aiStylistInitialTab}
        initialFaceMode={aiStylistInitialFaceMode}
      />

      {/* Cultural Heritage Story Modal */}
      <CulturalStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        item={selectedStoryItem}
        currentSetId={currentSetId}
      />

      {/* Audition Dossier Modal */}
      <AuditionDossierModal
        isOpen={isAuditionDossierOpen}
        onClose={() => setIsAuditionDossierOpen(false)}
      />

      {/* Cultural Authenticity Assessment Modal */}
      <CulturalAuthenticityModal
        isOpen={isAuthenticityModalOpen}
        onClose={() => setIsAuthenticityModalOpen(false)}
        assessment={authenticityAssessment}
        onAutoEquipModestBottom={handleAutoEquipModestBottom}
      />

      {/* Toast Notification — Smart Icon + Mobile Center */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-50 animate-toast-up">
          <div className="bg-[#04152e] text-[#ffdf98] pl-3 pr-4 py-2.5 rounded-xl shadow-xl border border-[#c59b27]/60 flex items-center gap-2 text-xs font-semibold whitespace-nowrap">
            <span className="material-symbols-outlined text-[17px] text-[#eec14b] shrink-0">
              {toast.includes('Đã mặc') || toast.includes('Đặt lại') || toast.includes('Lưu')
                ? 'check_circle'
                : toast.includes('ngẫu nhiên') || toast.includes('casino')
                ? 'casino'
                : toast.includes('Thiếu') || toast.includes('cảnh báo')
                ? 'warning'
                : 'auto_awesome'}
            </span>
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
