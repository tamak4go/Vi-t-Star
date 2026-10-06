// src/components/AIStylistModal.tsx
// Modal Cố Vấn Phối Đồ AI & Studio Poster Thời Trang Google Stitch
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Download,
  X,
  Check,
  RefreshCw,
  BookOpen,
  Palette,
  ExternalLink,
  Gauge,
  MapPin,
  Shirt,
  Edit3,
  Lock,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Camera,
  UploadCloud,
} from "lucide-react";
import {
  STYLING_OCCASIONS,
  generateStitchFashionPrompt,
  QUALITY_CONFIGS,
  CURATED_BACKGROUNDS,
  getEquippedOutfitSummary,
  getPresetOutfitSummary,
  LOCKED_CULTURAL_GUARDRAIL_VI,
  auditAndEnhancePrompt,
  type GenerationQuality,
  type StylingOccasion,
  type OutfitItemSummary,
  type OutfitSourceMode,
  type PromptAuditResult,
} from "../services/aiStylistService";
import {
  type EquippedOutfit,
  type ColorState,
  type OutfitPreset,
  OUTFIT_PRESETS,
} from "../data/dressroomConfig";
import {
  scanPosterCulturally,
  type DynamicPosterAnalysis,
} from "../services/posterAnalysisService";
import { extractDominantColorsFromImage } from "../services/imageColorExtractor";
import { PosterCulturalInspector } from "./PosterCulturalInspector";

interface AIStylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  equippedOutfit: EquippedOutfit;
  colorState: ColorState;
  onApplyPresetWithColors: (preset: OutfitPreset, colors: Record<string, string>) => void;
  showToast: (msg: string) => void;
  initialTab?: "stylist" | "stitch";
  initialFaceMode?: "default" | "custom";
}

interface StitchScreenResult {
  id: string;
  name: string;
  title: string;
  screenshotUrl?: string;
  htmlCode?: string;
}

export function AIStylistModal({
  isOpen,
  onClose,
  equippedOutfit,
  colorState,
  onApplyPresetWithColors,
  showToast,
  initialTab = "stylist",
  initialFaceMode = "default",
}: AIStylistModalProps) {
  const [activeTab, setActiveTab] = useState<"stylist" | "stitch">(initialTab);
  const [selectedOccasionId, setSelectedOccasionId] = useState<string>("tet");

  // State cho Stitch Studio
  const [outfitSourceMode, setOutfitSourceMode] = useState<OutfitSourceMode>("mannequin");
  const [selectedPresetOutfitId, setSelectedPresetOutfitId] = useState<string>("sample2");
  const [customOutfitInput, setCustomOutfitInput] = useState<string>("");
  const [userVibe, setUserVibe] = useState<string>("High Fashion Editorial");
  const [userGender, setUserGender] = useState<"female" | "male" | "unisex">("female");
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<string>("hue_citadel");
  const [customBackgroundInput, setCustomBackgroundInput] = useState<string>("");
  const [isUserEditingPrompt, setIsUserEditingPrompt] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [userCreativeInput, setUserCreativeInput] = useState<string>("");
  const [isFreshlyGenerated, setIsFreshlyGenerated] = useState<boolean>(false);
  const [freshGeneratedDescription, setFreshGeneratedDescription] = useState<string>("");
  const [showFullPromptPreview, setShowFullPromptPreview] = useState<boolean>(false);
  const [quality, setQuality] = useState<GenerationQuality>("standard");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [generatedScreen, setGeneratedScreen] = useState<StitchScreenResult | null>(null);
  const [recentScreens, setRecentScreens] = useState<StitchScreenResult[]>([]);
  const [loadingRecent, setLoadingRecent] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Quản lý API Key & Trạng Thái Kết Nối Google Stitch
  const [userApiKey] = useState<string>(() => {
    return localStorage.getItem("stitch_api_key") || "";
  });
  const [userProjectId] = useState<string>(() => {
    return localStorage.getItem("stitch_project_id") || "8753486478358563567";
  });

  // Quản lý Gương Mặt Người Mẫu Poster (Khuôn mặt độc bản của User qua Google Stitch)
  const [faceMode, setFaceMode] = useState<"default" | "custom">(initialFaceMode);
  const [userFaceImage, setUserFaceImage] = useState<string | null>(null);
  const [userFaceName, setUserFaceName] = useState<string>("Bạn");
  const [uploadedFaceScreenId, setUploadedFaceScreenId] = useState<string | null>(null);
  const [isUploadingFace, setIsUploadingFace] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Quản lý Thẩm Định Di Sản & Quét Màu Thực Tế Cho Poster AI (Không bịa đặt)
  const [isScanningPoster, setIsScanningPoster] = useState<boolean>(false);
  const [dynamicPosterAnalysis, setDynamicPosterAnalysis] = useState<DynamicPosterAnalysis | null>(null);

  // Đồng bộ tab và chế độ gương mặt khi modal được kích hoạt mở từ bên ngoài
  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      if (initialFaceMode) {
        setFaceMode(initialFaceMode);
      }
    }
  }, [isOpen, initialTab, initialFaceMode]);

  const handleFaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("⚠️ Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP)!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUserFaceImage(base64);
      setUploadedFaceScreenId(null);
      setFaceMode("custom");
      setIsUserEditingPrompt(false);
      showToast("📸 Đã nạp ảnh chân dung. Google Stitch sẽ dùng diện mạo này cho Poster!");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFaceImage = () => {
    setUserFaceImage(null);
    setUploadedFaceScreenId(null);
    setFaceMode("default");
    setIsUserEditingPrompt(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    showToast("ℹ️ Đã xóa ảnh chân dung, trở về người mẫu AI mặc định.");
  };

  const selectedOccasion =
    STYLING_OCCASIONS.find((o) => o.id === selectedOccasionId) || STYLING_OCCASIONS[0];

  const currentQualityConfig = QUALITY_CONFIGS[quality];

  // Danh sách chi tiết các món đồ đang mặc trên Canvas (memoized để tránh re-render lặp vô tận)
  const equippedSummaries: OutfitItemSummary[] = useMemo(
    () => getEquippedOutfitSummary(equippedOutfit, colorState),
    [equippedOutfit, colorState]
  );

  // Quét thẩm định di sản động dựa trên prompt và màu sắc thực tế từ pixel ảnh (Không bịa đặt)
  const executePosterScan = useCallback(
    async (screen: StitchScreenResult | null) => {
      if (!screen || !screen.screenshotUrl) {
        setDynamicPosterAnalysis(null);
        return;
      }

      setIsScanningPoster(true);
      try {
        // 1. Trích xuất màu sắc pixel thực tế từ ảnh Canvas (không bịa màu)
        const extractedColors = await extractDominantColorsFromImage(screen.screenshotUrl, 5);

        // 2. Quét thẩm định di sản động
        const analysis = scanPosterCulturally({
          posterId: screen.id,
          posterTitle: screen.title,
          promptText: customPrompt || screen.title,
          customUserInput: customOutfitInput,
          selectedOccasionId,
          selectedBackgroundId,
          extractedColors,
        });

        setDynamicPosterAnalysis(analysis);
      } catch (err) {
        console.error("[executePosterScan] Lỗi quét di sản poster:", err);
      } finally {
        setIsScanningPoster(false);
      }
    },
    [customPrompt, customOutfitInput, selectedOccasionId, selectedBackgroundId]
  );

  // Tự động quét khi có ảnh poster mới hoặc khi chọn poster khác trong bộ sưu tập
  useEffect(() => {
    if (generatedScreen) {
      executePosterScan(generatedScreen);
    } else {
      setDynamicPosterAnalysis(null);
    }
  }, [generatedScreen, executePosterScan]);

  // Giai đoạn xử lý thích ứng theo tiến trình Google Cloud (~40-60s)
  const getGenerationStage = (sec: number) => {
    if (sec < 10) {
      return { stage: "Giai đoạn 1/4", msg: "Phân tích cấu trúc phục trang & kết nối Google Stitch..." };
    }
    if (sec < 25) {
      return { stage: "Giai đoạn 2/4", msg: "Gemini Flash phác thảo bố cục tạp chí thời trang..." };
    }
    if (sec < 45) {
      return { stage: "Giai đoạn 3/4", msg: "Google Stitch đang tạo tác chất liệu lụa gấm & ánh sáng..." };
    }
    return { stage: "Giai đoạn 4/4", msg: "Đang kết xuất poster sắc nét & đồng bộ về Atelier..." };
  };

  const maxEstimated = quality === "fast" ? 45 : quality === "standard" ? 60 : 75;
  const progressPercent =
    elapsedSeconds < maxEstimated
      ? Math.min(94, Math.floor((elapsedSeconds / maxEstimated) * 94))
      : Math.min(98, 94 + Math.floor(((elapsedSeconds - maxEstimated) / 25) * 4));

  // Timer đếm giây khi đang sinh ảnh Stitch
  useEffect(() => {
    let timer: any = null;
    if (isGenerating) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((sec) => sec + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGenerating]);

  // Hàm sinh lại prompt từ trạng thái y phục và bối cảnh đã chọn
  const handleSyncPrompt = (
    mode = outfitSourceMode,
    presetId = selectedPresetOutfitId,
    customOutfit = customOutfitInput,
    bgId = selectedBackgroundId,
    customBg = customBackgroundInput,
    creativeText = userCreativeInput,
    isCustomFace = faceMode === "custom" && Boolean(userFaceImage),
    faceName = userFaceName
  ) => {
    const prompt = generateStitchFashionPrompt({
      equippedOutfit,
      colorState,
      outfitSourceMode: mode,
      presetOutfitId: presetId,
      customOutfitDescription: customOutfit,
      userCreativeText: creativeText,
      occasionId: selectedOccasionId,
      userVibe,
      userGender,
      backgroundPresetId: bgId,
      customBackground: customBg,
      quality,
      hasCustomFace: isCustomFace,
      customFaceName: faceName,
    });
    setCustomPrompt(prompt);
  };

  // Tự động kiểm duyệt và thẩm định khi user nhập nội dung sáng tạo (dùng useMemo chống re-render vô tận)
  const promptAudit: PromptAuditResult | null = useMemo(() => {
    const outfitDesc =
      outfitSourceMode === "preset"
        ? (OUTFIT_PRESETS.find((p) => p.id === selectedPresetOutfitId)?.name || "")
        : outfitSourceMode === "custom"
        ? customOutfitInput
        : equippedSummaries.map((i) => i.name).join(", ");

    return auditAndEnhancePrompt(userCreativeInput, outfitDesc, userVibe);
  }, [userCreativeInput, outfitSourceMode, selectedPresetOutfitId, customOutfitInput, equippedSummaries, userVibe]);

  // Tự động đồng bộ Prompt khi người dùng đổi outfit, nguồn mẫu, bối cảnh, chất lượng hoặc creative input
  useEffect(() => {
    if (!isUserEditingPrompt) {
      handleSyncPrompt();
    }
  }, [
    outfitSourceMode,
    selectedPresetOutfitId,
    customOutfitInput,
    userCreativeInput,
    equippedOutfit,
    colorState,
    selectedOccasionId,
    userVibe,
    userGender,
    selectedBackgroundId,
    customBackgroundInput,
    quality,
    faceMode,
    userFaceImage,
    userFaceName,
  ]);

  // Cập nhật khi mở Modal
  useEffect(() => {
    if (isOpen) {
      handleSyncPrompt();
    }
  }, [isOpen]);

  // Tải danh sách các poster trước đó từ Stitch API (với fallback di sản tự động)
  const fetchRecentScreens = async (key = userApiKey, proj = userProjectId) => {
    setLoadingRecent(true);
    try {
      const res = await fetch("/api/stitch/screens", {
        headers: {
          ...(key ? { "x-stitch-api-key": key } : {}),
          ...(proj ? { "x-stitch-project-id": proj } : {}),
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.screens)) {
        const valid = data.screens.filter((s: any) => s.screenshotUrl);
        setRecentScreens(valid);
        setGeneratedScreen((curr) => curr || valid[0] || null);
      }
    } catch (err) {
      console.error("Lỗi lấy lịch sử screen Stitch:", err);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === "stitch") {
      fetchRecentScreens();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Xử lý áp dụng set đồ đề xuất
  const handleApplyOccasion = (occasion: StylingOccasion) => {
    const preset = OUTFIT_PRESETS.find((p) => p.id === occasion.recommendedPresetId);
    if (preset) {
      onApplyPresetWithColors(preset, occasion.recommendedColors);
      showToast(`✨ Đã áp dụng diện mạo: ${occasion.name}!`);
    }
  };

  // Xử lý hủy chờ sinh ảnh
  const handleCancelGenerate = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    showToast("ℹ️ Đã dừng chờ kết quả sinh poster.");
  };

  // Xử lý gọi API Stitch sinh ảnh (Tạo tác tác phẩm độc bản thực sự qua Google Cloud)
  const handleGenerateStitchScreen = async () => {
    if (!customPrompt.trim()) return;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsGenerating(true);

    const cfg = QUALITY_CONFIGS[quality];
    let isTimedOut = false;

    // Timeout an toàn 120s cho Google Stitch tạo tác chi tiết
    const clientTimeout = setTimeout(() => {
      isTimedOut = true;
      controller.abort();
    }, 120000);

    const desc =
      outfitSourceMode === "custom"
        ? (customOutfitInput.trim() || "Mẫu tự do")
        : outfitSourceMode === "preset"
        ? (OUTFIT_PRESETS.find((p) => p.id === selectedPresetOutfitId)?.name || "Bộ mẫu có sẵn")
        : "Mẫu phối trên Canvas";

    try {
      let referenceScreenId = uploadedFaceScreenId;

      // Nếu người dùng chọn dùng ảnh mặt riêng và chưa upload lên Stitch Cloud:
      if (faceMode === "custom" && userFaceImage && !referenceScreenId) {
        try {
          setIsUploadingFace(true);
          showToast("🔄 Đang đồng bộ khuôn mặt lên Google Stitch...");
          const upRes = await fetch("/api/stitch/upload-face", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(userApiKey ? { "x-stitch-api-key": userApiKey } : {}),
              ...(userProjectId ? { "x-stitch-project-id": userProjectId } : {}),
            },
            body: JSON.stringify({
              imageBase64: userFaceImage,
              title: `Portrait - ${userFaceName || 'User'}`,
              ...(userApiKey ? { apiKey: userApiKey } : {}),
              ...(userProjectId ? { projectId: userProjectId } : {}),
            }),
          });
          const upData = await upRes.json();
          if (upData.success && upData.screenId) {
            referenceScreenId = upData.screenId;
            setUploadedFaceScreenId(upData.screenId);
          } else {
            throw new Error(upData.error || "Không nhận được ID màn hình từ Stitch");
          }
        } catch (upErr: any) {
          console.warn("Lỗi upload ảnh mặt lên Stitch:", upErr);
          showToast(`⚠️ Không thể nạp ảnh mặt: ${upErr.message || 'Lỗi mạng'}. Sẽ thử tạo poster chung.`);
        } finally {
          setIsUploadingFace(false);
        }
      }

      const res = await fetch("/api/stitch/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userApiKey ? { "x-stitch-api-key": userApiKey } : {}),
          ...(userProjectId ? { "x-stitch-project-id": userProjectId } : {}),
        },
        signal: controller.signal,
        body: JSON.stringify({
          prompt: customPrompt,
          quality,
          deviceType: cfg.deviceType,
          ...(referenceScreenId ? { referenceScreenId } : {}),
          ...(userApiKey ? { apiKey: userApiKey } : {}),
          ...(userProjectId ? { projectId: userProjectId } : {}),
        }),
      });

      const data = await res.json();
      if (data.success && data.screen) {
        setGeneratedScreen(data.screen);
        setIsFreshlyGenerated(true);
        setFreshGeneratedDescription(desc);
        if (referenceScreenId) {
          showToast("🎉 Đã hoàn tất Poster Lookbook mang đúng khuôn mặt và thần thái của bạn!");
        } else if (data.screen.isHeritageFallback) {
          showToast("ℹ️ Hiển thị tác phẩm di sản tương thích từ kho Atelier.");
        } else {
          showToast("🎉 Đã hoàn tất tác phẩm poster thời trang độc bản!");
        }
        fetchRecentScreens();
      } else {
        console.error("Lỗi sinh ảnh từ server:", data.error);
        showToast(`❌ Chưa thể sinh ảnh: ${data.error || "Google Stitch Cloud đang bận, vui lòng thử lại!"}`);
      }
    } catch (err: any) {
      if (isTimedOut || err.name === "AbortError") {
        showToast("⏱️ Quá thời gian chờ (120s) do mạng chập chờn. Vui lòng bấm thử lại!");
      } else {
        console.error("Lỗi gọi Stitch API:", err);
        showToast(`❌ Lỗi kết nối: ${err.message || "Vui lòng kiểm tra mạng và thử lại!"}`);
      }
    } finally {
      clearTimeout(clientTimeout);
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[95vh] sm:h-[92vh] max-h-[850px] bg-[#fcf9f3] text-[#1c1c18] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#c59b27]/30">
        {/* Header Modal - Compact on mobile */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-4 bg-[#1a2a44] text-[#fcf9f3] flex items-center justify-between border-b border-[#c59b27]/40 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#b93829] to-[#c59b27] flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="font-serif text-sm sm:text-xl font-bold tracking-wide text-white truncate">
                  Cố Vấn AI & Stitch Studio
                </h2>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#b93829] text-white shrink-0">
                  Gen Z
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 hidden xs:block truncate">
                Gợi ý phối trang phục theo sự kiện & Sinh poster với Google Stitch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher - Scrollable on mobile */}
        <div className="px-2.5 sm:px-6 pt-2 bg-[#f0eee8] border-b border-[#e5e2dc] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab("stylist")}
            className={`flex items-center gap-1.5 px-3 sm:px-5 py-2 font-medium text-xs sm:text-sm rounded-t-lg transition-all cursor-pointer shrink-0 ${
              activeTab === "stylist"
                ? "bg-[#fcf9f3] text-[#1a2a44] font-semibold border-t-2 border-[#b93829] shadow-sm"
                : "text-slate-600 hover:text-[#1a2a44] hover:bg-white/50"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#b93829]" />
            <span>Cố Vấn Phối Đồ</span>
          </button>

          <button
            onClick={() => setActiveTab("stitch")}
            className={`flex items-center gap-1.5 px-3 sm:px-5 py-2 font-medium text-xs sm:text-sm rounded-t-lg transition-all cursor-pointer shrink-0 ${
              activeTab === "stitch"
                ? "bg-[#fcf9f3] text-[#1a2a44] font-semibold border-t-2 border-[#b93829] shadow-sm"
                : "text-slate-600 hover:text-[#1a2a44] hover:bg-white/50"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c59b27]" />
            <span>Studio Poster AI</span>
            <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-[#b93829] font-bold border border-amber-300/60 hidden sm:inline-flex items-center gap-1 shadow-2xs">
              <Camera className="w-2.5 h-2.5" />
              Ghép Mặt Bạn
            </span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {activeTab === "stylist" ? (
            /* TAB 1: CỐ VẤN PHỐI ĐỒ THEO BỐI CẢNH */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6">
              {/* Cột trái: Chọn Bối Cảnh (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="font-serif font-bold text-base text-[#1a2a44]">
                    1. Chọn Hoàn Cảnh / Sự Kiện
                  </h3>
                  <span className="text-xs text-slate-500">6 Bối cảnh tiêu biểu</span>
                </div>

                <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                  {STYLING_OCCASIONS.map((occ) => {
                    const isSelected = occ.id === selectedOccasionId;
                    return (
                      <div
                        key={occ.id}
                        onClick={() => setSelectedOccasionId(occ.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? "bg-white border-[#b93829] shadow-md ring-1 ring-[#b93829]/20"
                            : "bg-[#f6f3ed] border-[#e5e2dc] hover:bg-white hover:border-[#c59b27]/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{occ.icon}</span>
                            <div>
                              <h4
                                className={`font-semibold text-sm ${
                                  isSelected ? "text-[#b93829]" : "text-[#1a2a44]"
                                }`}
                              >
                                {occ.name}
                              </h4>
                              <p className="text-xs text-slate-500 line-clamp-1">{occ.tagline}</p>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                              isSelected
                                ? "bg-[#b93829] text-white"
                                : "bg-[#ebe8e2] text-slate-600"
                            }`}
                          >
                            {occ.badge}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cột phải: Chi Tiết Văn Hóa & Gợi Ý Phối (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#e5e2dc] shadow-sm space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Tiêu đề & Tagline */}
                  <div className="border-b border-[#e5e2dc] pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider font-bold text-[#b93829]">
                        Ý Nghĩa Văn Hóa & Lễ Nghi
                      </span>
                      <span className="text-xl">{selectedOccasion.icon}</span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[#1a2a44] mt-0.5">
                      {selectedOccasion.name}
                    </h3>
                    <p className="text-xs italic text-slate-600 mt-0.5">
                      "{selectedOccasion.tagline}"
                    </p>
                  </div>

                  {/* Nguồn gốc & Bối cảnh */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#b93829]" />
                      Nguồn Gốc Lịch Sử & Giá Trị Văn Hóa
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed bg-[#fbf9f5] p-3 rounded-xl border border-[#ebe8e2]">
                      {selectedOccasion.culturalBackground}
                    </p>
                  </div>

                  {/* Quy chuẩn lễ nghi */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Quy Chuẩn Lễ Nghi (Etiquette)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50/60 text-emerald-950 p-2.5 rounded-lg border border-emerald-200/50">
                      {selectedOccasion.etiquetteTips}
                    </p>
                  </div>

                  {/* Triết lý phối màu & Phụ kiện */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Bảng màu tiến cử */}
                    <div className="bg-[#f6f3ed] p-3 rounded-xl border border-[#e5e2dc] space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-[#c59b27]" />
                        Màu Cổ Phục Tiến Cử
                      </h4>
                      <div className="flex items-center gap-2">
                        {selectedOccasion.colorPhilosophy.recommendedColors.map((hex) => (
                          <div key={hex} className="flex items-center gap-1.5">
                            <span
                              className="w-5 h-5 rounded-full border border-black/20 shadow-sm"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="text-[11px] font-mono text-slate-600">{hex}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">
                        {selectedOccasion.colorPhilosophy.explanation}
                      </p>
                    </div>

                    {/* Phụ kiện tiến cử */}
                    <div className="bg-[#f6f3ed] p-3 rounded-xl border border-[#e5e2dc] space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#b93829]" />
                        Phụ Kiện Đặc Trưng
                      </h4>
                      <ul className="text-xs text-slate-700 space-y-1">
                        {selectedOccasion.recommendedAccessories.map((acc, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#b93829] font-bold">•</span>
                            <span>
                              <strong>{acc.name}</strong>: {acc.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Gen Z Remix Tip */}
                  <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/80">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block mb-0.5">
                      💡 Mẹo Phối Đồ Gen Z Remix:
                    </span>
                    <p className="text-xs text-amber-950 leading-relaxed">
                      {selectedOccasion.genZRemixTip}
                    </p>
                  </div>
                </div>

                {/* Nút bấm Áp Dụng */}
                <div className="pt-2 border-t border-[#e5e2dc] flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Trang phục khuyên dùng:{" "}
                    <strong>
                      {
                        OUTFIT_PRESETS.find(
                          (p) => p.id === selectedOccasion.recommendedPresetId
                        )?.name
                      }
                    </strong>
                  </span>
                  <button
                    onClick={() => handleApplyOccasion(selectedOccasion)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#b93829] hover:bg-[#9e2e21] text-white font-medium text-sm rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4" />
                    Áp Dụng Cho Mannequin
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: GOOGLE STITCH EDITORIAL STUDIO */
            <div className="space-y-3.5">
              {/* Thanh Trạng Thái Studio */}
              <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-[#c59b27]/30 shadow-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#1a2a44]">
                        Google Stitch Atelier • Studio Trực Tuyến
                      </span>
                      <span className="text-[9.5px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Gemini 3.8 Flash Engine
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-[480px]">
                      Sẵn sàng kết xuất poster thời trang cổ phục nghệ thuật độc bản theo yêu cầu của bạn.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Sẵn Sàng</span>
                  </div>
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Form tùy biến prompt (md:col-span-5) */}
              <div className="md:col-span-5 space-y-3.5">
                <div className="border-b border-[#e5e2dc] pb-2">
                  <h3 className="font-serif font-bold text-base text-[#1a2a44] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#c59b27]" />
                    Tạo Poster Lookbook với Google Stitch
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tùy chọn sinh ảnh theo mẫu bạn đã phối, chọn bộ mẫu truyền thống có sẵn, hoặc tự do nhập mô tả mẫu phục trang mới.
                  </p>
                </div>

                {/* 1. BỘ CHỌN NGUỒN MẪU PHỤC TRANG */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <Shirt className="w-3.5 h-3.5 text-[#b93829]" />
                      Nguồn Mẫu Trang Phục:
                    </label>
                    <span className="text-[10px] font-semibold text-slate-600 bg-[#edeae3] px-2 py-0.5 rounded-full">
                      {outfitSourceMode === "mannequin"
                        ? "👗 Mẫu Đang Phối"
                        : outfitSourceMode === "preset"
                        ? "👘 Bộ Mẫu Sẵn"
                        : "✍️ Tự Gen Mẫu Khác"}
                    </span>
                  </div>

                  {/* 3 Nút Chọn Nguồn Mẫu */}
                  <div className="grid grid-cols-3 gap-1 p-1 bg-[#edeae3] rounded-xl border border-[#e5e2dc]">
                    <button
                      type="button"
                      onClick={() => {
                        setOutfitSourceMode("mannequin");
                        setIsUserEditingPrompt(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[10.5px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        outfitSourceMode === "mannequin"
                          ? "bg-white text-[#b93829] shadow-xs ring-1 ring-black/5"
                          : "text-slate-600 hover:text-[#1a2a44]"
                      }`}
                    >
                      <span>👗</span>
                      <span className="truncate">Mẫu Đang Phối</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOutfitSourceMode("preset");
                        setIsUserEditingPrompt(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[10.5px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        outfitSourceMode === "preset"
                          ? "bg-white text-[#b93829] shadow-xs ring-1 ring-black/5"
                          : "text-slate-600 hover:text-[#1a2a44]"
                      }`}
                    >
                      <span>👘</span>
                      <span className="truncate">Bộ Mẫu Có Sẵn</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOutfitSourceMode("custom");
                        setIsUserEditingPrompt(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[10.5px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        outfitSourceMode === "custom"
                          ? "bg-white text-[#b93829] shadow-xs ring-1 ring-black/5"
                          : "text-slate-600 hover:text-[#1a2a44]"
                      }`}
                    >
                      <span>✍️</span>
                      <span className="truncate">Tự Gen Mẫu Khác</span>
                    </button>
                  </div>

                  {/* NỘI DUNG THEO TỪNG CHẾ ĐỘ NGUỒN */}
                  {outfitSourceMode === "mannequin" && (
                    <div className="bg-[#f6f3ed] p-2.5 rounded-xl border border-[#e5e2dc] shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-medium text-slate-700">
                          Đang lấy <strong>{equippedSummaries.length}</strong> món đồ bạn đã phối trên Canvas:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserEditingPrompt(false);
                            handleSyncPrompt("mannequin");
                            showToast("🔄 Đã cập nhật y phục từ Canvas vào Prompt!");
                          }}
                          className="text-[10px] text-[#b93829] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <RefreshCw className="w-3 h-3" /> Cập nhật từ Canvas
                        </button>
                      </div>
                      {equippedSummaries.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                          {equippedSummaries.map((item, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white border border-[#e5e2dc] rounded-md text-[10px] text-slate-700 shadow-2xs"
                            >
                              {item.colorHex && (
                                <span
                                  className="w-2 h-2 rounded-full border border-black/20 shrink-0"
                                  style={{ backgroundColor: item.colorHex }}
                                  title={`Màu: ${item.colorHex}`}
                                />
                              )}
                              <strong className="text-slate-800 truncate max-w-[120px]">{item.name}</strong>
                              <span className="text-[9px] text-slate-400 font-mono">({item.categoryLabel})</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10.5px] text-slate-500 italic">
                          Mannequin chưa mặc trang phục nào. Hãy chọn đồ từ Tủ Đồ hoặc chọn "Bộ Mẫu Có Sẵn"!
                        </p>
                      )}
                    </div>
                  )}

                  {outfitSourceMode === "preset" && (
                    <div className="bg-[#f6f3ed] p-2.5 rounded-xl border border-[#e5e2dc] shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10.5px] font-bold text-slate-700">
                          Chọn 1 trong 11 Bộ Mẫu Cổ Phục Có Sẵn:
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const p = OUTFIT_PRESETS.find((it) => it.id === selectedPresetOutfitId);
                            if (p) {
                              onApplyPresetWithColors(p, {});
                              showToast(`✨ Đã mặc mẫu "${p.name}" lên Mannequin!`);
                            }
                          }}
                          className="text-[10px] text-[#b93829] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                          title="Mặc thử bộ mẫu này lên Mannequin ngoài Canvas"
                        >
                          <Sparkles className="w-3 h-3" /> Mặc thử lên Canvas
                        </button>
                      </div>

                      <select
                        value={selectedPresetOutfitId}
                        onChange={(e) => {
                          setSelectedPresetOutfitId(e.target.value);
                          setIsUserEditingPrompt(false);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#e5e2dc] rounded-lg focus:outline-none focus:border-[#b93829] font-medium text-slate-800"
                      >
                        {OUTFIT_PRESETS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.shortName})
                          </option>
                        ))}
                      </select>

                      {/* Chi tiết các món trong Preset */}
                      {(() => {
                        const curPreset = OUTFIT_PRESETS.find((p) => p.id === selectedPresetOutfitId);
                        const summaries = curPreset ? getPresetOutfitSummary(curPreset.id) : [];
                        return (
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-600 italic line-clamp-1">
                              {curPreset?.description}
                            </p>
                            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                              {summaries.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white border border-[#e5e2dc] rounded text-[9.5px] text-slate-700 shadow-2xs"
                                >
                                  <strong className="text-slate-800">{item.name}</strong>
                                  <span className="text-[8.5px] text-slate-400">({item.categoryLabel})</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {outfitSourceMode === "custom" && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-2.5 rounded-xl border border-amber-300 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10.5px] font-bold text-amber-950 flex items-center gap-1">
                          <Edit3 className="w-3 h-3 text-[#b93829]" />
                          Tự nhập mô tả mẫu phục trang mới (Tiếng Việt / English):
                        </label>
                        <span className="text-[9.5px] font-mono text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-300">
                          Nhấn Enter để sinh ảnh
                        </span>
                      </div>

                      <input
                        type="text"
                        value={customOutfitInput}
                        onChange={(e) => {
                          setCustomOutfitInput(e.target.value);
                          setIsUserEditingPrompt(false);
                          setIsFreshlyGenerated(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !isGenerating && customOutfitInput.trim()) {
                            e.preventDefault();
                            handleGenerateStitchScreen();
                          }
                        }}
                        placeholder="VD: Quần jean để tôi đi chụp kỉ yếu, Áo giao lĩnh thời Lê dệt chỉ vàng..."
                        className="w-full px-2.5 py-2 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-[#b93829] shadow-inner text-slate-800 font-medium"
                      />

                      {/* Các gợi ý mẫu nhanh */}
                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                        <span className="text-[9.5px] text-amber-900 font-semibold">Gợi ý mẫu:</span>
                        {[
                          "Quần jean áo trắng chụp kỉ yếu",
                          "Áo Giao Lĩnh thời Lê thêu rồng vàng",
                          "Áo Đối Khâm thời Lý Trần đài các",
                          "Áo Dài cưới hoàng gia đính ngọc trai",
                          "Cổ phục dạ hội Cyberpunk tương lai",
                        ].map((idea, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setCustomOutfitInput(idea);
                              setIsUserEditingPrompt(false);
                              setIsFreshlyGenerated(false);
                            }}
                            className="text-[9px] px-1.5 py-0.5 bg-white/90 hover:bg-white text-amber-900 border border-amber-200 rounded-md transition-colors cursor-pointer"
                          >
                            + {idea}
                          </button>
                        ))}
                      </div>

                      {/* Nút Kích Hoạt Sinh Ảnh Nhanh Ngay Tại Ô Nhập */}
                      <button
                        type="button"
                        onClick={handleGenerateStitchScreen}
                        disabled={isGenerating || !customOutfitInput.trim()}
                        className="w-full mt-1.5 py-2 px-3 bg-gradient-to-r from-[#b93829] via-[#c59b27] to-[#b93829] hover:brightness-110 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-200" />
                            <span>Google Stitch đang vẽ... ({elapsedSeconds}s)</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3.5 h-3.5 text-amber-200" />
                            <span>✨ Sinh Ảnh Theo Mô Tả Này Ngay (Enter)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. CÁC TÙY CHỌN PHONG CÁCH & GIỚI TÍNH */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Aesthetic / Phong Cách:
                    </label>
                    <select
                      value={userVibe}
                      onChange={(e) => setUserVibe(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#e5e2dc] rounded-lg focus:outline-none focus:border-[#b93829]"
                    >
                      <option value="High Fashion Editorial">High Fashion Editorial</option>
                      <option value="Royal Vietnamese Imperial">Cung Đình Trang Trọng</option>
                      <option value="Cinematic Sunset Atmosphere">Hoàng Hôn Điện Ảnh</option>
                      <option value="Cyberpunk Folklore Fusion">Cyberpunk Cổ Phục Remix</option>
                      <option value="Vintage 1930s Indochine">Đông Dương Cổ Điển</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Giới Tính Người Mẫu:
                    </label>
                    <select
                      value={userGender}
                      onChange={(e) => setUserGender(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#e5e2dc] rounded-lg focus:outline-none focus:border-[#b93829]"
                    >
                      <option value="female">Nữ (Female Model)</option>
                      <option value="male">Nam (Male Model)</option>
                      <option value="unisex">Unisex / Phi Giới Tính</option>
                    </select>
                  </div>
                </div>

                {/* 3. TÙY CHỌN GƯƠNG MẶT NGƯỜI MẪU (GOOGLE STITCH MULTIMODAL FACE) */}
                <div className="bg-[#fcf9f3] p-3 rounded-xl border border-amber-900/10 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#b93829]" />
                      Gương Mặt Người Mẫu Poster:
                    </label>
                    <div className="flex items-center bg-[#f0eee8] p-0.5 rounded-lg border border-[#e5e2dc] text-[10.5px]">
                      <button
                        type="button"
                        onClick={() => {
                          setFaceMode("default");
                          setIsUserEditingPrompt(false);
                        }}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                          faceMode === "default"
                            ? "bg-white text-[#1a2a44] shadow-xs font-bold"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Mặc Định AI
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFaceMode("custom");
                          setIsUserEditingPrompt(false);
                          if (!userFaceImage && fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                        }}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                          faceMode === "custom"
                            ? "bg-[#b93829] text-white shadow-xs font-bold"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-amber-200" />
                        <span>Mặt Của Bạn</span>
                      </button>
                    </div>
                  </div>

                  {/* Ẩn file input để kích hoạt */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFaceFileChange}
                    className="hidden"
                  />

                  {faceMode === "custom" && (
                    <div className="pt-1">
                      {!userFaceImage ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-amber-300 hover:border-[#b93829] bg-amber-50/60 hover:bg-amber-50/90 transition-all rounded-xl p-3.5 text-center cursor-pointer group"
                        >
                          <UploadCloud className="w-6 h-6 text-[#b93829] mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                          <p className="text-xs font-bold text-slate-800">
                            Bấm hoặc kéo thả ảnh chân dung / selfie vào đây
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Google Stitch AI sẽ nhận diện khuôn mặt và vẽ bạn thành nhân vật chính trên Poster!
                          </p>
                        </div>
                      ) : (
                        <div className="bg-white p-2.5 rounded-xl border border-amber-200/80 shadow-xs flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative shrink-0">
                              <img
                                src={userFaceImage}
                                alt="Ảnh mặt người dùng"
                                className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400 shadow-xs"
                              />
                              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-white shadow-xs border border-white">
                                ✓
                              </span>
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-slate-800">
                                  Khuôn mặt:
                                </span>
                                <input
                                  type="text"
                                  value={userFaceName}
                                  onChange={(e) => setUserFaceName(e.target.value)}
                                  placeholder="Tên của bạn"
                                  className="text-xs font-bold text-[#b93829] bg-amber-50/50 border-b border-amber-300 focus:outline-none focus:border-[#b93829] max-w-[90px] px-1 py-0.5 rounded-xs"
                                  title="Đặt tên cho người mẫu mang khuôn mặt của bạn"
                                />
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                                  {isUploadingFace ? "Đang đồng bộ..." : "Đã nạp"}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-tight">
                                Stitch sẽ tự động chuyển hóa đường nét khuôn mặt & mái tóc này thành phong cách minh họa trên Poster.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-medium rounded-lg transition-colors cursor-pointer"
                              title="Tải ảnh khác"
                            >
                              Đổi ảnh
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveFaceImage}
                              className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Gỡ ảnh này"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. BỘ CHỌN BỐI CẢNH (CURATED BACKGROUNDS HOẶC TỰ NHẬP PROMPT) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#b93829]" />
                      Bối Cảnh Không Gian (Setting):
                    </label>
                    {selectedBackgroundId === "custom" && (
                      <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-1.5 py-0.2 rounded">
                        ✍️ Đang tự nhập bối cảnh
                      </span>
                    )}
                  </div>

                  <select
                    value={selectedBackgroundId}
                    onChange={(e) => setSelectedBackgroundId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#e5e2dc] rounded-lg focus:outline-none focus:border-[#b93829]"
                  >
                    <optgroup label="🏛️ Cung Đình & Cố Đô">
                      {CURATED_BACKGROUNDS.filter((b) => b.category === "cung_dinh").map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🏮 Phố Thị Di Sản">
                      {CURATED_BACKGROUNDS.filter((b) => b.category === "pho_thi").map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🏞️ Thiên Nhiên & Danh Thắng">
                      {CURATED_BACKGROUNDS.filter((b) => b.category === "thien_nhien").map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="📸 Hiện Đại & Nghệ Thuật">
                      {CURATED_BACKGROUNDS.filter((b) => b.category === "hien_dai").map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="✍️ Tùy Biến Tự Do">
                      <option value="custom">✍️ Tự nhập bối cảnh riêng (User Custom Prompt)...</option>
                    </optgroup>
                  </select>

                  {/* Hộp nhập bối cảnh tự do khi user chọn 'custom' */}
                  {selectedBackgroundId === "custom" && (
                    <div className="mt-2 p-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10.5px] font-bold text-amber-950 flex items-center gap-1">
                          <Edit3 className="w-3 h-3 text-[#b93829]" />
                          Mô tả bối cảnh bạn muốn (Tiếng Việt hoặc Tiếng Anh):
                        </label>
                      </div>
                      <input
                        type="text"
                        value={customBackgroundInput}
                        onChange={(e) => setCustomBackgroundInput(e.target.value)}
                        placeholder="VD: Quán cà phê cổ điển đường Đồng Khởi Sài Gòn, nắng chiều rọi qua ô cửa kính..."
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-[#b93829] shadow-2xs"
                      />
                      <p className="text-[9.5px] text-amber-800 italic">
                        💡 Bạn có thể gõ bất kỳ không gian nào: chùa cổ, quán trà, cầu rồng, đường phố mùa thu...
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. TÙY CHỌN CHẤT LƯỢNG & TỐC ĐỘ SINH ẢNH */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-[#c59b27]" />
                      Chất Lượng & Tốc Độ Gen:
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {currentQualityConfig.estimatedTime}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {(Object.keys(QUALITY_CONFIGS) as GenerationQuality[]).map((qKey) => {
                      const cfg = QUALITY_CONFIGS[qKey];
                      const isSelected = quality === qKey;
                      return (
                        <button
                          key={qKey}
                          type="button"
                          onClick={() => setQuality(qKey)}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-white border-[#b93829] shadow-sm ring-1 ring-[#b93829]/20"
                              : "bg-[#f6f3ed] border-[#e5e2dc] hover:bg-white hover:border-[#c59b27]/40"
                          }`}
                        >
                          <div>
                            <span className="block text-[11px] font-bold text-[#1a2a44] truncate">
                              {cfg.label.split(" ")[0]} {cfg.label.split(" ")[1]}
                            </span>
                            <span className="block text-[9.5px] text-slate-500 line-clamp-1 mt-0.5">
                              {cfg.estimatedTime}
                            </span>
                          </div>
                          <span
                            className={`inline-block mt-1.5 text-[8.5px] px-1.5 py-0.5 rounded font-medium ${
                              isSelected
                                ? "bg-[#b93829] text-white"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {cfg.badge.split(" ")[0]} {cfg.id.toUpperCase()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 italic">
                    {currentQualityConfig.description}
                  </p>
                </div>

                {/* 5. KHUNG BẢO TỒN VĂN HÓA BẤT BIẾN & BỔ SUNG SÁNG TẠO CỦA BẠN */}
                <div className="space-y-2.5">
                  {/* Card Quy Tắc Bất Biến (Locked Guardrail) */}
                  <div className="bg-amber-950/5 border border-amber-800/20 rounded-xl p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#b93829]" />
                        <span className="text-[11px] font-bold text-[#1a2a44] font-serif">
                          Quy Tắc Thuần Phong Mỹ Tục
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[9px] font-medium px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
                        <Lock className="w-2.5 h-2.5 text-amber-800" /> Bất biến · Không thể sửa
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-700 leading-relaxed italic bg-white/70 p-2 rounded-lg border border-amber-900/10">
                      "{LOCKED_CULTURAL_GUARDRAIL_VI}"
                    </p>
                  </div>

                  {/* Ô Bổ Sung Sáng Tạo Của User */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Edit3 className="w-3 h-3 text-[#b93829]" />
                        Bổ sung theo ý bạn (Không bắt buộc):
                      </label>
                      {userCreativeInput && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserCreativeInput("");
                            handleSyncPrompt(
                              outfitSourceMode,
                              selectedPresetOutfitId,
                              customOutfitInput,
                              selectedBackgroundId,
                              customBackgroundInput,
                              ""
                            );
                          }}
                          className="text-[10px] text-slate-500 hover:text-rose-600 cursor-pointer"
                        >
                          Xóa trống
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={userCreativeInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setUserCreativeInput(val);
                        handleSyncPrompt(
                          outfitSourceMode,
                          selectedPresetOutfitId,
                          customOutfitInput,
                          selectedBackgroundId,
                          customBackgroundInput,
                          val
                        );
                      }}
                      className="w-full p-2.5 text-xs bg-white border border-[#e5e2dc] rounded-xl focus:outline-none focus:border-[#b93829] resize-none leading-relaxed shadow-2xs"
                      placeholder="Thêm chi tiết: Cầm hoa sen, ánh nắng hoàng hôn, nụ cười dịu dàng, tà áo bay nhẹ trong gió..."
                    />

                    {/* Chips gợi ý nhanh 1-click */}
                    <div className="flex flex-wrap gap-1">
                      {[
                        "Cầm quạt lụa sen",
                        "Ánh nắng vàng ấm áp",
                        "Nụ cười rạng rỡ đài các",
                        "Tà áo bay nhẹ đón gió",
                        "Đeo chuỗi ngọc trai cổ",
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const next = userCreativeInput ? `${userCreativeInput}, ${item}` : item;
                            setUserCreativeInput(next);
                            handleSyncPrompt(
                              outfitSourceMode,
                              selectedPresetOutfitId,
                              customOutfitInput,
                              selectedBackgroundId,
                              customBackgroundInput,
                              next
                            );
                          }}
                          className="text-[9.5px] px-2 py-0.5 bg-white border border-[#e5e2dc] hover:border-[#b93829] hover:text-[#b93829] text-slate-700 rounded-md transition-colors cursor-pointer shadow-2xs"
                        >
                          + {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Duyệt & Thẩm Định Prompt */}
                  {promptAudit && (
                    <div className="bg-[#fcfaf7] border border-[#e8e2d5] rounded-xl p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
                          <span className="text-[11px] font-bold text-[#1a2a44]">
                            AI Thẩm Định Văn Hóa & Nghệ Thuật
                          </span>
                        </div>
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                            promptAudit.modestyScore >= 90
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : promptAudit.modestyScore >= 70
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-rose-100 text-rose-800 border border-rose-300"
                          }`}
                        >
                          Điểm chuẩn di sản: {promptAudit.modestyScore}/100
                        </span>
                      </div>

                      {/* Cảnh báo nếu có */}
                      {promptAudit.warnings.length > 0 && (
                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-2 space-y-1">
                          {promptAudit.warnings.map((w, idx) => (
                            <p key={idx} className="text-[10px] text-rose-800 flex items-start gap-1 font-medium">
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0 mt-0.5" />
                              {w}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Góp ý nâng tầm & Nút Áp Dụng 1-click */}
                      {promptAudit.suggestions.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-slate-600 italic">
                            💡 Đề xuất AI: {promptAudit.suggestions.join(" ")}
                          </p>
                          {promptAudit.enhancedPrompt && (
                            <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-[#e5e2dc]">
                              <p className="text-[10px] text-slate-800 font-medium line-clamp-2">
                                ✨ "{promptAudit.enhancedPrompt}"
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setUserCreativeInput(promptAudit.enhancedPrompt);
                                  handleSyncPrompt(
                                    outfitSourceMode,
                                    selectedPresetOutfitId,
                                    customOutfitInput,
                                    selectedBackgroundId,
                                    customBackgroundInput,
                                    promptAudit.enhancedPrompt
                                  );
                                  showToast("✨ Đã áp dụng câu lệnh nâng tầm nghệ thuật của AI!");
                                }}
                                className="shrink-0 px-2 py-1 bg-[#1a2a44] hover:bg-[#0f1c30] text-[#c59b27] text-[10px] font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              >
                                <Check className="w-2.5 h-2.5" /> Áp dụng
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Collapsible Xem toàn bộ prompt gửi Google Stitch */}
                  <div className="border border-[#e5e2dc] rounded-xl overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setShowFullPromptPreview(!showFullPromptPreview)}
                      className="w-full px-3 py-2 text-left flex items-center justify-between text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#c59b27]" />
                        Xem câu lệnh hoàn chỉnh gửi Google Stitch
                      </span>
                      {showFullPromptPreview ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>

                    {showFullPromptPreview && (
                      <div className="p-2.5 border-t border-[#e5e2dc] bg-[#fbfaf8] space-y-2">
                        <textarea
                          rows={4}
                          value={customPrompt}
                          onChange={(e) => {
                            setCustomPrompt(e.target.value);
                            setIsUserEditingPrompt(true);
                          }}
                          className="w-full p-2 text-[10.5px] font-mono bg-white border border-[#e5e2dc] rounded-lg focus:outline-none focus:border-[#b93829] resize-none leading-relaxed"
                        />
                        <div className="flex items-center justify-between text-[9.5px] text-slate-500">
                          <span>Đã tích hợp đầy đủ khung bảo tồn thuần phong mỹ tục.</span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserEditingPrompt(false);
                              handleSyncPrompt();
                              showToast("🔄 Đã đặt lại prompt chuẩn mực!");
                            }}
                            className="text-[#b93829] hover:underline font-medium cursor-pointer"
                          >
                            Khôi phục mặc định
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA Call API - Sticky ở đáy cột trái để luôn trong tầm mắt */}
                <div className="sticky bottom-0 bg-[#fcf9f3]/95 backdrop-blur-md pt-2 pb-1 border-t border-[#e5e2dc] z-10 space-y-1">
                  <button
                    onClick={handleGenerateStitchScreen}
                    disabled={isGenerating || (outfitSourceMode === "custom" && !customOutfitInput.trim())}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                      isGenerating
                        ? "bg-slate-700 text-slate-300 cursor-not-allowed border border-slate-600"
                        : "bg-[#1a2a44] hover:bg-[#0f1c30] text-[#c59b27] border border-[#c59b27]/40 hover:border-[#c59b27] active:scale-[0.99]"
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#c59b27]" />
                        <span>
                          Stitch đang vẽ ({currentQualityConfig.label.split(" ")[0]}): {elapsedSeconds}s ({currentQualityConfig.estimatedTime})...
                        </span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 text-[#c59b27]" />
                        <span>
                          {outfitSourceMode === "custom" && customOutfitInput.trim()
                            ? `Sinh Ảnh: "${customOutfitInput.slice(0, 24)}${customOutfitInput.length > 24 ? '...' : ''}"`
                            : `Sinh Ảnh Poster (${currentQualityConfig.label.split(" ")[0]} ${currentQualityConfig.label.split(" ")[1]})`}
                        </span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-500 italic text-center">
                    ✨ Tự động tạo tác poster thời trang cổ phục độc bản với trí tuệ nhân tạo.
                  </p>
                </div>
              </div>

              {/* Cột hiển thị kết quả (md:col-span-7) */}
              <div className="md:col-span-7 flex flex-col space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-[#e5e2dc]">
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-bold text-sm text-[#1a2a44]">
                      Lookbook Poster Trực Quan
                    </h4>
                    {isGenerating ? (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                        🔄 Đang vẽ mới...
                      </span>
                    ) : isFreshlyGenerated ? (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> Vừa sinh theo yêu cầu
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full border border-slate-300">
                        📜 Mẫu tham khảo có sẵn
                      </span>
                    )}
                  </div>

                  {generatedScreen?.screenshotUrl && (
                    <a
                      href={generatedScreen.screenshotUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#b93829] hover:underline flex items-center gap-1 font-medium"
                    >
                      <ExternalLink className="w-3 h-3" /> Mở ảnh gốc
                    </a>
                  )}
                </div>

                {/* Banner Thông Báo Kích Hoạt khi User đã gõ mô tả mới nhưng chưa bấm sinh ảnh */}
                {!isGenerating && !isFreshlyGenerated && outfitSourceMode === "custom" && customOutfitInput.trim() && (
                  <div className="p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl flex items-center justify-between gap-3 text-slate-800 shadow-2xs animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 min-w-0">
                      <Sparkles className="w-4 h-4 text-[#b93829] shrink-0 animate-bounce" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          Mô tả bạn đang yêu cầu: <span className="text-[#b93829]">"{customOutfitInput}"</span>
                        </p>
                        <p className="text-[10.5px] text-slate-600 line-clamp-1">
                          Ảnh bên dưới là mẫu tham khảo. Hãy bấm nút để AI bắt đầu sinh ảnh theo yêu cầu!
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateStitchScreen}
                      disabled={isGenerating}
                      className="shrink-0 px-3.5 py-1.5 bg-[#b93829] hover:bg-[#9e2e21] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Sinh Ảnh Ngay</span>
                    </button>
                  </div>
                )}

                {/* Khu vực ảnh Poster - Nếu chưa có key, hiển thị placeholder hướng dẫn */}
                {/* Khu vực ảnh Poster */}
                <div className="relative min-h-[360px] max-h-[460px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
                  {/* Overlay đếm tiến độ khi đang sinh ảnh */}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs z-10 p-6 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-12 h-12 border-3 border-[#c59b27] border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_20px_rgba(197,155,39,0.4)]" />
                      <div>
                        <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#c59b27]/20 border border-[#c59b27]/40 text-[#c59b27] text-[10px] font-mono font-bold uppercase mb-1">
                          {getGenerationStage(elapsedSeconds).stage} • {elapsedSeconds}s
                        </div>
                        <p className="text-sm font-bold text-white tracking-wide">
                          Google Stitch • {currentQualityConfig.label}
                        </p>
                        <p className="text-xs text-slate-300 mt-1 font-medium max-w-xs mx-auto">
                          {getGenerationStage(elapsedSeconds).msg}
                        </p>
                      </div>

                      {/* Thanh tiến độ mượt mà */}
                      <div className="w-56 space-y-1">
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                          <div
                            className="h-full bg-gradient-to-r from-[#b93829] via-[#c59b27] to-[#eec14b] transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>{progressPercent}%</span>
                          <span>{currentQualityConfig.estimatedTime}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleCancelGenerate}
                        className="px-3 py-1 mt-2 text-[11px] text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition-colors cursor-pointer"
                      >
                        Hủy chờ
                      </button>
                    </div>
                  )}

                  {generatedScreen?.screenshotUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center p-2 group">
                      {/* Tag phân biệt nguồn ảnh & trạng thái quét */}
                      <div className="absolute top-3 left-3 z-5 flex items-center gap-1.5 flex-wrap">
                        {isFreshlyGenerated ? (
                          <div className="px-2.5 py-1 bg-emerald-950/85 backdrop-blur-md text-emerald-300 text-[10.5px] font-bold rounded-lg border border-emerald-500/60 shadow-lg flex items-center gap-1.5 animate-in fade-in">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span>Vừa sinh: "{freshGeneratedDescription}"</span>
                          </div>
                        ) : (
                          <div className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-slate-300 text-[10.5px] font-medium rounded-lg border border-slate-700/80 shadow-md flex items-center gap-1.5">
                            <span>📜 Mẫu tham khảo có sẵn</span>
                          </div>
                        )}

                        {isScanningPoster ? (
                          <div className="px-2.5 py-1 bg-amber-950/85 backdrop-blur-md text-amber-300 text-[10px] font-bold rounded-lg border border-amber-500/60 shadow-lg flex items-center gap-1 animate-pulse">
                            <Sparkles className="w-3 h-3 text-[#c59b27] animate-spin" />
                            <span>Đang quét di sản pixel...</span>
                          </div>
                        ) : dynamicPosterAnalysis ? (
                          <div className="px-2.5 py-1 bg-[#1a2a44]/90 backdrop-blur-md text-[#eed182] text-[10px] font-bold rounded-lg border border-[#c59b27]/60 shadow-lg flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#c59b27]" />
                            <span className="truncate max-w-[180px] sm:max-w-[260px]">{dynamicPosterAnalysis.summaryTitle}</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="relative inline-flex items-center justify-center max-h-[420px] max-w-full overflow-hidden rounded-lg">
                        <img
                          src={generatedScreen.screenshotUrl}
                          alt="Stitch Generated Fashion Poster"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            // Fallback an toàn nếu link ảnh ngoài gặp sự cố
                            const target = e.currentTarget;
                            if (!target.src.includes('sample6_ao-tac_ref.png')) {
                              target.src = '/assets/reference/sample6_ao-tac_ref.png';
                            }
                          }}
                          className="max-h-[420px] max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]"
                        />

                        {/* Tia Laser Quét Động Khi isScanningPoster === true (Không ghim tọa độ giả) */}
                        {isScanningPoster && (
                          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg z-10">
                            <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#c59b27] to-transparent shadow-[0_0_15px_#c59b27,0_0_30px_#b93829] animate-scan-laser" />
                            <div className="absolute inset-0 bg-[#c59b27]/5 pointer-events-none" />
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
                        <a
                          href={generatedScreen.screenshotUrl}
                          download={`vietstar-stitch-lookbook-${Date.now()}.png`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-[#b93829] hover:bg-[#9e2e21] text-white text-xs font-semibold rounded-lg shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" /> Tải Poster Về
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center space-y-2 text-slate-400">
                      <ImageIcon className="w-12 h-12 mx-auto stroke-1 text-slate-600" />
                      <p className="text-sm font-medium text-slate-300">
                        Chưa có Poster được sinh
                      </p>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        Hãy chọn một mẫu trong bộ sưu tập bên dưới hoặc bấm nút "Sinh Ảnh Poster Thời Trang" để tạo thiết kế mới!
                      </p>
                    </div>
                  )}
                </div>

                {/* 6. BẢNG AI THẨM ĐỊNH & CHÚ THÍCH DI SẢN CHO POSTER (QUÉT THỰC TẾ THEO ẢNH & PROMPT) */}
                {dynamicPosterAnalysis && (
                  <PosterCulturalInspector
                    analysis={dynamicPosterAnalysis}
                    isScanning={isScanningPoster}
                    onScanAgain={() => executePosterScan(generatedScreen)}
                    showToast={showToast}
                  />
                )}

                {/* Thư viện các poster đã tạo trước đó trong Project */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">
                      Bộ Sưu Tập Lookbook Đã Tạo ({recentScreens.length}):
                    </span>
                    <span className="text-[10px] text-slate-500 italic">Click vào ảnh để xem to</span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5">
                    {recentScreens.length > 0 ? (
                      recentScreens.map((sc) => (
                        <div
                          key={sc.id}
                          onClick={() => {
                            setGeneratedScreen(sc);
                            setIsFreshlyGenerated(false);
                          }}
                          className={`w-16 h-20 shrink-0 rounded-lg overflow-hidden border cursor-pointer transition-all bg-slate-900 ${
                            generatedScreen?.id === sc.id
                              ? "border-[#b93829] ring-2 ring-[#b93829]"
                              : "border-slate-300 hover:border-[#c59b27]"
                          }`}
                          title={sc.title}
                        >
                          <img
                            src={sc.screenshotUrl}
                            alt={sc.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        {loadingRecent ? "Đang tải dữ liệu Stitch..." : "Chưa có ảnh gần đây."}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
