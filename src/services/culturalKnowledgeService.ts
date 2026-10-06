// src/services/culturalKnowledgeService.ts
// Hệ thống tri thức văn hóa, điển tích trang phục, gợi ý thời tiết/sự kiện & thuật toán hài hòa màu sắc Ngũ Hành

import type { Category, ColorState, EquippedOutfit } from "../data/dressroomConfig";

export interface ItemCulturalStory {
  title: string;
  origin: string;          // Xuất xứ triều đại / Vùng miền
  meaning: string;         // Ý nghĩa biểu tượng & hoa văn
  wearEtiquette: string;   // Quy chuẩn lễ nghi truyền thống
  genZRemix: string;       // Gợi ý phối đồ sáng tạo cho bạn trẻ
  // Aliases for component compatibility
  era?: string;
  historicalContext?: string;
  symbolism?: string;
  etiquette?: string;
  genZRemixTips?: string;
  keyDetails?: string[];
}

export type CulturalStory = ItemCulturalStory;

// Bảng từ điển điển tích văn hóa chi tiết cho các nhóm trang phục
export const CULTURAL_STORIES_MAP: Record<string, ItemCulturalStory> = {
  // --- 1. Áo Tứ Thân & Yếm (Kinh Bắc) ---
  "sample1": {
    title: "Áo Tứ Thân & Yếm Đào Kinh Bắc",
    origin: "Bắc Bộ dân gian (Thế kỷ 12 – đầu thế kỷ 20)",
    meaning: "Bốn vạt áo tượng trưng cho tứ thân phụ mẫu (cha mẹ mình và cha mẹ người). Vạt trước buộc chéo biểu thị cho tình nghĩa vợ chồng son sắt, yếm đỏ thắm tượng trưng cho sinh khí và sự nồng hậu.",
    wearEtiquette: "Thường mặc trong các dịp hội làng, hát Quan họ, trẩy hội đầu xuân. Váy đụp đen phủ kín mắt cá chân thể hiện nét đoan trang thùy mị của người phụ nữ nông thôn Bắc Bộ.",
    genZRemix: "Mặc Áo Yếm lụa tơ tằm cùng chân váy maxi lụa rủ mềm hoặc khoác ngoài bằng blazer hiện đại, đeo trâm cài tóc hoa sen tối giản kiểu Haute Couture.",
  },
  "sample1-yem": {
    title: "Áo Yếm Cổ Truyền (Yếm Đào)",
    origin: "Nội y truyền thống của phụ nữ Việt qua nhiều thời kỳ",
    meaning: "Hình quả trám ôm khít tôn vinh bờ vai thon và lưng trần mềm mại, viền cổ khoét tròn hoặc cổ xây kín đáo.",
    wearEtiquette: "Nguyên bản luôn mặc lót bên trong áo tứ thân, áo cánh; ngày nay có thể mặc độc lập trong không gian nghệ thuật với chân váy dài.",
    genZRemix: "Phối cùng quần ống rộng suông cạp cao hoặc chân váy lụa đen satin để dạo phố mùa hè, phong thái vừa thanh tao vừa quyến rũ.",
  },
  "sample1-ao": {
    title: "Áo Tứ Thân Cánh Gián",
    origin: "Đồng bằng Bắc Bộ, gắn liền với di sản Quan họ",
    meaning: "Áo dài tha thướt xẻ làm 4 vạt, nhuộm từ vỏ củ nâu hoặc lá bàng mộc mạc, tôn vinh đức tính cần cù chịu thương chịu khó.",
    wearEtiquette: "Khoác ngoài yếm, vạt trước có thể buông thả nhẹ nhàng hoặc buộc thắt nút ngang eo tạo dáng thon gọn.",
    genZRemix: "Dùng làm áo choàng kimono/duster cardigan khoác ngoài đầm suông tối giản khi đi triển lãm nghệ thuật.",
  },
  "sample1-vay": {
    title: "Váy Đụp Đen Dân Gian",
    origin: "Trang phục hạ y tiêu biểu của phụ nữ Bắc Bộ xưa",
    meaning: "Màu đen tuyền nhuộm củ nâu và bùn non tượng trưng cho sự gắn bó với đất mẹ đồng ruộng, giữ ấm và tiện dụng khi lao động.",
    wearEtiquette: "Độ dài quét gót hoặc ngang mắt cá, cạp váy cuốn chặt bằng dải lưng lụa, bước đi khoan thai dịu dàng.",
    genZRemix: "Chuyển thể thành chân váy maxi xòe xếp ly vải thô đũi hoặc lụa cát, dễ dàng phối cùng croptop hoặc áo sơ mi hiện đại.",
  },
  "sample1-nit": {
    title: "Dải Nịt Ngũ Sắc",
    origin: "Phụ kiện thắt lưng dệt lụa tơ tằm Bắc Bộ",
    meaning: "Năm sắc màu đại diện cho ngũ hành vũ trụ (Kim - Mộc - Thủy - Hỏa - Thổ), cầu chúc may mắn, hòa hợp âm dương.",
    wearEtiquette: "Thắt nhẹ ngang eo, hai đầu dải lụa rủ tự nhiên dọc theo tà áo tạo điểm nhấn chuyển động uyển chuyển.",
    genZRemix: "Sử dụng làm thắt lưng obi cách tân trên áo sơ mi oversize hoặc thắt nơ trên quai túi tote vải canvas.",
  },

  // --- 2. Áo Dài Truyền Thống ---
  "sample2": {
    title: "Áo Dài Hoa Sen & Kiềng Bạc",
    origin: "Quốc phục Việt Nam (Phát triển từ áo ngũ thân thế kỷ 18 đến nay)",
    meaning: "Hai tà áo trước sau buông rủ thướt tha, tượng trưng cho sự vẹn toàn kín đáo. Hoa sen là quốc hoa biểu trưng cho sự thanh bạch 'gần bùn mà chẳng hôi tanh mùi bùn'.",
    wearEtiquette: "Trang phục chuẩn mực cho ngày lễ Tết, cưới hỏi, lễ tốt nghiệp kỷ yếu và ngoại giao văn hóa. Bắt buộc mặc cùng quần dài lụa trắng hoặc lụa đồng màu.",
    genZRemix: "Kết hợp Áo Dài truyền thống với kính râm retro gọng mắt mèo, nón lá vẽ nghệ thuật và giày sneaker trắng năng động để chụp kỷ yếu học đường.",
  },
  "sample2-kieng": {
    title: "Kiềng Bạc Chạm Hoa Sen",
    origin: "Trang sức cưới và lễ hội của phụ nữ Việt cổ truyền",
    meaning: "Vòng tròn bạc nguyên khối tượng trưng cho sự viên mãn trọn vẹn, xua đuổi tà khí và bảo bọc sức khỏe.",
    wearEtiquette: "Đeo sát chân cổ áo dài hoặc cổ yếm, mặt chạm khắc hoa sen hoặc chim phượng hướng ra phía trước.",
    genZRemix: "Mix cùng áo cổ lọ tối giản hoặc đầm dạ tiệc hiện đại như một món phụ kiện Statement Jewelry độc bản.",
  },
  "sample2-non": {
    title: "Nón Lá Thanh Trúc 16 Nan",
    origin: "Biểu tượng văn hóa nón lá làng Chuông (Hà Nội) / nón bài thơ xứ Huế",
    meaning: "16 nan tre uốn đồng tâm tượng trưng cho lứa tuổi trăng tròn xuân sắc; che nắng che mưa và khéo léo e ấp nụ cười duyên.",
    wearEtiquette: "Cầm nghiêng bên hông trái hoặc đội nghiêng duyên dáng khi dạo bước.",
    genZRemix: "Vẽ họa tiết typography Gen Z hoặc tranh trừu tượng lên vành nón để làm đạo cụ chụp ảnh street style độc nhất vô nhị.",
  },

  // --- 3. Áo Bà Ba (Nam Bộ) ---
  "sample3": {
    title: "Áo Bà Ba & Khăn Rằn Sông Nước",
    origin: "Nam Bộ (Thế kỷ 19 – tiếp biến từ văn hóa phương Nam)",
    meaning: "Thiết kế xẻ tà hai bên hông, cổ tròn không bâu phóng khoáng phản ánh tính cách hào sảng, chân chất và đôn hậu của con người miền Tây sông nước.",
    wearEtiquette: "Đi cùng quần lụa đen bóng, khăn rằn vắt vai và nón lá; thích hợp các chuyến du lịch miệt vườn, dã ngoại sinh thái.",
    genZRemix: "May bằng chất liệu tơ tằm nhuộm màu pastel ngọt ngào (hồng phấn, xanh bạc hà), mang túi cói mini mây tre và guốc mộc cao gót.",
  },

  // --- 4. Áo Ngũ Thân Lập Lĩnh ---
  "sample4": {
    title: "Áo Ngũ Thân Lập Lĩnh Sĩ Phu",
    origin: "Định hình dưới thời Chúa Nguyễn Phúc Khoát (1744) và Vua Minh Mạng (1827)",
    meaning: "Năm thân áo tượng trưng cho Tứ thân phụ mẫu và chính bản thân người mặc ở thân con bên trong. Cổ lập lĩnh thẳng đứng cài 5 cúc đại diện cho Ngũ Thường (Nhân, Lễ, Nghĩa, Trí, Tín).",
    wearEtiquette: "Trang phục tề chỉnh của tầng lớp trí thức, sĩ phu và quan lại khi vào chốn công đường, tế lễ hoặc đền chùa.",
    genZRemix: "Phối áo ngũ thân màu chàm hoặc nâu đất cùng quần suông trắng, mang giày da Oxford để tạo phong thái thư sinh đĩnh đạc.",
  },

  // --- 5. Áo Nhật Bình (Triều Nguyễn) ---
  "sample5": {
    title: "Áo Nhật Bình Hoàng Gia Cung Đình",
    origin: "Triều Nguyễn (1802 – 1945), quy chế y phục Hoàng gia",
    meaning: "Cổ áo hình chữ nhật ghép dải viền ngũ sắc tượng trưng cho Ngũ Hành tuần hoàn. Hoa văn phượng hoàng và thủy ba sóng nước biểu trưng cho đức hạnh cao quý của bậc Mẫu nghi thiên hạ.",
    wearEtiquette: "Lễ phục trang trọng của Hoàng thái hậu, Hoàng hậu, Công chúa và Cung tần trong các đại lễ cung đình.",
    genZRemix: "Khoác ngoài dáng cape trên một chiếc đầm lụa trơn dạ hội, hoặc mặc áo Nhật Bình chụp bộ ảnh cưới concept Hoàng Gia triều Nguyễn.",
  },

  // --- 6. Áo Tấc (Triều Nguyễn) ---
  "sample6": {
    title: "Áo Tấc (Áo Thụng) Cung Đình",
    origin: "Lễ phục phổ biến từ vua quan đến thứ dân thời Nguyễn",
    meaning: "Tay áo thụng rộng dài một tấc (nên gọi là Áo Tấc), khi chắp tay bái lễ tà áo phủ kín trang trọng, thể hiện phong thái khoan thai, khiêm cung và tôn nghiêm.",
    wearEtiquette: "Mặc trong các nghi lễ trang trọng, cúng tế tổ tiên, lễ cưới và yết kiến triều đình. Đi cùng khăn đóng và hài nhung.",
    genZRemix: "Chọn tông màu xanh thanh thiên hoặc đỏ đun, phối cùng kính mắt tròn gọng vàng để tái hiện diện mạo quý tộc triều Nguyễn đương đại.",
  },

  // --- 7. Dân Tộc Thái ---
  "sample7": {
    title: "Cổ Phục Áo Cóm Dân Tộc Thái",
    origin: "Đồng bào Thái vùng Tây Bắc (Sơn La, Điện Biên, Lai Châu)",
    meaning: "Áo Cóm bó sát tôn eo thon, hàng khuy bướm bạc (Hàng Cúp) tượng trưng cho sự gắn kết lứa đôi son sắt; khăn Piêu thêu hoa văn chỉ màu kể về vũ trụ và tình yêu đôi lứa.",
    wearEtiquette: "Trang phục mặc ngày thường lẫn ngày hội Xên Bản, Xên Mường, múa xòe bên chum rượu cần.",
    genZRemix: "Áo Cóm trắng khuy bạc phối cùng chân váy cạp cao hiện đại, khoác khăn Piêu như một chiếc khăn choàng cashmere sành điệu.",
  },

  // --- 8. Dân Tộc Chăm ---
  "sample8": {
    title: "Cổ Phục Chăm Pa Thổ Cẩm",
    origin: "Văn hóa Chăm Pa duyên hải miền Trung (Ninh Thuận, Bình Thuận)",
    meaning: "Áo chui đầu vạt chéo kết hợp đai lưng dệt hoa văn hình học cổ xưa, kiềng bạc chạm khắc gợi nhắc nền văn minh tháp cổ huyền bí và sự tôn sùng Mẫu thần Po Nagar.",
    wearEtiquette: "Mặc trong lễ hội Ka-tê, múa quạt dưới chân tháp Chăm trầm mặc.",
    genZRemix: "Sử dụng dải thắt lưng dệt thổ cẩm Chăm làm thắt lưng điểm nhấn cho trang phục Monochrome tối giản.",
  },

  // --- 9 & 10. Công Sở Hiện Đại ---
  "sample9": {
    title: "Sơ Mi Lụa Cổ Mandarin Giao Thoa",
    origin: "Thiết kế đương đại lấy cảm hứng từ cổ đứng Áo Dài Việt Nam",
    meaning: "Sự kết hợp tinh tế giữa phom dáng công sở sắc sảo thế kỷ 21 và đường nét cổ áo khép kín truyền thống.",
    wearEtiquette: "Phù hợp cho các buổi thuyết trình, hội nghị, phỏng vấn hoặc môi trường làm việc chuyên nghiệp.",
    genZRemix: "Phối cùng chân váy bút chì đính nơ eo và ví clutch ánh kim theo phong cách Quiet Luxury.",
  },
  "sample10": {
    title: "Sơ Mi Trắng & Quần Jean Thanh Lịch",
    origin: "Smart Casual phương Tây hòa nhịp cùng phong cách năng động Gen Z",
    meaning: "Biểu trưng cho tinh thần trẻ trung, tự tin và giải phóng năng lượng sáng tạo trong nhịp sống đô thị.",
    wearEtiquette: "Thích hợp cho ngày đi học, đi làm hay gặp gỡ bạn bè cuối tuần.",
    genZRemix: "Khoác thêm một chiếc khăn rằn Nam Bộ bản nhỏ quanh cổ như một điểm nhấn văn hóa Việt độc đáo.",
  },

  // --- 11. Y2K Streetwear ---
  "sample11": {
    title: "Y2K Remix Avant-Garde",
    origin: "Thời trang đường phố thập niên 2000 giao thoa hoa văn dân tộc",
    meaning: "Sự nổi loạn ngọt ngào của thế hệ trẻ: không ngần ngại phá vỡ định kiến để tạo nên tuyên ngôn thời trang cá nhân.",
    wearEtiquette: "Dành cho các buổi hẹn cà phê, triển lãm nghệ thuật đương đại, lễ hội âm nhạc đường phố.",
    genZRemix: "Mix áo croptop phong cách Y2K với chân váy voan tầng và vòng choker bạc lấy cảm hứng từ kiềng bạc truyền thống.",
  },
};

// Tra cứu điển tích nhanh cho một món đồ cụ thể hoặc setId
export function getItemCulturalStory(
  item?: { id?: string; setId?: string; category?: Category } | null,
  fallbackSetId?: string
): ItemCulturalStory {
  let matched: ItemCulturalStory | undefined;

  if (item?.id && CULTURAL_STORIES_MAP[item.id]) {
    matched = CULTURAL_STORIES_MAP[item.id];
  } else if (item?.setId && CULTURAL_STORIES_MAP[item.setId]) {
    matched = CULTURAL_STORIES_MAP[item.setId];
  } else if (fallbackSetId && CULTURAL_STORIES_MAP[fallbackSetId]) {
    matched = CULTURAL_STORIES_MAP[fallbackSetId];
  }

  const base: ItemCulturalStory = matched || {
    title: "Trang Phục Truyền Thống Việt Nam",
    origin: "Di sản may mặc truyền thống Việt Nam",
    meaning: "Kết tinh từ sự khéo léo của các nghệ nhân dệt lụa tơ tằm và may đo cung đình dân gian qua nhiều thế hệ.",
    wearEtiquette: "Cần giữ sự kín đáo, đoan trang và tôn trọng bối cảnh lịch sử của trang phục.",
    genZRemix: "Phối layer hài hòa giữa chất liệu truyền thống và phụ kiện hiện đại tối giản.",
  };

  return {
    ...base,
    era: base.era || base.origin,
    historicalContext: base.historicalContext || base.meaning,
    symbolism: base.symbolism || base.meaning,
    etiquette: base.etiquette || base.wearEtiquette,
    genZRemixTips: base.genZRemixTips || base.genZRemix,
    keyDetails: base.keyDetails || [
      "Chất liệu lụa tơ tằm / đũi tơ tự nhiên",
      "Kỹ thuật may tay viền cổ và tà áo chuẩn mực",
      "Màu sắc biểu trưng ngũ hành hài hòa",
      "Phom dáng tôn vinh cốt cách người Việt",
    ],
  };
}

// ============================================================================
// 2. BỘ MÁY GỢI Ý THEO THỜI TIẾT & SỰ KIỆN (WEATHER & OCCASION RECOMMENDER)
// ============================================================================

export type WeatherSeason = "spring" | "summer" | "autumn" | "winter";

export interface WeatherOption {
  id: WeatherSeason;
  label: string;
  icon: string;
  temperature: string;
  description: string;
  fabricsAdvice: string;
}

export const WEATHER_SEASONS: Record<WeatherSeason, WeatherOption> = {
  spring: {
    id: "spring",
    label: "Mùa Xuân Du Hội",
    icon: "🌸",
    temperature: "20°C - 26°C",
    description: "Tiết trời ấm áp, cây cối đâm chồi, mùa của trẩy hội đền chùa và du xuân chúc Tết.",
    fabricsAdvice: "Chất liệu lụa tơ tằm mềm mại, màu sắc rực rỡ (đỏ son, vàng mơ, hồng đào) đón hỷ khí tài lộc.",
  },
  summer: {
    id: "summer",
    label: "Mùa Hè Nắng Rực",
    icon: "☀️",
    temperature: "30°C - 38°C",
    description: "Nắng vàng rực rỡ, ngày hè năng động, chụp ảnh sen hồ hoặc du lịch biển đảo sông nước.",
    fabricsAdvice: "Ưu tiên vải tơ sống, lụa đũi mỏng mát, Áo Bà Ba, Áo Yếm thoáng khí, thấm hút mồ hôi tối đa.",
  },
  autumn: {
    id: "autumn",
    label: "Mùa Thu Dịu Mát",
    icon: "🍂",
    temperature: "22°C - 28°C",
    description: "Gió heo may se lạnh, nắng hanh vàng ươm, thời điểm hoàn hảo nhất để chụp ảnh kỷ yếu học đường.",
    fabricsAdvice: "Áo Dài lụa sen hai tà thướt tha, Áo Ngũ Thân màu chàm lam hoặc Cổ Phục Dân Tộc Thái trang nhã.",
  },
  winter: {
    id: "winter",
    label: "Mùa Đông Se Lạnh",
    icon: "❄️",
    temperature: "12°C - 18°C",
    description: "Gió mùa đông bắc rét ngọt miền Bắc, thích hợp diện những tầng áo ấm áp sang trọng.",
    fabricsAdvice: "Áo Tấc nhung gấm lót hai lớp, Áo Tứ Thân phối layer nhiều màu hoặc Áo Nhật Bình khoác dạ hội ấm áp.",
  },
};

export type OccasionType = "ky-yeu" | "tet" | "dinh-lang" | "dam-cuoi" | "cafe-genz" | "ngoai-giao";

export interface OccasionOption {
  id: OccasionType;
  label: string;
  icon: string;
  description: string;
}

export const OCCASIONS: Record<OccasionType, OccasionOption> = {
  "ky-yeu": {
    id: "ky-yeu",
    label: "Kỷ Yếu Học Đường",
    icon: "🎓",
    description: "Lưu giữ thanh xuân học trò cùng tà Áo Dài trắng và nón bài thơ",
  },
  "tet": {
    id: "tet",
    label: "Tết & Du Xuân",
    icon: "🧧",
    description: "Trẩy hội đầu năm, mừng tuổi ông bà cha mẹ với Áo Tấc & Nhật Bình",
  },
  "dinh-lang": {
    id: "dinh-lang",
    label: "Lễ Hội & Đình Làng",
    icon: "🏮",
    description: "Trẩy hội Kinh Bắc, hát Quan Họ cùng Áo Tứ Thân & Yếm Đào",
  },
  "dam-cuoi": {
    id: "dam-cuoi",
    label: "Hỷ Sự & Đám Cưới",
    icon: "💍",
    description: "Ngày vui lứa đôi, trang phục Nhật Bình hoặc Ngũ Thân quý phái",
  },
  "cafe-genz": {
    id: "cafe-genz",
    label: "Cà Phê Dạo Phố Gen Z",
    icon: "☕",
    description: "Hẹn hò bạn bè, chụp ảnh lookbook phong cách Y2K và Avant-Garde",
  },
  "ngoai-giao": {
    id: "ngoai-giao",
    label: "Ngoại Giao & Sự Kiện",
    icon: "✨",
    description: "Giao lưu văn hóa quốc tế, dạ tiệc di sản tôn vinh tinh hoa Đại Việt",
  },
};

export interface WeatherColorSuggestion {
  name: string;
  hex: string;
  element: NguHanhElement;
}

export interface WeatherRecommendation {
  recommendedSetIds: string[];
  recommendedPresetIds: string[];
  headline: string;
  stylingAdvice: string;
  weatherAdvice: string;
  topItemSuggestion: string;
  recommendedColors: WeatherColorSuggestion[];
  colorDirection: string[];
}

export function recommendByWeatherAndOccasion(
  weather: WeatherSeason,
  occasionId: OccasionType | string
): WeatherRecommendation {
  if (weather === "summer") {
    if (occasionId === "cafe-genz" || occasionId === "dao_pho" || occasionId === "y2k") {
      const colors: WeatherColorSuggestion[] = [
        { name: "Hồng Đào", hex: "#E8A0A3", element: "Hỏa" },
        { name: "Bạch Ngọc", hex: "#F2EFE6", element: "Kim" },
        { name: "Lam Chàm", hex: "#2F4B6E", element: "Thủy" },
      ];
      return {
        recommendedSetIds: ["sample1", "sample11", "sample3"],
        recommendedPresetIds: ["sample1", "sample11", "sample3"],
        headline: "Nắng Hè Phố Thị",
        stylingAdvice: "Nắng hè rực rỡ thích hợp diện Áo Yếm lụa tơ phối chân váy rủ mềm hoặc Áo Bà Ba mát mẻ.",
        weatherAdvice: "Nắng hè rực rỡ thích hợp diện Áo Yếm lụa tơ phối chân váy rủ mềm hoặc Áo Bà Ba mát mẻ.",
        topItemSuggestion: "Áo Yếm lụa tơ hoặc Áo Bà Ba lụa mỏng",
        recommendedColors: colors,
        colorDirection: colors.map((c) => c.hex),
      };
    }
    const colors: WeatherColorSuggestion[] = [
      { name: "Hồng Sen", hex: "#E8A0A3", element: "Hỏa" },
      { name: "Trắng Ngà", hex: "#F2EFE6", element: "Kim" },
      { name: "Vàng Hoàng Cúc", hex: "#E3A857", element: "Thổ" },
    ];
    return {
      recommendedSetIds: ["sample3", "sample1", "sample2"],
      recommendedPresetIds: ["sample3", "sample1", "sample2"],
      headline: "Miệt Vườn Hè Sang",
      stylingAdvice: "Tiết trời oi bức nên chọn phom áo thoáng mát, vải lụa tơ tằm Nam Bộ hoặc Bắc Bộ mỏng nhẹ.",
      weatherAdvice: "Tiết trời oi bức nên chọn phom áo thoáng mát, vải lụa tơ tằm Nam Bộ hoặc Bắc Bộ mỏng nhẹ.",
      topItemSuggestion: "Áo Bà Ba Nam Bộ vắt khăn rằn",
      recommendedColors: colors,
      colorDirection: colors.map((c) => c.hex),
    };
  }

  if (weather === "winter") {
    if (occasionId === "dam-cuoi" || occasionId === "cuoi_hoi" || occasionId === "ngoai-giao") {
      const colors: WeatherColorSuggestion[] = [
        { name: "Đỏ Son Hoàng Gia", hex: "#AE3022", element: "Hỏa" },
        { name: "Xanh Cổ Vịt", hex: "#2F4B6E", element: "Thủy" },
        { name: "Vàng Đồng Hoàng Kim", hex: "#E3A857", element: "Thổ" },
      ];
      return {
        recommendedSetIds: ["sample5", "sample6", "sample4"],
        recommendedPresetIds: ["sample5", "sample6", "sample4"],
        headline: "Dạ Tiệc Mùa Đông Cung Đình",
        stylingAdvice: "Gió lạnh mùa đông là thời điểm vàng để tỏa sáng với Áo Nhật Bình hoặc Áo Tấc nhung gấm cung đình.",
        weatherAdvice: "Gió lạnh mùa đông là thời điểm vàng để tỏa sáng với Áo Nhật Bình hoặc Áo Tấc nhung gấm cung đình.",
        topItemSuggestion: "Áo Nhật Bình hoặc Áo Tấc hoàng gia",
        recommendedColors: colors,
        colorDirection: colors.map((c) => c.hex),
      };
    }
    const colors: WeatherColorSuggestion[] = [
      { name: "Nâu Củ Nâu", hex: "#5B3A29", element: "Thổ" },
      { name: "Chàm Đậm", hex: "#2F4B6E", element: "Thủy" },
      { name: "Huyền Đen", hex: "#1A1A1A", element: "Thủy" },
    ];
    return {
      recommendedSetIds: ["sample6", "sample4", "sample1"],
      recommendedPresetIds: ["sample6", "sample4", "sample1"],
      headline: "Đông Ấm Kinh Kỳ Lớp Áo",
      stylingAdvice: "Mùa đông miền Bắc chuộng kiểu phối nhiều tầng áo (layering) của Áo Tứ Thân hoặc Ngũ Thân lót ấm.",
      weatherAdvice: "Mùa đông miền Bắc chuộng kiểu phối nhiều tầng áo (layering) của Áo Tứ Thân hoặc Ngũ Thân lót ấm.",
      topItemSuggestion: "Áo Tấc thụng hoặc Ngũ Thân lót nhung",
      recommendedColors: colors,
      colorDirection: colors.map((c) => c.hex),
    };
  }

  if (weather === "autumn") {
    const colors: WeatherColorSuggestion[] = [
      { name: "Trắng Lụa Sen", hex: "#F2EFE6", element: "Kim" },
      { name: "Đỏ Chu Sa", hex: "#AE3022", element: "Hỏa" },
      { name: "Vàng Nắng Thu", hex: "#E3A857", element: "Thổ" },
    ];
    return {
      recommendedSetIds: ["sample2", "sample4", "sample7"],
      recommendedPresetIds: ["sample2", "sample4", "sample7"],
      headline: "Thu Hà Nội Duyên Dáng",
      stylingAdvice: "Mùa thu lá bay là thời điểm tuyệt vời nhất để diện Áo Dài truyền thống chụp kỷ yếu tốt nghiệp.",
      weatherAdvice: "Mùa thu lá bay là thời điểm tuyệt vời nhất để diện Áo Dài truyền thống chụp kỷ yếu tốt nghiệp.",
      topItemSuggestion: "Áo Dài Sen kèm Kiềng Bạc và Nón Lá",
      recommendedColors: colors,
      colorDirection: colors.map((c) => c.hex),
    };
  }

  // Mùa xuân (spring)
  const colors: WeatherColorSuggestion[] = [
    { name: "Đỏ Son Cát Tường", hex: "#AE3022", element: "Hỏa" },
    { name: "Vàng Mơ Khởi Sắc", hex: "#E3A857", element: "Thổ" },
    { name: "Lục Ngọc Mùa Xuân", hex: "#2E5339", element: "Mộc" },
  ];
  return {
    recommendedSetIds: ["sample2", "sample5", "sample1"],
    recommendedPresetIds: ["sample2", "sample5", "sample1"],
    headline: "Xuân Khởi Sắc May Mắn",
    stylingAdvice: "Mùa xuân trẩy hội cầu may, trang phục mang sắc đỏ may mắn và vàng sung túc sẽ đón vượng khí đầu năm.",
    weatherAdvice: "Mùa xuân trẩy hội cầu may, trang phục mang sắc đỏ may mắn và vàng sung túc sẽ đón vượng khí đầu năm.",
    topItemSuggestion: "Áo Dài đỏ sen hoặc Áo Nhật Bình ngũ sắc",
    recommendedColors: colors,
    colorDirection: colors.map((c) => c.hex),
  };
}

// ============================================================================
// 3. THUẬT TOÁN THẨM ĐỊNH MÀU SẮC NGŨ HÀNH (COLOR HARMONY ENGINE)
// ============================================================================

export type NguHanhElement = "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";

export interface ColorHarmonyResult {
  score: number; // 0 - 100
  upperElement: NguHanhElement;
  lowerElement: NguHanhElement;
  relationType: "tuong_sinh" | "dong_hanh" | "tuong_phan_dep" | "tuong_khac";
  relationship: string;
  elementsPresent: NguHanhElement[];
  commentary: string;
  verdictTitle: string;
  elementSummary: string;
  culturalMeaning: string;
  stylingAdvice: string;
  paletteContrastRatio: string;
}

// Hàm phân loại màu HEX sang ngũ hành
export function mapHexToNguHanh(hexColor?: string): NguHanhElement {
  if (!hexColor) return "Kim";
  const hex = hexColor.toUpperCase().replace("#", "");
  const r = parseInt(hex.substring(0, 2) || "80", 16);
  const g = parseInt(hex.substring(2, 4) || "80", 16);
  const b = parseInt(hex.substring(4, 6) || "80", 16);

  // Tính độ sáng và bão hòa đơn giản
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Trắng, ánh kim, bạc -> Kim
  if (brightness > 215 && (max - min) < 40) return "Kim";

  // Đen, xanh đen, tím than -> Thủy
  if (brightness < 60) return "Thủy";

  // Sắc xanh dương, chàm lam -> Thủy
  if (b > r + 30 && b > g + 10) return "Thủy";

  // Sắc xanh lá cây, ngọc bích -> Mộc
  if (g > r + 20 && g > b + 20) return "Mộc";

  // Đỏ, hồng, tía, cam rực -> Hỏa
  if (r > g + 40 && r > b + 20) {
    if (g > 150) return "Thổ"; // cam vàng đất
    return "Hỏa";
  }

  // Vàng, nâu đất, be cát -> Thổ
  if (r > 120 && g > 90 && b < 100) return "Thổ";

  // Mặc định dựa trên tông màu chính
  return "Thổ";
}

// Kiểm tra quy luật tương sinh ngũ hành
export function evaluateColorHarmony(
  upperHex: string = "#AE3022",
  lowerHex: string = "#1A1A1A"
): ColorHarmonyResult {
  const upperEl = mapHexToNguHanh(upperHex);
  const lowerEl = mapHexToNguHanh(lowerHex);

  // Bảng quy luật tương sinh: Sinh nhập hoặc Sinh xuất đều tạo sinh khí
  const tuongSinhMap: Record<NguHanhElement, NguHanhElement> = {
    Kim: "Thủy",
    Thủy: "Mộc",
    Mộc: "Hỏa",
    Hỏa: "Thổ",
    Thổ: "Kim",
  };

  const tuongKhacMap: Record<NguHanhElement, NguHanhElement> = {
    Kim: "Mộc",
    Mộc: "Thổ",
    Thổ: "Thủy",
    Thủy: "Hỏa",
    Hỏa: "Kim",
  };

  // 1. Trường hợp Tương Sinh (Điểm tối đa 98 - 100)
  if (tuongSinhMap[upperEl] === lowerEl || tuongSinhMap[lowerEl] === upperEl) {
    return {
      score: 98,
      upperElement: upperEl,
      lowerElement: lowerEl,
      relationType: "tuong_sinh",
      relationship: `Tương Sinh (${upperEl} & ${lowerEl})`,
      elementsPresent: [upperEl, lowerEl],
      commentary: "Cổ nhân coi đây là thế phối hoàn mỹ nhất. Màu sắc áo và quần nâng đỡ nhau như Trời che Đất chở, tạo cảm giác an bình và vượng khí.",
      verdictTitle: "Tương Sinh Phú Quý (Điểm Vàng Di Sản)",
      elementSummary: `${upperEl} và ${lowerEl} tương sinh hỗ trợ tuần hoàn năng lượng`,
      culturalMeaning:
        "Cổ nhân coi đây là thế phối hoàn mỹ nhất. Màu sắc áo và quần nâng đỡ nhau như Trời che Đất chở, tạo cảm giác an bình, vượng khí và hanh thông cho người mặc.",
      stylingAdvice:
        "Bộ phối màu cực kỳ đài các và thuận mắt. Rất thích hợp diện trong các dịp trọng đại như Lễ Cưới, Tết Cổ Truyền hoặc Lễ Trao Bằng Kỷ Yếu.",
      paletteContrastRatio: "Cân bằng thị giác tuyệt hảo (Tỷ lệ vàng 1:1.618)",
    };
  }

  // 2. Trường hợp Đồng Hành (Cùng một hành - Điểm 90 - 94)
  if (upperEl === lowerEl) {
    return {
      score: 92,
      upperElement: upperEl,
      lowerElement: lowerEl,
      relationType: "dong_hanh",
      relationship: `Đồng Hành (${upperEl})`,
      elementsPresent: [upperEl],
      commentary: "Phối trang phục đồng tông thể hiện sự nhất quán, khiêm nhu và tinh tế chuẩn Quiet Luxury của tầng lớp quý tộc xưa.",
      verdictTitle: "Đồng Hành Nhã Nhặn (Monochrome Đương Đại)",
      elementSummary: `Song hành cùng hành ${upperEl}`,
      culturalMeaning:
        "Phối trang phục đồng tông (Tông xuyệt tông) thể hiện sự nhất quán, khiêm nhu và tinh tế chuẩn Quiet Luxury của tầng lớp quý tộc xưa.",
      stylingAdvice:
        "Hãy thêm một điểm nhấn phụ kiện tương phản (như dải nịt ngũ sắc, kiềng bạc hoặc giỏ mây) để tạo chiều sâu cho diện mạo.",
      paletteContrastRatio: "Tương phản êm dịu, hài hòa một sắc độ",
    };
  }

  // 3. Trường hợp Hỏa - Thủy (Đỏ - Đen kiểu Yếm thắm - Váy đụp Kinh Bắc)
  if ((upperEl === "Hỏa" && lowerEl === "Thủy") || (upperEl === "Thủy" && lowerEl === "Hỏa")) {
    return {
      score: 95,
      upperElement: upperEl,
      lowerElement: lowerEl,
      relationType: "tuong_phan_dep",
      relationship: "Tương Phản Kinh Điển (Âm Dương Hài Hòa)",
      elementsPresent: [upperEl, lowerEl],
      commentary: "Sự đối lập giữa Đỏ Son rực rỡ và Đen Tuyền bí ẩn chính là tinh thần của Áo Yếm & Váy Đụp Bắc Bộ — tượng trưng cho Đất và Lửa.",
      verdictTitle: "Tương Phản Kinh Điển (Nét Đẹp Dân Gian Kinh Bắc)",
      elementSummary: "Hỏa (Đỏ Thắm) kết hợp Thủy (Huyền Đen) cân bằng Âm Dương",
      culturalMeaning:
        "Tuy Thủy khắc Hỏa trong ngũ hành nhưng trong mỹ học dân gian Việt Nam, sự đối lập giữa Đỏ Son rực rỡ và Đen Tuyền bí ẩn chính là tinh thần của Áo Yếm & Váy Đụp Bắc Bộ — tượng trưng cho Đất và Lửa.",
      stylingAdvice:
        "Phong cách cực kỳ cá tính và ăn ảnh. Bạn có thể phối thêm kiềng bạc ánh kim (Kim sinh Thủy) để hóa giải tương khắc và đạt sự cân bằng tuyệt đối!",
      paletteContrastRatio: "Độ tương phản cao 4.8:1 (Rất nổi bật khi lên hình)",
    };
  }

  // 4. Các trường hợp tương khắc khác
  if (tuongKhacMap[upperEl] === lowerEl || tuongKhacMap[lowerEl] === upperEl) {
    return {
      score: 82,
      upperElement: upperEl,
      lowerElement: lowerEl,
      relationType: "tuong_khac",
      relationship: `Tương Khắc Phá Cách (${upperEl} & ${lowerEl})`,
      elementsPresent: [upperEl, lowerEl],
      commentary: "Thế phối màu mang tính thử thách và phá cách. Các gam màu tranh chấp sự chú ý tạo nên cá tính nổi loạn thời thượng.",
      verdictTitle: "Tương Phản Phá Cách (Gen Z Color-Block)",
      elementSummary: `${upperEl} và ${lowerEl} tương phản xung khắc mạnh mẽ`,
      culturalMeaning:
        "Thế phối màu mang tính thử thách và phá cách. Các gam màu tranh chấp sự chú ý của mắt nhìn, tạo nên cá tính nổi loạn và ấn tượng thị giác mạnh.",
      stylingAdvice:
        "Để hài hòa hơn, hãy thử giảm độ rực rỡ (Saturation) của một trong hai món đồ hoặc chèn thêm thắt lưng/khăn choàng mang màu trung tính (Trắng hoặc Be cát).",
      paletteContrastRatio: "Tương phản mạnh (Color-blocking thời thượng)",
    };
  }

  // Mặc định
  return {
    score: 88,
    upperElement: upperEl,
    lowerElement: lowerEl,
    relationType: "dong_hanh",
    relationship: `Hài Hòa (${upperEl} & ${lowerEl})`,
    elementsPresent: [upperEl, lowerEl],
    commentary: "Sự kết hợp màu sắc tự nhiên, mang lại cảm giác dễ chịu và duyên dáng.",
    verdictTitle: "Hài Hòa Thanh Nhã",
    elementSummary: `${upperEl} kết hợp ${lowerEl}`,
    culturalMeaning: "Sự kết hợp màu sắc tự nhiên, mang lại cảm giác dễ chịu và thân thiện.",
    stylingAdvice: "Bộ đồ đã đạt độ duyên dáng, bạn có thể tự tin sải bước.",
    paletteContrastRatio: "Vừa vặn, trang nhã",
  };
}

// Phân tích toàn bộ trang phục đang mặc trên Canvas
export function analyzeEquippedOutfitHarmony(
  equipped: EquippedOutfit,
  colorState: ColorState
): ColorHarmonyResult {
  const upperItem = equipped.outerTop || equipped.innerTop;
  const lowerItem = equipped.bottom;

  const upperHex =
    (upperItem && colorState[upperItem.id]) ||
    upperItem?.defaultColor ||
    "#AE3022";

  const lowerHex =
    (lowerItem && colorState[lowerItem.id]) ||
    lowerItem?.defaultColor ||
    "#1A1A1A";

  return evaluateColorHarmony(upperHex, lowerHex);
}

// ============================================================================
// 4. BỘ MÁY KIỂM ĐỊNH CHUẨN MỰC & CẢNH BÁO SAI LỆCH VĂN HÓA (CULTURAL AUTHENTICITY GUARD)
// ============================================================================

export interface CulturalAuthenticityAssessment {
  score: number; // 0 - 100
  tier: "authentic" | "remix" | "notice";
  badgeTitle: string;
  badgeIcon: string;
  badgeColorClass: string;
  headline: string;
  analysis: string;
  etiquetteTips: string[];
  conflicts: string[];
  dominantRegion?: string;
  regionsPresent: string[];
}

// Tra cứu tên gọi tiếng Việt của vùng miền
const REGION_NAMES_MAP: Record<string, string> = {
  bac_bo: "Bắc Bộ (Kinh Bắc)",
  hue: "Cung Đình Huế",
  nam_bo: "Nam Bộ Sông Nước",
  tay_bac: "Tây Bắc (Thái)",
  cham_pa: "Duyên Hải Chăm Pa",
  duong_dai: "Đương Đại / Gen Z",
};

/**
 * Thuật toán kiểm định tính chuẩn mực di sản và phát hiện sai lệch đặc trưng văn hóa
 * Phục vụ tiêu chí Audition: "Cảnh báo những cách kết hợp có thể làm sai lệch đặc trưng văn hóa"
 */
export function checkCulturalAuthenticity(
  equipped: EquippedOutfit,
  occasionId?: string
): CulturalAuthenticityAssessment {
  const activeItems = Object.values(equipped).filter(
    (item) => item && item.category !== "base"
  );

  // 1. Trường hợp người mẫu mộc chưa mặc gì
  if (activeItems.length === 0) {
    return {
      score: 100,
      tier: "authentic",
      badgeTitle: "Người Mẫu Mộc",
      badgeIcon: "accessibility_new",
      badgeColorClass: "bg-surface-container text-on-surface-variant",
      headline: "Sàn Thử Sẵn Sàng",
      analysis: "Chưa khoác y phục. Hãy chọn một mẫu trang phục truyền thống hoặc tự do phối đồ theo phong cách cá nhân.",
      etiquetteTips: ["Bắt đầu bằng việc chọn Áo Trong hoặc Áo Ngoài để định hình phong cách."],
      conflicts: [],
      regionsPresent: [],
    };
  }

  const conflicts: string[] = [];
  const etiquetteTips: string[] = [];
  const regionSet = new Set<string>();

  const upperItem = equipped.outerTop || equipped.innerTop;
  const bottomItem = equipped.bottom;
  const shoesItem = equipped.shoes;
  const headwearItem = equipped.headwear;
  const handheldItem = equipped.handheld;

  // Thu thập các vùng miền có mặt trên trang phục
  activeItems.forEach((it) => {
    if (it?.setId) {
      if (it.setId === "sample1" || it.setId === "sample2") regionSet.add("bac_bo");
      else if (it.setId === "sample4" || it.setId === "sample5" || it.setId === "sample6") regionSet.add("hue");
      else if (it.setId === "sample3") regionSet.add("nam_bo");
      else if (it.setId === "sample7") regionSet.add("tay_bac");
      else if (it.setId === "sample8") regionSet.add("cham_pa");
      else if (it.setId === "sample9" || it.setId === "sample10" || it.setId === "sample11") regionSet.add("duong_dai");
    }
  });

  const regionsPresent = Array.from(regionSet).map((r) => REGION_NAMES_MAP[r] || r);

  // 2. Kiểm tra lỗi nghiêm trọng nhất: Mặc áo mà KHÔNG mặc quần/váy (Thiếu hạ y)
  if (upperItem && !bottomItem) {
    conflicts.push(
      "Thiếu quần/hạ y: Cổ phục Việt Nam (Áo Dài, Áo Tấc, Tứ Thân) luôn tôn vinh nét đoan trang kín đáo. Cổ nhân quy định bắt buộc phải mặc cùng quần lụa dài hoặc váy truyền thống."
    );
    etiquetteTips.push("Hãy trang bị thêm Quần Lụa Trắng hoặc Váy Đụp để bảo đảm thuần phong mỹ tục.");

    return {
      score: 45,
      tier: "notice",
      badgeTitle: "Cảnh Báo Lệch Chuẩn (Thiếu Hạ Y)",
      badgeIcon: "warning",
      badgeColorClass: "bg-rose-900 text-rose-100 border border-rose-500",
      headline: "Vi Phạm Thuần Phong Mỹ Tục",
      analysis: "Trang phục đang thiếu quần/váy truyền thống che chắn cơ thể, làm mất đi sự trang nhã lịch thiệp vốn có của cổ phục.",
      etiquetteTips,
      conflicts,
      regionsPresent,
    };
  }

  // 3. Kiểm tra xung đột: Lễ phục Cung đình Hoàng gia vs Đồ đường phố / Dép lê dân dã
  const isRoyalTop = upperItem?.setId === "sample5" || upperItem?.setId === "sample6" || upperItem?.setId === "sample4";
  const isStreetBottom = bottomItem?.id === "sample11-vay"; // Váy ngắn Y2K
  const isCasualFootwear = shoesItem?.id === "sample3-dep" || shoesItem?.id === "sample11-bot"; // Dép lê Nam Bộ hoặc Bốt hầm hố

  if (isRoyalTop && isStreetBottom) {
    conflicts.push(
      "Lệch chuẩn đẳng cấp y phục: Áo Nhật Bình / Áo Tấc là đại lễ phục cung đình triều Nguyễn tôn nghiêm, quy chế lịch sử bắt buộc đi cùng quần lụa dài quét gót. Phối cùng chân váy ngắn làm phá vỡ phom dáng lễ nghi nguyên bản."
    );
    etiquetteTips.push("Nếu muốn diện Áo Nhật Bình cách tân, hãy chọn chân váy lụa maxi dáng dài thướt tha.");
  }

  if (isRoyalTop && isCasualFootwear) {
    conflicts.push(
      "Lệch chuẩn hài vớ cung đình: Lễ phục hoàng tộc triều Nguyễn cần đi cùng Hài nhung thêu chỉ vàng hoặc Hài mũi cong, tránh phối với dép lê dân gian tạo cảm giác cọc cạch."
    );
  }

  // 4. Kiểm tra xung đột văn hóa vùng miền đặc trưng (Bắc Bộ vs Nam Bộ vs Tây Bắc vs Chăm Pa)
  if (upperItem?.setId === "sample1" && headwearItem?.id === "sample7-khan") {
    conflicts.push(
      "Giao thoa văn hóa Kinh Bắc & Tây Bắc: Áo Tứ Thân đồng bằng Bắc Bộ đội cùng Khăn Piêu của đồng bào Thái. Đây là sự kết hợp thú vị nhưng cần lưu ý nếu mục đích là tái hiện đúng không gian văn hóa hội làng Kinh Bắc."
    );
  }

  if (upperItem?.setId === "sample5" && headwearItem?.id === "sample1-khan") {
    conflicts.push(
      "Lệch cấp bậc lễ phục: Áo Nhật Bình cung đình triều Nguyễn quy định đội Khăn vành dây hoặc Kim ước, không đi cùng Nón Quai Thao dân gian Bắc Bộ."
    );
  }

  if (upperItem?.setId === "sample8" && headwearItem?.id === "sample2-non") {
    etiquetteTips.push("Cổ phục Chăm Pa thường để tóc tự nhiên hoặc vấn khăn thổ cẩm; nón lá là nét đặc trưng của người Kinh.");
  }

  // 5. Kiểm tra không gian sự kiện (Occasion Fit)
  if (occasionId === "dinh-lang" || occasionId === "ngoai-giao") {
    if (upperItem?.setId === "sample11") {
      conflicts.push(
        "Không phù hợp không gian sự kiện: Phong cách Y2K croptop chưa phù hợp với tính chất trang nghiêm, linh thiêng của Đình Làng / Lễ Hội hay dạ tiệc Ngoại Giao."
      );
      etiquetteTips.push("Đề xuất đổi sang Áo Dài, Áo Tấc hoặc Áo Ngũ Thân để tôn vinh sự trang trọng.");
    }
  }

  // 6. Gợi ý cầm tay nhã nhặn
  if (handheldItem && (upperItem?.setId === "sample5" || upperItem?.setId === "sample6")) {
    etiquetteTips.push(`Vật phẩm cầm tay "${handheldItem.name}" kết hợp cùng đại lễ phục cung đình làm tăng nét thanh tao, quý phái.`);
  }

  // 6. Tính toán điểm số & Phân cấp danh hiệu
  let score = 100;
  if (conflicts.length > 0) {
    score = Math.max(60, 100 - conflicts.length * 15);
  } else if (regionSet.size > 2) {
    score = 88; // Mix nhiều vùng miền nhưng có ý thức
  }

  // Phân loại Tier
  if (conflicts.length > 0) {
    return {
      score,
      tier: "notice",
      badgeTitle: "Cần Cân Nhắc Văn Hóa",
      badgeIcon: "info",
      badgeColorClass: "bg-amber-800 text-amber-100 border border-amber-500",
      headline: "Phối Hợp Có Điểm Cần Lưu Ý",
      analysis:
        "Bộ trang phục đang có sự kết hợp giữa các yếu tố văn hóa khác biệt về cấp bậc lễ nghi hoặc vùng miền lịch sử. Hãy đọc các gợi ý bên dưới để hoàn thiện bản phối tôn trọng di sản.",
      etiquetteTips: etiquetteTips.length > 0 ? etiquetteTips : [
        "Cân nhắc thay đổi phụ kiện hoặc lớp áo ngoài để đạt sự đồng bộ văn hóa cao nhất.",
      ],
      conflicts,
      regionsPresent,
    };
  }

  if (regionSet.has("duong_dai") && regionSet.size > 1) {
    return {
      score: 94,
      tier: "remix",
      badgeTitle: "Gen Z Remix Tinh Tế",
      badgeIcon: "palette",
      badgeColorClass: "bg-[#1a2a44] text-[#eed182] border border-[#c59b27]/60",
      headline: "Giao Thoa Cổ Điển & Hiện Đại Độc Đáo",
      analysis:
        "Bạn đã khéo léo kết hợp giữa đường nét di sản truyền thống và phụ kiện/hạ y đương đại. Bản phối vừa giữ được sự kín đáo, vừa thể hiện cá tính thời trang trẻ trung của thế hệ Z.",
      etiquetteTips: [
        "Có thể bổ sung thêm trang sức bạc (kiềng bạc hoặc trâm cài) để tăng chiều sâu nghệ thuật.",
      ],
      conflicts: [],
      regionsPresent,
    };
  }

  return {
    score: 100,
    tier: "authentic",
    badgeTitle: "Di Sản Thuần Khiết (100% Authentic)",
    badgeIcon: "verified",
    badgeColorClass: "bg-[#AE3022] text-[#FAF6EE] border border-[#c59b27]",
    headline: "Chuẩn Mực Lịch Sử & Lễ Nghi Trọn Vẹn",
    analysis:
      "Tất cả các món đồ từ y phục, hạ y đến phụ kiện đều thuộc cùng một hệ thống di sản văn hóa nguyên bản. Phom dáng, đường nét và thần thái toát lên sự đài các, trang nghiêm và chuẩn mực lịch sử tuyệt đối.",
    etiquetteTips: [
      "Bộ trang phục hoàn hảo cho các dịp trọng đại như Lễ Cưới, Kỷ Yếu Học Đường, Ngoại Giao Văn Hóa và Lễ Hội Dân Gian.",
    ],
    conflicts: [],
    regionsPresent,
  };
}

