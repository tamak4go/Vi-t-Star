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
  | "handheld"
  | "headwear";

export type Category = LayerId;

// Cùng mức layer 70 cho phụ kiện đeo cổ (neckwear) và đồ cầm tay (handheld)
export const LAYER_MAP: Record<LayerId, number> = {
  base:      10,
  shoes:     20,
  innerTop:  30,
  bottom:    40,
  outerTop:  50,
  belt:      60,
  neckwear:  70,
  handheld:  70,
  headwear:  80,
};

// Thứ tự hiển thị layer trong panel inspector/debug (thấp -> cao)
export const LAYER_INSPECTOR_ORDER: LayerId[] = [
  "base", "shoes", "innerTop", "bottom", "outerTop",
  "belt", "neckwear", "handheld", "headwear",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  base:     "Người mẫu",
  shoes:    "Giày / Hài",
  innerTop: "Áo trong (Yếm)",
  bottom:   "Váy / Quần",
  outerTop: "Áo ngoài",
  belt:     "Nịt lưng / Corset",
  neckwear: "Phụ kiện cổ",
  handheld: "Đồ cầm tay",
  headwear: "Mũ / Khăn",
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

// Reference & Mannequin model (1 model naked đồng nhất)
export const BASE_MANNEQUIN_ITEM: WardrobeItem = {
  id: "base-naked",
  category: "base",
  name: "Cơ thể mẫu nữ chuẩn",
  src: "/assets/base/naked.png",
  setId: "base",
  recolorable: false,
};

export const REFERENCE_FULL_SAMPLE = "/assets/reference/bo-mau-modern-y2k.png";

// ---- 4. Dữ liệu kho trang phục đầy đủ ----

export const WARDROBE_ITEMS: WardrobeItem[] = [
  BASE_MANNEQUIN_ITEM,
  {
    id: "khan-mo-qua-den",
    category: "headwear",
    name: "Khăn mỏ quạ đen tuyền",
    src: "/assets/headwear/khan-mo-qua-den.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#2a2f3b",
  },
  {
    id: "khan-van-lam",
    category: "headwear",
    name: "Khăn vấn xanh chàm lam",
    src: "/assets/headwear/khan-van-lam.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#93abc4",
  },
  {
    id: "non-quai-thao",
    category: "headwear",
    name: "Nón quai thao dệt mộc",
    src: "/assets/headwear/non-quai-thao.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#5d494e",
  },
  {
    id: "khan-van-hong-dao",
    category: "headwear",
    name: "Khăn vấn hồng đào",
    src: "/assets/headwear/khan-van-hong-dao.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#a85469",
  },
  {
    id: "tram-cai-toc-ngoc",
    category: "headwear",
    name: "Trâm cài tóc ngọc",
    src: "/assets/headwear/tram-cai-toc-ngoc.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#d6d0ac",
  },
  {
    id: "mu-beret-y2k",
    category: "headwear",
    name: "Mũ len beret Y2K xanh tím",
    src: "/assets/headwear/mu-beret-y2k.png",
    setId: "y2k-modern",
    recolorable: true,
    defaultColor: "#30396d",
  },
  {
    id: "khan-dong-luc-xam",
    category: "headwear",
    name: "Khăn đóng lục xám mộc",
    src: "/assets/headwear/khan-dong-luc-xam.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#757f76",
  },
  {
    id: "khan-trum-y2k",
    category: "headwear",
    name: "Khăn trùm Y2K nâu hồng",
    src: "/assets/headwear/khan-trum-y2k.png",
    setId: "y2k-modern",
    recolorable: true,
    defaultColor: "#b49a9c",
  },
  {
    id: "vong-co-choker-y2k",
    category: "neckwear",
    name: "Vòng cổ Choker Y2K xích bạc",
    src: "/assets/neckwear/vong-co-choker-y2k.png",
    setId: "y2k-modern",
    recolorable: false,
    defaultColor: "#9f9e9e",
  },
  {
    id: "kieng-bac-co-truyen",
    category: "neckwear",
    name: "Kiềng bạc cổ truyền trơn",
    src: "/assets/neckwear/kieng-bac-co-truyen.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: false,
    defaultColor: "#9a9999",
  },
  {
    id: "kieng-bac-ban-mong",
    category: "neckwear",
    name: "Kiềng bạc bản mỏng",
    src: "/assets/neckwear/kieng-bac-ban-mong.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: false,
    defaultColor: "#a9a8a7",
  },
  {
    id: "quat-nan-hoa-lua",
    category: "handheld",
    name: "Quạt nan lụa hoa tay trái",
    src: "/assets/handheld/quat-nan-hoa-lua.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#d5bc9c",
  },
  {
    id: "phu-kien-tay-phai",
    category: "handheld",
    name: "Dải lụa hoa tay phải",
    src: "/assets/handheld/phu-kien-tay-phai.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#a2825a",
  },
  {
    id: "dai-lua-deo-co-tay",
    category: "handheld",
    name: "Dải lụa đeo cổ tay",
    src: "/assets/handheld/dai-lua-deo-co-tay.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#a29da2",
  },
  {
    id: "ao-tu-than-do-dieu",
    category: "outerTop",
    name: "Áo tứ thân đỏ điều",
    src: "/assets/outerTop/ao-tu-than-do-dieu.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#be675f",
  },
  {
    id: "ao-tu-than-cham-lam",
    category: "outerTop",
    name: "Áo tứ thân chàm lam",
    src: "/assets/outerTop/ao-tu-than-cham-lam.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#c6d2df",
  },
  {
    id: "ao-tu-than-hong-dao",
    category: "outerTop",
    name: "Áo tứ thân hồng đào",
    src: "/assets/outerTop/ao-tu-than-hong-dao.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#e8cac5",
  },
  {
    id: "ao-tu-than-cham-dam",
    category: "outerTop",
    name: "Áo tứ thân chàm sẫm",
    src: "/assets/outerTop/ao-tu-than-cham-dam.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#263046",
  },
  {
    id: "ao-dai-tu-than-sen",
    category: "outerTop",
    name: "Áo dài tứ thân gấm sen",
    src: "/assets/outerTop/ao-dai-tu-than-sen.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#bc5a72",
  },
  {
    id: "ao-khoac-jacket-y2k",
    category: "outerTop",
    name: "Áo khoác lửng Jacket Y2K",
    src: "/assets/outerTop/ao-khoac-jacket-y2k.png",
    setId: "y2k-modern",
    recolorable: true,
    defaultColor: "#4f414b",
  },
  {
    id: "ao-yem-canh-sen",
    category: "innerTop",
    name: "Áo yếm hoa sen",
    src: "/assets/innerTop/ao-yem-canh-sen.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#b87e7c",
  },
  {
    id: "ao-yem-bach-ngoc",
    category: "innerTop",
    name: "Áo yếm bạch ngọc",
    src: "/assets/innerTop/ao-yem-bach-ngoc.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#c9c2c0",
  },
  {
    id: "ao-yem-do-tham",
    category: "innerTop",
    name: "Áo yếm đỏ thắm",
    src: "/assets/innerTop/ao-yem-do-tham.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#c43e8b",
  },
  {
    id: "ao-doi-kham-bach-ngoc",
    category: "innerTop",
    name: "Áo đối khâm cánh ngọc",
    src: "/assets/innerTop/ao-doi-kham-bach-ngoc.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#d2cfcd",
  },
  {
    id: "ao-croptop-y2k",
    category: "innerTop",
    name: "Áo croptop yếm cách tân Y2K",
    src: "/assets/innerTop/ao-croptop-y2k.png",
    setId: "y2k-modern",
    recolorable: true,
    defaultColor: "#e3dbcf",
  },
  {
    id: "nit-lung-luc-tham",
    category: "belt",
    name: "Dải nịt lưng lục thắm",
    src: "/assets/belt/nit-lung-luc-tham.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#6e9574",
  },
  {
    id: "dai-nit-eo-y2k",
    category: "belt",
    name: "Đai nịt eo Corset Y2K",
    src: "/assets/belt/dai-nit-eo-y2k.png",
    setId: "y2k-modern",
    recolorable: true,
    defaultColor: "#504e48",
  },
  {
    id: "dai-lung-vay-ngan-y2k",
    category: "belt",
    name: "Đai thắt lưng chân váy Y2K",
    src: "/assets/belt/dai-lung-vay-ngan-y2k.png",
    setId: "y2k-modern",
    recolorable: true,
    defaultColor: "#242425",
  },
  {
    id: "vay-dup-den-tuyen",
    category: "bottom",
    name: "Váy đụp đen tuyền",
    src: "/assets/bottom/vay-dup-den-tuyen.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#22201b",
  },
  {
    id: "quan-lua-bach-ngoc",
    category: "bottom",
    name: "Quần lụa bạch ngọc",
    src: "/assets/bottom/quan-lua-bach-ngoc.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#e0d7ce",
  },
  {
    id: "vay-dai-cham-lam",
    category: "bottom",
    name: "Váy dài chàm lam",
    src: "/assets/bottom/vay-dai-cham-lam.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#495f77",
  },
  {
    id: "quan-linh-to-nga",
    category: "bottom",
    name: "Quần lĩnh tơ ngà",
    src: "/assets/bottom/quan-linh-to-nga.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#e2e2db",
  },
  {
    id: "vay-linh-den-moc",
    category: "bottom",
    name: "Váy lĩnh đen mộc",
    src: "/assets/bottom/vay-linh-den-moc.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#282622",
  },
  {
    id: "vay-gam-kem",
    category: "bottom",
    name: "Váy gấm màu kem",
    src: "/assets/bottom/vay-gam-kem.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#e4dbd2",
  },
  {
    id: "quan-ong-rong-trang",
    category: "bottom",
    name: "Quần ống rộng trắng",
    src: "/assets/bottom/quan-ong-rong-trang.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#d6d6da",
  },
  {
    id: "vay-xep-ly-to-tam",
    category: "bottom",
    name: "Váy xếp ly tơ tằm",
    src: "/assets/bottom/vay-xep-ly-to-tam.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#ede7dc",
  },
  {
    id: "quan-linh-den-dai",
    category: "bottom",
    name: "Quần lĩnh đen dài",
    src: "/assets/bottom/quan-linh-den-dai.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#252525",
  },
  {
    id: "bot-cao-co-den-y2k",
    category: "shoes",
    name: "Bốt cao cổ đen Y2K",
    src: "/assets/shoes/bot-cao-co-den-y2k.png",
    setId: "y2k-modern",
    recolorable: true,
    defaultColor: "#3c323b",
  },
  {
    id: "hai-cong-den-tuyen",
    category: "shoes",
    name: "Đôi hài mũi cong đen",
    src: "/assets/shoes/hai-cong-den-tuyen.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#343332",
  },
  {
    id: "hai-gam-to-vang",
    category: "shoes",
    name: "Hài gấm tơ vàng",
    src: "/assets/shoes/hai-gam-to-vang.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#c8ab94",
  },
  {
    id: "hai-nhung-den-mong",
    category: "shoes",
    name: "Hài nhung đen mỏng",
    src: "/assets/shoes/hai-nhung-den-mong.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#282934",
  },
  {
    id: "hai-theu-hong-dao",
    category: "shoes",
    name: "Hài thêu nhung hồng đào",
    src: "/assets/shoes/hai-theu-hong-dao.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#94505f",
  },
  {
    id: "guoc-moc-quet-son",
    category: "shoes",
    name: "Guốc mộc quẹt sơn",
    src: "/assets/shoes/guoc-moc-quet-son.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#aa8669",
  },
  {
    id: "hai-gam-to-nga",
    category: "shoes",
    name: "Hài gấm tơ ngà",
    src: "/assets/shoes/hai-gam-to-nga.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#b9a798",
  },
  {
    id: "hai-nhung-canh-gian",
    category: "shoes",
    name: "Hài nhung cánh gián",
    src: "/assets/shoes/hai-nhung-canh-gian.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#5a5755",
  },
  {
    id: "hai-da-den-bong",
    category: "shoes",
    name: "Hài da đen bóng",
    src: "/assets/shoes/hai-da-den-bong.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#2c2e33",
  },
  {
    id: "hai-gam-to-vang-dam",
    category: "shoes",
    name: "Hài gấm tơ vàng sẫm",
    src: "/assets/shoes/hai-gam-to-vang-dam.png",
    setId: "ao-tu-than-kinh-bac",
    recolorable: true,
    defaultColor: "#c5a976",
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
  handheld:  true,
  headwear:  true,
};

export type BrightnessState = Record<string, number>;
export const INITIAL_BRIGHTNESS_STATE: BrightnessState = {};

// Backward compatibility types if needed
export type CategoryFilter = "all" | "outerTop" | "innerTop" | "bottom" | "belt" | "headwear" | "shoes" | "accessories";

// ---- 5. Helpers ----

export const DEFAULT_EQUIPPED_OUTFIT: EquippedOutfit = {
  base: BASE_MANNEQUIN_ITEM,
  outerTop: WARDROBE_ITEMS.find((it) => it.id === 'ao-tu-than-do-dieu'),
  innerTop: WARDROBE_ITEMS.find((it) => it.id === 'ao-yem-do-tham'),
  bottom: WARDROBE_ITEMS.find((it) => it.id === 'vay-dup-den-tuyen'),
  belt: WARDROBE_ITEMS.find((it) => it.id === 'nit-lung-luc-tham'),
  neckwear: WARDROBE_ITEMS.find((it) => it.id === 'kieng-bac-co-truyen'),
  handheld: WARDROBE_ITEMS.find((it) => it.id === 'quat-nan-hoa-lua'),
  headwear: WARDROBE_ITEMS.find((it) => it.id === 'khan-mo-qua-den'),
  shoes: WARDROBE_ITEMS.find((it) => it.id === 'hai-cong-den-tuyen'),
};

export const Y2K_EQUIPPED_OUTFIT: EquippedOutfit = {
  base: BASE_MANNEQUIN_ITEM,
  outerTop: WARDROBE_ITEMS.find((it) => it.id === 'ao-khoac-jacket-y2k'),
  innerTop: WARDROBE_ITEMS.find((it) => it.id === 'ao-croptop-y2k'),
  bottom: WARDROBE_ITEMS.find((it) => it.id === 'dai-lung-vay-ngan-y2k') || WARDROBE_ITEMS.find((it) => it.id === 'vay-linh-den-moc'),
  belt: WARDROBE_ITEMS.find((it) => it.id === 'dai-nit-eo-y2k'),
  neckwear: WARDROBE_ITEMS.find((it) => it.id === 'vong-co-choker-y2k'),
  headwear: WARDROBE_ITEMS.find((it) => it.id === 'mu-beret-y2k'),
  shoes: WARDROBE_ITEMS.find((it) => it.id === 'bot-cao-co-den-y2k'),
};

export function buildEquippedFromSet(items: WardrobeItem[]): EquippedOutfit {
  if (items === WARDROBE_ITEMS) {
    return { ...DEFAULT_EQUIPPED_OUTFIT };
  }
  const equipped: EquippedOutfit = {};
  for (const item of items) equipped[item.category] = item;
  return equipped;
}

export function sortByLayer(equipped: EquippedOutfit): WardrobeItem[] {
  return Object.values(equipped)
    .filter((item): item is WardrobeItem => Boolean(item))
    .sort((a, b) => LAYER_MAP[a.category] - LAYER_MAP[b.category]);
}

