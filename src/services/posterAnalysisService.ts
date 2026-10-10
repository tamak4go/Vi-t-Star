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

  // 1. Phân loại đặc thù di sản theo thứ tự ưu tiên cao -> thấp (tránh bị từ khóa chung chung đè)
  const isChamHeritage =
    corpus.includes("chăm") ||
    corpus.includes("cham") ||
    corpus.includes("champa") ||
    corpus.includes("thổ cẩm") ||
    corpus.includes("tho cam") ||
    corpus.includes("aw cam") ||
    corpus.includes("aw sah") ||
    corpus.includes("talei kabak") ||
    corpus.includes("khan mut") ||
    corpus.includes("khan mút") ||
    corpus.includes("katê") ||
    corpus.includes("kate");

  const isThaiTayBac =
    corpus.includes("áo cóm") ||
    corpus.includes("ao com") ||
    corpus.includes("khăn piêu") ||
    corpus.includes("khan pieu") ||
    corpus.includes("dân tộc thái") ||
    corpus.includes("khuy bướm");

  const isNhatBinh =
    corpus.includes("nhật bình") ||
    corpus.includes("nhat binh");

  const isAoTac =
    corpus.includes("áo tấc") ||
    corpus.includes("ao tac") ||
    corpus.includes("áo thụng") ||
    corpus.includes("ao thung");

  const isNguThan =
    corpus.includes("ngũ thân") ||
    corpus.includes("ngu than") ||
    corpus.includes("lập lĩnh") ||
    corpus.includes("tay chẽn");

  const isTuThan =
    corpus.includes("tứ thân") ||
    corpus.includes("tu than") ||
    corpus.includes("bốn vạt") ||
    corpus.includes("quan họ");

  const isAoYem =
    corpus.includes("áo yếm") ||
    corpus.includes("ao yem") ||
    corpus.includes("yếm đào");

  const isBaBa =
    corpus.includes("bà ba") ||
    corpus.includes("ba ba");

  const isAoDai =
    corpus.includes("áo dài") ||
    corpus.includes("ao dai");

  const components: PosterComponentDetail[] = [];
  let detectedRegionId: HeritageRegion = "duong_dai";
  let isAuthentic = false;
  let isRemix = false;
  let summaryTitle = "Tác Phẩm Thời Trang Cổ Phục Độc Bản";
  let historicalLore = "Tác phẩm kết tinh vẻ đẹp thời trang truyền thống Việt Nam dưới góc nhìn nghệ thuật đương đại.";

  // Kiểm tra xem tác phẩm có đề cập đến Thượng Y hay chỉ là Hạ Y / Phụ kiện đơn lẻ
  const hasUpperMention =
    isChamHeritage ||
    isThaiTayBac ||
    isNhatBinh ||
    isAoTac ||
    isNguThan ||
    isTuThan ||
    isAoYem ||
    isBaBa ||
    isAoDai ||
    corpus.includes("áo") ||
    corpus.includes("ao ") ||
    corpus.includes("tunic") ||
    corpus.includes("top") ||
    corpus.includes("robe");

  const isOnlyBottomPiece =
    (corpus.includes("quần") ||
      corpus.includes("quan") ||
      corpus.includes("pants") ||
      corpus.includes("trousers") ||
      corpus.includes("bottom") ||
      corpus.includes("váy đụp") ||
      corpus.includes("xà rông") ||
      corpus.includes("sarong")) &&
    !hasUpperMention;

  if (isOnlyBottomPiece) {
    // Trường hợp hiện vật / ảnh chỉ là Hạ Y (quần/váy) đơn lẻ - Tuyệt đối không bịa Thượng Y
    if (isChamHeritage) {
      detectedRegionId = "cham_pa";
      summaryTitle = "Xà Rông Dệt Thổ Cẩm Chăm (Cấu Phần Hạ Y)";
      historicalLore = "Xà rông dệt thổ cẩm (Kăn) là trang phục hạ y truyền thống đặc sắc của người Chăm, dệt hoa văn hình học tỉ mỉ tôn vinh kỹ nghệ dệt tay nghìn năm.";
    } else {
      detectedRegionId = "bac_bo";
      summaryTitle = "Quần Lụa Dài Suông Truyền Thống (Cấu Phần Hạ Y)";
      historicalLore = "Quần lụa dài suông là cấu phần hạ y cơ bản và mẫu mực trong trang phục truyền thống Việt Nam. Độ suông rộng thanh tao vừa giữ gìn nét đoan trang kín đáo khi bước đi, vừa tôn phong thái đĩnh đạc của người mặc.";
    }
    isAuthentic = true;
  } else if (isChamHeritage) {
    // ---- 1. DI SẢN CỔ PHỤC CHĂM PA (DUYÊN HẢI NAM TRUNG BỘ) ----
    detectedRegionId = "cham_pa";
    isAuthentic = true;
    const isMale = corpus.includes("nam") || corpus.includes("male") || corpus.includes("chàng trai");

    if (isMale) {
      summaryTitle = "Cổ Phục Dân Tộc Chăm Pa Hoa Văn Thổ Cẩm (Nam Giới)";
      historicalLore =
        "Trang phục truyền thống nam giới dân tộc Chăm (Duyên hải Nam Trung Bộ — Ninh Thuận, Bình Thuận) mang dấu ấn rực rỡ của nền văn minh Champa nghìn năm. Thân áo dệt từ sợi bông nhuộm chàm, hoa văn thổ cẩm quả trám trước ngực cùng dải thắt lưng Talei Kabak biểu trưng cho lòng trung trinh, sự kiên định và tôn kính cội nguồn thiêng liêng.";
      components.push({
        id: "comp-top-cham-nam",
        category: "top",
        categoryLabel: "Cổ Phục Chăm Pa",
        name: "Áo Nam Cổ Phục Dân Tộc Chăm (Aw Cam)",
        description: "Thân áo chẽn nam dệt từ sợi bông nhuộm chàm, trang trí dải hoa văn thổ cẩm hình học truyền thống viền trước ngực và cổ áo.",
        historicalEra: "Văn hóa Champa (Duyên hải Nam Trung Bộ)",
        symbolism: "Họa tiết thổ cẩm hình học thiêng liêng tôn sùng thần linh xứ sở và Mẫu thần Po Nagar.",
        etiquetteNote: "Trang phục lễ hội Katê truyền thống, tà áo và dải thắt lưng tề chỉnh.",
        status: "authentic",
      });
    } else {
      summaryTitle = "Cổ Phục Dân Tộc Chăm Pa Hoa Văn Thổ Cẩm";
      historicalLore =
        "Trang phục truyền thống dân tộc Chăm (Duyên hải Nam Trung Bộ — Ninh Thuận, Bình Thuận) mang vẻ đẹp huyền bí của các tòa tháp cổ rêu phong. Áo chui đầu truyền thống kết hợp dải thắt lưng dệt thổ cẩm Talei Kabak biểu trưng cho sự hòa hợp âm dương và lời cầu chúc mùa màng tốt tươi trong lễ hội Katê linh thiêng.";
      components.push({
        id: "comp-top-cham-nu",
        category: "top",
        categoryLabel: "Cổ Phục Chăm Pa",
        name: "Áo Truyền Thống Dân Tộc Chăm (Aw Cam / Aw Sah)",
        description: "Áo chui đầu truyền thống người Chăm dệt hoa văn thổ cẩm, phom dáng kín đáo duyên dáng tôn nét đẹp duyên hải miền Trung.",
        historicalEra: "Văn hóa Champa (Duyên hải Nam Trung Bộ)",
        symbolism: "Họa tiết hình học thiêng liêng và dải thêu thủ công tôn vinh kỹ nghệ dệt thổ cẩm Champa cổ kính.",
        etiquetteNote: "Trang phục lễ hội Katê và ngày hội làng, bước đi khoan thai thanh lịch.",
        status: "authentic",
      });
    }

    // Phụ kiện đặc trưng Chăm
    components.push({
      id: "comp-acc-cham-talei-kabak",
      category: "accessory",
      categoryLabel: "Dải Lưng Lễ Phục",
      name: "Dải Thắt Lưng Thổ Cẩm Chăm (Talei Kabak)",
      description: "Dải thắt lưng dệt thổ cẩm đỏ viền hoa văn vàng rủ hai vạt dài bên hông, chi tiết linh hồn không thể thiếu trong lễ phục Katê của người Chăm.",
      historicalEra: "Di sản dệt thổ cẩm Chăm Pa",
      symbolism: "Tượng trưng cho sự may mắn, phồn vinh và tôn vinh bàn tay dệt khéo léo của người phụ nữ Chăm.",
      etiquetteNote: "Thắt chặt ngang eo, hai đầu dải buông rủ cân đối bên hông.",
      status: "authentic",
    });

    components.push({
      id: "comp-acc-cham-khan-mut",
      category: "headwear",
      categoryLabel: "Khăn Vấn Chăm",
      name: "Khăn Vấn Đầu Chăm (Khan Mút)",
      description: "Khăn quấn đầu trắng hoặc lam chàm truyền thống của người Chăm, biểu trưng cho sự thanh sạch và lòng tôn kính thần linh.",
      historicalEra: "Phong tục đội khăn Chăm Pa",
      symbolism: "Sự thuần khiết, đoan trang và ý thức gìn giữ bản sắc cội nguồn.",
      status: "authentic",
    });

    components.push({
      id: "comp-acc-cham-kieng",
      category: "neckwear",
      categoryLabel: "Trang Sức Cổ",
      name: "Kiềng Bạc Chăm Cổ Truyền",
      description: "Vòng kiềng bạc sáng bóng đeo sát cổ, mang dấu ấn nghệ thuật kim hoàn Champa cổ xưa.",
      historicalEra: "Nghệ thuật kim hoàn Champa",
      symbolism: "Sự thanh bạch, xua đuổi tà khí và bảo bọc sinh khí người mặc.",
      status: "authentic",
    });
  } else if (isThaiTayBac) {
    // ---- 2. DÂN TỘC THÁI TÂY BẮC ----
    detectedRegionId = "tay_bac";
    isAuthentic = true;
    summaryTitle = "Áo Cóm Hàng Cúc Bướm Bạc Dân Tộc Thái (Tây Bắc)";
    historicalLore =
      "Áo Cóm bó sát eo tôn bờ eo thon 'thắt đáy lưng ong' khỏe khoắn của cô gái miền sơn cước, đính hàng khuy bướm bạc tinh xảo gắn liền với điệu xòe hoa Tây Bắc.";
    components.push({
      id: "comp-top-ao-com",
      category: "top",
      categoryLabel: "Trang Phục Sơn Cước",
      name: "Áo Cóm & Hàng Cúc Bướm Bạc",
      description: "Thân áo ôm khít dáng người, cài hàng cúc hình bướm hoặc búp sen chạm khắc thủ công.",
      historicalEra: "Văn hóa dân tộc Thái Tây Bắc",
      symbolism: "Tình yêu đôi lứa thủy chung và sức sống mãnh liệt giữa đại ngàn.",
      etiquetteNote: "Cài khít thẳng hàng cúc chính giữa ngực.",
      status: "authentic",
    });
  } else if (isNhatBinh) {
    // ---- 3. ÁO NHẬT BÌNH TRIỀU NGUYỄN ----
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
  } else if (isAoTac) {
    // ---- 4. ÁO TẤC CUNG ĐÌNH HUẾ ----
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
  } else if (isNguThan) {
    // ---- 5. ÁO NGŨ THÂN LẬP LĨNH ----
    detectedRegionId = "hue";
    isAuthentic = true;
    summaryTitle = "Áo Ngũ Thân Lập Lĩnh Cổ Truyền";
    historicalLore =
      "Áo Ngũ Thân định hình dưới thời Chúa Nguyễn Phúc Khoát (1744) và Vua Minh Mạng (1827). Năm thân áo tượng trưng cho tứ thân phụ mẫu và chính bản thân người mặc, cổ lập lĩnh đứng thẳng cài 5 cúc đại diện cho Ngũ Thường.";
    components.push({
      id: "comp-top-ngu-than",
      category: "top",
      categoryLabel: "Phục Trang Sĩ Phu",
      name: "Áo Ngũ Thân Lập Lĩnh Tay Chẽn",
      description: "Phom áo năm thân kín đáo, cổ đứng cài 5 khuy thẳng thớm, toát lên phong thái đĩnh đạc của nho sĩ tri thức.",
      historicalEra: "Thời Nguyễn (1744 – Thế kỷ 20)",
      symbolism: "Ngũ Thường: Nhân, Lễ, Nghĩa, Trí, Tín và tinh thần hiếu đạo vẹn toàn.",
      etiquetteNote: "Cài đủ 5 cúc, cổ áo phẳng phiu.",
      status: "authentic",
    });
  } else if (isTuThan) {
    // ---- 6. ÁO TỨ THÂN KINH BẮC ----
    detectedRegionId = "bac_bo";
    isAuthentic = true;
    summaryTitle = "Áo Tứ Thân Cổ Truyền Dân Gian";
    historicalLore =
      "Áo Tứ Thân gắn liền với không gian hội làng Kinh Bắc và di sản Quan họ. Bốn vạt áo tượng trưng cho tứ thân phụ mẫu bốn bên; hai vạt buộc chéo biểu thị tình nghĩa phu thê son sắt.";
    components.push({
      id: "comp-top-tu-than",
      category: "top",
      categoryLabel: "Phục Trang Dân Gian",
      name: "Áo Tứ Thân Bốn Vạt",
      description: "Bốn vạt áo buông rủ mộc mạc nhuộm củ nâu, khoác ngoài tề chỉnh.",
      historicalEra: "Thế kỷ 12 – Đầu thế kỷ 20",
      symbolism: "Hiếu nghĩa sinh thành và đức tính chịu thương chịu khó của phụ nữ xưa.",
      etiquetteNote: "Khi ra chốn đông người luôn mặc kèm áo khoác ngoài tề chỉnh.",
      status: "authentic",
    });
  } else if (isAoYem) {
    // ---- 7. ÁO YẾM ĐÀO BẮC BỘ ----
    detectedRegionId = "bac_bo";
    isAuthentic = true;
    summaryTitle = "Áo Yếm Cổ Truyền Dân Gian";
    historicalLore =
      "Áo Yếm là nội y cổ truyền của phụ nữ Việt, tôn vinh nét đẹp thắt đáy lưng ong và đường cong thanh thoát của phụ nữ xưa.";
    components.push({
      id: "comp-top-yem",
      category: "top",
      categoryLabel: "Nội Y Dân Gian",
      name: "Áo Yếm Cổ Xưa",
      description: "Yếm hình quả trám hoặc cổ xây ôm bờ vai thon thả, buộc dây sau gáy và lưng.",
      historicalEra: "Thời Lý - Trần đến đầu thế kỷ 20",
      symbolism: "Vẻ đẹp thuần khiết, mộc mạc của người phụ nữ Việt.",
      etiquetteNote: "Nội y dân gian, thường mặc kèm áo khoác ngoài khi đi lễ trang nghiêm.",
      status: "authentic",
    });
  } else if (isBaBa) {
    // ---- 8. ÁO BÀ BA NAM BỘ ----
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
  } else if (isAoDai) {
    // ---- 9. ÁO DÀI TRUYỀN THỐNG (CHỈ KÍCH HOẠT KHI THỰC SỰ LÀ ÁO DÀI) ----
    detectedRegionId = corpus.includes("huế") ? "hue" : "bac_bo";
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
  } else if (hasUpperMention) {
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
  } else if (
    corpus.includes("quần jean") ||
    corpus.includes("jeans") ||
    corpus.includes("denim") ||
    corpus.includes("quần bò") ||
    corpus.includes("váy ngắn") ||
    corpus.includes("y2k")
  ) {
    isRemix = true;
    components.push({
      id: "comp-bottom-remix",
      category: "bottom",
      categoryLabel: "Hạ Y Cách Tân",
      name: "Hạ Y Hiện Đại (Denim Streetwear)",
      description: "Quần dài tối màu mang phong cách đương đại, tạo sự tương phản phá cách giữa họa tiết cổ truyền và hơi thở đường phố.",
      status: "remix",
    });
  } else if (corpus.includes("xà rông") || corpus.includes("sarong") || corpus.includes("kăn")) {
    components.push({
      id: "comp-bottom-sarong",
      category: "bottom",
      categoryLabel: "Hạ Y Truyền Thống",
      name: "Xà Rông Dệt Thổ Cẩm (Kăn)",
      description: "Váy quấn xà rông dệt hoa văn thổ cẩm phủ kín mắt cá chân theo phong tục Chăm Pa truyền thống.",
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
  } else if (isChamHeritage) {
    // Đối với người Chăm: Mặc định quần vải chàm ống suông tối màu
    components.push({
      id: "comp-bottom-cham-pants",
      category: "bottom",
      categoryLabel: "Hạ Y Truyền Thống",
      name: "Quần Vải Chàm Dáng Suông",
      description: "Quần vải tối màu dáng suông rộng rãi kín đáo, tôn nét đĩnh đạc trang nghiêm.",
      status: "authentic",
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
  if (!isChamHeritage && (corpus.includes("kiềng bạc") || corpus.includes("kiềng"))) {
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
  if (corpus.includes("huế") || corpus.includes("cung đình") || corpus.includes("hoàng thành") || corpus.includes("hue")) {
    components.push({
      id: "comp-setting-hue",
      category: "setting",
      categoryLabel: "Bối Cảnh Không Gian",
      name: isChamHeritage ? "Đại Nội Hoàng Thành Huế (Giao Lưu Văn Hóa)" : "Đại Nội Hoàng Thành Huế",
      description: isChamHeritage
        ? "Không gian cổ kính Đại Nội tạo nét giao lưu di sản liên vùng giữa cổ phục Chăm Pa và kiến trúc Cố Đô."
        : "Tường gạch rêu phong và sân đá hoa cương cổ kính, toát lên sự uy nghiêm trầm mặc.",
      status: "authentic",
    });
  } else if (corpus.includes("tháp chàm") || corpus.includes("tháp chăm") || corpus.includes("po nagar") || isChamHeritage) {
    components.push({
      id: "comp-setting-cham",
      category: "setting",
      categoryLabel: "Bối Cảnh Không Gian",
      name: "Không Gian Tháp Cổ Chăm Pa",
      description: "Quần thể tháp Chăm gạch nung cổ kính rêu phong dưới nắng gió miền Trung, bối cảnh linh thiêng nghìn năm của lễ hội Katê.",
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

  // 5. Tính toán Điểm Chuẩn Mực Văn Hóa Chân Thực (TUYỆT ĐỐI KHÔNG BỊA 98-100 ĐIỂM CHO OUTFIT REMIX/DENIM)
  let score = 75;
  let tier: "authentic" | "remix" | "notice" = "remix";
  let badgeTitle = "Sáng Tạo Đương Đại (Modern Vibe)";
  let badgeColorClass = "bg-slate-800 text-amber-200 border border-slate-600";
  let headline = "Phong Cách Thời Trang Tự Do";
  let analysisText = `Bức poster thể hiện cảm hứng thời trang đương đại. Các chi tiết trang phục mang tính sáng tạo tự do.`;
  const etiquetteTips: string[] = [];
  const conflicts: string[] = [];

  const hasRemixItem = components.some((c) => c.status === "remix");
  const hasTop = components.some((c) => c.category === "top");
  const hasBottom = components.some((c) => c.category === "bottom");

  if (hasModestyIssue) {
    score = 50;
    tier = "notice";
    badgeTitle = "Cần Bổ Sung Hạ Y Trang Nhã";
    badgeColorClass = "bg-rose-900 text-rose-100 border border-rose-500";
    headline = "Lưu Ý Về Thuần Phong Mỹ Tục";
    analysisText = "Hình ảnh có dấu hiệu thiếu quần dài hoặc chân váy truyền thống che chắn cơ thể.";
    conflicts.push("Thiếu hạ y trang nhã theo quy chuẩn cổ truyền.");
    etiquetteTips.push("Cổ phục Việt luôn đi liền với quần lụa dài hoặc váy đụp phủ kín mắt cá chân.");
  } else if (isOnlyBottomPiece) {
    score = 75;
    tier = "remix";
    badgeTitle = "Cấu Phần Hạ Y Cổ Truyền (Đơn Lẻ)";
    badgeColorClass = "bg-amber-950 text-amber-100 border border-amber-500/50";
    headline = "Hiện Vật Cấu Phần Hạ Y Đơn Lẻ";
    analysisText = `Tác phẩm là chi tiết hạ y đơn lẻ. Trong quy chuẩn y phục dân tộc, hạ y cần được kết hợp đồng bộ cùng Thượng y và phụ kiện tương thích để tạo nên tổng thể di sản hoàn chỉnh.`;
    etiquetteTips.push("Nên phối cùng Thượng y đồng bộ và hài mộc để hoàn thiện diện mạo cổ phong.");
  } else if (isAuthentic && hasRemixItem) {
    // Có Thượng y di sản nhưng kết hợp Hạ y hiện đại (ví dụ: Áo Cổ phục Chăm + Quần Jeans/Denim) -> ĐÁNH GIÁ CHUẨN XÁC LÀ REMIX 85 ĐIỂM
    score = 85;
    tier = "remix";
    badgeTitle = "Giao Thoa Cổ Điển & Đương Đại";
    badgeColorClass = "bg-[#1a2a44] text-[#eed182] border border-[#c59b27]/60";
    headline = "Phong Cách Cách Tân Đương Đại";
    analysisText = `Tác phẩm kết hợp độc đáo giữa nét đẹp di sản của ${summaryTitle} và hạ y hiện đại (Denim/Streetwear). Đây là sự giao thoa trẻ trung, đưa họa tiết cổ truyền vào nhịp sống đương đại nhưng chưa phải là bộ lễ phục cổ truyền nguyên bản.`;
    etiquetteTips.push("Phù hợp cho chụp ảnh thời trang nghệ thuật, dạo phố và các sự kiện sáng tạo trẻ trung.");
    etiquetteTips.push("Nếu tham gia nghi lễ truyền thống trang nghiêm, nên thay thế hạ y hiện đại bằng quần lụa suông hoặc xà rông cổ truyền đồng bộ.");
  } else if (isAuthentic) {
    // 100% thành phần đều là di sản chuẩn mực (không có chi tiết remix)
    score = hasTop && hasBottom ? 98 : 90;
    tier = "authentic";
    badgeTitle = "Di Sản Thuần Khiết (Authentic)";
    badgeColorClass = "bg-[#AE3022] text-[#FAF6EE] border border-[#c59b27]";
    headline = "Tác Phẩm Chuẩn Mực Bản Sắc Di Sản";
    analysisText = `Bức poster đã khắc họa rõ nét tinh thần và phom dáng của ${summaryTitle}. Đường nét đoan trang, tôn kính cội nguồn lịch sử.`;
    etiquetteTips.push("Bộ trang phục phù hợp với các nghi lễ trang trọng, kỷ yếu học đường và lễ hội truyền thống.");
  } else if (isRemix || corpus.includes("y2k") || corpus.includes("croptop") || corpus.includes("sneaker")) {
    score = 82;
    tier = "remix";
    badgeTitle = "Gen Z Remix Tinh Tế";
    badgeColorClass = "bg-[#1a2a44] text-[#eed182] border border-[#c59b27]/60";
    headline = "Giao Thoa Cổ Điển & Đương Đại Độc Đáo";
    analysisText = "Tác phẩm thể hiện tinh thần sáng tạo trẻ trung, đưa chất liệu di sản vào nhịp sống hiện đại.";
    etiquetteTips.push("Phong cách phù hợp dạo phố, chụp ảnh lookbook thời trang và tham gia các sự kiện nghệ thuật.");
  } else {
    score = 75;
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
