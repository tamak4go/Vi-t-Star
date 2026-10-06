// src/data/dressroomConfig.ts
// Cấu hình hệ thống layer + recolor cho Dress Room - VietStar
// Bao gồm 11 bộ phục trang (Sample 1 Tứ Thân + 10 bộ phục trang mới từ đồ 2)

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
  bottom:    30,
  innerTop:  40,
  outerTop:  50,
  belt:      60,
  neckwear:  70,
  headwear:  80,
  handheld:  90,
};

// Thứ tự hiển thị layer trong panel inspector/debug (thấp -> cao)
export const LAYER_INSPECTOR_ORDER: LayerId[] = [
  "base", "shoes", "bottom", "innerTop", "outerTop",
  "belt", "neckwear", "headwear", "handheld",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  base:     "Người mẫu",
  shoes:    "Giày",
  innerTop: "Áo Trong",
  bottom:   "Quần / Váy",
  outerTop: "Áo Ngoài",
  belt:     "Nịt Lưng",
  neckwear: "Phụ Kiện",
  headwear: "Mũ / Khăn Đội",
  handheld: "Phụ Kiện Cầm Tay",
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

// ---- 1.1 Vùng Miền / Bối Cảnh Địa Phương Văn Hóa (Audition Tiêu Chí Địa Phương) ----
export type HeritageRegion =
  | "all"
  | "bac_bo"
  | "hue"
  | "nam_bo"
  | "tay_bac"
  | "cham_pa"
  | "duong_dai";

export interface RegionFilterOption {
  id: HeritageRegion;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
}

export const HERITAGE_REGIONS: RegionFilterOption[] = [
  { id: "all", label: "Tất Cả Địa Phương", shortLabel: "Tất Cả", icon: "public", description: "Toàn bộ kho tàng trang phục 3 miền" },
  { id: "bac_bo", label: "Bắc Bộ (Kinh Bắc)", shortLabel: "Bắc Bộ", icon: "spa", description: "Áo Tứ Thân, Yếm Đào, Nón Quai Thao, Áo Dài Sen" },
  { id: "hue", label: "Cung Đình Huế", shortLabel: "Huế", icon: "castle", description: "Áo Nhật Bình, Áo Tấc, Áo Ngũ Thân Triều Nguyễn" },
  { id: "nam_bo", label: "Nam Bộ Sông Nước", shortLabel: "Nam Bộ", icon: "sailing", description: "Áo Bà Ba, Khăn Rằn, Nón Lá, Giỏ Mây" },
  { id: "tay_bac", label: "Tây Bắc Đại Ngàn", shortLabel: "Tây Bắc", icon: "landscape", description: "Áo Cóm, Khăn Piêu Dân Tộc Thái" },
  { id: "cham_pa", label: "Duyên Hải Chăm Pa", shortLabel: "Chăm Pa", icon: "account_balance", description: "Cổ Phục Thổ Cẩm & Kiềng Bạc Tháp Cổ" },
  { id: "duong_dai", label: "Gen Z Remix", shortLabel: "Gen Z", icon: "bolt", description: "Công Sở Cổ Đứng, Y2K Streetwear Phá Cách" },
];

export function getSetRegion(setId?: string): HeritageRegion {
  if (!setId) return "duong_dai";
  if (setId === "sample1" || setId === "sample2") return "bac_bo";
  if (setId === "sample4" || setId === "sample5" || setId === "sample6") return "hue";
  if (setId === "sample3") return "nam_bo";
  if (setId === "sample7") return "tay_bac";
  if (setId === "sample8") return "cham_pa";
  if (setId === "sample9" || setId === "sample10" || setId === "sample11") return "duong_dai";
  return "duong_dai";
}


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

// ---- 3. Kiểu dữ liệu item & Preset ----

export interface WardrobeItem {
  id: string;
  category: Category;
  name: string;
  src: string;
  setId?: string;
  recolorable: boolean;   // vải trơn -> true, hoa văn/viền đa sắc -> false
  defaultColor?: string;  // hex ban đầu, dùng làm gốc tính HSL khi recolor
}

export interface OutfitPreset {
  id: string;
  setId: string;
  name: string;
  shortName: string;
  icon: string;
  referenceImg: string;
  items: string[]; // item IDs
  description?: string;
}

export type EquippedOutfit = Partial<Record<Category, WardrobeItem>>;

// Màu đang áp cho từng item recolorable, key = item.id
export type ColorState = Record<string, string>;
export const INITIAL_COLOR_STATE: ColorState = {};

// Reference & Mannequin models
export const BASE_MANNEQUIN_ITEM: WardrobeItem = {
  id: "base-naked",
  category: "base",
  name: "Cơ thể mẫu nữ chuẩn",
  src: "/assets/base/naked.png",
  setId: "base",
  recolorable: false,
};

export const BASE_MANNEQUIN_HEELS_ITEM: WardrobeItem = {
  id: "base-naked-heels",
  category: "base",
  name: "Cơ thể mẫu kiễng cao gót",
  src: "/assets/base/naked_heels.png",
  setId: "base",
  recolorable: false,
};

export const REFERENCE_FULL_SAMPLE = "/assets/reference/full-sample.png";

// ---- 4. Danh sách 11 Bộ Trang Phục Phối Sẵn (Presets) ----

export const OUTFIT_PRESETS: OutfitPreset[] = [
  {
    "id": "sample1",
    "setId": "sample1",
    "name": "Áo Tứ Thân Kinh Bắc",
    "shortName": "Tứ Thân",
    "icon": "spa",
    "referenceImg": "/assets/reference/full-sample.png",
    "description": "Trang phục dân gian Bắc Bộ với áo tứ thân cánh gián, yếm đỏ thắm và dải nịt ngũ sắc.",
    "items": [
      "sample1-giay",
      "sample1-yem",
      "sample1-vay",
      "sample1-ao",
      "sample1-nit",
      "sample1-khan"
    ]
  },
  {
    "id": "sample2",
    "setId": "sample2",
    "name": "Áo Dài Sen Truyền Thống",
    "shortName": "Áo Dài",
    "icon": "local_florist",
    "referenceImg": "/assets/reference/sample2_ao-dai_ref.png",
    "description": "Áo dài truyền thống họa tiết hoa sen thanh tao kết hợp kiềng bạc và nón lá cầm tay.",
    "items": [
      "sample2-ao",
      "sample2-quan",
      "sample2-kieng",
      "sample2-khan",
      "sample2-non",
      "sample2-hai"
    ]
  },
  {
    "id": "sample3",
    "setId": "sample3",
    "name": "Áo Bà Ba Nam Bộ",
    "shortName": "Bà Ba",
    "icon": "nature_people",
    "referenceImg": "/assets/reference/sample3_ao-ba-ba_ref.png",
    "description": "Áo bà ba hồng thắm vắt khăn rằn Nam Bộ, giỏ mây tre và hoa sứ cài tóc mộc mạc.",
    "items": [
      "sample3-ao",
      "sample3-quan",
      "sample3-hoa",
      "sample3-gio",
      "sample3-dep"
    ]
  },
  {
    "id": "sample4",
    "setId": "sample4",
    "name": "Áo Ngũ Thân Truyền Thống",
    "shortName": "Ngũ Thân",
    "icon": "temple_buddhist",
    "referenceImg": "/assets/reference/sample4_ngu-than_ref.png",
    "description": "Cổ phục ngũ thân hồng phấn đoan trang đi kèm chuỗi tràng hạt đỏ và khăn vấn cung đình.",
    "items": [
      "sample4-ao",
      "sample4-quan",
      "sample4-trang-hat",
      "sample4-khan",
      "sample4-hai"
    ]
  },
  {
    "id": "sample5",
    "setId": "sample5",
    "name": "Áo Nhật Bình Cung Đình",
    "shortName": "Nhật Bình",
    "icon": "crown",
    "referenceImg": "/assets/reference/sample5_nhat-binh_ref.png",
    "description": "Lễ phục cung đình triều Nguyễn thêu phượng hoàng kim tuyến uy nghi cùng khăn vành lam.",
    "items": [
      "sample5-ao",
      "sample5-quan",
      "sample5-khan",
      "sample5-hai"
    ]
  },
  {
    "id": "sample6",
    "setId": "sample6",
    "name": "Áo Tấc Quý Tộc Triều Nguyễn",
    "shortName": "Áo Tấc",
    "icon": "auto_awesome",
    "referenceImg": "/assets/reference/sample6_ao-tac_ref.png",
    "description": "Áo tấc thụng xanh lam vương giả triều Nguyễn với khăn đóng trâm vàng quý phái.",
    "items": [
      "sample6-ao",
      "sample6-quan",
      "sample6-khan",
      "sample6-hai"
    ]
  },
  {
    "id": "sample7",
    "setId": "sample7",
    "name": "Trang Phục Dân Tộc Thái",
    "shortName": "Dân Tộc Thái",
    "icon": "forest",
    "referenceImg": "/assets/reference/sample7_dan-toc-thai_ref.png",
    "description": "Áo Cóm trắng cúc bướm bạc, váy đen xẻ tà, dải nịt eo xà tích bạc và khăn Piêu thổ cẩm.",
    "items": [
      "sample7-ao",
      "sample7-vay",
      "sample7-nit",
      "sample7-khan",
      "sample7-dep"
    ]
  },
  {
    "id": "sample8",
    "setId": "sample8",
    "name": "Cổ Phục Chàm Hoa Văn Thổ Cẩm",
    "shortName": "Chàm Thổ Cẩm",
    "icon": "palette",
    "referenceImg": "/assets/reference/sample8_co-phuc-cham_ref.png",
    "description": "Trang phục truyền thống Chàm vạt chéo thổ cẩm, kiềng bạc chạm khắc và đai tua rua.",
    "items": [
      "sample8-ao",
      "sample8-quan",
      "sample8-kieng",
      "sample8-nit",
      "sample8-khan",
      "sample8-sandal"
    ]
  },
  {
    "id": "sample9",
    "setId": "sample9",
    "name": "Thời Trang Công Sở 1 (Chân Váy Bút Chì)",
    "shortName": "Công Sở 1",
    "icon": "work",
    "referenceImg": "/assets/reference/sample9_cong-so-1_ref.png",
    "description": "Sơ mi lụa xếp ly cổ thanh lịch, chân váy bút chì nơ eo, ví clutch bạc và giày cao gót đính đá.",
    "items": [
      "sample9-ao",
      "sample9-vay",
      "sample9-bong-tai",
      "sample9-vi",
      "sample9-giay"
    ]
  },
  {
    "id": "sample10",
    "setId": "sample10",
    "name": "Thời Trang Công Sở 2 (Sơ Mi Trắng Jean)",
    "shortName": "Công Sở 2",
    "icon": "business_center",
    "referenceImg": "/assets/reference/sample10_cong-so-2_ref.png",
    "description": "Sơ mi trắng cổ bẻ V-neck phóng khoáng sơ vin cùng quần jean skinny và giày cao gót be nude.",
    "items": [
      "sample10-ao",
      "sample10-quan",
      "sample10-giay"
    ]
  },
  {
    "id": "sample11",
    "setId": "sample11",
    "name": "Phong Cách Y2K Hiện Đại",
    "shortName": "Y2K Hiện Đại",
    "icon": "headphones",
    "referenceImg": "/assets/reference/sample11_y2k_ref.png",
    "description": "Sweater đen sao hồng phá cách, chân váy voan xếp ly, choker da xích bạc và tai nghe headphone.",
    "items": [
      "sample11-ao",
      "sample11-vay",
      "sample11-choker",
      "sample11-headphone",
      "sample11-bot"
    ]
  }
];

// ---- 5. Danh mục toàn bộ trang phục (Wardrobe Items) ----

export const WARDROBE_ITEMS: WardrobeItem[] = [
  BASE_MANNEQUIN_ITEM,
  {
    id: "sample1-giay",
    category: "shoes",
    name: "Sample 1 - Hài mộc đen",
    src: "/assets/shoes/giay.png",
    setId: "sample1",
    recolorable: true,
    defaultColor: "#2B2B2B",
  },
  {
    id: "sample1-yem",
    category: "innerTop",
    name: "Sample 1 - Áo yếm đỏ thắm",
    src: "/assets/inner/yem-do.png",
    setId: "sample1",
    recolorable: true,
    defaultColor: "#AE3022",
  },
  {
    id: "sample1-vay",
    category: "bottom",
    name: "Sample 1 - Váy đụp đen",
    src: "/assets/bottom/vay-den.png",
    setId: "sample1",
    recolorable: true,
    defaultColor: "#2B2B2B",
  },
  {
    id: "sample1-ao",
    category: "outerTop",
    name: "Sample 1 - Áo tứ thân",
    src: "/assets/outer/ao-tu-than-do.png",
    setId: "sample1",
    recolorable: true,
    defaultColor: "#5B3A29",
  },
  {
    id: "sample1-nit",
    category: "belt",
    name: "Sample 1 - Dải nịt ngũ sắc",
    src: "/assets/belt/nit-lung.png",
    setId: "sample1",
    recolorable: true,
    defaultColor: "#E3A857",
  },
  {
    id: "sample1-khan",
    category: "headwear",
    name: "Sample 1 - Khăn mỏ quạ",
    src: "/assets/headwear/khan-mo-qua.png",
    setId: "sample1",
    recolorable: true,
    defaultColor: "#1A1A1A",
  },
  {
    id: "sample2-ao",
    category: "outerTop",
    name: "Áo Dài Sen Truyền Thống - Áo dài sen truyền thống",
    src: "/assets/outerTop/sample2_ao-dai_ao.png",
    setId: "sample2",
    recolorable: false,
    defaultColor: "#E8A0A3",
  },
  {
    id: "sample2-quan",
    category: "bottom",
    name: "Áo Dài Sen Truyền Thống - Quần lụa trắng áo dài",
    src: "/assets/bottom/sample2_ao-dai_quan.png",
    setId: "sample2",
    recolorable: true,
    defaultColor: "#F2EFE6",
  },
  {
    id: "sample2-kieng",
    category: "neckwear",
    name: "Áo Dài Sen Truyền Thống - Kiềng bạc cổ điển",
    src: "/assets/neckwear/sample2_ao-dai_kieng.png",
    setId: "sample2",
    recolorable: false,
    defaultColor: "#E0E0E0",
  },
  {
    id: "sample2-khan",
    category: "headwear",
    name: "Áo Dài Sen Truyền Thống - Khăn vấn sen hồng",
    src: "/assets/headwear/sample2_ao-dai_khan.png",
    setId: "sample2",
    recolorable: false,
    defaultColor: "#E8A0A3",
  },
  {
    id: "sample2-non",
    category: "handheld",
    name: "Áo Dài Sen Truyền Thống - Nón lá cầm tay",
    src: "/assets/handheld/sample2_ao-dai_non.png",
    setId: "sample2",
    recolorable: false,
    defaultColor: "#F5DEB3",
  },
  {
    id: "sample2-hai",
    category: "shoes",
    name: "Áo Dài Sen Truyền Thống - Hài sen thêu hoa",
    src: "/assets/shoes/sample2_ao-dai_hai.png",
    setId: "sample2",
    recolorable: false,
    defaultColor: "#E8A0A3",
  },
  {
    id: "sample3-ao",
    category: "innerTop",
    name: "Áo Bà Ba Nam Bộ - Áo bà ba hồng khăn rằn",
    src: "/assets/innerTop/sample3_ao-ba-ba_ao.png",
    setId: "sample3",
    recolorable: false,
    defaultColor: "#E8A0A3",
  },
  {
    id: "sample3-quan",
    category: "bottom",
    name: "Áo Bà Ba Nam Bộ - Quần đen bà ba",
    src: "/assets/bottom/sample3_ao-ba-ba_quan.png",
    setId: "sample3",
    recolorable: true,
    defaultColor: "#2B2B2B",
  },
  {
    id: "sample3-hoa",
    category: "headwear",
    name: "Áo Bà Ba Nam Bộ - Hoa sứ cài tóc",
    src: "/assets/headwear/sample3_ao-ba-ba_hoa.png",
    setId: "sample3",
    recolorable: false,
    defaultColor: "#FFFFFF",
  },
  {
    id: "sample3-gio",
    category: "handheld",
    name: "Áo Bà Ba Nam Bộ - Giỏ mây Nam Bộ",
    src: "/assets/handheld/sample3_ao-ba-ba_gio.png",
    setId: "sample3",
    recolorable: false,
    defaultColor: "#D2B48C",
  },
  {
    id: "sample3-dep",
    category: "shoes",
    name: "Áo Bà Ba Nam Bộ - Dép mộc quai nâu",
    src: "/assets/shoes/sample3_ao-ba-ba_dep.png",
    setId: "sample3",
    recolorable: false,
    defaultColor: "#5B3A29",
  },
  {
    id: "sample4-ao",
    category: "outerTop",
    name: "Áo Ngũ Thân Truyền Thống - Áo ngũ thân hồng phấn",
    src: "/assets/outerTop/sample4_ngu-than_ao.png",
    setId: "sample4",
    recolorable: true,
    defaultColor: "#E8A0A3",
  },
  {
    id: "sample4-quan",
    category: "bottom",
    name: "Áo Ngũ Thân Truyền Thống - Quần lụa trắng ngũ thân",
    src: "/assets/bottom/sample4_ngu-than_quan.png",
    setId: "sample4",
    recolorable: true,
    defaultColor: "#F2EFE6",
  },
  {
    id: "sample4-trang-hat",
    category: "neckwear",
    name: "Áo Ngũ Thân Truyền Thống - Chuỗi tràng hạt đỏ",
    src: "/assets/neckwear/sample4_ngu-than_trang-hat.png",
    setId: "sample4",
    recolorable: false,
    defaultColor: "#AE3022",
  },
  {
    id: "sample4-khan",
    category: "headwear",
    name: "Áo Ngũ Thân Truyền Thống - Khăn vấn ngũ thân",
    src: "/assets/headwear/sample4_ngu-than_khan.png",
    setId: "sample4",
    recolorable: true,
    defaultColor: "#2B2B2B",
  },
  {
    id: "sample4-hai",
    category: "shoes",
    name: "Áo Ngũ Thân Truyền Thống - Hài cong ngũ thân",
    src: "/assets/shoes/sample4_ngu-than_hai.png",
    setId: "sample4",
    recolorable: true,
    defaultColor: "#2B2B2B",
  },
  {
    id: "sample5-ao",
    category: "outerTop",
    name: "Áo Nhật Bình Cung Đình - Áo Nhật bình cam thêu phượng",
    src: "/assets/outerTop/sample5_nhat-binh_ao.png",
    setId: "sample5",
    recolorable: false,
    defaultColor: "#E3A857",
  },
  {
    id: "sample5-quan",
    category: "bottom",
    name: "Áo Nhật Bình Cung Đình - Quần lụa trắng Nhật bình",
    src: "/assets/bottom/sample5_nhat-binh_quan.png",
    setId: "sample5",
    recolorable: true,
    defaultColor: "#F2EFE6",
  },
  {
    id: "sample5-khan",
    category: "headwear",
    name: "Áo Nhật Bình Cung Đình - Khăn vành lam cung đình",
    src: "/assets/headwear/sample5_nhat-binh_khan.png",
    setId: "sample5",
    recolorable: false,
    defaultColor: "#2F4B6E",
  },
  {
    id: "sample5-hai",
    category: "shoes",
    name: "Áo Nhật Bình Cung Đình - Hài phượng hoàng kim tuyến",
    src: "/assets/shoes/sample5_nhat-binh_hai.png",
    setId: "sample5",
    recolorable: false,
    defaultColor: "#E3A857",
  },
  {
    id: "sample6-ao",
    category: "outerTop",
    name: "Áo Tấc Quý Tộc Triều Nguyễn - Áo tấc thụng xanh lam",
    src: "/assets/outerTop/sample6_ao-tac_ao.png",
    setId: "sample6",
    recolorable: true,
    defaultColor: "#2F4B6E",
  },
  {
    id: "sample6-quan",
    category: "bottom",
    name: "Áo Tấc Quý Tộc Triều Nguyễn - Quần lụa trắng áo tấc",
    src: "/assets/bottom/sample6_ao-tac_quan.png",
    setId: "sample6",
    recolorable: true,
    defaultColor: "#F2EFE6",
  },
  {
    id: "sample6-khan",
    category: "headwear",
    name: "Áo Tấc Quý Tộc Triều Nguyễn - Khăn đóng trâm vàng",
    src: "/assets/headwear/sample6_ao-tac_khan.png",
    setId: "sample6",
    recolorable: false,
    defaultColor: "#2F4B6E",
  },
  {
    id: "sample6-hai",
    category: "shoes",
    name: "Áo Tấc Quý Tộc Triều Nguyễn - Hài nhung đen áo tấc",
    src: "/assets/shoes/sample6_ao-tac_hai.png",
    setId: "sample6",
    recolorable: true,
    defaultColor: "#2B2B2B",
  },
  {
    id: "sample7-ao",
    category: "innerTop",
    name: "Trang Phục Dân Tộc Thái - Áo Cóm trắng cúc bướm",
    src: "/assets/innerTop/sample7_dan-toc-thai_ao.png",
    setId: "sample7",
    recolorable: true,
    defaultColor: "#F2EFE6",
  },
  {
    id: "sample7-vay",
    category: "bottom",
    name: "Trang Phục Dân Tộc Thái - Váy đen xẻ tà Thái",
    src: "/assets/bottom/sample7_dan-toc-thai_vay.png",
    setId: "sample7",
    recolorable: true,
    defaultColor: "#2B2B2B",
  },
  {
    id: "sample7-nit",
    category: "belt",
    name: "Trang Phục Dân Tộc Thái - Dải nịt xanh + xà tích bạc",
    src: "/assets/belt/sample7_dan-toc-thai_nit.png",
    setId: "sample7",
    recolorable: false,
    defaultColor: "#2E5339",
  },
  {
    id: "sample7-khan",
    category: "headwear",
    name: "Trang Phục Dân Tộc Thái - Khăn Piêu thổ cẩm Thái",
    src: "/assets/headwear/sample7_dan-toc-thai_khan.png",
    setId: "sample7",
    recolorable: false,
    defaultColor: "#2B2B2B",
  },
  {
    id: "sample7-dep",
    category: "shoes",
    name: "Trang Phục Dân Tộc Thái - Dép be dân tộc Thái",
    src: "/assets/shoes/sample7_dan-toc-thai_dep.png",
    setId: "sample7",
    recolorable: false,
    defaultColor: "#E3A857",
  },
  {
    id: "sample8-ao",
    category: "outerTop",
    name: "Cổ Phục Chàm Hoa Văn Thổ Cẩm - Áo chàm vạt chéo thổ cẩm",
    src: "/assets/outerTop/sample8_co-phuc-cham_ao.png",
    setId: "sample8",
    recolorable: false,
    defaultColor: "#2F4B6E",
  },
  {
    id: "sample8-quan",
    category: "bottom",
    name: "Cổ Phục Chàm Hoa Văn Thổ Cẩm - Quần đen ống rộng Chàm",
    src: "/assets/bottom/sample8_co-phuc-cham_quan.png",
    setId: "sample8",
    recolorable: true,
    defaultColor: "#2B2B2B",
  },
  {
    id: "sample8-kieng",
    category: "neckwear",
    name: "Cổ Phục Chàm Hoa Văn Thổ Cẩm - Kiềng bạc Chàm chạm khắc",
    src: "/assets/neckwear/sample8_co-phuc-cham_kieng.png",
    setId: "sample8",
    recolorable: false,
    defaultColor: "#E0E0E0",
  },
  {
    id: "sample8-nit",
    category: "belt",
    name: "Cổ Phục Chàm Hoa Văn Thổ Cẩm - Đai vải thổ cẩm tua rua",
    src: "/assets/belt/sample8_co-phuc-cham_nit.png",
    setId: "sample8",
    recolorable: false,
    defaultColor: "#AE3022",
  },
  {
    id: "sample8-khan",
    category: "headwear",
    name: "Cổ Phục Chàm Hoa Văn Thổ Cẩm - Khăn vấn chàm tua rua",
    src: "/assets/headwear/sample8_co-phuc-cham_khan.png",
    setId: "sample8",
    recolorable: false,
    defaultColor: "#2F4B6E",
  },
  {
    id: "sample8-sandal",
    category: "shoes",
    name: "Cổ Phục Chàm Hoa Văn Thổ Cẩm - Sandal chiến binh Chàm",
    src: "/assets/shoes/sample8_co-phuc-cham_sandal.png",
    setId: "sample8",
    recolorable: false,
    defaultColor: "#2B2B2B",
  },
  {
    id: "sample9-ao",
    category: "innerTop",
    name: "Công Sở 1 (Chân Váy Bút Chì) - Áo sơ mi lụa cổ xếp ly",
    src: "/assets/innerTop/sample9_cong-so-1_ao.png",
    setId: "sample9",
    recolorable: true,
    defaultColor: "#F2EFE6",
  },
  {
    id: "sample9-vay",
    category: "bottom",
    name: "Công Sở 1 (Chân Váy Bút Chì) - Chân váy bút chì nơ eo",
    src: "/assets/bottom/sample9_cong-so-1_vay.png",
    setId: "sample9",
    recolorable: true,
    defaultColor: "#2B2B2B",
  },
  {
    id: "sample9-bong-tai",
    category: "neckwear",
    name: "Công Sở 1 (Chân Váy Bút Chì) - Bông tai ngọc trai",
    src: "/assets/neckwear/sample9_cong-so-1_bong-tai.png",
    setId: "sample9",
    recolorable: false,
    defaultColor: "#FFFFFF",
  },
  {
    id: "sample9-vi",
    category: "handheld",
    name: "Công Sở 1 (Chân Váy Bút Chì) - Ví clutch bạc cầm tay",
    src: "/assets/handheld/sample9_cong-so-1_vi.png",
    setId: "sample9",
    recolorable: false,
    defaultColor: "#C0C0C0",
  },
  {
    id: "sample9-giay",
    category: "shoes",
    name: "Công Sở 1 (Chân Váy Bút Chì) - Giày cao gót đen đính đá",
    src: "/assets/shoes/sample9_cong-so-1_giay.png",
    setId: "sample9",
    recolorable: false,
    defaultColor: "#2B2B2B",
  },
  {
    id: "sample10-ao",
    category: "innerTop",
    name: "Công Sở 2 (Sơ Mi Trắng Jean) - Áo sơ mi trắng cổ bẻ V-neck",
    src: "/assets/innerTop/sample10_cong-so-2_ao.png",
    setId: "sample10",
    recolorable: true,
    defaultColor: "#FFFFFF",
  },
  {
    id: "sample10-quan",
    category: "bottom",
    name: "Công Sở 2 (Sơ Mi Trắng Jean) - Quần jean skinny cạp cao",
    src: "/assets/bottom/sample10_cong-so-2_quan.png",
    setId: "sample10",
    recolorable: true,
    defaultColor: "#2F4B6E",
  },
  {
    id: "sample10-giay",
    category: "shoes",
    name: "Công Sở 2 (Sơ Mi Trắng Jean) - Giày cao gót be nude",
    src: "/assets/shoes/sample10_cong-so-2_giay.png",
    setId: "sample10",
    recolorable: false,
    defaultColor: "#E3A857",
  },
  {
    id: "sample11-ao",
    category: "outerTop",
    name: "Phong Cách Y2K Hiện Đại - Áo sweater đen sao hồng Y2K",
    src: "/assets/outerTop/sample11_y2k_ao.png",
    setId: "sample11",
    recolorable: false,
    defaultColor: "#2B2B2B",
  },
  {
    id: "sample11-vay",
    category: "bottom",
    name: "Phong Cách Y2K Hiện Đại - Chân váy voan xếp ly hồng",
    src: "/assets/bottom/sample11_y2k_vay.png",
    setId: "sample11",
    recolorable: true,
    defaultColor: "#E8A0A3",
  },
  {
    id: "sample11-choker",
    category: "neckwear",
    name: "Phong Cách Y2K Hiện Đại - Vòng cổ choker da xích bạc",
    src: "/assets/neckwear/sample11_y2k_choker.png",
    setId: "sample11",
    recolorable: false,
    defaultColor: "#2B2B2B",
  },
  {
    id: "sample11-headphone",
    category: "headwear",
    name: "Phong Cách Y2K Hiện Đại - Tai nghe headphone hồng",
    src: "/assets/headwear/sample11_y2k_headphone.png",
    setId: "sample11",
    recolorable: false,
    defaultColor: "#E8A0A3",
  },
  {
    id: "sample11-bot",
    category: "shoes",
    name: "Phong Cách Y2K Hiện Đại - Bốt đen bánh mì sao hồng",
    src: "/assets/shoes/sample11_y2k_bot.png",
    setId: "sample11",
    recolorable: false,
    defaultColor: "#2B2B2B",
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

// ---- 6. Helpers ----

export function buildEquippedFromSet(items: WardrobeItem[]): EquippedOutfit {
  const equipped: EquippedOutfit = {};
  for (const item of items) equipped[item.category] = item;
  return equipped;
}

export function buildEquippedFromPreset(presetId: string): EquippedOutfit {
  const preset = OUTFIT_PRESETS.find((p) => p.id === presetId);
  if (!preset) return { base: BASE_MANNEQUIN_ITEM };

  const equipped: EquippedOutfit = { base: BASE_MANNEQUIN_ITEM };
  const itemsMap = new Map(WARDROBE_ITEMS.map((it) => [it.id, it]));

  for (const itemId of preset.items) {
    const item = itemsMap.get(itemId);
    if (item) {
      equipped[item.category] = item;
    }
  }
  return equipped;
}

export function sortByLayer(equipped: EquippedOutfit): WardrobeItem[] {
  return Object.values(equipped)
    .filter((item): item is WardrobeItem => Boolean(item))
    .sort((a, b) => LAYER_MAP[a.category] - LAYER_MAP[b.category]);
}

// ---- 7. Stage Backdrops (Bối Cảnh Sàn Thử Sống Động) ----

export interface StageBackdrop {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  src?: string;
  occasionId?: string;
  description: string;
}

export const STAGE_BACKDROPS: StageBackdrop[] = [
  {
    id: "parchment",
    name: "Giấy Dó Truyền Thống",
    shortName: "Giấy Dó",
    icon: "📜",
    src: "",
    description: "Sàn thử mộc nền giấy dó hoàng cung tối giản (Mặc định)",
  },
  {
    id: "ky_yeu",
    name: "Kỷ Yếu Học Đường",
    shortName: "Kỷ Yếu",
    icon: "🎓",
    src: "/assets/backgrounds/bg_ky_yeu.png",
    occasionId: "ky-yeu",
    description: "Sân trường rợp bóng cây, cờ hoa kỷ yếu thanh xuân",
  },
  {
    id: "tet",
    name: "Tết & Du Xuân",
    shortName: "Du Xuân",
    icon: "🧧",
    src: "/assets/backgrounds/bg_tet.png",
    occasionId: "tet",
    description: "Phố hoa rực rỡ, lồng đèn đỏ mừng xuân đón vượng khí",
  },
  {
    id: "dinh_lang",
    name: "Lễ Hội & Đình Làng",
    shortName: "Đình Làng",
    icon: "🏮",
    src: "/assets/backgrounds/bg_dinh_lang.png",
    occasionId: "dinh-lang",
    description: "Không gian cổ kính sân đình, cờ hội ngũ sắc Kinh Bắc",
  },
  {
    id: "hy_su",
    name: "Hỷ Sự & Đám Cưới",
    shortName: "Hỷ Sự",
    icon: "💍",
    src: "/assets/backgrounds/bg_hy_su.png",
    occasionId: "dam-cuoi",
    description: "Sảnh đại tiệc cưới hoa lệ, ánh đèn hoàng gia sang trọng",
  },
  {
    id: "ca_phe",
    name: "Cà Phê Dạo Phố Gen Z",
    shortName: "Dạo Phố",
    icon: "☕",
    src: "/assets/backgrounds/bg_ca_phe.png",
    occasionId: "cafe-genz",
    description: "Quán cà phê phố thị thời thượng, phong cách dạo phố trẻ trung",
  },
  {
    id: "ngoai_giao",
    name: "Ngoại Giao & Sự Kiện",
    shortName: "Ngoại Giao",
    icon: "✨",
    src: "/assets/backgrounds/bg_ngoai_giao.png",
    occasionId: "ngoai-giao",
    description: "Hội nghị quốc tế trang trọng, dạ tiệc di sản tầm vóc",
  },
];
