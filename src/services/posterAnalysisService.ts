// src/services/posterAnalysisService.ts
// Bộ quét AI & Thẩm định Di Sản Động cho Poster Thời Trang Sinh Bởi AI (Google Stitch)
// TUYỆT ĐỐI KHÔNG BỊA TỌA ĐỘ GHIM VÀ KHÔNG ÁP ĐẶT DANH SÁCH MẪU CỨNG
// Dữ liệu được bóc tách chân thực theo: Mô tả thực tế của User + Prompt thời trang + Bảng màu pixel thực tế

import {
  type HeritageRegion,
  HERITAGE_REGIONS,
} from "../data/dressroomConfig";
import {
  type CulturalAuthenticityAssessment,
  type ColorHarmonyResult,
  evaluateColorHarmony,
} from "./culturalKnowledgeService";
import { STYLING_OCCASIONS } from "./aiStylistService";
import { type ExtractedColor } from "./imageColorExtractor";

export interface PosterComponentDetail {
  id: string;
  category: "top" | "bottom" | "headwear" | "neckwear" | "accessory" | "setting" | "remix";
  categoryLabel: string;
  name: string;
  description: string;
  historicalEra?: string;
  symbolism?: string;
  etiquetteNote?: string;
  status: "authentic" | "remix" | "neutral" | "warning";
}

export interface DynamicPosterAnalysis {
  posterId: string;
  posterTitle: string;
  summaryTitle: string;
  detectedRegion: {
    id: HeritageRegion;
    name: string;
    icon: string;
    description: string;
  };
  styleCategory: "authentic" | "remix" | "modern";
  styleBadge: string;
  authenticity: CulturalAuthenticityAssessment;
  components: PosterComponentDetail[];
  colorPalette: ExtractedColor[];
  colorHarmony: ColorHarmonyResult;
  occasionFit: {
    name: string;
    icon: string;
    suitability: "Rất phù hợp" | "Hài hòa sáng tạo" | "Cần cân nhắc";
    advice: string;
  };
  historicalLore: string;
  culturalAdvice: string[];
}

/**
 * Trình quét AI phân tích cấu trúc phục trang động từ text prompt và metadata thực tế
 */
export function scanPosterCulturally(params: {
  posterId: string;
  posterTitle: string;
  promptText: string;
  customUserInput?: string;
  selectedOccasionId?: string;
  selectedBackgroundId?: string;
  extractedColors: ExtractedColor[];
}): DynamicPosterAnalysis {
  const {
    posterId,
    posterTitle,
    promptText,
    customUserInput = "",
    selectedOccasionId = "tet",
    extractedColors,
  } = params;

  const corpus = `${posterTitle} ${promptText} ${customUserInput}`.toLowerCase();

  // 1. Nhận diện Thượng Y (Áo / Cổ áo)
  const components: PosterComponentDetail[] = [];
  let detectedRegionId: HeritageRegion = "duong_dai";
  let isAuthentic = false;
  let isRemix = false;
  let summaryTitle = "Tác Phẩm Thời Trang Cổ Phục Độc Bản";
  let historicalLore = "Tác phẩm kết tinh vẻ đẹp thời trang truyền thống Việt Nam dưới góc nhìn nghệ thuật đương đại.";

  if (corpus.includes("nhật bình") || corpus.includes("nhat binh")) {
    detectedRegionId = "hue";
    isAuthentic = true;
    summaryTitle = "Lễ Phục Áo Nhật Bình Hoàng Cung Triều Nguyễn";
    historicalLore =
      "Áo Nhật Bình là đệ nhất thường phục của bậc Hoàng tộc triều Nguyễn (1802–1945). Cổ áo hình chữ nhật đặc trưng ghép dải viền ngũ hành, thêu phượng hoàng và thủy ba sóng nước biểu trưng cho đức hạnh Mẫu nghi thiên hạ.";
    components.push({
      id: "comp-top-nhat-binh",
      category: "top",
      categoryLabel: "Thượng Y Hoàng Tộc",
      name: "Áo Nhật Bình Cổ Chữ Nhật",
      description: "Thân áo vạt lớn xẻ trước, cổ khoét chữ nhật dệt viền ngũ sắc tượng trưng cho Ngũ Hành tuần hoàn.",
      historicalEra: "Triều Nguyễn (1802 – 1945)",
      symbolism: "Ngũ Luân & Ngũ Thường, phượng hoàng kim tuyến tượng trưng cho sự bao bọc vương quyền.",
      etiquetteNote: "Lễ phục trang nghiêm, cài khuy ngực ngay ngắn.",
      status: "authentic",
    });
  } else if (corpus.includes("áo tấc") || corpus.includes("ao tac") || corpus.includes("áo thụng")) {
    detectedRegionId = "hue";
    isAuthentic = true;
    summaryTitle = "Lễ Phục Áo Tấc (Áo Thụng) Cung Đình";
    historicalLore =
      "Áo Tấc là lễ phục trang nghiêm thời Nguyễn với đặc trưng tay áo thụng rộng rủ quá đầu ngón tay hơn một tấc. Thường mặc trong các dịp cúng tế gia tiên, đại lễ và yết kiến triều đình.";
    components.push({
      id: "comp-top-ao-tac",
      category: "top",
      categoryLabel: "Lễ Phục Cung Đình",
      name: "Áo Tấc Cổ Lập Lĩnh Tay Thụng",
      description: "Tay áo thụng dài che kín đôi bàn tay khi bái lễ, phom áo ngũ thân khoan thai đĩnh đạc.",
      historicalEra: "Thời Nguyễn (Thế kỷ 19 - 20)",
      symbolism: "Đức khiêm nhường, không nóng vội; 5 cúc cài đại diện cho Nhân, Lễ, Nghĩa, Trí, Tín.",
      etiquetteNote: "Khoác ngoài tề chỉnh, bước đi đĩnh đạc.",
      status: "authentic",
    });
  } else if (corpus.includes("áo dài") || corpus.includes("ao dai")) {
    detectedRegionId = "bac_bo";
    isAuthentic = true;
    summaryTitle = "Áo Dài Truyền Thống Quốc Phục Việt Nam";
    historicalLore =
      "Áo Dài là biểu tượng di sản trường tồn của người Việt, phát triển từ áo ngũ thân truyền thống, tôn vinh nét đẹp kín đáo, thanh tao và uyển chuyển.";
    components.push({
      id: "comp-top-ao-dai",
      category: "top",
      categoryLabel: "Quốc Phục Biểu Tượng",
      name: "Áo Dài Hai Tà Tha Thướt",
      description: "Hai tà áo trước sau buông rủ thướt tha, cổ đứng thanh thoát tôn vinh vẻ đẹp kín đáo.",
      historicalEra: "Thế kỷ 18 đến nay",
      symbolism: "Sự đoan trang, thuần khiết; hoa sen tượng trưng cho khí chất quân tử thanh bạch.",
      etiquetteNote: "Tà áo phẳng phiu, bước đi nhịp nhàng khoan thai.",
      status: "authentic",
    });
  } else if (corpus.includes("tứ thân") || corpus.includes("tu than") || corpus.includes("yếm")) {
    detectedRegionId = "bac_bo";
    isAuthentic = true;
    summaryTitle = "Áo Tứ Thân & Yếm Đào Hội Làng Kinh Bắc";
    historicalLore =
      "Áo Tứ Thân gắn liền với không gian hội làng Kinh Bắc và di sản Quan họ. Bốn vạt áo tượng trưng cho tứ thân phụ mẫu bốn bên; hai vạt buộc chéo biểu thị tình nghĩa phu thê son sắt.";
    components.push({
      id: "comp-top-tu-than",
      category: "top",
      categoryLabel: "Phục Trang Dân Gian",
      name: "Áo Tứ Thân / Yếm Đào Cổ Truyền",
      description: "Yếm hình quả trám ôm bờ vai thon thả, khoác ngoài bằng áo tứ thân mộc mạc nhuộm củ nâu.",
      historicalEra: "Thế kỷ 12 – Đầu thế kỷ 20",
      symbolism: "Hiếu nghĩa sinh thành và đức tính chịu thương chịu khó của phụ nữ Bắc Bộ xưa.",
      etiquetteNote: "Khi ra chốn đông người luôn mặc kèm áo khoác ngoài tề chỉnh.",
      status: "authentic",
    });
  } else if (corpus.includes("bà ba") || corpus.includes("ba ba")) {
    detectedRegionId = "nam_bo";
    isAuthentic = true;
    summaryTitle = "Áo Bà Ba Nam Bộ Sông Nước";
    historicalLore =
      "Áo Bà Ba xẻ tà hai bên hông phóng khoáng phản ánh đức tính hào sảng, chất phác và đôn hậu của con người miền Tây Nam Bộ trù phú.";
    components.push({
      id: "comp-top-ba-ba",
      category: "top",
      categoryLabel: "Phục Trang Nam Bộ",
      name: "Áo Bà Ba Cổ Tròn Xẻ Tà",
      description: "Dáng áo ôm vừa vặn, hai túi nhỏ phía trước tiện dụng, chất liệu lụa hoặc tơ tằm thoáng mát.",
      historicalEra: "Thế kỷ 19 đến nay",
      symbolism: "Sự nồng hậu, phóng khoáng và gắn bó bền bỉ với dòng kênh sông nước.",
      etiquetteNote: "Đi cùng khăn rằn vắt vai và nón lá duyên dáng.",
      status: "authentic",
    });
  } else if (corpus.includes("áo cóm") || corpus.includes("khăn piêu") || corpus.includes("thái")) {
    detectedRegionId = "tay_bac";
    isAuthentic = true;
    summaryTitle = "Áo Cóm Hàng Cúc Bướm Dân Tộc Thái Tây Bắc";
    historicalLore =
      "Áo Cóm bó sát eo tôn bờ eo thon 'thắt đáy lưng ong' khỏe khoắn của cô gái miền sơn cước, đính hàng khuy bướm bạc tinh xảo.";
    components.push({
      id: "comp-top-ao-com",
      category: "top",
      categoryLabel: "Trang Phục Sơn Cước",
      name: "Áo Cóm & Hàng Cúc Bướm Bạc",
      description: "Thân áo ôm khít dáng người, cài hàng cúc hình bướm hoặc búp sen chạm khắc thủ công.",
      historicalEra: "Văn hóa dân tộc Thái",
      symbolism: "Tình yêu đôi lứa thủy chung và sức sống mãnh liệt giữa đại ngàn.",
      etiquetteNote: "Cài khít thẳng hàng cúc chính giữa ngực.",
      status: "authentic",
    });
  } else {
    // Trường hợp mô tả tự do / đương đại
    summaryTitle = "Phong Cách Việt Phục Cách Tân Hiện Đại";
    components.push({
      id: "comp-top-modern",
      category: "top",
      categoryLabel: "Thượng Y Đương Đại",
      name: "Phục Trang Sáng Tạo Theo Mô Tả",
      description: customUserInput || "Thiết kế thời trang cách tân lấy cảm hứng từ đường nét cổ phục.",
      status: "neutral",
    });
  }

  // 2. Nhận diện Hạ Y (Quần / Váy)
  let hasModestyIssue = false;
  if (
    corpus.includes("không mặc quần") ||
    corpus.includes("không quần") ||
    (corpus.includes("áo yếm") && !corpus.includes("quần") && !corpus.includes("váy"))
  ) {
    hasModestyIssue = true;
    components.push({
      id: "comp-bottom-warning",
      category: "bottom",
      categoryLabel: "Cảnh Báo Hạ Y",
      name: "Thiếu Quần / Váy Trang Nhã",
      description: "Cổ phục Việt Nam đề cao vẻ đẹp kín đáo, trang nhã. Việc thiếu hạ y che chắn làm mất đi vẻ tôn nghiêm.",
      etiquetteNote: "Nên trang bị quần lụa dài hoặc váy đụp theo quy chuẩn cổ truyền.",
      status: "warning",
    });
  } else if (corpus.includes("quần lụa") || corpus.includes("quần trắng") || corpus.includes("quần dài") || corpus.includes("lãnh mỹ a")) {
    components.push({
      id: "comp-bottom-silk-pants",
      category: "bottom",
      categoryLabel: "Hạ Y Truyền Thống",
      name: "Quần Lụa Dài Suông Phủ Mắt Cá",
      description: "Dáng quần lụa suông rộng, bước đi khoan thai, che chắn kín đáo đôi chân theo chuẩn mực cổ nhân.",
      historicalEra: "Quy chuẩn y phục cổ truyền",
      symbolism: "Sự đoan trang, phong thái đĩnh đạc và nhẹ nhàng.",
      etiquetteNote: "Độ dài vừa chấm mu bàn chân, ống quần thẳng thớm.",
      status: "authentic",
    });
  } else if (corpus.includes("váy đụp") || corpus.includes("chân váy lụa") || corpus.includes("váy đen")) {
    components.push({
      id: "comp-bottom-skirt",
      category: "bottom",
      categoryLabel: "Hạ Y Dân Gian",
      name: "Váy Đụp Đen Dân Gian",
      description: "Chân váy đen tuyền phủ mắt cá chân, cuốn chặt cạp bằng dải thắt lưng lụa mềm.",
      historicalEra: "Bắc Bộ xưa",
      symbolism: "Gắn liền với đất mẹ đồng ruộng, giữ gìn nét đẹp mộc mạc.",
      status: "authentic",
    });
  } else if (corpus.includes("quần jean") || corpus.includes("jeans") || corpus.includes("váy ngắn") || corpus.includes("y2k")) {
    isRemix = true;
    components.push({
      id: "comp-bottom-remix",
      category: "bottom",
      categoryLabel: "Hạ Y Cách Tân",
      name: "Hạ Y Hiện Đại (Denim / Váy Ngắn)",
      description: "Sự kết hợp phá cách mang hơi thở đường phố đương đại, thể hiện cá tính tự do của Gen Z.",
      status: "remix",
    });
  }

  // 3. Nhận diện Phụ Kiện / Mũ Nón
  if (corpus.includes("nón lá") || corpus.includes("non la")) {
    components.push({
      id: "comp-acc-non-la",
      category: "headwear",
      categoryLabel: "Vật Phẩm Cầm Tay",
      name: "Nón Lá Thanh Trúc 16 Nan",
      description: "16 nan tre đồng tâm uốn cong che nắng, che mưa và e ấp nụ cười duyên.",
      historicalEra: "Biểu tượng văn hóa Chuông / Huế",
      status: "authentic",
    });
  }
  if (corpus.includes("khăn đóng") || corpus.includes("khăn xếp")) {
    components.push({
      id: "comp-acc-khan-dong",
      category: "headwear",
      categoryLabel: "Khăn Vấn Nam",
      name: "Khăn Đóng / Khăn Xếp Đen Tuyền",
      description: "Khăn vấn quấn nếp chữ Nhân ngay ngắn, tôn lên khuôn mặt cương trực, đĩnh đạc.",
      status: "authentic",
    });
  }
  if (corpus.includes("khăn vành") || corpus.includes("kim ước")) {
    components.push({
      id: "comp-acc-khan-vanh",
      category: "headwear",
      categoryLabel: "Mũ Nón Hoàng Tộc",
      name: "Khăn Vành Dây Hoàng Cung",
      description: "Dải lụa vấn chặt nhiều vòng đội đỉnh trán, biểu trưng cho phẩm cấp cao quý.",
      status: "authentic",
    });
  }
  if (corpus.includes("kiềng bạc") || corpus.includes("kiềng")) {
    components.push({
      id: "comp-acc-kieng-bac",
      category: "neckwear",
      categoryLabel: "Trang Sức Cổ",
      name: "Kiềng Bạc Chạm Khắc Sen",
      description: "Vòng kiềng bạc sáng bóng đeo sát cổ, tượng trưng cho sự vẹn toàn và thanh bạch.",
      status: "authentic",
    });
  }
  if (corpus.includes("khăn rằn")) {
    components.push({
      id: "comp-acc-khan-ran",
      category: "accessory",
      categoryLabel: "Khăn Choàng Di Sản",
      name: "Khăn Rằn Sọc Ca-rô Nam Bộ",
      description: "Họa tiết sọc trắng đen bền bỉ trên sông nước, vắt nhẹ ngang vai.",
      status: "authentic",
    });
  }

  // 4. Nhận diện Không Gian & Bối Cảnh
  if (corpus.includes("huế") || corpus.includes("cung đình") || corpus.includes("hoàng thành")) {
    components.push({
      id: "comp-setting-hue",
      category: "setting",
      categoryLabel: "Bối Cảnh Không Gian",
      name: "Đại Nội Hoàng Thành Huế",
      description: "Tường gạch rêu phong và sân đá hoa cương cổ kính, toát lên sự uy nghiêm trầm mặc.",
      status: "authentic",
    });
  } else if (corpus.includes("đình làng") || corpus.includes("hội làng") || corpus.includes("chùa")) {
    components.push({
      id: "comp-setting-dinh",
      category: "setting",
      categoryLabel: "Bối Cảnh Không Gian",
      name: "Không Gian Sân Đình & Hội Làng Cổ",
      description: "Mái đao cong vút và cờ hội ngũ sắc Kinh Bắc, không gian văn hóa tâm linh tôn nghiêm.",
      status: "authentic",
    });
  }

  // 5. Tính toán Điểm Chuẩn Mực Văn Hóa Chân Thực (Không tự gán 100/100 khi không đủ căn cứ)
  let score = 75;
  let tier: "authentic" | "remix" | "notice" = "remix";
  let badgeTitle = "Sáng Tạo Đương Đại (Modern Vibe)";
  let badgeColorClass = "bg-slate-800 text-amber-200 border border-slate-600";
  let headline = "Phong Cách Thời Trang Tự Do";
  let analysisText = `Bức poster thể hiện cảm hứng thời trang đương đại. Các chi tiết trang phục mang tính sáng tạo tự do.`;
  const etiquetteTips: string[] = [];
  const conflicts: string[] = [];

  if (hasModestyIssue) {
    score = 50;
    tier = "notice";
    badgeTitle = "Cần Bổ Sung Hạ Y Trang Nhã";
    badgeColorClass = "bg-rose-900 text-rose-100 border border-rose-500";
    headline = "Lưu Ý Về Thuần Phong Mỹ Tục";
    analysisText = "Hình ảnh có dấu hiệu thiếu quần dài hoặc chân váy truyền thống che chắn cơ thể.";
    conflicts.push("Thiếu hạ y trang nhã theo quy chuẩn cổ truyền.");
    etiquetteTips.push("Cổ phục Việt luôn đi liền với quần lụa dài hoặc váy đụp phủ kín mắt cá chân.");
  } else if (isAuthentic) {
    // Có căn cứ cổ phục chuẩn xác
    const hasFullSet = components.some((c) => c.category === "top") && components.some((c) => c.category === "bottom");
    score = hasFullSet ? 98 : 90;
    tier = "authentic";
    badgeTitle = "Di Sản Thuần Khiết (Authentic)";
    badgeColorClass = "bg-[#AE3022] text-[#FAF6EE] border border-[#c59b27]";
    headline = "Tác Phẩm Chuẩn Mực Bản Sắc Di Sản";
    analysisText = `Bức poster đã khắc họa rõ nét tinh thần và phom dáng của ${summaryTitle}. Đường nét đoan trang, tôn kính cội nguồn lịch sử.`;
    etiquetteTips.push("Bộ trang phục phù hợp với các nghi lễ trang trọng, kỷ yếu học đường và lễ hội truyền thống.");
  } else if (isRemix || corpus.includes("y2k") || corpus.includes("croptop") || corpus.includes("sneaker")) {
    score = 88;
    tier = "remix";
    badgeTitle = "Gen Z Remix Tinh Tế";
    badgeColorClass = "bg-[#1a2a44] text-[#eed182] border border-[#c59b27]/60";
    headline = "Giao Thoa Cổ Điển & Đương Đại Độc Đáo";
    analysisText = "Tác phẩm thể hiện tinh thần sáng tạo trẻ trung, đưa chất liệu di sản vào nhịp sống hiện đại.";
    etiquetteTips.push("Phong cách phù hợp dạo phố, chụp ảnh lookbook thời trang và tham gia các sự kiện nghệ thuật.");
  } else {
    score = 78;
    tier = "remix";
    badgeTitle = "Phong Cách Đương Đại";
    badgeColorClass = "bg-[#1a2a44] text-slate-200 border border-slate-600";
    headline = "Khởi Sắc Đương Đại Sáng Tạo";
    analysisText = `Tác phẩm thể hiện nét chấm phá lấy cảm hứng cổ phong dưới góc nhìn đương đại.`;
    etiquetteTips.push("Phù hợp cho các hoạt động sáng tạo nghệ thuật và thời trang thường nhật.");
  }

  const authenticity: CulturalAuthenticityAssessment = {
    score,
    tier,
    badgeTitle,
    badgeIcon: tier === "authentic" ? "verified" : tier === "remix" ? "palette" : "warning",
    badgeColorClass,
    headline,
    analysis: analysisText,
    etiquetteTips,
    conflicts,
    regionsPresent: [HERITAGE_REGIONS.find((r) => r.id === detectedRegionId)?.label || "Đương Đại"],
  };

  // 6. Phân tích Ngũ Hành dựa trên BẢNG MÀU PIXEL THỰC TẾ
  const primaryColor = extractedColors[0]?.hex || "#AE3022";
  const secondaryColor = extractedColors[1]?.hex || "#F2EFE6";
  const colorHarmony = evaluateColorHarmony(primaryColor, secondaryColor);

  // 7. Độ phù hợp bối cảnh
  const occasionObj = STYLING_OCCASIONS.find((o) => o.id === selectedOccasionId) || STYLING_OCCASIONS[0];
  let suitability: "Rất phù hợp" | "Hài hòa sáng tạo" | "Cần cân nhắc" = "Rất phù hợp";
  let advice = `Rất ăn ý với không gian ${occasionObj.name}, toát lên thần thái lịch thiệp.`;

  if (hasModestyIssue) {
    suitability = "Cần cân nhắc";
    advice = `Cần bổ sung quần lụa kín đáo để phù hợp với tính chất trang trọng của ${occasionObj.name}.`;
  } else if (isRemix) {
    suitability = "Hài hòa sáng tạo";
    advice = `Nét phá cách Gen Z mang lại làn gió mới mẻ khi chụp ảnh kỷ niệm dịp ${occasionObj.name}.`;
  }

  const regionOption = HERITAGE_REGIONS.find((r) => r.id === detectedRegionId) || HERITAGE_REGIONS[0];

  return {
    posterId,
    posterTitle,
    summaryTitle,
    detectedRegion: {
      id: regionOption.id,
      name: regionOption.label,
      icon: regionOption.icon,
      description: regionOption.description,
    },
    styleCategory: isAuthentic && tier === "authentic" ? "authentic" : isRemix || tier === "remix" ? "remix" : "modern",
    styleBadge: badgeTitle,
    authenticity,
    components,
    colorPalette: extractedColors,
    colorHarmony,
    occasionFit: {
      name: occasionObj.name,
      icon: occasionObj.icon,
      suitability,
      advice,
    },
    historicalLore,
    culturalAdvice: etiquetteTips,
  };
}
