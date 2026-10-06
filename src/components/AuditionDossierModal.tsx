// src/components/AuditionDossierModal.tsx
// Hộp Thoại Hồ Sơ Đề Án Audition: "Việt Phục Remix - Gen Z"
// Trình bày phương pháp luận nghiên cứu & bảo chứng văn hóa di sản số cho Ban Giám Khảo
import React from 'react';

interface AuditionDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditionDossierModal: React.FC<AuditionDossierModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#FAF6EE] text-[#1a2a44] rounded-2xl shadow-2xl border-2 border-[#C59B27]/60 flex flex-col p-4 sm:p-6 relative no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Archaic Watermark Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#C59B27_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-start justify-between pb-3.5 border-b border-[#C59B27]/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#AE3022] to-[#6d130a] text-[#eed182] flex flex-col items-center justify-center shadow-md border border-[#c59b27]/50 shrink-0">
              <span className="text-[8px] font-bold uppercase tracking-wider">Hồ Sơ</span>
              <span className="material-symbols-outlined text-[20px] my-[-2px]">verified_user</span>
              <span className="text-[7.5px] uppercase font-semibold">Audition</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-headline-sm text-base sm:text-lg font-bold text-[#AE3022]">
                  Đề Án: Việt Phục Remix
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1a2a44] text-[#eed182] border border-[#c59b27]/40">
                  Gen Z Heritage
                </span>
              </div>
              <p className="text-[11px] font-semibold text-[#8b6914] uppercase tracking-wider mt-0.5">
                Bảo Tồn Di Sản · Sáng Tạo Đương Đại · Trải Nghiệm Số Hóa
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
        <div className="relative z-10 flex flex-col gap-4 py-4 text-[12px] sm:text-[13px] leading-relaxed">
          {/* Section 1: Nhóm Trang Phục & Bối Cảnh Văn Hóa */}
          <div className="p-3.5 rounded-xl bg-white/90 border border-[#e2d8c6] shadow-xs">
            <div className="flex items-center gap-2 text-[#AE3022] font-bold text-[12.5px] uppercase tracking-wide mb-1.5">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
              <span>1. Nhóm Trang Phục & Bối Cảnh Văn Hóa (3 Miền & Dân Tộc)</span>
            </div>
            <p className="text-[#3b322a] mb-2 leading-normal">
              Hệ thống tuyển chọn và phục dựng 10 nhóm cổ phục tiêu biểu trải dài khắp các vùng miền địa lý và tiến trình lịch sử Đại Việt:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
              <div className="p-2 rounded-lg bg-[#FAF6EE] border border-[#e2d8c6]">
                <strong className="text-[#AE3022]">🌸 Bắc Bộ (Kinh Bắc):</strong> Áo Tứ Thân, Yếm Đào, Nón Quai Thao, Dải Nịt Ngũ Sắc, Váy Đụp dân gian.
              </div>
              <div className="p-2 rounded-lg bg-[#FAF6EE] border border-[#e2d8c6]">
                <strong className="text-[#AE3022]">🏰 Cung Đình Huế (Triều Nguyễn):</strong> Áo Nhật Bình đại lễ, Áo Tấc thụng khiêm cung, Áo Ngũ Thân Lập Lĩnh.
              </div>
              <div className="p-2 rounded-lg bg-[#FAF6EE] border border-[#e2d8c6]">
                <strong className="text-[#AE3022]">🚣 Nam Bộ Sông Nước:</strong> Áo Bà Ba, Khăn Rằn, Nón Lá, Giỏ Mây mộc mạc đôn hậu.
              </div>
              <div className="p-2 rounded-lg bg-[#FAF6EE] border border-[#e2d8c6]">
                <strong className="text-[#AE3022]">⛰️ Tây Bắc & Duyên Hải:</strong> Cổ phục Dân tộc Thái (Áo Cóm, Khăn Piêu) & Cổ phục Chăm Pa Tháp Cổ.
              </div>
            </div>
          </div>

          {/* Section 2: Xác Định Nhu Cầu Người Dùng (Target Persona) */}
          <div className="p-3.5 rounded-xl bg-white/90 border border-[#e2d8c6] shadow-xs">
            <div className="flex items-center gap-2 text-[#1a2a44] font-bold text-[12.5px] uppercase tracking-wide mb-1.5">
              <span className="material-symbols-outlined text-[18px]">group</span>
              <span>2. Chân Dung & Nhu Cầu Người Dùng (Gen Z Persona)</span>
            </div>
            <ul className="space-y-1.5 text-[#3b322a]">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c59b27] mt-1.5 shrink-0" />
                <span><strong>Học sinh, Sinh viên:</strong> Muốn tìm hiểu trang phục truyền thống để chụp ảnh kỷ yếu, diện Tết, biểu diễn văn nghệ học đường mà không bị già dặn, gò bó.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c59b27] mt-1.5 shrink-0" />
                <span><strong>Giới trẻ yêu sáng tạo:</strong> Thích thử nghiệm phối đồ (remix) phong cách Y2K, street style hiện đại với các biểu tượng di sản (kiềng bạc, khăn rằn, áo yếm).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c59b27] mt-1.5 shrink-0" />
                <span><strong>Rào cản lớn nhất:</strong> Thiếu nguồn kiến thức chuẩn xác, sợ mặc sai lễ nghi thuần phong mỹ tục, sợ bị chỉ trích khi cách tân thiếu hiểu biết.</span>
              </li>
            </ul>
          </div>

          {/* Section 3: Trải Nghiệm Phối Đồ Đa Tầng (UX/UI Architecture) */}
          <div className="p-3.5 rounded-xl bg-white/90 border border-[#e2d8c6] shadow-xs">
            <div className="flex items-center gap-2 text-[#2E5339] font-bold text-[12.5px] uppercase tracking-wide mb-1.5">
              <span className="material-symbols-outlined text-[18px]">layers</span>
              <span>3. Phác Thảo Trải Nghiệm Phối Đồ (Interactive UX/UI)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11.5px]">
              <div className="p-2 rounded-lg bg-[#FAF6EE] border border-[#e2d8c6]">
                <strong className="text-[#2E5339] block mb-0.5">Sàn Thử 2D Đa Tầng</strong>
                Xếp lớp 9 tầng y phục (người mẫu, giày, quần, áo trong, áo ngoài, nịt, phụ kiện, nón).
              </div>
              <div className="p-2 rounded-lg bg-[#FAF6EE] border border-[#e2d8c6]">
                <strong className="text-[#2E5339] block mb-0.5">Bảng Màu Ngũ Hành</strong>
                Thuật toán phân tích tương sinh, tương khắc, âm dương hài hòa đạt tỷ lệ vàng thị giác.
              </div>
              <div className="p-2 rounded-lg bg-[#FAF6EE] border border-[#e2d8c6]">
                <strong className="text-[#2E5339] block mb-0.5">Thời Tiết & Sự Kiện</strong>
                Gợi ý chất liệu vải (lụa tơ tằm, nhung gấm) theo 4 mùa và bối cảnh (Kỷ yếu, Tết, Lễ hội).
              </div>
            </div>
          </div>

          {/* Section 4: Bảo Đảm Thông Tin Văn Hóa & Cảnh Báo Lệch Chuẩn */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#FFF9F2] to-[#FAF6EE] border-2 border-[#d9822b]/50 shadow-xs">
            <div className="flex items-center gap-2 text-[#a85012] font-bold text-[12.5px] uppercase tracking-wide mb-1.5">
              <span className="material-symbols-outlined text-[18px]">gavel</span>
              <span>4. Bảo Chứng Văn Hóa Số & Cảnh Báo Lệch Chuẩn (Cultural Guard)</span>
            </div>
            <p className="text-[#4a3520] mb-2 leading-normal">
              Ứng dụng thiết lập 3 lớp phòng vệ đạo đức và di sản văn hóa số:
            </p>
            <div className="space-y-1.5 text-[11.5px] text-[#4a3520]">
              <div className="p-2 rounded-lg bg-white/80 border border-[#d9822b]/30">
                <strong>🛡️ Cảnh Báo Lệch Chuẩn Văn Hóa (Cultural Authenticity Guard):</strong> Phát hiện ngay lập tức khi người dùng phối cọc cạch giữa các vùng miền hoặc đẳng cấp lễ phục (ví dụ: Nhật Bình cung đình mặc với váy ngắn hay dép lê; mặc hở hang đi lễ đình chùa).
              </div>
              <div className="p-2 rounded-lg bg-white/80 border border-[#d9822b]/30">
                <strong>📖 Thư Viện Điển Tích Văn Hóa:</strong> Tích hợp lịch sử, ý nghĩa ngũ thường (Nhân, Lễ, Nghĩa, Trí, Tín) trên từng món đồ thông qua Modal Điển Tích.
              </div>
              <div className="p-2 rounded-lg bg-white/80 border border-[#d9822b]/30">
                <strong>✨ Google Stitch Multimodal AI:</strong> Cho phép tải ảnh selfie cá nhân và ứng dụng AI để sinh Poster thời trang chân thực, bảo toàn 100% ngũ quan người thật trong tà áo di sản.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 pt-3 border-t border-[#C59B27]/40 flex items-center justify-between">
          <span className="text-[10.5px] text-[#8b6914] italic">
            🇻🇳 Dự án Audition: Tôn vinh & Lan tỏa Việt phục truyền thống đến thế hệ trẻ
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-[#AE3022] text-[#FAF6EE] hover:bg-[#8e251a] font-bold text-[11.5px] shadow-sm transition-colors cursor-pointer"
          >
            Đóng Hồ Sơ
          </button>
        </div>
      </div>
    </div>
  );
};
