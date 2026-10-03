// src/components/SnapshotModal.tsx
// Thẻ Lookbook Thời Trang Gen Z & Chứng Thư Phối Cổ Phục (Audition Việt Phục Remix)
import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import type { UserFaceConfig } from './FaceUploadModal';
import type { EquippedOutfit, ColorState } from '../data/dressroomConfig';
import { mapHexToNguHanh } from '../services/culturalKnowledgeService';

interface SnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  isMissingBottom?: boolean;
  outfitName?: string;
  eraName?: string;
  onAutoEquipModestBottom?: () => void;
  userFaceConfig?: UserFaceConfig;
  colorState?: ColorState;
  equippedOutfit?: EquippedOutfit;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({
  isOpen,
  onClose,
  canvasRef,
  isMissingBottom,
  outfitName,
  eraName,
  onAutoEquipModestBottom,
  userFaceConfig,
  colorState = {},
  equippedOutfit = {},
}) => {
  const [downloading, setDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const lookbookCardRef = useRef<HTMLDivElement | null>(null);

  // Khi modal mở, chụp thử ảnh từ canvas
  React.useEffect(() => {
    if (isOpen && canvasRef.current) {
      toPng(canvasRef.current, { cacheBust: true, pixelRatio: 2 })
        .then((dataUrl) => {
          setPreviewUrl(dataUrl);
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#c59b27', '#ae3022', '#1a2a44', '#2e5339'],
          });
        })
        .catch((err) => {
          console.error('Lỗi chụp ảnh canvas:', err);
        });
    } else {
      setPreviewUrl(null);
    }
  }, [isOpen, canvasRef]);

  if (!isOpen) return null;

  // Lấy các mã màu nổi bật đang phối
  const activeColorEntries = Object.entries(colorState).filter(([_, hex]) => Boolean(hex));
  const activeHexes = Array.from(new Set(activeColorEntries.map(([_, hex]) => hex))).slice(0, 5);

  const handleDownload = async () => {
    // Ưu tiên xuất nguyên thẻ Lookbook Card có đầy đủ bảng màu, tên người mẫu và dấu triện
    const targetEl = lookbookCardRef.current || canvasRef.current;
    if (!targetEl) return;

    setDownloading(true);
    try {
      const dataUrl = await toPng(targetEl, {
        cacheBust: true,
        pixelRatio: 3, // Xuất độ phân giải cao 3x
      });
      const link = document.createElement('a');
      link.download = `viet-phuc-remix-lookbook-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyImage = async () => {
    const targetEl = lookbookCardRef.current || canvasRef.current;
    if (!targetEl) return;
    try {
      const dataUrl = await toPng(targetEl, { cacheBust: true, pixelRatio: 2 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Lỗi sao chép ảnh vào clipboard:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#04152e]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white max-w-lg w-full max-h-[94vh] overflow-y-auto rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col gap-3 border-2 border-[#c59b27] relative animate-in fade-in zoom-in-95 duration-200">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f0eee8] text-[#1c1c18] hover:bg-[#ebe8e2] flex items-center justify-center transition-colors cursor-pointer"
          title="Đóng cửa sổ"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Tiêu đề Modal */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#ae3022] text-[#eed182] flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[20px]">style</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-base sm:text-lg font-bold text-[#04152e]">
              Thẻ Lookbook Cổ Phục Remix
            </h3>
            <p className="text-[11px] text-[#5e6168]">
              Thiết kế thẻ thời trang Gen Z kèm bảng màu HEX và dấu triện hoàng gia
            </p>
          </div>
        </div>

        {/* Cảnh báo thiếu quần khi xuất ảnh */}
        {isMissingBottom && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start justify-between gap-2 text-amber-950">
            <div className="flex items-start gap-1.5 text-xs">
              <span className="material-symbols-outlined text-amber-700 text-[18px] shrink-0 mt-0.5">
                warning
              </span>
              <div>
                <strong className="block text-[11px] font-bold text-amber-900 uppercase">
                  Lưu ý thuần phong mỹ tục
                </strong>
                <span className="text-[10px] text-amber-800 leading-snug">
                  Trang phục đang thiếu quần/váy truyền thống.
                </span>
              </div>
            </div>
            {onAutoEquipModestBottom && (
              <button
                type="button"
                onClick={onAutoEquipModestBottom}
                className="px-2 py-1 rounded bg-[#ae3022] hover:bg-[#8c170d] text-white text-[10px] font-bold shrink-0 shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                title="Tự động mặc quần phù hợp"
              >
                <span className="material-symbols-outlined text-[13px]">check</span>
                <span>Mặc Quần</span>
              </button>
            )}
          </div>
        )}

        {/* Khung Lookbook Card Editorial hoàn chỉnh (Target để xuất ảnh) */}
        <div
          ref={lookbookCardRef}
          id="lookbook-export-card"
          className="w-full bg-[#FAF6EE] p-4 sm:p-5 rounded-xl border border-[#C59B27]/50 shadow-md flex flex-col items-center gap-3 relative text-[#1a2a44]"
        >
          {/* Top Editorial Brand Bar */}
          <div className="w-full flex items-center justify-between pb-2 border-b border-[#C59B27]/30 text-[10px] font-bold tracking-widest text-[#AE3022] uppercase">
            <span>Việt Phục Remix · Gen Z Lookbook</span>
            <span>Atelier No. 01</span>
          </div>

          {/* Canvas Snapshot Image */}
          <div className="w-48 sm:w-52 aspect-[9/16] bg-white rounded-lg overflow-hidden relative shadow-md border border-[#C59B27]/40 flex items-center justify-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Bản phối y phục hoàn chỉnh"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-xs text-[#75777e]">Đang kết xuất hình ảnh...</span>
            )}

            {/* Dấu Triện son đỏ góc dưới phải */}
            <div className="absolute bottom-2 right-2 w-8 h-8 rounded bg-[#AE3022] text-[#FAF6EE] flex flex-col items-center justify-center font-bold text-[7px] leading-tight shadow-md border border-[#C59B27]/50 pointer-events-none">
              <span>BẢO</span>
              <span>CHỨNG</span>
            </div>
          </div>

          {/* Outfit Title, Era & Garment Count */}
          <div className="text-center w-full">
            <h4 className="font-headline-sm text-base font-bold text-[#AE3022]">
              {outfitName || 'Cổ Phục Đại Việt'}
            </h4>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1a2a44] text-[#eed182] border border-[#c59b27]/30">
                {eraName || 'Di Sản Dân Tộc'}
              </span>
              {Object.values(equippedOutfit).filter(Boolean).length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-medium bg-[#FAF6EE] text-[#5c4a3e] border border-[#C59B27]/40">
                  {Object.values(equippedOutfit).filter(Boolean).length} Món Y Phục
                </span>
              )}
            </div>
          </div>

          {/* Creator / Model Pill (if user custom face is enabled) */}
          {userFaceConfig?.enabled && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#C59B27]/40 shadow-xs">
              <div className="w-5 h-5 rounded-full overflow-hidden border border-[#AE3022]">
                <img src={userFaceConfig.src} alt="Model" className="w-full h-full object-cover" />
              </div>
              <span className="text-[10.5px] font-semibold text-[#1a2a44]">
                Người Mẫu: <span className="text-[#AE3022] font-bold">{userFaceConfig.name}</span>
              </span>
            </div>
          )}

          {/* Color Palette Swatches (HEX) */}
          {activeHexes.length > 0 && (
            <div className="w-full pt-2 border-t border-[#C59B27]/20 flex flex-col items-center gap-1.5">
              <span className="text-[9.5px] font-bold text-[#8b6914] uppercase tracking-wider">
                Bảng Mã Màu Bản Phối (Palette):
              </span>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {activeHexes.map((hex, idx) => {
                  const elem = mapHexToNguHanh(hex);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-md border border-[#e2d8c6] shadow-2xs"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-[9px] font-mono font-bold text-[#3b322a] uppercase">
                        {hex}
                      </span>
                      <span className="text-[8px] text-[#AE3022] font-semibold">({elem})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Nút hành động */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#AE3022] to-[#C59B27] text-white hover:brightness-105 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
            <span>{downloading ? 'Đang Xuất Lookbook...' : 'Tải Lookbook HD (PNG)'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyImage}
            className="py-2 px-3 rounded-xl bg-[#FAF6EE] text-[#1a2a44] border border-[#C59B27]/40 hover:bg-[#e8ded0] font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
            title="Sao chép ảnh vào Clipboard để dán nhanh lên Zalo/Facebook"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copySuccess ? 'check' : 'content_copy'}
            </span>
            <span>{copySuccess ? 'Đã Sao Chép!' : 'Sao Chép'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-3.5 rounded-xl bg-[#f0eee8] text-[#1c1c18] hover:bg-[#ebe8e2] font-medium text-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Đóng</span>
          </button>
        </div>
      </div>
    </div>
  );
};
