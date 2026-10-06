// src/services/posterAnalysisService.ts
// Bộ dịch vụ AI Phân Tích Di Sản & Chú Thích Toàn Diện cho Poster Thời Trang Sinh Bởi AI (Google Stitch)
// Tích hợp 100% các tính năng của Dressroom vào Poster:
// 1. Bảo chứng chuẩn mực văn hóa (Cultural Authenticity Guard & Score)
// 2. Định danh vùng miền & Triều đại lịch sử (Heritage Region & Era)
// 3. Phân tích ngũ hành & Bảng màu sắc tương sinh (Color Harmony)
// 4. Bối cảnh sự kiện & Thời tiết phù hợp (Occasion Fit)
// 5. Hệ thống điểm ghim & chú thích tương tác (Interactive Hotspot Pins)
// 6. Liên kết ngược sàn thử đồ (Apply to Dressroom Mannequin)

import {
  type EquippedOutfit,
  type ColorState,
  type OutfitPreset,
  type HeritageRegion,
  OUTFIT_PRESETS,
  HERITAGE_REGIONS,
} from "../data/dressroomConfig";
import {
  type CulturalAuthenticityAssessment,
  type ColorHarmonyResult,
  checkCulturalAuthenticity,
  evaluateColorHarmony,
} from "./culturalKnowledgeService";
import { STYLING_OCCASIONS } from "./aiStylistService";

export interface PosterHotspot {
  id: string;
  number: number;
  title: string;
  category: "top" | "bottom" | "headwear" | "neckwear" | "shoes" | "accessories" | "remix" | "setting";
  categoryLabel: string;
  x: number; // Tọa độ ngang (%)
  y: number; // Tọa độ dọc (%)
  era: string; // Niên đại lịch sử
  meaning: string; // Ý nghĩa biểu tượng ngũ thường & triết lý
  etiquette: string; // Quy chuẩn mặc đúng thuần phong mỹ tục
  genZRemix: string; // Gợi ý phối đồ cho thế hệ Z
  tags: string[];
}

export interface PosterPaletteColor {
  hex: string;
  name: string;
  element: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
  role: string; // Màu chủ đạo, màu nhấn, màu viền...
}

export interface PosterCulturalAnalysis {
  posterId: string;
  title: string;
  detectedAttireName: string;
  era: string;
  region: {
    id: HeritageRegion;
    name: string;
    icon: string;
    description: string;
  };
  authenticity: CulturalAuthenticityAssessment;
  colorHarmony: ColorHarmonyResult & {
    palette: PosterPaletteColor[];
  };
  occasionFit: {
    id: string;
    name: string;
    icon: string;
    score: number;
    fitVerdict: string;
    advice: string;
  };
  hotspots: PosterHotspot[];
  historicalStory: string;
  symbolismDetail: string;
  etiquetteRules: string[];
  genZRemixTips: string[];
  suggestedPreset: {
    preset: OutfitPreset;
    colors: Record<string, string>;
  } | null;
}

// Bảng từ điển trích xuất thông tin trang phục từ từ khóa Prompt hoặc Tên Poster
interface AttireArchetype {
  matchKeywords: string[];
  presetId: string;
  attireName: string;
  era: string;
  regionId: HeritageRegion;
  storyKey: string;
  defaultColors: Record<string, string>;
  palette: PosterPaletteColor[];
  hotspots: Omit<PosterHotspot, "id" | "number">[];
  historicalStory: string;
  symbolismDetail: string;
  etiquetteRules: string[];
  genZRemixTips: string[];
}

const ATTIRE_ARCHETYPES: AttireArchetype[] = [
  // 1. ÁO NHẬT BÌNH (Cung đình Huế)
  {
    matchKeywords: ["nhật bình", "nhat binh", "sample5", "hoàng gia", "cung đình", "phượng hoàng", "triều nguyễn"],
    presetId: "sample5",
    attireName: "Áo Nhật Bình Hoàng Gia Cung Đình Triều Nguyễn",
    era: "Triều Nguyễn (1802 – 1945)",
    regionId: "hue",
    storyKey: "sample5",
    defaultColors: {
      "sample5-ao": "#2F4B6E",
      "sample5-quan": "#F2EFE6",
    },
    palette: [
      { hex: "#2F4B6E", name: "Chàm Lam Hoàng Tộc", element: "Thủy", role: "Thân áo chính" },
      { hex: "#AE3022", name: "Đỏ Chu Sa Cung Đình", element: "Hỏa", role: "Dải viền ngũ hành" },
      { hex: "#C59B27", name: "Vàng Kim Hoàng Gia", element: "Thổ", role: "Chỉ thêu phượng hoàng" },
      { hex: "#F2EFE6", name: "Bạch Ngọc Lụa Ngà", element: "Kim", role: "Hạ y quần lụa" },
    ],
    hotspots: [
      {
        title: "Cổ Áo Chữ Nhật Ngũ Hành",
        category: "top",
        categoryLabel: "Phục Trang Thượng Y",
        x: 50,
        y: 28,
        era: "Triều Nguyễn (Quy chế y phục cung đình)",
        meaning: "Cổ áo khoét hình chữ nhật ghép dải viền ngũ sắc tượng trưng cho Ngũ Hành (Kim - Mộc - Thủy - Hỏa - Thổ) tuần hoàn vũ trụ.",
        etiquette: "Cài khuy đồng tâm kín đáo, giữ vạt áo thẳng thớm trang nghiêm trong các đại lễ cung đình.",
        genZRemix: "Mặc dáng cape mở cúc ngoài đầm dạ hội đen hoặc trắng tối giản tạo điểm nhấn vương giả.",
        tags: ["Cổ Nhật Bình", "Ngũ Hành", "Triều Nguyễn"],
      },
      {
        title: "Khăn Vành Dây Hoàng Tộc",
        category: "headwear",
        categoryLabel: "Mũ Nón Hoàng Gia",
        x: 50,
        y: 12,
        era: "Thời Vua Khải Định - Bảo Đại",
        meaning: "Dải lụa xanh hoặc tím vấn chặt nhiều vòng tượng trưng cho tầng mây nâng đỡ vầng thái dương.",
        etiquette: "Đội thẳng tâm trán, không để xô lệch khi thực hiện nghi lễ bái kiến.",
        genZRemix: "Thay thế bằng kẹp tóc ngọc trai hoặc băng đô nhung trơn trong các bộ ảnh phong cách đương đại.",
        tags: ["Khăn Vành", "Hoàng Gia"],
      },
      {
        title: "Thêu Phượng Hoàng & Thủy Ba",
        category: "top",
        categoryLabel: "Hoa Văn Di Sản",
        x: 42,
        y: 42,
        era: "Thế kỷ 19",
        meaning: "Phượng hoàng tượng trưng cho đức hạnh Mẫu nghi thiên hạ; sóng nước thủy ba tượng trưng cho non sông thái bình.",
        etiquette: "Hoa văn thêu tay tinh xảo bằng chỉ ngũ sắc và kim tuyến, thể hiện đẳng cấp tôn quý.",
        genZRemix: "Chụp ảnh cận cảnh (macro) tôn vinh chi tiết thủ công truyền thống.",
        tags: ["Phượng Hoàng", "Thủy Ba"],
      },
      {
        title: "Quần Lụa Dài Quét Gót (Bạch Ngọc)",
        category: "bottom",
        categoryLabel: "Hạ Y Đoan Trang",
        x: 50,
        y: 74,
        era: "Quy chuẩn y phục triều Nguyễn",
        meaning: "Màu trắng tinh khiết tượng trưng cho sự thanh liêm, bao bọc toàn vẹn đôi chân.",
        etiquette: "Bắt buộc mặc phủ kín mắt cá chân, ống quần rộng khoan thai khi di chuyển.",
        genZRemix: "Phối cùng quần lụa cạp cao ống suông hiện đại với giày cao gót mũi nhọn.",
        tags: ["Quần Lụa", "Đoan Trang"],
      },
      {
        title: "Hài Nhung Thêu Chỉ Vàng",
        category: "shoes",
        categoryLabel: "Hài Cung Đình",
        x: 50,
        y: 91,
        era: "Triều Nguyễn",
        meaning: "Hài nhung êm ái, mũi hài uốn cong nhẹ nhàng mang ý nghĩa nâng bước phúc lộc.",
        etiquette: "Đi bước chậm rãi khoan thai, giữ phong thái đài các.",
        genZRemix: "Có thể thay bằng guốc mộc sơn mài hoặc giày mules tối giản.",
        tags: ["Hài Nhung", "Thêu Kim Tuyến"],
      },
    ],
    historicalStory:
      "Áo Nhật Bình là đệ nhất lễ phục triều Nguyễn (1802–1945), dành riêng cho Hoàng thái hậu, Hoàng hậu, Công chúa và Cung tần trong các ngày khánh tiết, tiếp sứ và tế lễ Tông miếu. Tên gọi 'Nhật Bình' bắt nguồn từ dải cổ áo lớn hình chữ nhật ghép dải viền ngũ sắc buông thẳng trước ngực.",
    symbolismDetail:
      "Ngũ sắc viền cổ đại diện cho Ngũ Luân và Ngũ Thường. Hoa văn chim phượng ngậm hoa mẫu đơn và sóng nước thủy ba tam sơn biểu trưng cho sự che chở bao la và phúc trạch non sông bền vững.",
    etiquetteRules: [
      "Bắt buộc mặc cùng quần lụa trắng dài phủ mắt cá chân, tuyệt đối không mặc hở hạ y.",
      "Đi cùng khăn vành dây hoặc tóc vấn trâm ngọc, giữ thần thái trang trọng, tự tin.",
      "Phù hợp tuyệt đối cho không gian Cung Đình Huế, Hỷ sự truyền thống và Ngoại giao văn hóa.",
    ],
    genZRemixTips: [
      "Khoác ngoài dáng kimono/cape trên nền váy maxi lụa tơ sống đen.",
      "Đeo hoa tai bạc hoa sen tối giản, trang điểm môi đỏ nhung cổ điển.",
    ],
  },

  // 2. ÁO TẤC (ÁO THỤNG CUNG ĐÌNH)
  {
    matchKeywords: ["áo tấc", "ao tac", "áo thụng", "sample6", "lễ phục", "khăn đóng"],
    presetId: "sample6",
    attireName: "Áo Tấc (Áo Thụng) Cung Đình Triều Nguyễn",
    era: "Triều Nguyễn (1802 – 1945)",
    regionId: "hue",
    storyKey: "sample6",
    defaultColors: {
      "sample6-ao": "#1E3A5F",
      "sample6-quan": "#F2EFE6",
    },
    palette: [
      { hex: "#1E3A5F", name: "Xanh Thanh Thiên Hoàng Gia", element: "Thủy", role: "Thân áo thụng" },
      { hex: "#C59B27", name: "Vàng Kim Cúc Áo", element: "Thổ", role: "Ngũ cúc cài cổ" },
      { hex: "#F2EFE6", name: "Bạch Ngọc Lụa Trắng", element: "Kim", role: "Quần lụa dài" },
      { hex: "#2B2B2B", name: "Đen Tuyền Khăn Đóng", element: "Thủy", role: "Khăn đóng đội đầu" },
    ],
    hotspots: [
      {
        title: "Tay Áo Thụng Dài Một Tấc",
        category: "top",
        categoryLabel: "Đặc Trưng Phom Dáng",
        x: 30,
        y: 44,
        era: "Triều Nguyễn",
        meaning: "Ống tay áo thụng rộng rủ xuống hơn một tấc (4cm) quá đầu ngón tay, tượng trưng cho phong thái khiêm nhường, hòa nhã.",
        etiquette: "Khi chắp tay bái lễ, hai tay thu gọn trong tà áo tạo vẻ tôn nghiêm tuyệt đối.",
        genZRemix: "Chụp ảnh góc nghiêng tạo vạt tay bay tự nhiên trong gió chiều Cố đô.",
        tags: ["Tay Thụng", "Khoan Thai"],
      },
      {
        title: "Khăn Đóng / Khăn Xếp Đen Tuyền",
        category: "headwear",
        categoryLabel: "Phụ Kiện Đầu",
        x: 50,
        y: 11,
        era: "Cổ truyền Việt Nam",
        meaning: "Khăn xếp quấn hình chữ Nhân hoặc chữ Nhất, nhắc nhở người mặc sống chính trực và giữ vững cốt cách.",
        etiquette: "Đội cân đối đỉnh đầu, tóc mai chải gọn gàng.",
        genZRemix: "Có thể kết hợp với kính mắt tròn retro kim loại để tạo diện mạo tri thức nho nhã.",
        tags: ["Khăn Đóng", "Chính Trực"],
      },
      {
        title: "Cổ Đứng Cài 5 Khuy Ngũ Thường",
        category: "top",
        categoryLabel: "Chi Tiết Cổ Áo",
        x: 50,
        y: 26,
        era: "Định chế thời Nguyễn",
        meaning: "5 cúc áo cài kín đại diện cho Ngũ Thường: Nhân, Lễ, Nghĩa, Trí, Tín.",
        etiquette: "Cài kín cúc cổ khi vào chốn đền chùa, lễ gia tiên.",
        genZRemix: "Có thể mở cúc trên cùng khi chụp ảnh ngoại cảnh dạo phố thoải mái.",
        tags: ["Ngũ Thường", "Cổ Đứng"],
      },
      {
        title: "Quần Lụa Trắng Dáng Suông",
        category: "bottom",
        categoryLabel: "Hạ Y Truyền Thống",
        x: 50,
        y: 72,
        era: "Triều Nguyễn",
        meaning: "Dáng quần suông thẳng đứng, tôn lên bước đi vững chãi khoan thai.",
        etiquette: "Ống quần không bó sát, tạo độ phồng rủ tự nhiên của tơ lụa.",
        genZRemix: "Chất liệu lụa satin mờ hoặc lụa đũi tạo cảm giác thanh thoát dễ chịu.",
        tags: ["Quần Suông", "Bạch Ngọc"],
      },
    ],
    historicalStory:
      "Áo Tấc (còn gọi là Áo Thụng) là lễ phục phổ biến bậc nhất thời Nguyễn từ hàng quan lại đến sĩ phu thứ dân. Mặc trong các dịp đại lễ, cúng tế tổ tiên, lễ cưới và yết kiến đấng bề trên.",
    symbolismDetail:
      "Tay áo thụng dài thể hiện đức tính không vội vàng, thận trọng trong từng lời ăn tiếng nói và cử chỉ hành lễ.",
    etiquetteRules: [
      "Mặc cùng quần dài và khăn đóng để tạo dáng người đĩnh đạc.",
      "Thích hợp các buổi kỷ yếu chụp ảnh lưu niệm thời trang di sản và ngày cưới truyền thống.",
    ],
    genZRemixTips: [
      "Tông màu xanh lam đậm hoặc xanh cổ vịt rất nịnh da trong ảnh studio thời trang.",
      "Mang kính gọng kim loại thanh mảnh tạo phong cách giáo sư thanh xuân.",
    ],
  },

  // 3. ÁO DÀI TRUYỀN THỐNG (Hoa sen & Kiềng bạc)
  {
    matchKeywords: ["áo dài", "ao dai", "sample2", "hoa sen", "kiềng bạc", "kỷ yếu", "quốc phục"],
    presetId: "sample2",
    attireName: "Áo Dài Hoa Sen & Kiềng Bạc Quốc Phục",
    era: "Thế kỷ 18 đến Hiện Đại (Quốc Phục Việt Nam)",
    regionId: "bac_bo",
    storyKey: "sample2",
    defaultColors: {
      "sample2-ao": "#AE3022",
      "sample2-quan": "#F2EFE6",
    },
    palette: [
      { hex: "#AE3022", name: "Đỏ Điều May Mắn", element: "Hỏa", role: "Tà áo dài chính" },
      { hex: "#F2EFE6", name: "Bạch Ngọc Tơ Tằm", element: "Kim", role: "Quần lụa dài" },
      { hex: "#E8A0A3", name: "Hồng Sen Tinh Khôi", element: "Hỏa", role: "Họa tiết hoa sen" },
      { hex: "#D6D1CD", name: "Bạc Ánh Trăng", element: "Kim", role: "Kiềng bạc đeo cổ" },
    ],
    hotspots: [
      {
        title: "Hai Tà Áo Dài Tha Thướt",
        category: "top",
        categoryLabel: "Biểu Tượng Quốc Phục",
        x: 48,
        y: 45,
        era: "Di sản thế kỷ 18 đến nay",
        meaning: "Hai tà trước sau buông rủ thướt tha, tượng trưng cho nét đẹp vẹn toàn, đoan trang và nhu mì của người phụ nữ Việt.",
        etiquette: "Tà áo phẳng phiu, bước đi nhịp nhàng giữ cho tà áo bay nhẹ nhàng tự nhiên.",
        genZRemix: "Phối cùng giày sneaker trắng năng động trong các bộ ảnh kỷ yếu học đường năng động.",
        tags: ["Áo Dài", "Quốc Phục", "Tha Thướt"],
      },
      {
        title: "Kiềng Bạc Chạm Khắc Hoa Sen",
        category: "neckwear",
        categoryLabel: "Trang Sức Cổ Truyền",
        x: 50,
        y: 24,
        era: "Văn hóa trang sức cưới Việt",
        meaning: "Vòng tròn bạc tượng trưng cho sự viên mãn trọn vẹn; hoa sen đại diện cho sự thanh cao thuần khiết.",
        etiquette: "Đeo ôm sát chân cổ áo, mặt chạm hoa sen hướng về phía trước.",
        genZRemix: "Dùng như một món phụ kiện Statement Jewelry nổi bật trên trang phục tối giản.",
        tags: ["Kiềng Bạc", "Hoa Sen"],
      },
      {
        title: "Nón Lá Thanh Trúc 16 Nan",
        category: "headwear",
        categoryLabel: "Vật Phẩm Cầm Tay",
        x: 68,
        y: 35,
        era: "Làng Chuông / Huế cổ truyền",
        meaning: "16 nan tre đồng tâm tượng trưng cho lứa tuổi trăng tròn xuân sắc; e ấp nụ cười duyên dáng.",
        etiquette: "Cầm nghiêng bên hông hoặc đội nhẹ che nắng sớm.",
        genZRemix: "Vẽ typography hoặc thơ ngắn lên vành nón tạo nét độc bản cho kỷ yếu.",
        tags: ["Nón Lá", "Thanh Trúc"],
      },
      {
        title: "Quần Lụa Trắng Ống Rộng",
        category: "bottom",
        categoryLabel: "Hạ Y Truyền Thống",
        x: 50,
        y: 78,
        era: "Quy chuẩn Áo Dài",
        meaning: "Chất liệu lụa dệt mềm mại, giúp cử động thoải mái và giữ dáng đứng thanh tao.",
        etiquette: "Độ dài chạm mu bàn chân, giấu khéo gót giày bên trong.",
        genZRemix: "Có thể thay bằng quần lụa màu pastel (hồng đào, xanh ngọc) tạo điểm nhấn tương phản dịu mắt.",
        tags: ["Lụa Hà Đông", "Thanh Tao"],
      },
    ],
    historicalStory:
      "Áo Dài là quốc phục biểu tượng trường tồn của người Việt, kế thừa tinh hoa từ áo ngũ thân thế kỷ 18 qua các cuộc cách tân Le Mur, Lê Phổ đến hiện đại. Tà áo ôm khít phần thân trên rồi xẻ tà buông tự do từ eo xuống mắt cá.",
    symbolismDetail:
      "Tà áo kín đáo nhưng tôn vinh trọn vẹn đường cong tự nhiên. Hoa sen thêu tay tượng trưng cho khí chất 'Gần bùn mà chẳng hôi tanh mùi bùn'.",
    etiquetteRules: [
      "Luôn mặc cùng quần dài lụa ống suông, không mặc với quần bó ngắn.",
      "Tư thế đứng thẳng lưng, hai tay khép nhẹ trước bụng hoặc cầm nón lá duyên dáng.",
    ],
    genZRemixTips: [
      "Kính râm gọng mắt mèo kết hợp áo dài tạo nên phong cách retro chic ấn tượng.",
      "Túi xách mây tre đan mini thay thế túi xách da công nghiệp.",
    ],
  },

  // 4. ÁO TỨ THÂN & YẾM ĐÀO (Bắc Bộ Kinh Bắc)
  {
    matchKeywords: ["tứ thân", "tu than", "yếm", "yem", "sample1", "kinh bắc", "quan họ", "váy đụp", "nón quai thao"],
    presetId: "sample1",
    attireName: "Áo Tứ Thân & Yếm Đào Hội Làng Kinh Bắc",
    era: "Thế kỷ 12 – Đầu thế kỷ 20 (Đồng bằng Bắc Bộ)",
    regionId: "bac_bo",
    storyKey: "sample1",
    defaultColors: {
      "sample1-ao": "#5B3A29",
      "sample1-yem": "#AE3022",
      "sample1-vay": "#1A1A1A",
    },
    palette: [
      { hex: "#AE3022", name: "Đỏ Thắm Yếm Đào", element: "Hỏa", role: "Áo yếm lót trong" },
      { hex: "#5B3A29", name: "Nâu Cánh Gián Mộc", element: "Thổ", role: "Tà áo tứ thân ngoài" },
      { hex: "#1A1A1A", name: "Đen Tuyển Váy Đụp", element: "Thủy", role: "Hạ y chân váy" },
      { hex: "#E3A857", name: "Vàng Rơm Thắt Lưng", element: "Thổ", role: "Dải nịt ngũ sắc" },
    ],
    hotspots: [
      {
        title: "Áo Yếm Cổ Truyền (Yếm Đào)",
        category: "top",
        categoryLabel: "Nội Y Dân Gian",
        x: 50,
        y: 30,
        era: "Cổ xưa",
        meaning: "Hình quả trám ôm khít tôn vinh bờ vai thon thả và cổ kiêu ba ngấn của phụ nữ Kinh Bắc.",
        etiquette: "Mặc lót bên trong áo tứ thân; khi ra chốn đông người luôn khoác áo ngoài tề chỉnh.",
        genZRemix: "Mặc độc lập cùng chân váy lụa suông cạp cao trong các không gian nghệ thuật mùa hè.",
        tags: ["Yếm Đào", "Kinh Bắc"],
      },
      {
        title: "Bốn Vạt Áo Tứ Thân",
        category: "top",
        categoryLabel: "Phục Trang Ngoài",
        x: 42,
        y: 48,
        era: "Thế kỷ 12-20",
        meaning: "Bốn vạt áo tượng trưng cho tứ thân phụ mẫu (cha mẹ mình và cha mẹ chồng). Hai vạt trước buộc chéo tượng trưng cho tình nghĩa phu thê son sắt.",
        etiquette: "Vạt áo nhuộm màu củ nâu mộc mạc, thể hiện sự giản dị khiêm nhường.",
        genZRemix: "Dùng làm áo khoác cardigan duster dài ngoài đầm suông tối giản.",
        tags: ["Tứ Thân", "Tứ Thân Phụ Mẫu"],
      },
      {
        title: "Váy Đụp Đen Dân Gian",
        category: "bottom",
        categoryLabel: "Hạ Y Truyền Thống",
        x: 50,
        y: 75,
        era: "Bắc Bộ dân gian",
        meaning: "Màu đen tuyền gắn liền với bùn non và đất mẹ, biểu tượng đức tính chịu thương chịu khó.",
        etiquette: "Độ dài ngang mắt cá chân, cạp váy cuốn chặt bằng dải lưng lụa.",
        genZRemix: "Chuyển thể thành chân váy maxi xòe xếp ly vải đũi thô dạo phố.",
        tags: ["Váy Đụp", "Đất Mẹ"],
      },
      {
        title: "Dải Nịt Lụa Ngũ Sắc",
        category: "accessories",
        categoryLabel: "Thắt Lưng",
        x: 50,
        y: 52,
        era: "Lễ hội dân gian",
        meaning: "Năm sắc màu đại diện ngũ hành tuần hoàn, cầu chúc may mắn bình an.",
        etiquette: "Thắt hờ ngang eo, để dải lụa buông rủ nhịp nhàng.",
        genZRemix: "Dùng làm thắt lưng obi cách tân trên áo sơ mi trắng oversize.",
        tags: ["Dải Nịt", "Ngũ Sắc"],
      },
    ],
    historicalStory:
      "Áo Tứ Thân là trang phục tiêu biểu của phụ nữ Bắc Bộ xưa, gắn liền với các làn điệu Dân ca Quan họ Kinh Bắc và trẩy hội Chùa Hương. Bốn vạt áo buông rủ mang triết lý hiếu nghĩa sâu sắc.",
    symbolismDetail:
      "Tứ thân tượng trưng cho cha mẹ bốn bên; hai vạt buộc thắt nút biểu thị tình vợ chồng gắn bó keo sơn không rời.",
    etiquetteRules: [
      "Bắt buộc có váy đụp hoặc quần dài bảo đảm nét e ấp tế nhị.",
      "Khăn mỏ quạ và nón quai thao tôn vinh trọn vẹn nét duyên thầm thôn dã.",
    ],
    genZRemixTips: [
      "Phối yếm lụa với áo blazer hiện đại kiểu Haute Couture.",
      "Mang giày búp bê tối giản hoặc guốc mộc thanh mảnh.",
    ],
  },

  // 5. ÁO BÀ BA (Nam Bộ Sông Nước)
  {
    matchKeywords: ["bà ba", "ba ba", "sample3", "nam bộ", "sông nước", "khăn rằn", "miền tây", "guốc mộc"],
    presetId: "sample3",
    attireName: "Áo Bà Ba & Khăn Rằn Miền Tây Sông Nước",
    era: "Thế kỷ 19 đến nay (Vùng đất Phương Nam)",
    regionId: "nam_bo",
    storyKey: "sample3",
    defaultColors: {
      "sample3-ao": "#387050",
      "sample3-quan": "#1A1A1A",
    },
    palette: [
      { hex: "#387050", name: "Xanh Lục Tràm Miệt Vườn", element: "Mộc", role: "Thân áo bà ba" },
      { hex: "#1A1A1A", name: "Đen Tuyển Lụa Lãnh Mỹ A", element: "Thủy", role: "Quần lụa đen" },
      { hex: "#E5E0D8", name: "Trắng Sọc Khăn Rằn", element: "Kim", role: "Khăn rằn vắt vai" },
      { hex: "#E8A0A3", name: "Hoa Sứ Cài Tóc", element: "Hỏa", role: "Phụ kiện mái tóc" },
    ],
    hotspots: [
      {
        title: "Áo Bà Ba Xẻ Tà Phóng Khoáng",
        category: "top",
        categoryLabel: "Phục Trang Thượng Y",
        x: 50,
        y: 40,
        era: "Thế kỷ 19",
        meaning: "Cổ tròn không bâu, xẻ tà hai bên hông phóng khoáng phản ánh tính cách hào sảng, chân chất và đôn hậu của con người miền Tây.",
        etiquette: "May ôm vừa vặn, hai túi áo nhỏ phía trước tiện dụng.",
        genZRemix: "Chất liệu tơ tằm màu pastel ngọt ngào phối cùng túi cói mây tre đan.",
        tags: ["Áo Bà Ba", "Hào Sảng", "Miền Tây"],
      },
      {
        title: "Khăn Rằn Vắt Vai Nam Bộ",
        category: "accessories",
        categoryLabel: "Khăn Choàng Di Sản",
        x: 62,
        y: 32,
        era: "Văn hóa phương Nam",
        meaning: "Họa tiết sọc ca-rô trắng đen bền bỉ che nắng che mưa trong những chuyến chèo ghe dọc kênh rạch.",
        etiquette: "Vắt chéo vai hoặc quấn nhẹ quanh cổ.",
        genZRemix: "Quấn làm khăn bandana tóc hoặc buộc nơ quai túi xách hiện đại.",
        tags: ["Khăn Rằn", "Sông Nước"],
      },
      {
        title: "Quần Lụa Đen Lãnh Mỹ A",
        category: "bottom",
        categoryLabel: "Hạ Y Truyền Thống",
        x: 50,
        y: 72,
        era: "Lụa Tân Châu trứ danh",
        meaning: "Lụa dệt nhuộm mặc nưa đen tuyền bóng bẩy, mát rượi và nhanh khô khi đi sông nước.",
        etiquette: "Ống rộng suông bay nhẹ theo bước chân.",
        genZRemix: "Dùng làm quần suông lụa đen phối cùng áo croptop hè cực kỳ sành điệu.",
        tags: ["Lãnh Mỹ A", "Lụa Đen"],
      },
    ],
    historicalStory:
      "Áo Bà Ba là biểu tượng văn hóa bình dị mà kiên cường của vùng đất Nam Bộ trù phú. Thiết kế xẻ tà hai bên hông kết hợp hai túi áo tiện lợi giúp người dân thuận tiện lao động và sinh hoạt miệt vườn.",
    symbolismDetail:
      "Sự giản dị mộc mạc của chiếc áo gắn liền với sự nồng hậu, phóng khoáng 'đến chơi nhà là thành ruột thịt' của người miền Tây.",
    etiquetteRules: [
      "Đi cùng nón lá và khăn rằn tạo nên diện mạo đồng nhất tuyệt đẹp.",
      "Thích hợp các chuyến du lịch sinh thái, khám phá chợ nổi và dã ngoại ngoài trời.",
    ],
    genZRemixTips: [
      "May bằng vải tơ sống nhuộm hoa văn loang (tie-dye) độc đáo.",
      "Mang guốc mộc cao gót sơn mài thay thế dép kẹp thường ngày.",
    ],
  },

  // 6. TÂY BẮC (Đồng bào Thái - Áo Cóm & Khăn Piêu)
  {
    matchKeywords: ["tây bắc", "tay bac", "sample7", "khăn piêu", "áo cóm", "thái", "hàng cúc bướm"],
    presetId: "sample7",
    attireName: "Áo Cóm Hàng Cúc Bướm & Khăn Piêu Tây Bắc",
    era: "Văn hóa dân tộc Thái Tây Bắc",
    regionId: "tay_bac",
    storyKey: "sample7",
    defaultColors: {
      "sample7-ao": "#F2EFE6",
      "sample7-vay": "#1A1A1A",
    },
    palette: [
      { hex: "#F2EFE6", name: "Trắng Lụa Áo Cóm", element: "Kim", role: "Thân áo cóm ôm sát" },
      { hex: "#1A1A1A", name: "Đen Váy Dài Thắt Eo", element: "Thủy", role: "Váy đen chạm mắt cá" },
      { hex: "#AE3022", name: "Chỉ Đỏ Khăn Piêu", element: "Hỏa", role: "Hoa văn thổ cẩm piêu" },
      { hex: "#C59B27", name: "Bạc Bướm Hàng Khuy", element: "Kim", role: "Hàng cúc bướm búp sen" },
    ],
    hotspots: [
      {
        title: "Áo Cóm Ôm Khít Tôn Dáng",
        category: "top",
        categoryLabel: "Áo Dân Tộc Thái",
        x: 50,
        y: 35,
        era: "Cổ truyền Thái",
        meaning: "Áo may bó sát eo tôn vinh bờ eo thon 'thắt đáy lưng ong' khỏe khoắn của cô gái miền sơn cước.",
        etiquette: "Cài ngay ngắn hàng cúc bướm dọc chính giữa ngực.",
        genZRemix: "Dùng làm áo croptop ôm dáng phối cùng quần jeans cạp cao năng động.",
        tags: ["Áo Cóm", "Thắt Đáy Lưng Ong"],
      },
      {
        title: "Hàng Cúc Bướm Bằng Bạc (Hàng Khuy)",
        category: "top",
        categoryLabel: "Trang Sức Đính Kèm",
        x: 50,
        y: 28,
        era: "Nghệ thuật chạm bạc Thái",
        meaning: "Hàng cúc hình bướm, ve sầu hoặc búp sen bằng bạc chạm khắc tinh xảo, tượng trưng cho tình yêu đôi lứa thủy chung.",
        etiquette: "Hai bên hàng cúc cài khít nhau tạo đường thẳng chuẩn mực.",
        genZRemix: "Chụp ảnh cận cảnh tôn vinh nghệ thuật chạm khắc kim hoàn thủ công.",
        tags: ["Cúc Bướm", "Chạm Bạc"],
      },
      {
        title: "Khăn Piêu Thêu Chỉ Ngũ Sắc",
        category: "headwear",
        categoryLabel: "Khăn Thổ Cẩm",
        x: 50,
        y: 12,
        era: "Di sản Tây Bắc",
        meaning: "Chiếc khăn đội đầu thêu hoa văn chim rừng, cây cỏ bằng chỉ ngũ sắc, thể hiện sự khéo léo đảm đang của người con gái.",
        etiquette: "Đội nghiêng duyên dáng trên búi tóc tằng cẩu.",
        genZRemix: "Dùng làm khăn choàng vai trên áo khoác dạ mùa đông.",
        tags: ["Khăn Piêu", "Thổ Cẩm"],
      },
    ],
    historicalStory:
      "Trang phục cô gái Thái Tây Bắc với chiếc Áo Cóm duyên dáng và Khăn Piêu rực rỡ là hiện thân của vẻ đẹp núi rừng đại ngàn, vừa mộc mạc vừa uyển chuyển trong từng điệu xòe hoa.",
    symbolismDetail:
      "Hàng cúc bướm bạc biểu thị ước vọng sinh sôi nảy nở, tình yêu sắt son bền chặt.",
    etiquetteRules: [
      "Váy đen ôm dài chạm mắt cá chân, thắt lưng xanh tạo điểm nhấn eo.",
      "Thích hợp các lễ hội mừng lúa mới, du lịch Mộc Châu, Sa Pa.",
    ],
    genZRemixTips: [
      "Khăn Piêu quấn thành áo yếm cách tân hoặc khăn turban cá tính.",
      "Đi bốt da thấp cổ tạo vẻ đẹp giao thoa hiện đại vùng cao.",
    ],
  },

  // 7. DUYÊN HẢI CHĂM PA
  {
    matchKeywords: ["chăm pa", "cham pa", "sample8", "thổ cẩm chăm", "tháp cổ", "duyên hải"],
    presetId: "sample8",
    attireName: "Cổ Phục Thổ Cẩm & Kiềng Bạc Tháp Cổ Chăm Pa",
    era: "Vương quốc Chăm Pa cổ truyền (Miền Trung)",
    regionId: "cham_pa",
    storyKey: "sample8",
    defaultColors: {
      "sample8-ao": "#8C2D19",
      "sample8-vay": "#F2EFE6",
    },
    palette: [
      { hex: "#8C2D19", name: "Đỏ Đất Nung Tháp Chàm", element: "Hỏa", role: "Vải dệt thổ cẩm" },
      { hex: "#C59B27", name: "Vàng Kim Trang Sức", element: "Kim", role: "Vòng kiềng cổ tháp" },
      { hex: "#F2EFE6", name: "Bạch Ngọc Váy Dài", element: "Kim", role: "Váy lụa rủ dài" },
      { hex: "#2E5339", name: "Xanh Rêu Đền Đài", element: "Mộc", role: "Họa tiết dệt thổ cẩm" },
    ],
    hotspots: [
      {
        title: "Áo Dài Chăm Thắt Đai Thổ Cẩm",
        category: "top",
        categoryLabel: "Trang Phục Thần Nữ",
        x: 50,
        y: 40,
        era: "Văn hóa Chăm Pa cổ",
        meaning: "Áo dài chui đầu không xẻ tà ôm nhẹ cơ thể, tượng trưng cho vẻ đẹp thánh thiện của nữ thần Po Nagar.",
        etiquette: "Đeo thắt lưng thổ cẩm dệt hoa văn hình học cổ.",
        genZRemix: "Khoác ngoài như đầm tunic phóng khoáng phong cách Bohemian.",
        tags: ["Áo Dài Chăm", "Thần Nữ"],
      },
      {
        title: "Khăn Choàng Thổ Cẩm Dệt Tay",
        category: "accessories",
        categoryLabel: "Khăn Dệt Cổ",
        x: 60,
        y: 28,
        era: "Làng dệt Mỹ Nghiệp",
        meaning: "Họa tiết móc xích và hoa văn rồng thần Naga cầu mưa thuận gió hòa.",
        etiquette: "Vắt hờ qua vai phải, bước đi uyển chuyển như vũ điệu Apsara.",
        genZRemix: "Dùng làm khăn quàng cổ mùa thu phong cách nghệ thuật.",
        tags: ["Thổ Cẩm", "Mỹ Nghiệp"],
      },
    ],
    historicalStory:
      "Cổ phục phụ nữ Chăm Pa mang đậm dấu ấn kiến trúc tháp Chàm và vũ điệu cung đình Apsara huyền bí bên bờ sóng duyên hải miền Trung.",
    symbolismDetail:
      "Vải dệt thổ cẩm màu đỏ gạch nung thể hiện mối giao hòa giữa con người và vũ trụ linh thiêng.",
    etiquetteRules: [
      "Trang phục kín đáo trang nghiêm khi tham dự lễ hội Katê.",
    ],
    genZRemixTips: [
      "Kết hợp trang sức bạc to bản kiểu Bohemian hiện đại.",
    ],
  },

  // 8. GEN Z REMIX / ĐƯƠNG ĐẠI (Y2K & Streetwear)
  {
    matchKeywords: ["y2k", "gen z", "sample11", "sample9", "sample10", "croptop", "hiện đại", "streetwear", "cách tân"],
    presetId: "sample11",
    attireName: "Việt Phục Remix Đương Đại (Gen Z Fusion)",
    era: "Thế kỷ 21 (Phong cách Giới Trẻ Đương Đại)",
    regionId: "duong_dai",
    storyKey: "sample11",
    defaultColors: {
      "sample11-ao": "#2B2B2B",
      "sample11-vay": "#E8A0A3",
    },
    palette: [
      { hex: "#2B2B2B", name: "Đen Nhám Cyberpunk", element: "Thủy", role: "Áo khoác hiện đại" },
      { hex: "#E8A0A3", name: "Hồng Pastel Gen Z", element: "Hỏa", role: "Chân váy xếp ly" },
      { hex: "#AE3022", name: "Đỏ Chu Sa Cổ Truyền", element: "Hỏa", role: "Điểm nhấn hoa văn" },
      { hex: "#C59B27", name: "Vàng Đồng Phụ Kiện", element: "Kim", role: "Khuy bấm kim loại" },
    ],
    hotspots: [
      {
        title: "Áo Croptop Lấy Cảm Hứng Áo Yếm",
        category: "top",
        categoryLabel: "Phá Cách Gen Z",
        x: 50,
        y: 35,
        era: "Đương đại thế kỷ 21",
        meaning: "Giữ cấu trúc cổ yếm truyền thống nhưng cách tân bằng chất liệu dệt kim hiện đại, tạo nên diện mạo vừa hoài cổ vừa năng động.",
        etiquette: "Thích hợp dạo phố, chụp lookbook, triển lãm nghệ thuật.",
        genZRemix: "Phối cùng quần túi hộp cargo hoặc chân váy xếp ly dáng dài.",
        tags: ["Yếm Cách Tân", "Y2K", "Gen Z"],
      },
      {
        title: "Chân Váy Voan Xếp Ly Hồng",
        category: "bottom",
        categoryLabel: "Hạ Y Đương Đại",
        x: 50,
        y: 65,
        era: "Xu hướng thời trang 2026",
        meaning: "Độ xòe mềm mại mang cảm hứng tà váy đụp nhưng biến tấu ngắn năng động theo hơi thở Y2K.",
        etiquette: "Nên mang kèm quần bảo hộ bên trong khi di chuyển ngoài trời.",
        genZRemix: "Đi cùng bốt đen cổ cao hoặc tất ống chân cá tính.",
        tags: ["Chân Váy", "Xếp Ly"],
      },
      {
        title: "Vòng Cổ Choker Da & Xích Bạc",
        category: "neckwear",
        categoryLabel: "Phụ Kiện Cá Tính",
        x: 50,
        y: 22,
        era: "Đương đại",
        meaning: "Điểm nhấn hiện đại thay thế cho kiềng bạc cổ truyền, thể hiện tuyên ngôn độc lập và tự tin của Gen Z.",
        etiquette: "Đeo ôm sát cổ, tạo sự tương phản với nét mềm mại của lụa.",
        genZRemix: "Mix cùng dây chuyền bạc mảnh nhiều tầng.",
        tags: ["Choker", "Statement"],
      },
    ],
    historicalStory:
      "Việt Phục Remix là xu hướng các bạn trẻ Gen Z ứng dụng phom dáng, hoa văn hoặc chi tiết cổ phục Việt vào trang phục thường nhật, giúp di sản bước ra đời sống hiện đại một cách sống động.",
    symbolismDetail:
      "Sự dung hòa giữa tính tôn ti cổ truyền và tự do biểu đạt cá nhân của kỷ nguyên số.",
    etiquetteRules: [
      "Không mặc đồ quá ngắn khi vào chốn tâm linh, đền chùa tôn nghiêm.",
      "Tôn trọng tỉ lệ trang phục để không làm biến dạng giá trị nhận diện của cổ phục.",
    ],
    genZRemixTips: [
      "Sử dụng các gam màu đối lập như hồng pastel và đen nhung để tạo hiệu ứng thị giác mạnh mẽ.",
      "Mang tai nghe headphone làm đạo cụ chụp ảnh street style.",
    ],
  },
];

/**
 * Hàm phân tích toàn diện một bức Poster được sinh bởi AI
 */
export function analyzePosterCulturally(params: {
  posterId: string;
  posterTitle: string;
  promptText: string;
  sourceMode?: "mannequin" | "preset" | "custom";
  equippedOutfit?: EquippedOutfit;
  colorState?: ColorState;
  selectedPresetId?: string;
  customOutfitInput?: string;
  selectedOccasionId?: string;
  selectedBackgroundId?: string;
}): PosterCulturalAnalysis {
  const {
    posterId,
    posterTitle,
    promptText,
    sourceMode = "mannequin",
    equippedOutfit = {},
    colorState = {},
    selectedPresetId,
    customOutfitInput = "",
    selectedOccasionId = "tet",
  } = params;

  const combinedSearchText = `${posterTitle} ${promptText} ${customOutfitInput} ${selectedPresetId || ""}`.toLowerCase();

  // 1. Tìm Archetype phù hợp nhất dựa trên từ khóa
  let matchedArchetype = ATTIRE_ARCHETYPES[0]; // Mặc định Áo Nhật Bình

  // Nếu là nguồn từ preset cụ thể:
  if (sourceMode === "preset" && selectedPresetId) {
    const found = ATTIRE_ARCHETYPES.find((a) => a.presetId === selectedPresetId);
    if (found) matchedArchetype = found;
  } else if (sourceMode === "mannequin" && equippedOutfit) {
    // Nhận diện từ món đồ đang mặc trên Canvas
    const mainItem = equippedOutfit.outerTop || equippedOutfit.innerTop;
    if (mainItem?.setId) {
      const found = ATTIRE_ARCHETYPES.find((a) => a.presetId === mainItem.setId);
      if (found) matchedArchetype = found;
    }
  } else {
    // Quét theo từ khóa trong prompt và mô tả
    for (const arch of ATTIRE_ARCHETYPES) {
      const isMatched = arch.matchKeywords.some((kw) => combinedSearchText.includes(kw));
      if (isMatched) {
        matchedArchetype = arch;
        break;
      }
    }
  }

  // 2. Định danh Vùng Miền
  const regionOption =
    HERITAGE_REGIONS.find((r) => r.id === matchedArchetype.regionId) || HERITAGE_REGIONS[2]; // Default Cung Đình Huế

  // 3. Đánh giá tính Chuẩn Mực Văn Hóa (Cultural Authenticity Guard)
  // Nếu có equippedOutfit thì dùng checkCulturalAuthenticity thực tế, nếu không thì tự suy luận từ Archetype
  let authenticity: CulturalAuthenticityAssessment;
  if (sourceMode === "mannequin" && Object.keys(equippedOutfit).length > 1) {
    authenticity = checkCulturalAuthenticity(equippedOutfit, selectedOccasionId);
  } else {
    // Đánh giá dựa trên Archetype và prompt
    const hasModestyConflict =
      combinedSearchText.includes("không mặc quần") ||
      combinedSearchText.includes("không quần") ||
      (combinedSearchText.includes("yếm") && !combinedSearchText.includes("váy") && !combinedSearchText.includes("quần"));

    if (hasModestyConflict) {
      authenticity = {
        score: 55,
        tier: "notice",
        badgeTitle: "Cần Bổ Sung Hạ Y",
        badgeIcon: "warning",
        badgeColorClass: "bg-rose-900 text-rose-100 border border-rose-500",
        headline: "Cổ Phục Cần Đảm Bảo Hạ Y Trang Nhã",
        analysis: "Mô tả có dấu hiệu thiếu quần dài hoặc chân váy truyền thống. Cổ phục Việt luôn gắn liền với nét đoan trang kín kẽ.",
        etiquetteTips: ["Hãy mặc cùng Quần Lụa Trắng hoặc Chân Váy để đảm bảo thuần phong mỹ tục."],
        conflicts: ["Thiếu hạ y che chắn cơ thể."],
        regionsPresent: [regionOption.label],
      };
    } else if (matchedArchetype.regionId === "duong_dai") {
      authenticity = {
        score: 92,
        tier: "remix",
        badgeTitle: "Gen Z Remix Tinh Tế",
        badgeIcon: "palette",
        badgeColorClass: "bg-[#1a2a44] text-[#eed182] border border-[#c59b27]/60",
        headline: "Giao Thoa Cổ Điển & Đương Đại Ấn Tượng",
        analysis: "Bức poster thể hiện tinh thần cách tân độc đáo, kết hợp chất liệu truyền thống với phom dáng thời trang trẻ trung của thế hệ Z.",
        etiquetteTips: ["Phù hợp dạo phố, chụp ảnh lookbook nghệ thuật và dự tiệc sáng tạo."],
        conflicts: [],
        regionsPresent: [regionOption.label],
      };
    } else {
      authenticity = {
        score: 100,
        tier: "authentic",
        badgeTitle: "Di Sản Thuần Khiết (100% Authentic)",
        badgeIcon: "verified",
        badgeColorClass: "bg-[#AE3022] text-[#FAF6EE] border border-[#c59b27]",
        headline: "Chuẩn Mực Lịch Sử & Lễ Nghi Trọn Vẹn",
        analysis: `Bộ trang phục trong poster tái hiện xuất sắc phom dáng và tinh hoa ${matchedArchetype.attireName}. Đường nét đoan trang, tôn kính cội nguồn lịch sử.`,
        etiquetteTips: matchedArchetype.etiquetteRules,
        conflicts: [],
        regionsPresent: [regionOption.label],
      };
    }
  }

  // 4. Phân tích Ngũ Hành & Màu Sắc (Color Harmony)
  const upperItem = equippedOutfit.outerTop || equippedOutfit.innerTop;
  const lowerItem = equippedOutfit.bottom;
  const userUpperHex = upperItem ? (colorState[upperItem.id] || upperItem.defaultColor) : undefined;
  const userLowerHex = lowerItem ? (colorState[lowerItem.id] || lowerItem.defaultColor) : undefined;
  const primaryHex = (sourceMode === "mannequin" && userUpperHex) || matchedArchetype.palette[0]?.hex || "#AE3022";
  const secondaryHex = (sourceMode === "mannequin" && userLowerHex) || matchedArchetype.palette[1]?.hex || "#F2EFE6";
  const baseHarmony = evaluateColorHarmony(primaryHex, secondaryHex);

  const colorHarmony: ColorHarmonyResult & { palette: PosterPaletteColor[] } = {
    ...baseHarmony,
    palette: matchedArchetype.palette,
  };

  // 5. Đánh giá độ phù hợp với Bối Cảnh Sự Kiện (Occasion Fit)
  const occasionData = STYLING_OCCASIONS.find((o) => o.id === selectedOccasionId) || STYLING_OCCASIONS[0];
  const isPresetSuitable = occasionData.suitablePresets.includes(matchedArchetype.presetId);
  const fitScore = isPresetSuitable ? 98 : 85;

  const occasionFit = {
    id: occasionData.id,
    name: occasionData.name,
    icon: occasionData.icon,
    score: fitScore,
    fitVerdict: isPresetSuitable ? "Hoàn Hảo Tương Thích" : "Hài Hòa Thú Vị",
    advice: isPresetSuitable
      ? `Trang phục ${matchedArchetype.attireName} là lựa chọn tiêu chuẩn số 1 cho dịp ${occasionData.name}.`
      : `Bạn có thể mặc trang phục này trong dịp ${occasionData.name}, tạo nét chấm phá cá tính riêng biệt.`,
  };

  // 6. Xây dựng danh sách Hotspots
  const hotspots: PosterHotspot[] = matchedArchetype.hotspots.map((hs, index) => ({
    ...hs,
    id: `hotspot-${index + 1}`,
    number: index + 1,
  }));

  // 7. Chuẩn bị thông tin Preset tương ứng để người dùng có thể "Thử Lên Sàn Đồ Mannequin"
  const matchedPreset = OUTFIT_PRESETS.find((p) => p.id === matchedArchetype.presetId) || null;
  const suggestedPreset = matchedPreset
    ? {
        preset: matchedPreset,
        colors: matchedArchetype.defaultColors,
      }
    : null;

  return {
    posterId,
    title: posterTitle,
    detectedAttireName: matchedArchetype.attireName,
    era: matchedArchetype.era,
    region: {
      id: regionOption.id,
      name: regionOption.label,
      icon: regionOption.icon,
      description: regionOption.description,
    },
    authenticity,
    colorHarmony,
    occasionFit,
    hotspots,
    historicalStory: matchedArchetype.historicalStory,
    symbolismDetail: matchedArchetype.symbolismDetail,
    etiquetteRules: matchedArchetype.etiquetteRules,
    genZRemixTips: matchedArchetype.genZRemixTips,
    suggestedPreset,
  };
}
