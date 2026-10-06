// src/components/PosterCulturalInspector.tsx
// Thành phần AI Thẩm Định Di Sản, Phân Tích Đa Chiều & Chú Thích Điểm Ghim Tương Tác Trên Poster AI
import { useState } from "react";
import {
  ShieldCheck,
  MapPin,
  Sparkles,
  BookOpen,
  Check,
  Shirt,
  Eye,
  EyeOff,
  Compass,
  ArrowRight,
  Palette,
} from "lucide-react";
import {
  type PosterCulturalAnalysis,
} from "../services/posterAnalysisService";
import type { OutfitPreset } from "../data/dressroomConfig";

interface PosterCulturalInspectorProps {
  analysis: PosterCulturalAnalysis;
  showHotspots: boolean;
  onToggleHotspots: () => void;
  selectedHotspotId: string | null;
  onSelectHotspot: (id: string | null) => void;
  onApplyPresetToDressroom?: (preset: OutfitPreset, colors: Record<string, string>) => void;
  onCloseModal?: () => void;
  showToast: (msg: string) => void;
}

export function PosterCulturalInspector({
  analysis,
  showHotspots,
  onToggleHotspots,
  selectedHotspotId,
  onSelectHotspot,
  onApplyPresetToDressroom,
  onCloseModal,
  showToast,
}: PosterCulturalInspectorProps) {
  const [activeTab, setActiveTab] = useState<"hotspots" | "lore" | "colors" | "etiquette">("hotspots");

  const selectedHotspot =
    analysis.hotspots.find((h) => h.id === selectedHotspotId) || null;

  const handleApplyToDressroom = () => {
    if (!analysis.suggestedPreset || !onApplyPresetToDressroom) return;
    onApplyPresetToDressroom(
      analysis.suggestedPreset.preset,
      analysis.suggestedPreset.colors
    );
    showToast(`✨ Đã nạp diện mạo "${analysis.detectedAttireName}" lên sàn thử Dressroom!`);
    if (onCloseModal) {
      onCloseModal();
    }
  };

  return (
    <div className="bg-[#fcfaf7] border border-[#e8e2d5] rounded-2xl p-3 sm:p-4 space-y-3.5 shadow-xs">
      {/* 1. Header Bar: Tiêu Đề Phân Tích & Toggle Chú Thích */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#e5e2dc]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#b93829] to-[#c59b27] flex items-center justify-center text-white shadow-2xs shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-[#1a2a44] truncate flex items-center gap-1.5">
              <span>AI Thẩm Định & Chú Thích Poster</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Audition Standard
              </span>
            </h4>
            <p className="text-[10px] text-slate-500 truncate">
              Nhận diện: <strong className="text-[#b93829]">{analysis.detectedAttireName}</strong> ({analysis.era})
            </p>
          </div>
        </div>

        {/* Nút bật tắt ghim tương tác trên ảnh */}
        <button
          type="button"
          onClick={onToggleHotspots}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
            showHotspots
              ? "bg-[#1a2a44] text-[#c59b27] border-[#c59b27]/60 shadow-sm"
              : "bg-white text-slate-700 border-[#e5e2dc] hover:border-[#b93829]"
          }`}
          title="Bật/tắt các điểm ghim chú thích trên ảnh poster"
        >
          {showHotspots ? <Eye className="w-3.5 h-3.5 text-[#c59b27]" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
          <span>{showHotspots ? `Điểm Ghim (${analysis.hotspots.length})` : "Hiện Ghim"}</span>
        </button>
      </div>

      {/* 2. Dải Huy Hiệu Chỉ Số Nhanh (Heritage Quick Badges Strip) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Badge 1: Điểm chuẩn di sản */}
        <div className="p-2 rounded-xl bg-white border border-[#e5e2dc] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] text-slate-500 font-medium">Bảo Chứng Di Sản</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#b93829]" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-sm font-bold text-[#1a2a44] font-serif">
              {analysis.authenticity.score}/100
            </span>
            <span
              className={`text-[8.5px] px-1 py-0.2 rounded font-bold truncate ${
                analysis.authenticity.tier === "authentic"
                  ? "bg-emerald-100 text-emerald-800"
                  : analysis.authenticity.tier === "remix"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {analysis.authenticity.badgeTitle.split(" ")[0]}
            </span>
          </div>
        </div>

        {/* Badge 2: Vùng miền địa phương */}
        <div className="p-2 rounded-xl bg-white border border-[#e5e2dc] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] text-slate-500 font-medium">Vùng Văn Hóa</span>
            <MapPin className="w-3.5 h-3.5 text-[#c59b27]" />
          </div>
          <p className="mt-1 text-xs font-bold text-[#1a2a44] truncate" title={analysis.region.name}>
            {analysis.region.name}
          </p>
          <span className="text-[9px] text-slate-400 block truncate">{analysis.era.split("(")[0]}</span>
        </div>

        {/* Badge 3: Ngũ Hành & Màu Sắc */}
        <div className="p-2 rounded-xl bg-white border border-[#e5e2dc] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] text-slate-500 font-medium">Ngũ Hành Sắc Phục</span>
            <Palette className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="mt-1 text-xs font-bold text-[#1a2a44] truncate">
            {analysis.colorHarmony.verdictTitle}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            {analysis.colorHarmony.palette.slice(0, 4).map((p, idx) => (
              <span
                key={idx}
                className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                style={{ backgroundColor: p.hex }}
                title={`${p.name} (${p.hex}) - Mệnh ${p.element}`}
              />
            ))}
          </div>
        </div>

        {/* Badge 4: Độ Tương Thích Bối Cảnh */}
        <div className="p-2 rounded-xl bg-white border border-[#e5e2dc] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] text-slate-500 font-medium">Bối Cảnh Tương Thích</span>
            <span className="text-xs">{analysis.occasionFit.icon}</span>
          </div>
          <p className="mt-1 text-xs font-bold text-[#1a2a44] truncate">
            {analysis.occasionFit.name}
          </p>
          <span className="text-[9px] text-emerald-700 font-semibold block truncate">
            {analysis.occasionFit.fitVerdict} ({analysis.occasionFit.score}%)
          </span>
        </div>
      </div>

      {/* 3. Tab Switcher Khảo Sát Chi Tiết */}
      <div className="flex items-center gap-1 p-1 bg-[#ede8df] rounded-xl text-xs font-medium overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("hotspots")}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === "hotspots"
              ? "bg-white text-[#1a2a44] font-bold shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Shirt className="w-3.5 h-3.5 text-[#b93829]" />
          <span>Điểm Nhấn Y Phục ({analysis.hotspots.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("lore")}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === "lore"
              ? "bg-white text-[#1a2a44] font-bold shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#c59b27]" />
          <span>Điển Tích & Nguồn Gốc</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("colors")}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === "colors"
              ? "bg-white text-[#1a2a44] font-bold shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-indigo-600" />
          <span>Ngũ Hành & Bảng Màu</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("etiquette")}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === "etiquette"
              ? "bg-white text-[#1a2a44] font-bold shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          <span>Lễ Nghi & Gen Z Remix</span>
        </button>
      </div>

      {/* 4. Nội Dung Chi Tiết Từng Tab */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-[#e5e2dc] min-h-[140px] space-y-2.5">
        {/* TAB 1: DANH SÁCH ĐIỂM NHẤN Y PHỤC (HOTSPOTS) */}
        {activeTab === "hotspots" && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Click vào một chi tiết để làm nổi bật vị trí trên Poster:</span>
              {selectedHotspotId && (
                <button
                  type="button"
                  onClick={() => onSelectHotspot(null)}
                  className="text-[10px] text-[#b93829] hover:underline cursor-pointer"
                >
                  Bỏ chọn
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {analysis.hotspots.map((hs) => {
                const isSelected = selectedHotspotId === hs.id;
                return (
                  <div
                    key={hs.id}
                    onClick={() => onSelectHotspot(isSelected ? null : hs.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-50/70 border-[#b93829] ring-1 ring-[#b93829]/30 shadow-xs"
                        : "bg-[#faf8f4] border-[#ebe5dc] hover:bg-white hover:border-[#c59b27]/60"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                          isSelected
                            ? "bg-[#b93829] text-white shadow-2xs"
                            : "bg-[#1a2a44] text-[#eed182]"
                        }`}
                      >
                        {hs.number}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="font-bold text-xs text-[#1a2a44] truncate">
                            {hs.title}
                          </h5>
                          <span className="text-[9px] text-slate-400 shrink-0">
                            {hs.categoryLabel}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-600 line-clamp-2 mt-0.5 leading-snug">
                          {hs.meaning}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Khung phóng to chi tiết món đang chọn */}
            {selectedHotspot && (
              <div className="mt-2 p-3 bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-300 rounded-xl space-y-1.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#b93829] text-white font-bold text-xs flex items-center justify-center">
                      {selectedHotspot.number}
                    </span>
                    <h5 className="font-bold text-xs text-amber-950">
                      {selectedHotspot.title}
                    </h5>
                  </div>
                  <span className="text-[9.5px] font-mono text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-full">
                    {selectedHotspot.era}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Ý nghĩa văn hóa:</strong> {selectedHotspot.meaning}
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed bg-emerald-50/70 p-2 rounded-lg border border-emerald-200/50">
                  <strong>Quy chuẩn lễ nghi:</strong> {selectedHotspot.etiquette}
                </p>
                <p className="text-[11px] text-indigo-900 leading-relaxed bg-indigo-50/70 p-2 rounded-lg border border-indigo-200/50">
                  <strong>Gợi ý Gen Z Remix:</strong> {selectedHotspot.genZRemix}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ĐIỂN TÍCH & NGUỒN GỐC LỊCH SỬ */}
        {activeTab === "lore" && (
          <div className="space-y-3">
            <div>
              <h5 className="text-xs font-bold text-[#b93829] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Hoàn Cảnh Lịch Sử & Triều Đại
              </h5>
              <p className="text-xs text-slate-700 leading-relaxed bg-[#fbf9f5] p-2.5 rounded-xl border border-[#ebe5dc]">
                {analysis.historicalStory}
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold text-[#c59b27] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Ý Nghĩa Biểu Tượng & Hoa Văn
              </h5>
              <p className="text-xs text-slate-700 leading-relaxed bg-[#fbf9f5] p-2.5 rounded-xl border border-[#ebe5dc]">
                {analysis.symbolismDetail}
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: NGŨ HÀNH & BẢNG MÀU SẮC */}
        {activeTab === "colors" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#e5e2dc]">
              <div>
                <h5 className="font-bold text-xs text-[#1a2a44]">
                  {analysis.colorHarmony.verdictTitle}
                </h5>
                <p className="text-[11px] text-slate-500">
                  {analysis.colorHarmony.commentary}
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                Điểm: {analysis.colorHarmony.score}/100
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10.5px] font-bold text-slate-700 block">
                Bảng Mã Màu Trích Xuất Từ Poster:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {analysis.colorHarmony.palette.map((c, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl border border-[#e5e2dc] bg-[#faf8f4] flex items-center gap-2"
                  >
                    <div
                      className="w-6 h-6 rounded-lg border border-black/20 shadow-2xs shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 truncate" title={c.name}>
                        {c.name}
                      </p>
                      <span className="text-[9.5px] font-mono text-slate-500 block">
                        {c.hex} · {c.element}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-600 italic bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
              💡 <strong>Lời khuyên Ngũ Hành:</strong> {analysis.colorHarmony.stylingAdvice}
            </p>
          </div>
        )}

        {/* TAB 4: LỄ NGHI & GEN Z REMIX */}
        {activeTab === "etiquette" && (
          <div className="space-y-3">
            <div>
              <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Quy Chuẩn Lễ Nghi & Không Gian Phù Hợp
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {analysis.etiquetteRules.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Gợi Ý Phối Đồ Sáng Tạo Cho Giới Trẻ (Gen Z Remix)
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-200/50">
                {analysis.genZRemixTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-indigo-600 font-bold mt-0.5">✨</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 5. Nút Hành Động: Áp Dụng Diện Mạo Lên Sàn Thử Dressroom (Bi-directional Link) */}
      {analysis.suggestedPreset && onApplyPresetToDressroom && (
        <div className="pt-1 flex items-center justify-between gap-3 bg-gradient-to-r from-amber-100/60 via-orange-100/40 to-amber-100/60 p-2.5 rounded-xl border border-amber-300 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <Shirt className="w-4 h-4 text-[#b93829] shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                Đồng bộ sang Sàn Thử: <span className="text-[#b93829]">{analysis.detectedAttireName}</span>
              </p>
              <p className="text-[10px] text-slate-600 line-clamp-1">
                Mặc set cổ phục này lên mannequin 2D và thử nghiệm phối màu tiếp!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyToDressroom}
            className="shrink-0 px-3.5 py-1.5 bg-[#b93829] hover:bg-[#9e2e21] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Thử Lên Mannequin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
