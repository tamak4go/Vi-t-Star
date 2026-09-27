// src/data/dressroomConfig.ts
// Cấu hình hệ thống layer + recolor cho Dress Room - vietstar

// ---- 1. LayerId & Category (bước nhảy 10) ----

export type LayerId =
  | "base"
  | "shoes"
  | "innerTop"
  | "bottom"
  | "outerTop"
  | "belt"
  | "neckwear"
  | "headwear"
  | "handheld";

export type Category = LayerId;

export const LAYER_MAP: Record<LayerId, number> = {
  base:      10,
  shoes:     20,
  innerTop:  30,
  bottom:    40,
  outerTop:  50,
  belt:      60,
  neckwear:  70,
  headwear:  80,
  handheld:  90,
};

// Thứ tự hiển thị layer trong panel inspector/debug (thấp -> cao)
export const LAYER_INSPECTOR_ORDER: LayerId[] = [
  "base", "shoes", "innerTop", "bottom", "outerTop",
  "belt", "neckwear", "headwear", "handheld",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  base:     "Người mẫu",
  shoes:    "Giày",
  innerTop: "Áo trong",
  bottom:   "Váy / Quần",
  outerTop: "Áo ngoài",
  belt:     "Nịt lưng",
  neckwear: "Trang sức cổ",
  headwear: "Mũ (Khăn)",
  handheld: "Đồ cầm tay",
};

// Thứ tự ưu tiên hiển thị các Tab trên thanh điều khiển Tủ Đồ
export const WARDROBE_CATEGORIES: Category[] = [
  "outerTop",
  "innerTop",
  "bottom",
  "belt",
  "headwear",
  "shoes",
  "neckwear",
  "handheld",
  "base",
];

// ---- 2. Palette màu Việt cổ (dùng cho preset swatch) ----

export interface TraditionalColor {
  name: string;
  hex: string;
  shortName?: string;
}

export const TRADITIONAL_PALETTE: TraditionalColor[] = [
  { name: "Hồng đào",       hex: "#E8A0A3", shortName: "Hồng đào" },
  { name: "Vàng mơ",        hex: "#E3A857", shortName: "Vàng mơ" },
  { name: "Điều",           hex: "#AE3022", shortName: "Đỏ điều" },
  { name: "Chàm lam",       hex: "#2F4B6E", shortName: "Chàm lam" },
  { name: "Bạch ngọc",      hex: "#F2EFE6", shortName: "Bạch ngọc" },
  { name: "Nâu cánh gián",  hex: "#5B3A29", shortName: "Cánh gián" },
  { name: "Lục thắm",       hex: "#2E5339", shortName: "Lục thắm" },
];

// Alias tương thích
export const TRADITIONAL_COLORS = TRADITIONAL_PALETTE;

// ---- 3. Kiểu dữ liệu item ----

export interface WardrobeItem {
  id: string;
  category: Category;
  name: string;
  src: string;
  setId?: string;
  recolorable: boolean;   // vải trơn -> true, hoa văn/viền đa sắc -> false
  defaultColor?: string;  // hex ban đầu, dùng làm gốc tính HSL khi recolor
}

export type EquippedOutfit = Partial<Record<Category, WardrobeItem>>;

// Màu đang áp cho từng item recolorable, key = item.id
export type ColorState = Record<string, string>;

export const INITIAL_COLOR_STATE: ColorState = {};

// Reference & Mannequin models
export const BASE_MANNEQUIN_ITEM: WardrobeItem = {
  id: "base-naked",
  category: "base",
  name: "Cơ thể mẫu nữ",
  src: "/assets/base/naked.png",
  setId: "ao-tu-than-do",
  recolorable: false,
};

export const REFERENCE_FULL_SAMPLE = "/assets/reference/full-sample.png";

// ---- 4. Dữ liệu mẫu: bộ Áo Tứ Thân đỏ ----

export const WARDROBE_ITEMS: WardrobeItem[] = [
  BASE_MANNEQUIN_ITEM,
  {
    id: "giay", category: "shoes", name: "Đôi hài mộc đen",
    src: "/assets/shoes/giay.png", setId: "ao-tu-than-do",
    recolorable: true, defaultColor: "#2B2B2B",
  },
  {
    id: "yem-do", category: "innerTop", name: "Áo yếm đỏ thắm",
    src: "/assets/inner/yem-do.png", setId: "ao-tu-than-do",
    recolorable: true, defaultColor: "#AE3022",
  },
  {
    id: "vay-den", category: "bottom", name: "Váy đụp đen",
    src: "/assets/bottom/vay-den.png", setId: "ao-tu-than-do",
    recolorable: true, defaultColor: "#2B2B2B",
  },
  {
    id: "ao-tu-than", category: "outerTop", name: "Áo tứ thân",
    src: "/assets/outer/ao-tu-than-do.png", setId: "ao-tu-than-do",
    recolorable: true, defaultColor: "#5B3A29",
  },
  {
    id: "nit-lung", category: "belt", name: "Dải thắt lưng ngũ sắc",
    src: "/assets/belt/nit-lung.png", setId: "ao-tu-than-do",
    recolorable: true, defaultColor: "#E3A857",
  },
  {
    id: "khan-mo-qua", category: "headwear", name: "Khăn mỏ quạ",
    src: "/assets/headwear/khan-mo-qua.png", setId: "ao-tu-than-do",
    recolorable: true, defaultColor: "#1A1A1A",
  },
];

export type LayerStateMap = Record<LayerId, boolean>;

export const INITIAL_LAYER_STATE: LayerStateMap = {
  base:      true,
  shoes:     true,
  innerTop:  true,
  bottom:    true,
  outerTop:  true,
  belt:      true,
  neckwear:  true,
  headwear:  true,
  handheld:  true,
};

export type BrightnessState = Record<string, number>;
export const INITIAL_BRIGHTNESS_STATE: BrightnessState = {};

// Backward compatibility types if needed
export type CategoryFilter = "all" | "outerTop" | "innerTop" | "bottom" | "belt" | "headwear" | "shoes" | "acc";

// ---- 5. Helpers ----

export function buildEquippedFromSet(items: WardrobeItem[]): EquippedOutfit {
  const equipped: EquippedOutfit = {};
  for (const item of items) equipped[item.category] = item;
  return equipped;
}

export function sortByLayer(equipped: EquippedOutfit): WardrobeItem[] {
  return Object.values(equipped)
    .filter((item): item is WardrobeItem => Boolean(item))
    .sort((a, b) => LAYER_MAP[a.category] - LAYER_MAP[b.category]);
}
