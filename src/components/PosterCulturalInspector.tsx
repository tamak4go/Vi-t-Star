// src/components/PosterCulturalInspector.tsx
// Thành phần AI Thẩm Định Di Sản & Chú Thích Bóc Tách Thành Phần Cho Poster Thời Trang
// HOÀN TOÀN KHÔNG BỊA TỌA ĐỘ GHIM — HIỂN THỊ DỮ LIỆU ĐƯỢC QUÉT CHÂN THỰC TỪ ẢNH & PROMPT
import { useState } from "react";
import {
  ShieldCheck,
  MapPin,
  Sparkles,
  BookOpen,
  Check,
  Shirt,
  Compass,
  Palette,
  RefreshCw,
  AlertTriangle,
  Download,
} from "lucide-react";
import {
  type DynamicPosterAnalysis,
  type PosterComponentDetail,
} from "../services/posterAnalysisService";

interface PosterCulturalInspectorProps {
  analysis: DynamicPosterAnalysis;
  isScanning: boolean;
  onScanAgain: () => void;
  showToast: (msg: string) => void;
}

export function PosterCulturalInspector({
  analysis,
  isScanning,
  onScanAgain,
  showToast,
}: PosterCulturalInspectorProps) {
  const [activeTab, setActiveTab] = useState<"components" | "colors" | "lore" | "etiquette">("components");
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);

  const selectedComp: PosterComponentDetail | null =
    analysis.components.find((c) => c.id === selectedCompId) || null;

  const handleDownloadDossier = () => {
    const content = `=== HỒ SƠ THẨM ĐỊNH DI SẢN POSTER AI ===
Tác phẩm: ${analysis.summaryTitle}
Vùng miền: ${analysis.detectedRegion.name}
Xếp loại: ${analysis.styleBadge} (${analysis.authenticity.score}/100)

1. BẢNG MÀU PIXEL TRÍCH XUẤT THỰC TẾ:
${analysis.colorPalette
  .map((c) => `- ${c.traditionalName} (${c.hex}) • Mệnh ${c.element} • Chiếm ${c.percentage}%`)
  .join("\n")}

2. THÀNH PHẦN PHỤC TRANG NHẬN DIỆN ĐƯỢC:
${analysis.components
  .map(
    (comp) =>
      `• [${comp.categoryLabel}] ${comp.name}: ${comp.description}${
        comp.symbolism ? ` (Ý nghĩa: ${comp.symbolism})` : ""
      }`
  )
  .join("\n")}

3. ĐIỂN TÍCH & BỐI CẢNH LỊCH SỬ:
${analysis.historicalLore}

4. QUY CHUẨN LỄ NGHI:
${analysis.culturalAdvice.map((a) => `- ${a}`).join("\n")}
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ho-so-tham-dinh-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("📄 Đã xuất tệp Hồ Sơ Thẩm Định Di Sản!");
  };

  return (
    <div className="bg-[#fcfaf7] border border-[#e8e2d5] rounded-2xl p-3 sm:p-4 space-y-3.5 shadow-xs transition-all">
      {/* 1. Header Bar: Tiêu Đề Phân Tích & Nút Quét Lại */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#e5e2dc]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#b93829] to-[#c59b27] flex items-center justify-center text-white shadow-2xs shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-[#1a2a44] truncate flex items-center gap-1.5">
              <span>Hồ Sơ Thẩm Định & Quét Di Sản Poster</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                AI Vision Scan
              </span>
            </h4>
            <p className="text-[10.5px] text-slate-500 truncate">
              Nhận diện: <strong className="text-[#b93829]">{analysis.summaryTitle}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onScanAgain}
            disabled={isScanning}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#e5e2dc] bg-white text-slate-700 hover:border-[#b93829] hover:text-[#b93829] transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            title="Quét lại hình ảnh và phân tích lại"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin text-[#b93829]" : "text-slate-500"}`} />
            <span>{isScanning ? "Đang quét..." : "Quét Lại"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadDossier}
            className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Tải văn bản thẩm định di sản"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
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
          <p className="mt-1 text-xs font-bold text-[#1a2a44] truncate" title={analysis.detectedRegion.name}>
            {analysis.detectedRegion.name}
          </p>
          <span className="text-[9px] text-slate-400 block truncate">
            {analysis.detectedRegion.description}
          </span>
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
            {analysis.colorPalette.slice(0, 4).map((p, idx) => (
              <span
                key={idx}
                className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                style={{ backgroundColor: p.hex }}
                title={`${p.traditionalName} (${p.hex}) - Mệnh ${p.element}`}
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
            {analysis.occasionFit.suitability}
          </span>
        </div>
      </div>

      {/* 3. Tab Switcher Khảo Sát Chi Tiết */}
      <div className="flex items-center gap-1 p-1 bg-[#ede8df] rounded-xl text-xs font-medium overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("components")}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === "components"
              ? "bg-white text-[#1a2a44] font-bold shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Shirt className="w-3.5 h-3.5 text-[#b93829]" />
          <span>Bóc Tách Thành Phần ({analysis.components.length})</span>
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
          <span>Sắc Phục Pixel Thực ({analysis.colorPalette.length} màu)</span>
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
          onClick={() => setActiveTab("etiquette")}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === "etiquette"
              ? "bg-white text-[#1a2a44] font-bold shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          <span>Lễ Nghi & Gợi Ý Phối</span>
        </button>
      </div>

      {/* 4. Nội Dung Chi Tiết Từng Tab */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-[#e5e2dc] min-h-[140px] space-y-2.5">
        {/* TAB 1: DANH SÁCH BÓC TÁCH THÀNH PHẦN Y PHỤC (COMPONENTS) */}
        {activeTab === "components" && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Các thành phần trang phục nhận diện thực tế từ tác phẩm:</span>
              {selectedCompId && (
                <button
                  type="button"
                  onClick={() => setSelectedCompId(null)}
                  className="text-[10px] text-[#b93829] hover:underline cursor-pointer"
                >
                  Thu gọn
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {analysis.components.map((comp) => {
                const isSelected = selectedCompId === comp.id;
                return (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedCompId(isSelected ? null : comp.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-50/70 border-[#b93829] ring-1 ring-[#b93829]/30 shadow-xs"
                        : "bg-[#faf8f4] border-[#ebe5dc] hover:bg-white hover:border-[#c59b27]/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              comp.status === "warning"
                                ? "bg-rose-100 text-rose-800"
                                : comp.status === "remix"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {comp.categoryLabel}
                          </span>
                          <h5 className="font-bold text-xs text-[#1a2a44] truncate">
                            {comp.name}
                          </h5>
                        </div>
                        <p className="text-[10.5px] text-slate-600 line-clamp-2 mt-1 leading-snug">
                          {comp.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chi tiết thành phần đang chọn */}
            {selectedComp && (
              <div className="mt-2 p-3 bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-300 rounded-xl space-y-1.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-amber-950">
                      {selectedComp.name}
                    </span>
                  </div>
                  {selectedComp.historicalEra && (
                    <span className="text-[9.5px] font-mono text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-full">
                      {selectedComp.historicalEra}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedComp.description}
                </p>
                {selectedComp.symbolism && (
                  <p className="text-[11px] text-slate-800 leading-relaxed bg-white/70 p-2 rounded-lg border border-amber-900/10">
                    <strong>Ý nghĩa biểu tượng:</strong> {selectedComp.symbolism}
                  </p>
                )}
                {selectedComp.etiquetteNote && (
                  <p className="text-[11px] text-emerald-900 leading-relaxed bg-emerald-50/70 p-2 rounded-lg border border-emerald-200/50">
                    <strong>Quy chuẩn lễ nghi:</strong> {selectedComp.etiquetteNote}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SẮC PHỤC PIXEL THỰC TẾ (CANVAS SCAN PALETTE) */}
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
                Hòa Sắc: {analysis.colorHarmony.score}/100
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-700">
                <span>Bảng Màu Trích Xuất Trực Tiếp Từ Pixel Ảnh Thật:</span>
                <span className="text-[9.5px] text-slate-400 font-normal">Quét qua Canvas 2D</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {analysis.colorPalette.map((c, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl border border-[#e5e2dc] bg-[#faf8f4] flex items-center gap-2.5 shadow-2xs"
                  >
                    <div
                      className="w-8 h-8 rounded-lg border border-black/20 shadow-xs shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[11px] font-bold text-slate-800 truncate" title={c.traditionalName}>
                          {c.traditionalName}
                        </p>
                        <span className="text-[9px] font-mono text-slate-400 font-bold shrink-0">
                          {c.percentage}%
                        </span>
                      </div>
                      <span className="text-[9.5px] font-mono text-slate-500 block">
                        {c.hex} · Mệnh {c.element}
                      </span>
                      <span className="text-[8.5px] text-[#b93829] font-medium block truncate">
                        {c.role}
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

        {/* TAB 3: ĐIỂN TÍCH & NGUỒN GỐC LỊCH SỬ */}
        {activeTab === "lore" && (
          <div className="space-y-3">
            <div>
              <h5 className="text-xs font-bold text-[#b93829] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Hoàn Cảnh Lịch Sử & Giá Trị Di Sản
              </h5>
              <p className="text-xs text-slate-700 leading-relaxed bg-[#fbf9f5] p-2.5 rounded-xl border border-[#ebe5dc]">
                {analysis.historicalLore}
              </p>
            </div>

            <div className="p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-xl space-y-1">
              <h6 className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#c59b27]" />
                Nhận Định Của Cố Vấn Văn Hóa
              </h6>
              <p className="text-xs text-slate-700 leading-relaxed">
                {analysis.authenticity.analysis}
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: LỄ NGHI & GỢI Ý PHỐI ĐỒ */}
        {activeTab === "etiquette" && (
          <div className="space-y-3">
            {analysis.authenticity.conflicts.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 space-y-1">
                <h6 className="text-xs font-bold text-rose-900 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Điểm Cần Lưu Ý Về Văn Hóa
                </h6>
                <ul className="space-y-1 text-xs text-rose-800">
                  {analysis.authenticity.conflicts.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Quy Chuẩn Lễ Nghi & Bối Cảnh Phù Hợp
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {analysis.culturalAdvice.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-2.5 bg-indigo-50/60 border border-indigo-200/60 rounded-xl space-y-1">
              <h6 className="text-[11px] font-bold text-indigo-950 flex items-center gap-1">
                <Compass className="w-3 h-3 text-indigo-600" />
                Lời Khuyên Bối Cảnh ({analysis.occasionFit.name})
              </h6>
              <p className="text-xs text-slate-700 leading-relaxed">
                {analysis.occasionFit.advice}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
