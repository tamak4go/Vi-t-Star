// src/components/AIStylistModal.tsx
// Modal Cố Vấn Phối Đồ AI & Studio Poster Thời Trang Google Stitch
import { useState, useEffect, useRef } from "react";
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
  Key,
  Activity,
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

interface AIStylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  equippedOutfit: EquippedOutfit;
  colorState: ColorState;
  onApplyPresetWithColors: (preset: OutfitPreset, colors: Record<string, string>) => void;
  showToast: (msg: string) => void;
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
}: AIStylistModalProps) {
  const [activeTab, setActiveTab] = useState<"stylist" | "stitch">("stylist");
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
  const [promptAudit, setPromptAudit] = useState<PromptAuditResult | null>(null);
  const [showFullPromptPreview, setShowFullPromptPreview] = useState<boolean>(false);
  const [quality, setQuality] = useState<GenerationQuality>("standard");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [generatedScreen, setGeneratedScreen] = useState<StitchScreenResult | null>(null);
  const [recentScreens, setRecentScreens] = useState<StitchScreenResult[]>([]);
  const [loadingRecent, setLoadingRecent] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Quản lý API Key & Trạng Thái Kết Nối Google Stitch
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    return localStorage.getItem("stitch_api_key") || "";
  });
  const [userProjectId, setUserProjectId] = useState<string>(() => {
    return localStorage.getItem("stitch_project_id") || "8753486478358563567";
  });
  const [showKeyConfig, setShowKeyConfig] = useState<boolean>(false);
  const [inputApiKey, setInputApiKey] = useState<string>("");
  const [inputProjectId, setInputProjectId] = useState<string>("8753486478358563567");
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "connected" | "unconfigured" | "error">("idle");
  const [connectionLatency, setConnectionLatency] = useState<number | null>(null);
  const [connectionMessage, setConnectionMessage] = useState<string>("");

  const selectedOccasion =
    STYLING_OCCASIONS.find((o) => o.id === selectedOccasionId) || STYLING_OCCASIONS[0];

  const currentQualityConfig = QUALITY_CONFIGS[quality];

  // Danh sách chi tiết các món đồ đang mặc trên Canvas
  const equippedSummaries: OutfitItemSummary[] = getEquippedOutfitSummary(equippedOutfit, colorState);

  // Giai đoạn xử lý thích ứng theo chất lượng (Draft hoặc Standard/Ultra)
  const getGenerationStage = (sec: number) => {
    if (quality === "fast") {
      if (sec < 20) {
        return { stage: "Giai đoạn 1/3", msg: "Phân tích y phục tinh gọn & màu sắc..." };
      }
      if (sec < 55) {
        return { stage: "Giai đoạn 2/3", msg: "Google Stitch tạo bố cục thẻ nhanh gọn..." };
      }
      return { stage: "Giai đoạn 3/3", msg: "Đang kết xuất bản nháp poster..." };
    }
    if (sec < 25) {
      return { stage: "Giai đoạn 1/4", msg: "Phân tích cấu trúc y phục & bảng màu di sản..." };
    }
    if (sec < 75) {
      return { stage: "Giai đoạn 2/4", msg: "Google Stitch đang phác thảo bố cục nghệ thuật..." };
    }
    if (sec < 135) {
      return { stage: "Giai đoạn 3/4", msg: "Google Stitch đang kết xuất chất liệu lụa gấm & không gian..." };
    }
    if (sec < 185) {
      return { stage: "Giai đoạn 4/4", msg: "Đang chụp ảnh poster & tối ưu hóa góc máy..." };
    }
    return { stage: "Hoàn tất", msg: "Đang xuất bản poster và đồng bộ về Atelier..." };
  };

  const maxEstimated = quality === "fast" ? 75 : quality === "standard" ? 120 : 180;
  const progressPercent =
    elapsedSeconds < maxEstimated
      ? Math.min(94, Math.floor((elapsedSeconds / maxEstimated) * 94))
      : Math.min(98, 94 + Math.floor(((elapsedSeconds - maxEstimated) / 60) * 4));

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
    creativeText = userCreativeInput
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
    });
    setCustomPrompt(prompt);
  };

  // Tự động kiểm duyệt và thẩm định khi user nhập nội dung sáng tạo
  useEffect(() => {
    const outfitDesc =
      outfitSourceMode === "preset"
        ? (OUTFIT_PRESETS.find((p) => p.id === selectedPresetOutfitId)?.name || "")
        : outfitSourceMode === "custom"
        ? customOutfitInput
        : equippedSummaries.map((i) => i.name).join(", ");

    const audit = auditAndEnhancePrompt(userCreativeInput, outfitDesc, userVibe);
    setPromptAudit(audit);
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
  ]);

  // Cập nhật khi mở Modal
  useEffect(() => {
    if (isOpen) {
      handleSyncPrompt();
    }
  }, [isOpen]);

  // Kiểm tra kết nối và đo độ trễ tới Google Stitch API
  const testStitchConnection = async (key = userApiKey, proj = userProjectId) => {
    setConnectionStatus("testing");
    try {
      const res = await fetch("/api/stitch/ping", {
        headers: {
          ...(key ? { "x-stitch-api-key": key } : {}),
          ...(proj ? { "x-stitch-project-id": proj } : {}),
        },
      });
      const data = await res.json();
      if (data.configured && data.success) {
        setConnectionStatus("connected");
        setConnectionLatency(data.latencyMs ?? null);
        setConnectionMessage(data.message || `Đã kết nối (${data.latencyMs}ms)`);
      } else if (!data.configured) {
        setConnectionStatus("unconfigured");
        setConnectionMessage(data.message || "Chưa cấu hình API Key (sử dụng thư viện di sản mẫu)");
      } else {
        setConnectionStatus("error");
        setConnectionMessage(data.error || "Không thể kết nối Google Stitch SDK");
      }
    } catch (err: any) {
      setConnectionStatus("error");
      setConnectionMessage(`Lỗi kết nối server: ${err.message}`);
    }
  };

  const handleOpenKeyConfig = () => {
    setInputApiKey(userApiKey);
    setInputProjectId(userProjectId);
    setShowKeyConfig(true);
  };

  const handleSaveKeyConfig = () => {
    const trimmedKey = inputApiKey.trim();
    const trimmedProj = (inputProjectId.trim() || "8753486478358563567").replace("projects/", "");
    setUserApiKey(trimmedKey);
    setUserProjectId(trimmedProj);
    if (trimmedKey) {
      localStorage.setItem("stitch_api_key", trimmedKey);
    } else {
      localStorage.removeItem("stitch_api_key");
    }
    localStorage.setItem("stitch_project_id", trimmedProj);
    setShowKeyConfig(false);
    showToast("💾 Đã lưu cấu hình Google Stitch!");
    testStitchConnection(trimmedKey, trimmedProj);
    fetchRecentScreens(trimmedKey, trimmedProj);
  };

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
      testStitchConnection();
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

  // Xử lý gọi API Stitch sinh ảnh
  const handleGenerateStitchScreen = async () => {
    if (!customPrompt.trim()) return;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsGenerating(true);

    const cfg = QUALITY_CONFIGS[quality];

    try {
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
          apiKey: userApiKey,
          projectId: userProjectId,
        }),
      });

      const data = await res.json();
      if (data.success && data.screen) {
        setGeneratedScreen(data.screen);
        showToast("🎉 Google Stitch đã hoàn tất poster thời trang!");
        fetchRecentScreens();
      } else {
        const errMsg = data.error || "Không thể sinh ảnh";
        showToast(`⚠️ Lỗi từ Stitch: ${errMsg}`);
        if (errMsg.includes("STITCH_API_KEY") || errMsg.includes("API Key")) {
          setShowKeyConfig(true);
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Người dùng đã hủy yêu cầu Stitch.");
      } else {
        console.error("Lỗi gọi Stitch API:", err);
        showToast(`❌ Không thể kết nối tới Google Stitch API: ${err.message}`);
      }
    } finally {
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
            <span className="text-[9px] px-1 py-0.2 rounded bg-[#1a2a44] text-[#c59b27] font-mono hidden sm:inline">
              Live API
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
              {/* Thanh Chẩn Đoán & Trạng Thái Kết Nối API */}
              <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-[#c59b27]/30 shadow-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      connectionStatus === "connected"
                        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                        : connectionStatus === "testing"
                        ? "bg-amber-500 animate-ping"
                        : connectionStatus === "unconfigured"
                        ? "bg-amber-400"
                        : "bg-rose-500"
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-[#1a2a44]">
                        {connectionStatus === "connected"
                          ? "Google Stitch Cloud: Sẵn Sàng"
                          : connectionStatus === "testing"
                          ? "Đang kiểm tra kết nối Stitch..."
                          : connectionStatus === "unconfigured"
                          ? "Chế Độ Trưng Bày Di Sản (Mẫu Sẵn)"
                          : "Lỗi Kết Nối Google Stitch"}
                      </span>
                      {connectionLatency !== null && connectionStatus === "connected" && (
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {connectionLatency}ms
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                        ID: {userProjectId}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-[480px]">
                      {connectionMessage ||
                        (connectionStatus === "connected"
                          ? "Sẵn sàng sinh ảnh poster thời trang với Gemini 3.8 Flash."
                          : "Đang nạp trạng thái kết nối...")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => testStitchConnection()}
                    disabled={connectionStatus === "testing"}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-[#1a2a44] bg-[#f0eee8] hover:bg-[#e5e2dc] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    title="Kiểm tra kết nối và đo ping tới Google Stitch"
                  >
                    <Activity
                      className={`w-3.5 h-3.5 ${
                        connectionStatus === "testing"
                          ? "animate-spin text-amber-600"
                          : "text-[#c59b27]"
                      }`}
                    />
                    <span className="hidden xs:inline">
                      {connectionStatus === "testing" ? "Đang Test..." : "Kiểm Tra"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (showKeyConfig) {
                        setShowKeyConfig(false);
                      } else {
                        handleOpenKeyConfig();
                      }
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer border ${
                      showKeyConfig
                        ? "bg-[#1a2a44] text-white border-[#1a2a44]"
                        : "text-slate-700 hover:text-[#1a2a44] bg-[#f0eee8] hover:bg-[#e5e2dc] border-transparent"
                    }`}
                    title="Cấu hình Google Stitch API Key"
                  >
                    <Key className="w-3.5 h-3.5 text-[#b93829]" />
                    <span>{userApiKey ? "Đổi Key" : "Nhập Key"}</span>
                  </button>
                </div>
              </div>

              {/* Ngăn Cấu Hình API Key Thu Gọn */}
              {showKeyConfig && (
                <div className="p-3.5 sm:p-4 bg-[#fbf9f5] border border-[#c59b27]/40 rounded-xl shadow-xs space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-[#e5e2dc] pb-2">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#b93829]" />
                      <h4 className="text-xs font-bold text-[#1a2a44] uppercase tracking-wide">
                        Cấu Hình Google Stitch API Key & Project ID
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowKeyConfig(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 block">
                        Stitch API Key:
                      </label>
                      <input
                        type="password"
                        value={inputApiKey}
                        onChange={(e) => setInputApiKey(e.target.value)}
                        placeholder="Dán API Key (AQ.AA...)"
                        className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#e5e2dc] rounded-lg focus:outline-none focus:border-[#b93829] shadow-inner"
                      />
                      <p className="text-[10px] text-slate-500">
                        Lưu an toàn trong trình duyệt (localStorage), không lo mất khi reload hay chuyển tab.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 block">
                        Stitch Project ID:
                      </label>
                      <input
                        type="text"
                        value={inputProjectId}
                        onChange={(e) => setInputProjectId(e.target.value)}
                        placeholder="8753486478358563567"
                        className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#e5e2dc] rounded-lg focus:outline-none focus:border-[#b93829] shadow-inner"
                      />
                      <p className="text-[10px] text-slate-500">
                        ID dự án Vietnamese Heritage Atelier trên Google Stitch Studio.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#e5e2dc]">
                    <button
                      type="button"
                      onClick={() => setShowKeyConfig(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg cursor-pointer transition-colors"
                    >
                      Đóng
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveKeyConfig}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-[#b93829] hover:bg-[#9e2e21] text-white rounded-lg shadow-xs cursor-pointer transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Lưu & Kiểm Tra Ngay</span>
                    </button>
                  </div>
                </div>
              )}

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
                      </div>

                      <input
                        type="text"
                        value={customOutfitInput}
                        onChange={(e) => {
                          setCustomOutfitInput(e.target.value);
                          setIsUserEditingPrompt(false);
                        }}
                        placeholder="VD: Áo giao lĩnh thời Lê dệt chỉ vàng lấp lánh, đai ngọc bích thắt eo, kết hợp áo choàng nhung..."
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-[#b93829] shadow-2xs text-slate-800"
                      />

                      {/* Các gợi ý mẫu nhanh */}
                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                        <span className="text-[9.5px] text-amber-900 font-semibold">Gợi ý mẫu:</span>
                        {[
                          "Áo Giao Lĩnh thời Lê thêu rồng vàng",
                          "Áo Đối Khâm thời Lý Trần đài các",
                          "Áo Dài cưới hoàng gia đính ngọc trai",
                          "Áo dài nam cách tân cổ đứng quý tộc",
                          "Cổ phục dạ hội Cyberpunk tương lai",
                        ].map((idea, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setCustomOutfitInput(idea);
                              setIsUserEditingPrompt(false);
                            }}
                            className="text-[9px] px-1.5 py-0.5 bg-white/90 hover:bg-white text-amber-900 border border-amber-200 rounded-md transition-colors cursor-pointer"
                          >
                            + {idea}
                          </button>
                        ))}
                      </div>
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

                {/* 3. BỘ CHỌN BỐI CẢNH (CURATED BACKGROUNDS HOẶC TỰ NHẬP PROMPT) */}
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

                {/* CTA Call API */}
                <div className="space-y-1.5">
                  <button
                    onClick={handleGenerateStitchScreen}
                    disabled={isGenerating}
                    className={`w-full py-2.5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                      isGenerating
                        ? "bg-slate-700 text-slate-300 cursor-not-allowed border border-slate-600"
                        : "bg-[#1a2a44] hover:bg-[#0f1c30] text-[#c59b27] border border-[#c59b27]/40 hover:border-[#c59b27]"
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
                        <span>Sinh Ảnh Poster ({currentQualityConfig.label.split(" ")[0]} {currentQualityConfig.label.split(" ")[1]})</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-500 italic text-center">
                    💡 Chế độ {currentQualityConfig.label}: {currentQualityConfig.estimatedTime}.
                  </p>
                </div>
              </div>

              {/* Cột hiển thị kết quả (md:col-span-7) */}
              <div className="md:col-span-7 flex flex-col space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-[#e5e2dc]">
                  <h4 className="font-serif font-bold text-sm text-[#1a2a44]">
                    Lookbook Poster Trực Quan
                  </h4>
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
                      <img
                        src={generatedScreen.screenshotUrl}
                        alt="Stitch Generated Fashion Poster"
                        referrerPolicy="no-referrer"
                        className="max-h-[420px] max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]"
                      />
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
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
                          onClick={() => setGeneratedScreen(sc)}
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
