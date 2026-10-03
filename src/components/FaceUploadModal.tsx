// src/components/FaceUploadModal.tsx
// Studio Tùy Biến Gương Mặt Cá Nhân Hóa Cho Nhân Vật Đại Diện (Gen Z Việt Phục Remix)
import React, { useRef, useState, useEffect } from 'react';

export interface UserFaceConfig {
  enabled: boolean;
  src: string;
  name: string;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export const DEFAULT_FACE_CONFIG: UserFaceConfig = {
  enabled: false,
  src: '',
  name: 'Mặc định (Người mẫu mộc)',
  scale: 1.0,
  offsetX: 0,
  offsetY: 0,
};

// Preset gương mặt minh họa sẵn để người dùng trải nghiệm ngay lập tức
const PRESET_FACES: Array<{ id: string; name: string; tag: string; src: string }> = [
  {
    id: 'genz-nu',
    name: 'Nữ Sinh Gen Z',
    tag: 'Tươi tắn · Tự nhiên',
    // High quality vector avatar data URL
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150"><ellipse cx="60" cy="78" rx="42" ry="54" fill="%23FFE3D1"/><path d="M26 48 Q60 22 94 48 Q98 80 94 100 Q60 124 26 100 Z" fill="%23FFE3D1"/><ellipse cx="44" cy="72" rx="5" ry="3.5" fill="%232C2420"/><ellipse cx="76" cy="72" rx="5" ry="3.5" fill="%232C2420"/><path d="M38 65 Q45 61 52 64" stroke="%232C2420" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M68 64 Q75 61 82 65" stroke="%232C2420" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M60 74 L57 88 L63 88" stroke="%23E8967A" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="38" cy="85" rx="7" ry="4" fill="%23FF9EAA" opacity="0.5"/><ellipse cx="82" cy="85" rx="7" ry="4" fill="%23FF9EAA" opacity="0.5"/><path d="M50 102 Q60 110 70 102" stroke="%23C94A4A" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M24 60 C18 35 30 18 60 18 C90 18 102 35 96 60 C90 32 80 26 60 28 C40 26 30 32 24 60 Z" fill="%231E1B18"/></svg>',
  },
  {
    id: 'genz-nam',
    name: 'Nam Sinh Gen Z',
    tag: 'Lịch lãm · Thư sinh',
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150"><ellipse cx="60" cy="78" rx="40" ry="52" fill="%23F7DCB9"/><ellipse cx="45" cy="73" rx="5" ry="3" fill="%23231F20"/><ellipse cx="75" cy="73" rx="5" ry="3" fill="%23231F20"/><path d="M38 64 Q46 62 53 64" stroke="%23231F20" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M67 64 Q74 62 82 64" stroke="%23231F20" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M60 74 L58 87 L63 87" stroke="%23DFA37B" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M52 101 Q60 106 68 101" stroke="%23B35346" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M25 50 C20 28 32 15 60 15 C88 15 100 28 95 50 C85 24 75 22 60 22 C45 22 35 24 25 50 Z" fill="%23171717"/></svg>',
  },
  {
    id: 'hue-co-dien',
    name: 'Nữ Sinh Cố Đô',
    tag: 'Đoan trang · Dịu dàng',
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150"><ellipse cx="60" cy="78" rx="39" ry="53" fill="%23FFF0E5"/><ellipse cx="45" cy="72" rx="4.5" ry="3.5" fill="%233A2E2B"/><ellipse cx="75" cy="72" rx="4.5" ry="3.5" fill="%233A2E2B"/><path d="M39 65 Q45 61 51 63" stroke="%233A2E2B" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M69 63 Q75 61 81 65" stroke="%233A2E2B" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M60 74 L58 86 L62 86" stroke="%23E2A28C" stroke-width="1.8" fill="none" stroke-linecap="round"/><ellipse cx="38" cy="84" rx="6" ry="3.5" fill="%23FFB2BA" opacity="0.4"/><ellipse cx="82" cy="84" rx="6" ry="3.5" fill="%23FFB2BA" opacity="0.4"/><path d="M52 101 Q60 107 68 101" stroke="%23D94242" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M28 55 C22 30 35 20 60 20 C85 20 98 30 92 55 C82 25 72 24 60 25 C48 24 38 25 28 55 Z" fill="%2324201E"/></svg>',
  },
];

interface FaceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFaceConfig: UserFaceConfig;
  onApplyFaceConfig: (config: UserFaceConfig) => void;
}

export const FaceUploadModal: React.FC<FaceUploadModalProps> = ({
  isOpen,
  onClose,
  currentFaceConfig,
  onApplyFaceConfig,
}) => {
  const [faceSrc, setFaceSrc] = useState<string>(currentFaceConfig.src || '');
  const [faceName, setFaceName] = useState<string>(currentFaceConfig.name || 'Ảnh Tự Chụp');
  const [scale, setScale] = useState<number>(currentFaceConfig.scale || 1.0);
  const [offsetX, setOffsetX] = useState<number>(currentFaceConfig.offsetX || 0);
  const [offsetY, setOffsetY] = useState<number>(currentFaceConfig.offsetY || 0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFaceSrc(currentFaceConfig.src || '');
      setFaceName(currentFaceConfig.name || 'Ảnh Tự Chụp');
      setScale(currentFaceConfig.scale || 1.0);
      setOffsetX(currentFaceConfig.offsetX || 0);
      setOffsetY(currentFaceConfig.offsetY || 0);
    }
  }, [isOpen, currentFaceConfig]);

  if (!isOpen) return null;

  // Xử lý nạp file ảnh từ thiết bị
  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (PNG, JPG, WEBP)!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setFaceSrc(result);
        setFaceName(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleSelectPreset = (preset: typeof PRESET_FACES[0]) => {
    setFaceSrc(preset.src);
    setFaceName(preset.name);
    setScale(1.0);
    setOffsetX(0);
    setOffsetY(0);
  };

  const handleApply = () => {
    onApplyFaceConfig({
      enabled: Boolean(faceSrc),
      src: faceSrc,
      name: faceName || 'Gương Mặt Đã Chọn',
      scale,
      offsetX,
      offsetY,
    });
    onClose();
  };

  const handleRemoveFace = () => {
    onApplyFaceConfig(DEFAULT_FACE_CONFIG);
    setFaceSrc('');
    setFaceName('Mặc định (Người mẫu mộc)');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-surface-container-lowest text-on-surface rounded-2xl shadow-2xl border border-tertiary-fixed/30 flex flex-col p-4 sm:p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ae3022] to-[#c59b27] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[24px]">face</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-base sm:text-lg font-bold text-primary flex items-center gap-1.5">
                Cá Nhân Hóa Gương Mặt
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FAF6EE] text-[#AE3022] border border-[#c59b27]/40">
                  Gen Z Avatar
                </span>
              </h2>
              <p className="text-[11.5px] text-on-surface-variant">
                Tải ảnh khuôn mặt của bạn để thử trang phục truyền thống theo thời gian thực
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
            title="Đóng modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 py-4">
          {/* Left / Top: Interactive Oval Crop Preview Box */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center bg-[#FAF6EE] rounded-xl p-3 border border-[#c59b27]/30 shadow-inner">
            <div className="relative w-36 h-48 sm:w-40 sm:h-52 rounded-xl bg-white shadow-md border border-outline-variant/40 overflow-hidden flex items-center justify-center">
              {/* Traditional background watermark */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#C59B27_1px,transparent_1px)] [background-size:12px_12px]" />

              {/* Mannequin Silhouette Reference Frame */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                <span className="material-symbols-outlined text-[140px] text-[#1a2a44]">person</span>
              </div>

              {/* Oval Face Mount Guide */}
              <div className="relative w-28 h-36 rounded-[50%] border-2 border-dashed border-[#AE3022] overflow-hidden flex items-center justify-center shadow-sm bg-neutral-100/50">
                {faceSrc ? (
                  <img
                    src={faceSrc}
                    alt="Face Preview"
                    className="w-full h-full object-cover transition-transform duration-75 select-none"
                    style={{
                      transform: `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`,
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[36px] text-tertiary-fixed-dim">
                      add_a_photo
                    </span>
                    <span className="text-[10px] font-semibold mt-1">Chưa tải ảnh</span>
                  </div>
                )}
              </div>

              {/* Top Hat/Khăn Vấn Simulation Overlay */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 pointer-events-none z-10 px-2 py-0.5 rounded-full bg-[#1a2a44]/80 text-[#eed182] text-[8.5px] font-mono font-bold uppercase tracking-wider backdrop-blur-xs">
                Khung Thử Mũ/Khăn
              </div>
            </div>

            <span className="text-[10.5px] text-on-surface-variant font-medium mt-2 text-center">
              {faceSrc ? `Gương mặt: ${faceName}` : 'Dùng thanh trượt căn chỉnh mặt vào khung oval'}
            </span>
          </div>

          {/* Right / Controls: Upload + Adjusters + Presets */}
          <div className="sm:col-span-7 flex flex-col justify-between gap-3">
            {/* File Upload Drag & Drop Area */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer flex items-center gap-3 ${
                  isDragOver
                    ? 'border-primary bg-primary/10'
                    : 'border-outline-variant hover:border-[#c59b27] bg-surface-container-high/60 hover:bg-surface-container-high'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">upload_file</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[12px] font-bold text-primary">
                    Bấm để tải ảnh khuôn mặt hoặc selfie
                  </span>
                  <span className="text-[10px] text-on-surface-variant">
                    Hỗ trợ PNG, JPG, WEBP · Tự động cắt mặt theo tỷ lệ
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Face Presets */}
            <div>
              <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider block mb-1.5">
                Hoặc chọn mẫu nhân vật có sẵn:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_FACES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`p-1.5 rounded-lg border text-left flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      faceName === p.name
                        ? 'border-[#c59b27] bg-[#FAF6EE] shadow-xs'
                        : 'border-outline-variant/40 hover:border-outline-variant bg-surface-container-low'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-outline-variant/30 flex items-center justify-center">
                      <img src={p.src} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold text-primary leading-tight text-center">
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fine Tuning Sliders (Phóng to, Dịch chuyển X/Y) */}
            {faceSrc && (
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">zoom_in</span>
                    Phóng to / Thu nhỏ:
                  </span>
                  <span className="font-mono text-on-surface-variant font-bold">
                    {Math.round(scale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.8"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-[#ae3022] h-1.5 cursor-pointer"
                />

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-on-surface-variant">
                      <span>Ngang (X):</span>
                      <span className="font-mono">{offsetX}px</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      step="1"
                      value={offsetX}
                      onChange={(e) => setOffsetX(parseInt(e.target.value, 10))}
                      className="w-full accent-[#c59b27] h-1 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-on-surface-variant">
                      <span>Dọc (Y):</span>
                      <span className="font-mono">{offsetY}px</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      step="1"
                      value={offsetY}
                      onChange={(e) => setOffsetY(parseInt(e.target.value, 10))}
                      className="w-full accent-[#c59b27] h-1 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between gap-2">
          {currentFaceConfig.enabled ? (
            <button
              type="button"
              onClick={handleRemoveFace}
              className="py-2 px-3 rounded-lg text-error hover:bg-error-container/30 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              <span>Gỡ bỏ mặt cá nhân</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3.5 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-high text-[11.5px] font-semibold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!faceSrc}
              className="py-2 px-4 rounded-lg bg-gradient-to-r from-[#ae3022] to-[#c59b27] text-white hover:brightness-105 font-bold text-[11.5px] flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">check</span>
              <span>Áp Dụng Cho Mannequin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
