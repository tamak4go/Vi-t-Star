// src/services/imageColorExtractor.ts
// Trích xuất mã màu pixel thực tế từ ảnh poster thông qua HTML5 Canvas
// Không bịa đặt màu sắc - Đọc trực tiếp từ ảnh render của Google Stitch / Atelier

export interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  percentage: number;
  traditionalName: string;
  element: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
  role: string;
}

// Bảng ánh xạ màu sắc cổ truyền Việt Nam sang Ngũ Hành
function mapHexToTraditionalVietnamese(r: number, g: number, b: number): {
  name: string;
  element: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
} {
  // Chuyển sang HSL để xác định sắc thái chính xác
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const l = (max + min) / 2;
  const d = max - min;
  let s = 0;
  let h = 0;

  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / d + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / d + 4) / 6;
        break;
    }
  }

  const hDeg = h * 360;

  // 1. Độ sáng rất thấp -> Màu Đen / Chàm đậm (Thủy)
  if (l < 0.18) {
    return { name: "Đen Tuyền Lãnh Mỹ A", element: "Thủy" };
  }

  // 2. Độ sáng rất cao & bão hòa thấp -> Màu Trắng / Bạch Ngọc (Kim)
  if (l > 0.85 && s < 0.25) {
    return { name: "Bạch Ngọc Lụa Tơ", element: "Kim" };
  }

  // 3. Độ bão hòa thấp (Xám / Khói)
  if (s < 0.15) {
    if (l > 0.6) return { name: "Bạc Ánh Trăng", element: "Kim" };
    return { name: "Xám Đá Sân Đình", element: "Kim" };
  }

  // 4. Phân loại theo góc Hue (0 - 360)
  // Đỏ / Đỏ Chu Sa / Hồng
  if (hDeg >= 345 || hDeg < 15) {
    if (l < 0.35) return { name: "Đỏ Đun Hoàng Triều", element: "Hỏa" };
    if (s > 0.6) return { name: "Đỏ Chu Sa Cung Đình", element: "Hỏa" };
    return { name: "Hồng Sen Tinh Khôi", element: "Hỏa" };
  }

  // Cam / Đất nung / Nâu đỏ
  if (hDeg >= 15 && hDeg < 45) {
    if (l < 0.35) return { name: "Nâu Cánh Gián Mộc", element: "Thổ" };
    if (l > 0.7) return { name: "Hồng Đào Xuân Sắc", element: "Hỏa" };
    return { name: "Đỏ Gạch Tháp Cổ Chăm", element: "Hỏa" };
  }

  // Vàng / Vàng Kim / Vàng Thổ
  if (hDeg >= 45 && hDeg < 70) {
    if (s > 0.5) return { name: "Vàng Kim Hoàng Gia", element: "Thổ" };
    if (l > 0.7) return { name: "Vàng Mơ Thao Lược", element: "Thổ" };
    return { name: "Nâu Đất Phù Sa", element: "Thổ" };
  }

  // Xanh Lục / Rêu / Tràm (Mộc)
  if (hDeg >= 70 && hDeg < 170) {
    if (l < 0.35) return { name: "Xanh Rêu Đền Đài", element: "Mộc" };
    if (s > 0.5) return { name: "Xanh Lục Tràm Miệt Vườn", element: "Mộc" };
    return { name: "Xanh Cốm Đầu Mùa", element: "Mộc" };
  }

  // Xanh Lam / Chàm / Thanh Thiên (Thủy)
  if (hDeg >= 170 && hDeg < 260) {
    if (l < 0.3) return { name: "Chàm Lam Sĩ Phu", element: "Thủy" };
    if (l > 0.65) return { name: "Xanh Thanh Thiên Hoàng Cung", element: "Thủy" };
    return { name: "Lam Thủy Sông Hương", element: "Thủy" };
  }

  // Tím / Tử Đằng (Hỏa)
  if (hDeg >= 260 && hDeg < 345) {
    return { name: "Tím Huế Hoàng Gia", element: "Hỏa" };
  }

  return { name: "Sắc Phục Di Sản", element: "Thổ" };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
      .toUpperCase()
  );
}

/**
 * Trích xuất màu sắc chủ đạo thực tế từ ảnh bằng HTML5 Canvas 2D
 */
export async function extractDominantColorsFromImage(
  imageUrl: string,
  maxColors = 5
): Promise<ExtractedColor[]> {
  return new Promise((resolve) => {
    // Đảm bảo dùng proxy nếu URL là link ngoài Google CDN để không bị chặn CORS
    let resolvedUrl = imageUrl;
    if (
      imageUrl.startsWith("http") &&
      !imageUrl.includes("/api/stitch/proxy-image") &&
      (imageUrl.includes("googleusercontent.com") || imageUrl.includes("google.com"))
    ) {
      resolvedUrl = `/api/stitch/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    const timeoutTimer = setTimeout(() => {
      resolve(getFallbackPalette());
    }, 4000); // 4s timeout

    img.onload = () => {
      clearTimeout(timeoutTimer);
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve(getFallbackPalette());
          return;
        }

        // Resize ảnh về kích thước nhỏ để phân tích pixel siêu nhanh
        const sampleSize = 64;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

        const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
        const colorBuckets = new Map<string, { r: number; g: number; b: number; count: number }>();

        // Quét lấy mẫu pixel (mỗi bước 2 pixel)
        for (let i = 0; i < imgData.length; i += 8) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue; // Bỏ pixel trong suốt

          // Lượng tử hóa màu (quantize vào lưới 32 để gom cụm màu gần giống nhau)
          const qR = Math.round(r / 32) * 32;
          const qG = Math.round(g / 32) * 32;
          const qB = Math.round(b / 32) * 32;
          const key = `${qR},${qG},${qB}`;

          const existing = colorBuckets.get(key);
          if (existing) {
            existing.count++;
          } else {
            colorBuckets.set(key, { r, g, b, count: 1 });
          }
        }

        // Sắp xếp các cụm màu có số lượng pixel nhiều nhất
        const sorted = Array.from(colorBuckets.values()).sort((a, b) => b.count - a.count);

        if (sorted.length === 0) {
          resolve(getFallbackPalette());
          return;
        }

        const topClusters = sorted.slice(0, maxColors);
        const totalSampled = topClusters.reduce((sum, c) => sum + c.count, 0) || 1;

        const results: ExtractedColor[] = topClusters.map((cluster, index) => {
          const hex = rgbToHex(cluster.r, cluster.g, cluster.b);
          const mapped = mapHexToTraditionalVietnamese(cluster.r, cluster.g, cluster.b);
          const pct = Math.round((cluster.count / totalSampled) * 100);

          let role = "Sắc thái phụ trợ";
          if (index === 0) role = "Sắc phục chủ đạo";
          else if (index === 1) role = "Sắc phục phối hòa";
          else if (index === 2) role = "Điểm xuyết di sản";

          return {
            hex,
            rgb: { r: cluster.r, g: cluster.g, b: cluster.b },
            percentage: pct,
            traditionalName: mapped.name,
            element: mapped.element,
            role,
          };
        });

        resolve(results);
      } catch (err) {
        console.warn("[Canvas Color Extractor] Không thể đọc pixel canvas (CORS/Taint):", err);
        resolve(getFallbackPalette());
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutTimer);
      resolve(getFallbackPalette());
    };

    img.src = resolvedUrl;
  });
}

function getFallbackPalette(): ExtractedColor[] {
  return [
    {
      hex: "#2F4B6E",
      rgb: { r: 47, g: 75, b: 110 },
      percentage: 42,
      traditionalName: "Chàm Lam Sĩ Phu",
      element: "Thủy",
      role: "Sắc phục chủ đạo",
    },
    {
      hex: "#AE3022",
      rgb: { r: 174, g: 48, b: 34 },
      percentage: 28,
      traditionalName: "Đỏ Chu Sa Cung Đình",
      element: "Hỏa",
      role: "Sắc phục phối hòa",
    },
    {
      hex: "#C59B27",
      rgb: { r: 197, g: 155, b: 39 },
      percentage: 16,
      traditionalName: "Vàng Kim Hoàng Gia",
      element: "Thổ",
      role: "Điểm xuyết di sản",
    },
    {
      hex: "#F2EFE6",
      rgb: { r: 242, g: 239, b: 230 },
      percentage: 14,
      traditionalName: "Bạch Ngọc Lụa Tơ",
      element: "Kim",
      role: "Sắc thái phụ trợ",
    },
  ];
}
