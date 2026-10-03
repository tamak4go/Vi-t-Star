// src/components/CulturalStoryModal.tsx
// Hộp Thoại Điển Tích & Ý Nghĩa Văn Hóa Cổ Phục (Audition Việt Phục Remix - Gen Z)
import React from 'react';
import { getItemCulturalStory, type CulturalStory } from '../services/culturalKnowledgeService';
import type { WardrobeItem } from '../data/dressroomConfig';

interface CulturalStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WardrobeItem | null;
  currentSetId?: string;
}

export const CulturalStoryModal: React.FC<CulturalStoryModalProps> = ({
  isOpen,
  onClose,
  item,
  currentSetId,
}) => {
  if (!isOpen) return null;

  const story: CulturalStory = getItemCulturalStory(item, currentSetId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#FAF6EE] text-[#1a2a44] rounded-2xl shadow-2xl border-2 border-[#C59B27]/50 flex flex-col p-4 sm:p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Archaic Watermark Background */}
        <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#C59B27_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-start justify-between pb-3 border-b border-[#C59B27]/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#AE3022] to-[#7a180e] text-[#eed182] flex flex-col items-center justify-center shadow-md border border-[#c59b27]/40 shrink-0">
              <span className="text-[9px] font-bold uppercase tracking-wider">Di Sản</span>
              <span className="material-symbols-outlined text-[20px] my-[-2px]">menu_book</span>
              <span className="text-[7.5px] uppercase font-semibold">Việt Cổ</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-base sm:text-lg font-bold text-[#AE3022]">
                  {story.title}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1a2a44] text-[#eed182] border border-[#c59b27]/30">
                  {story.era}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-[#8b6914] uppercase tracking-wider mt-0.5">
                Điển Tích · Ý Nghĩa Biểu Tượng · Phối Đồ Gen Z
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
        <div className="relative z-10 flex flex-col gap-3.5 py-4 text-[12px] sm:text-[13px] leading-relaxed">
          {/* Historical Era & Context Card */}
          <div className="p-3 rounded-xl bg-white/80 border border-[#e2d8c6] shadow-xs">
            <div className="flex items-center gap-1.5 text-[#AE3022] font-bold text-[12px] uppercase tracking-wide mb-1">
              <span className="material-symbols-outlined text-[17px]">history_edu</span>
              <span>1. Hoàn Cảnh Lịch Sử & Nguồn Gốc</span>
            </div>
            <p className="text-[#3b322a] leading-normal">{story.historicalContext}</p>
          </div>

          {/* Symbolism & Philosophy */}
          <div className="p-3 rounded-xl bg-white/80 border border-[#e2d8c6] shadow-xs">
            <div className="flex items-center gap-1.5 text-[#1a2a44] font-bold text-[12px] uppercase tracking-wide mb-1">
              <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
              <span>2. Ý Nghĩa Biểu Tượng & Ngũ Thường</span>
            </div>
            <p className="text-[#3b322a] leading-normal">{story.symbolism}</p>
          </div>

          {/* Traditional Etiquette */}
          <div className="p-3 rounded-xl bg-[#FFF9F2] border border-[#d9822b]/30 shadow-xs">
            <div className="flex items-center gap-1.5 text-[#a85012] font-bold text-[12px] uppercase tracking-wide mb-1">
              <span className="material-symbols-outlined text-[17px]">gavel</span>
              <span>3. Quy Cách Lễ Nghi & Thuần Phong Mỹ Tục</span>
            </div>
            <p className="text-[#4a3520] leading-normal">{story.etiquette}</p>
          </div>

          {/* Gen Z Remix Tips */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#1a2a44]/5 to-[#c59b27]/10 border border-[#c59b27] shadow-xs">
            <div className="flex items-center gap-1.5 text-[#AE3022] font-bold text-[12px] uppercase tracking-wide mb-1">
              <span className="material-symbols-outlined text-[17px]">brush</span>
              <span>4. Gợi Ý Phối Đồ Hiện Đại (Gen Z Remix)</span>
            </div>
            <p className="text-[#2b2520] font-medium leading-normal">{story.genZRemixTips}</p>
          </div>

          {/* Key Visual Details */}
          {story.keyDetails && story.keyDetails.length > 0 && (
            <div className="p-3 rounded-xl bg-white/80 border border-[#e2d8c6] shadow-xs">
              <div className="flex items-center gap-1.5 text-[#2E5339] font-bold text-[12px] uppercase tracking-wide mb-1.5">
                <span className="material-symbols-outlined text-[17px]">check_circle</span>
                <span>Chi Tiết Nhận Diện Đặc Trưng</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {story.keyDetails.map((detail: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-center gap-1.5 text-[11.5px] text-[#4a3d34] bg-[#FAF6EE] px-2 py-1 rounded-md border border-[#e2d8c6]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c59b27] shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 pt-3 border-t border-[#C59B27]/30 flex items-center justify-between">
          <span className="text-[10.5px] text-[#8b6914] italic">
            📖 Tư liệu nghiên cứu bởi Viện Cổ Phục & Không Gian Di Sản Số
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-[#AE3022] text-[#FAF6EE] hover:bg-[#8e251a] font-bold text-[11.5px] shadow-sm transition-colors cursor-pointer"
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
