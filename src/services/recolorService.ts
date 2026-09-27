// src/services/recolorService.ts
// Lõi xử lý màu: HSL recolor giữ nguyên Lightness (nếp vải, bóng đổ),
// có thêm hệ số brightness để chỉnh đậm/nhạt độc lập với màu.

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

function hexToRgb(hex: string): RGB {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;

  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h, s, l };
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hslToRgb(h: number, s: number, l: number): RGB {
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Cache theo key "src_hex_brightness" — mỗi tổ hợp chỉ xử lý 1 lần
const recolorCache = new Map<string, string>();

export interface RecolorOptions {
  targetHex: string;
  brightness?: number; // -1..1, 0 = giữ nguyên độ sáng gốc
}

export async function recolorGarment(
  src: string,
  { targetHex, brightness = 0 }: RecolorOptions
): Promise<string> {
  const cacheKey = `${src}_${targetHex}_${brightness}`;
  const cached = recolorCache.get(cacheKey);
  if (cached) return cached;

  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const target = hexToRgb(targetHex);
  const { h: targetH, s: targetS } = rgbToHsl(target.r, target.g, target.b);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue; // bỏ qua pixel trong suốt

    const { l } = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    const adjustedL = clamp01(l + brightness);

    // Bảo toàn đường nét mực đen và hoa văn viền vẽ tay (Ink Line Preservation):
    // Với các nét vẽ viền tối (adjustedL < 0.18), giảm bão hòa để nét mực giữ độ đen đậm nguyên bản, không bị biến dạng
    // Với điểm bắt sáng cao (adjustedL > 0.92), giữ độ sáng trong trẻo tự nhiên của lụa
    let effectiveS = targetS;
    if (adjustedL < 0.18) {
      effectiveS = targetS * Math.max(0, (adjustedL - 0.03) / 0.15);
    } else if (adjustedL > 0.92) {
      effectiveS = targetS * Math.max(0, (1 - adjustedL) / 0.08);
    }

    const newColor = hslToRgb(targetH, effectiveS, adjustedL);
    data[i] = newColor.r;
    data[i + 1] = newColor.g;
    data[i + 2] = newColor.b;
  }

  ctx.putImageData(imageData, 0, 0);
  const dataUrl = canvas.toDataURL("image/png");
  recolorCache.set(cacheKey, dataUrl);
  return dataUrl;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
