// src/components/CulturalAuthenticityModal.tsx
// Hộp thoại Phân Tích Chuẩn Mực Di Sản & Cảnh Báo Sai Lệch Văn Hóa
// Tiêu chí đề thi Audition: "Cảnh báo những cách kết hợp có thể làm sai lệch đặc trưng văn hóa"
import React from 'react';
import type { CulturalAuthenticityAssessment } from '../services/culturalKnowledgeService';

interface CulturalAuthenticityModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: CulturalAuthenticityAssessment;
  onAutoEquipModestBottom?: () => void;
}

export const CulturalAuthenticityModal: React.FC<CulturalAuthenticityModalProps> = ({
  isOpen,
  onClose,
  assessment,
  onAutoEquipModestBottom,
}) => {
  if (!isOpen) return null;

  const isNotice = assessment.tier === 'notice';
  const isRemix = assessment.tier === 'remix';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#FAF6EE] text-[#1a2a44] rounded-2xl shadow-2xl border-2 border-[#C59B27]/50 flex flex-col p-4 sm:p-6 relative no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Archaic Watermark Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#C59B27_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-start justify-between pb-3 border-b border-[#C59B27]/30">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shadow-md border shrink-0 ${
                isNotice
                  ? 'bg-amber-900 text-amber-100 border-amber-600'
                  : isRemix
                  ? 'bg-[#1a2a44] text-[#eed182] border-[#c59b27]'
                  : 'bg-[#AE3022] text-[#FAF6EE] border-[#c59b27]'
              }`}
            >
              <span className="text-[8px] font-bold uppercase tracking-wider">Bảo Chứng</span>
              <span className="material-symbols-outlined text-[20px] my-[-2px]">
                {assessment.badgeIcon}
              </span>
              <span className="text-[7.5px] uppercase font-semibold">Văn Hóa</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-headline-sm text-base sm:text-lg font-bold text-primary">
                  {assessment.badgeTitle}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-surface-container text-primary border border-outline-variant/30">
                  {assessment.score} / 100 Điểm
                </span>
              </div>
              <p className="text-[11px] font-semibold text-[#8b6914] uppercase tracking-wider mt-0.5">
                Thẩm Định Chuẩn Mực Di Sản & Khuyến Nghị Lễ Nghi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5c4a3e] hover:bg-[#e8ded0] transition-colors cursor-pointer"
            title="Đóng modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Content Sections */}
        <div className="relative z-10 flex flex-col gap-3 py-4 text-[12px] sm:text-[13px] leading-relaxed">
          {/* Vùng Miền Hiện Diện */}
          {assessment.regionsPresent.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap p-2.5 rounded-xl bg-white/80 border border-[#e2d8c6]">
              <span className="text-[11px] font-bold text-outline uppercase tracking-wider shrink-0 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-secondary">explore</span>
                <span>VÙNG MIỀN HIỆN DIỆN:</span>
              </span>
              {assessment.regionsPresent.map((reg, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-[#1a2a44] text-[#eed182] text-[10.5px] font-medium"
                >
                  {reg}
                </span>
              ))}
            </div>
          )}

          {/* Phân Tích Tổng Quan */}
          <div className="p-3.5 rounded-xl bg-white/90 border border-[#e2d8c6] shadow-xs">
            <div className="flex items-center gap-1.5 text-primary font-bold text-[12px] uppercase tracking-wide mb-1">
              <span className="material-symbols-outlined text-[17px] text-secondary">analytics</span>
              <span>{assessment.headline}</span>
            </div>
            <p className="text-[#3b322a] leading-normal">{assessment.analysis}</p>
          </div>

          {/* Danh Sách Cảnh Báo Lệch Chuẩn (Nếu có) */}
          {assessment.conflicts.length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-50/90 border border-rose-300 shadow-xs flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold text-[12px] uppercase tracking-wide">
                <span className="material-symbols-outlined text-[18px] text-rose-600">warning</span>
                <span>Cảnh Báo Cách Kết Hợp Có Thể Làm Sai Lệch Văn Hóa</span>
              </div>
              <ul className="space-y-1.5">
                {assessment.conflicts.map((conflict, idx) => (
                  <li
                    key={idx}
                    className="p-2 rounded-lg bg-white/90 border border-rose-200 text-rose-950 text-[11.5px] sm:text-[12px] flex items-start gap-2 leading-relaxed"
                  >
                    <span className="text-rose-600 font-bold shrink-0 mt-0.5">•</span>
                    <span>{conflict}</span>
                  </li>
                ))}
              </ul>
              {onAutoEquipModestBottom && assessment.conflicts.some((c) => c.includes('hạ y')) && (
                <button
                  type="button"
                  onClick={() => {
                    onAutoEquipModestBottom();
                    onClose();
                  }}
                  className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-[#c59b27] to-[#eec14b] text-[#1a2a44] font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer hover:brightness-105 mt-1"
                >
                  <span className="material-symbols-outlined text-[15px]">check</span>
                  <span>Mặc Quần Lụa Truyền Thống Ngay</span>
                </button>
              )}
            </div>
          )}

          {/* Lời Khuyên Lễ Nghi & Gợi Ý Chuyên Gia */}
          {assessment.etiquetteTips.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#FFF9F2] border border-[#d9822b]/40 shadow-xs">
              <div className="flex items-center gap-1.5 text-[#a85012] font-bold text-[12px] uppercase tracking-wide mb-1.5">
                <span className="material-symbols-outlined text-[17px]">tips_and_updates</span>
                <span>Lời Khuyên Chuẩn Mực Di Sản Từ Chuyên Gia</span>
              </div>
              <ul className="space-y-1">
                {assessment.etiquetteTips.map((tip, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-[11.5px] sm:text-[12px] text-[#4a3520] leading-normal"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c59b27] mt-1.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 pt-3 border-t border-[#C59B27]/30 flex items-center justify-between">
          <span className="text-[10.5px] text-[#8b6914] italic">
            🛡️ Bộ nguyên tắc thẩm định di sản số theo tiêu chuẩn Văn Hóa Dân Gian Việt Nam
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-[#AE3022] text-[#FAF6EE] hover:bg-[#8e251a] font-bold text-[11.5px] shadow-sm transition-colors cursor-pointer"
          >
            Đã Tiếp Thu
          </button>
        </div>
      </div>
    </div>
  );
};
