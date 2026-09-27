// src/components/SnapshotModal.tsx
import React, { useState } from 'react'
import { toPng } from 'html-to-image'
import confetti from 'canvas-confetti'

interface SnapshotModalProps {
  isOpen: boolean
  onClose: () => void
  canvasRef: React.RefObject<HTMLDivElement | null>
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({
  isOpen,
  onClose,
  canvasRef,
}) => {
  const [downloading, setDownloading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Khi modal mở, chụp thử ảnh từ canvas
  React.useEffect(() => {
    if (isOpen && canvasRef.current) {
      toPng(canvasRef.current, { cacheBust: true, pixelRatio: 2 })
        .then((dataUrl) => {
          setPreviewUrl(dataUrl)
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#c59b27', '#ae3022', '#1a2a44'],
          })
        })
        .catch((err) => {
          console.error('Lỗi chụp ảnh canvas:', err)
        })
    } else {
      setPreviewUrl(null)
    }
  }, [isOpen, canvasRef])

  if (!isOpen) return null

  const handleDownload = async () => {
    if (!canvasRef.current) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(canvasRef.current, {
        cacheBust: true,
        pixelRatio: 3, // Xuất độ phân giải cao
      })
      const link = document.createElement('a')
      link.download = `viet-phuc-cac-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Lỗi tải ảnh:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#04152e]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-5 flex flex-col gap-4 border-2 border-[#c59b27] relative animate-in fade-in zoom-in-95 duration-200">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f0eee8] text-[#1c1c18] hover:bg-[#ebe8e2] flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Tiêu đề Modal */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ae3022] text-[24px]">verified</span>
          <h3 className="font-serif text-lg font-bold text-[#04152e]">
            Chứng Thư Phối Cổ Phục
          </h3>
        </div>

        {/* Khung trưng bày bản chụp */}
        <div className="w-full bg-[#fcf9f3] p-4 rounded-xl border border-[#e5e2dc] flex flex-col items-center gap-3 relative">
          <div className="w-full flex items-center justify-between text-[10px] font-serif text-[#04152e]/70 tracking-wider">
            <span>VIỆT PHỤC CÁC • DI SẢN KINH BẮC</span>
            <span>BẢN XUẤT 1:1</span>
          </div>

          <div className="w-48 aspect-[9/16] bg-white rounded-lg overflow-hidden relative shadow-md p-1 border border-[#e5e2dc] flex items-center justify-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Bản phối y phục hoàn chỉnh"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-xs text-[#75777e]">Đang xử lý hình ảnh...</span>
            )}

            {/* Dấu Triện son đỏ góc */}
            <div className="absolute bottom-2 right-2 w-7 h-7 rounded bg-[#ae3022] text-white flex flex-col items-center justify-center font-serif font-bold text-[6px] leading-tight shadow-sm border border-[#c59b27]/50">
              <span>TRIỆN</span>
              <span>CÁC</span>
            </div>
          </div>

          <div className="text-center">
            <p className="font-serif text-sm font-semibold text-[#04152e]">
              Áo Tứ Thân & Nịt Lưng Ngũ Sắc
            </p>
            <p className="text-xs text-[#5e6168] mt-0.5">
              Phục dựng theo quy thức truyền thống
            </p>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#ae3022] text-white hover:bg-[#8c170d] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>{downloading ? 'Đang Tải...' : 'Tải Ảnh Về Máy (PNG)'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-[#f0eee8] text-[#1c1c18] hover:bg-[#ebe8e2] font-medium text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
