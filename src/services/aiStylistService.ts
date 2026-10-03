// src/services/aiStylistService.ts
// Cố vấn Thời trang & Văn hóa AI: Gợi ý phối trang phục theo bối cảnh, phụ kiện và tư vấn giá trị văn hóa
import {
  type EquippedOutfit,
  type ColorState,
  type LayerStateMap,
  type WardrobeItem,
  OUTFIT_PRESETS,
  WARDROBE_ITEMS,
  type OutfitPreset,
  buildEquippedFromPreset,
} from "../data/dressroomConfig";

export interface StylingOccasion {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  icon: string;
  culturalBackground: string;
  etiquetteTips: string;
  colorPhilosophy: {
    recommendedColors: string[];
    explanation: string;
  };
  suitablePresets: string[]; // preset ids
  recommendedAccessories: {
    name: string;
    description: string;
    itemId?: string;
  }[];
  genZRemixTip: string;
  recommendedPresetId: string;
  recommendedColors: Record<string, string>; // itemCategory or itemId -> hex
}

export const STYLING_OCCASIONS: StylingOccasion[] = [
  {
    id: "tet",
    name: "Tết Cổ Truyền & Du Xuân",
    tagline: "Phú Quý An Khang — Nghênh Xuân Cung Đình",
    badge: "Lễ Hội Đầu Năm",
    icon: "🌸",
    culturalBackground:
      "Tết Nguyên Đán là thời khắc thiêng liêng tống cựu nghinh tân. Người Việt xưa chuộng cổ phục dáng thụng hoặc áo ngũ thân, áo dài để du xuân, lễ gia tiên. Tà áo thanh thoát thể hiện ước vọng về một năm mưa thuận gió hòa, phúc trạch tràn đầy.",
    etiquetteTips:
      "Khi viếng thăm bậc trưởng bối và dâng hương gia tiên, tà áo cần cài cúc chỉnh tề kín cổ, bước đi đoan trang, thể hiện lễ nghi hiếu kính truyền thống.",
    colorPhilosophy: {
      recommendedColors: ["#AE3022", "#E3A857", "#F2EFE6"],
      explanation:
        "Sắc Đỏ Điều (Chu Sa) tượng trưng cho hỷ khí, may mắn và xua đuổi tà khí. Màu Vàng Mơ (Hoàng Yến) đại diện cho vương quyền, no ấm và thịnh vượng.",
    },
    suitablePresets: ["sample2", "sample6", "sample4"],
    recommendedPresetId: "sample2",
    recommendedColors: {
      "sample2-ao": "#AE3022", // Đỏ điều
      "sample2-quan": "#F2EFE6", // Bạch ngọc
    },
    recommendedAccessories: [
      {
        name: "Nón Lá Thanh Trúc",
        description: "16 nan tre đồng tâm che nắng xuân nhẹ nhàng, tôn dáng vóc thon thả bên cành đào thắm.",
        itemId: "sample2-non",
      },
      {
        name: "Kiềng Bạc Chạm Sen",
        description: "Vòng kiềng bạc sáng bóng đúc nổi họa tiết liên hoa mang ý nghĩa thanh cao thoát tục.",
        itemId: "sample2-kieng",
      },
    ],
    genZRemixTip:
      "Phối Áo Dài truyền thống cùng nón lá và một cặp kính râm mắt mèo gọng đồi mồi — nét giao thoa giữa mỹ học cung đình và hơi thở retro chic.",
  },
  {
    id: "le_chua",
    name: "Chiêm Bái Đền Chùa & Tâm Linh",
    tagline: "Tĩnh Lặng Tâm Can — Đoan Trang Kính Cẩn",
    badge: "Chốn Thiêng",
    icon: "🪷",
    culturalBackground:
      "Không gian tôn nghiêm nơi đình chùa, cổ miếu đòi hỏi trang phục giữ trọn đạo mạo, trang nhã. Áo Ngũ Thân đại diện cho Ngũ Luân (Phụ tử, Quân thần, Phu thê, Huynh đệ, Bằng hữu) và Ngũ Thường (Nhân, Lễ, Nghĩa, Trí, Tín).",
    etiquetteTips:
      "Tuyệt đối tránh các màu sắc quá chói lọi, trang phục ngắn hay hở hang. Nên chọn áo dài tay vạt dài quá gối, cài khuy kín cổ.",
    colorPhilosophy: {
      recommendedColors: ["#5B3A29", "#2F4B6E", "#F2EFE6"],
      explanation:
        "Sắc Nâu Cánh Gián mộc mạc gợi nhắc màu áo chàm của các vị thiền sư và người nông dân chất phác. Màu Chàm Lam mang vẻ điềm đạm, lắng đọng tâm thức.",
    },
    suitablePresets: ["sample4", "sample1"],
    recommendedPresetId: "sample4",
    recommendedColors: {
      "sample4-ao": "#5B3A29", // Nâu cánh gián
      "sample4-quan": "#F2EFE6", // Bạch ngọc
    },
    recommendedAccessories: [
      {
        name: "Chuỗi Tràng Hạt Gỗ",
        description: "Chuỗi 108 hạt gỗ quý niệm Phật, ôm lấy cổ áo mandarin mang lại trường năng lượng thanh tịnh.",
        itemId: "sample4-trang-hat",
      },
      {
        name: "Khăn Vấn Lam Trầm",
        description: "Khăn vấn tóc gọn gàng sau gáy, giữ dáng đầu thanh tú khi cúi mình hành lễ.",
        itemId: "sample4-khan",
      },
    ],
    genZRemixTip:
      "Khoác Áo Ngũ Thân trơn màu mộc, đi hài nhung đế bằng êm ái, tạo nét đẹp tối giản (Zen Minimalist) cực kỳ thoát tục.",
  },
  {
    id: "ky_yeu",
    name: "Kỷ Yếu Học Đường & Thanh Xuân",
    tagline: "Lưu Bút Tuổi Trẻ — Trong Trẻo Tinh Khôi",
    badge: "Học Đường Gen Z",
    icon: "🎓",
    culturalBackground:
      "Áo dài và áo bà ba là hai biểu tượng gắn liền với nét đẹp hồn nhiên thời cắp sách. Màu trắng tinh khôi của tà áo dài nữ sinh hay sự dung dị của chiếc áo bà ba đồng bằng sông Cửu Long luôn là ký ức đẹp nhất của thanh xuân.",
    etiquetteTips:
      "Dáng áo may ôm nhẹ nhàng, chất liệu lụa tơ tằm thoáng mát, tôn lên nụ cười rạng rỡ và sự năng động tuổi trẻ.",
    colorPhilosophy: {
      recommendedColors: ["#F2EFE6", "#E8A0A3", "#2E5339"],
      explanation:
        "Bạch Ngọc (trắng lụa) là hiện thân của sự thuần khiết, khởi đầu mới. Hồng Đào tượng trưng cho sức sống thanh xuân tươi thắm.",
    },
    suitablePresets: ["sample2", "sample3", "sample7"],
    recommendedPresetId: "sample2",
    recommendedColors: {
      "sample2-ao": "#F2EFE6", // Bạch ngọc tinh khôi
      "sample2-quan": "#E8A0A3", // Hồng đào
    },
    recommendedAccessories: [
      {
        name: "Nón Lá Cầm Tay Ký Tên",
        description: "Chiếc nón lá truyền thống với những dòng lưu bút lưu niệm tuổi học trò thân thương.",
        itemId: "sample2-non",
      },
      {
        name: "Hoa Sứ Cài Mái Tóc",
        description: "Bông hoa sứ trắng tinh khiết cài nghiêng bờ tóc buông xõa dịu dàng.",
        itemId: "sample3-hoa",
      },
    ],
    genZRemixTip:
      "Phối Áo Dài tơ tằm lụa ngà cùng giày sneaker trắng hoặc hoa tai ngọc trai mini — phong thái nữ sinh hiện đại tràn đầy năng lượng.",
  },
  {
    id: "da_hoi",
    name: "Dạ Hội Hoàng Cung & Sự Kiện Nghệ Thuật",
    tagline: "Vương Giả Triều Nguyễn — Tinh Hoa Di Sản",
    badge: "High Glamour",
    icon: "👑",
    culturalBackground:
      "Áo Nhật Bình là đệ nhất lễ phục triều Nguyễn, chế tác riêng cho Hoàng thái hậu, Hoàng hậu, Công chúa và Cung tần. Cổ áo hình chữ nhật viền ngũ hành kết hợp hoa văn phượng hoàng kim tuyến toát lên quyền uy tột bậc.",
    etiquetteTips:
      "Trang phục có cấu trúc vạt lớn và tay thụng rộng, đòi hỏi phong thái đĩnh đạc, khoan thai và kiêu hãnh.",
    colorPhilosophy: {
      recommendedColors: ["#2F4B6E", "#E3A857", "#AE3022"],
      explanation:
        "Chàm Lam quý phái tương phản cùng dải viền ngũ sắc tượng trưng cho Ngũ Hành (Kim, Mộc, Thủy, Hỏa, Thổ) tuần hoàn vũ trụ.",
    },
    suitablePresets: ["sample5", "sample6"],
    recommendedPresetId: "sample5",
    recommendedColors: {
      "sample5-ao": "#2F4B6E", // Chàm lam hoàng gia
      "sample5-quan": "#E3A857", // Vàng mơ
    },
    recommendedAccessories: [
      {
        name: "Khăn Vành Dây Đính Ngọc",
        description: "Khăn quấn vành dây cung đình kiêu sa, nâng tầm vẻ đẹp đài các của bậc quý tộc.",
        itemId: "sample5-khan",
      },
      {
        name: "Hài Gấm Thêu Chỉ Vàng",
        description: "Đôi hài cong bọc gấm thêu hoa cúc hoàng gia, mũi vuốt kiêu hãnh.",
        itemId: "sample5-hai",
      },
    ],
    genZRemixTip:
      "Mặc Áo Nhật Bình làm áo khoác choàng cape ngoài bên trên một chiếc đầm lụa tối giản — phong cách runway Haute Couture đẳng cấp quốc tế.",
  },
  {
    id: "cong_so",
    name: "Công Sở Thanh Lịch & Giao Thoa Di Sản",
    tagline: "Hiện Đại Sắc Sảo — Phong Thái Nữ Quyền",
    badge: "Modern Chic",
    icon: "💼",
    culturalBackground:
      "Nét duyên ngầm của phụ nữ Việt được chuyển tải khéo léo qua các thiết kế sơ mi lụa tơ tằm cách điệu cổ mandarin hoặc áo dài cách tân tay bồng, phù hợp nhịp sống công sở năng động thế kỷ 21.",
    etiquetteTips:
      "Phom dáng chỉn chu, đường may sắc nét tôn vinh vẻ đẹp trí tuệ và sự tự tin của người phụ nữ hiện đại.",
    colorPhilosophy: {
      recommendedColors: ["#F2EFE6", "#1A2A44", "#E8A0A3"],
      explanation:
        "Tông màu trung tính trang nhã giúp người mặc dễ dàng ghi điểm tác phong chuyên nghiệp trong mắt đối tác và đồng nghiệp.",
    },
    suitablePresets: ["sample9", "sample10"],
    recommendedPresetId: "sample9",
    recommendedColors: {
      "sample9-ao": "#F2EFE6",
    },
    recommendedAccessories: [
      {
        name: "Ví Clutch Bạc Kim Khí",
        description: "Ví cầm tay kim loại ánh bạc sang trọng, cất giữ giấy tờ và đồ trang điểm gọn gàng.",
        itemId: "sample9-vi",
      },
      {
        name: "Giày Cao Gót Mũi Nhọn Khóa Đá",
        description: "Đôi giày cao gót thanh mảnh tôn trọn chiều cao và bước chân uyển chuyển.",
        itemId: "sample9-giay",
      },
    ],
    genZRemixTip:
      "Sơ mi lụa phối cùng chân váy bút chì đính nơ eo, thêm đôi bông tai ngọc trai tối giản chuẩn Quiet Luxury.",
  },
  {
    id: "y2k",
    name: "Dạo Phố Y2K Phá Cách & Remix Cổ Phục",
    tagline: "Nổi Loạn Tinh Nghịch — Streetwear Gen Z",
    badge: "Avant-Garde",
    icon: "⚡",
    culturalBackground:
      "Gen Z không ngần ngại phá vỡ các khuôn mẫu truyền thống. Lấy cảm hứng từ sắc màu hoa văn thổ cẩm Tây Bắc kết hợp với chất liệu da, kim loại xích bạc và phom dáng Y2K thập niên 2000 đầy cá tính.",
    etiquetteTips:
      "Tự do thể hiện cá tính riêng, phối layer phóng khoáng cho các buổi hẹn cà phê, triển lãm nghệ thuật hay lễ hội âm nhạc.",
    colorPhilosophy: {
      recommendedColors: ["#AE3022", "#2F4B6E", "#5B3A29"],
      explanation:
        "Sự va đập tương phản giữa sắc đen huyền bí, hồng neon và bạc xích tạo nên diện mạo thị giác bùng nổ.",
    },
    suitablePresets: ["sample11", "sample8", "sample7"],
    recommendedPresetId: "sample11",
    recommendedColors: {
      "sample11-ao": "#AE3022",
    },
    recommendedAccessories: [
      {
        name: "Vòng Cổ Choker Xích Bạc",
        description: "Choker da phối các mắt xích bạc lấp lánh ôm sát cần cổ thon gọn.",
        itemId: "sample11-choker",
      },
      {
        name: "Tai Nghe Headphone Retro",
        description: "Phụ kiện âm nhạc công nghệ cổ điển thể hiện chất sống Gen Z đam mê âm thanh sống động.",
        itemId: "sample11-headphone",
      },
    ],
    genZRemixTip:
      "Áo sweater croptop mix cùng chân váy xòe voan đen và giày boots cổ cao đinh tán — chuẩn aesthetic Cyberpunk Vietnamese Folk.",
  },
];

// Tùy chọn chất lượng & tốc độ sinh ảnh Stitch
export type GenerationQuality = "fast" | "standard" | "ultra";

export interface QualityConfig {
  id: GenerationQuality;
  label: string;
  badge: string;
  deviceType: "MOBILE" | "DESKTOP";
  estimatedTime: string;
  description: string;
}

export const QUALITY_CONFIGS: Record<GenerationQuality, QualityConfig> = {
  fast: {
    id: "fast",
    label: "Siêu Tốc (Instant Lookbook)",
    badge: "⚡ Tức thì 1-3s",
    deviceType: "MOBILE",
    estimatedTime: "~1 - 3s",
    description: "Kết xuất poster di sản siêu tốc ngay tức thì trong 1-3 giây, không cần chờ đợi.",
  },
  standard: {
    id: "standard",
    label: "Tiêu Chuẩn AI (Balanced)",
    badge: "🌟 Khuyên dùng",
    deviceType: "DESKTOP",
    estimatedTime: "~5 - 8s",
    description: "Bố cục hoàn chỉnh, cân bằng tối ưu giữa độ nét của phục trang và thời gian tạo tác.",
  },
  ultra: {
    id: "ultra",
    label: "Tuyệt Phẩm 8K (Masterpiece)",
    badge: "👑 Tuyệt phẩm",
    deviceType: "DESKTOP",
    estimatedTime: "~8 - 12s",
    description: "Độ phân giải tối đa cho triển lãm, dệt gấm thêu ren cực kỳ tỉ mỉ và ánh sáng điện ảnh cao cấp.",
  },
};

// Danh sách các bối cảnh văn hóa Việt Nam tạo sẵn phong phú
export interface BackgroundPreset {
  id: string;
  name: string;
  category: "cung_dinh" | "pho_thi" | "thien_nhien" | "hien_dai" | "custom";
  groupName: string;
  icon: string;
  promptSetting: string;
}

export const CURATED_BACKGROUNDS: BackgroundPreset[] = [
  {
    id: "hue_citadel",
    name: "Hoàng Thành Huế & Hồ Sen Sương Mờ",
    category: "cung_dinh",
    groupName: "🏛️ Cung Đình & Cố Đô",
    icon: "🏛️",
    promptSetting: "Ancient paved stone courtyard of the Hue Imperial Citadel, weathered mossy balustrades, misty morning lotus pond with pink blooming water lilies, subtle red lacquered royal pavilions in soft mist",
  },
  {
    id: "thai_hoa_palace",
    name: "Điện Thái Hòa Sơn Son Thếp Vàng",
    category: "cung_dinh",
    groupName: "🏛️ Cung Đình & Cố Đô",
    icon: "👑",
    promptSetting: "Regal grand hall of Thái Hòa Imperial Palace, magnificent vermilion lacquered columns with intricate carved golden dragon motifs, subtle glowing silk lanterns, majestic Vietnamese dynastic atmosphere",
  },
  {
    id: "hoi_an_twilight",
    name: "Phố Cổ Hội An Lung Linh Đèn Lồng",
    category: "pho_thi",
    groupName: "🏮 Phố Thị Di Sản",
    icon: "🏮",
    promptSetting: "Charming cobblestone alley in Hoi An ancient town, warm amber lanterns casting gentle reflections, rustic yellow heritage shophouses adorned with vibrant bougainvillea flowers, tranquil Hoai river reflection at twilight",
  },
  {
    id: "hanoi_old_quarter",
    name: "Phố Cổ Hà Nội 36 Phố Phường Rêu Phong",
    category: "pho_thi",
    groupName: "🏮 Phố Thị Di Sản",
    icon: "🚲",
    promptSetting: "Poetic 1930s Hanoi Old Quarter French-Indochinese street corner, weathered moss-tinted ochre walls, golden autumn afternoon sunbeams filtering through ancient tropical foliage, vintage bicycle",
  },
  {
    id: "dinh_lang_bac_bo",
    name: "Đình Làng Bắc Bộ Cây Đa Bến Nước",
    category: "pho_thi",
    groupName: "🏮 Phố Thị Di Sản",
    icon: "🌳",
    promptSetting: "Traditional northern Vietnamese village communal house yard (Đình làng), majestic ancient banyan tree roots, calm village pond with weathered brick steps, nostalgic rural heritage ambiance",
  },
  {
    id: "mu_cang_chai",
    name: "Ruộng Bậc Thang Mù Cang Chải / Sa Pa",
    category: "thien_nhien",
    groupName: "🏞️ Thiên Nhiên & Danh Thắng",
    icon: "🌾",
    promptSetting: "Sweeping emerald and golden rice terraces of Northwest mountains (Mù Cang Chải / Sa Pa), dramatic mountain ridge silhouette, breathtaking sunset golden hour rim lighting, floating mountain mist",
  },
  {
    id: "trang_an_ninh_binh",
    name: "Tràng An Ninh Bình Non Nước Hữu Tình",
    category: "thien_nhien",
    groupName: "🏞️ Thiên Nhiên & Danh Thắng",
    icon: "🚣",
    promptSetting: "Picturesque landscape of Tràng An Ninh Bình, towering karst limestone cliffs rising from serene emerald water, secluded ancient stone pagoda resting at the water edge under soft ethereal fog",
  },
  {
    id: "cho_noi_mien_tay",
    name: "Sông Nước Miền Tây & Chợ Nổi Nam Bộ",
    category: "thien_nhien",
    groupName: "🏞️ Thiên Nhiên & Danh Thắng",
    icon: "🛶",
    promptSetting: "Lush southern Vietnamese Mekong Delta river scenery, traditional wooden sampan boats loaded with yellow apricot blossoms and tropical fruits, coconut palms mirrored on calm sunlit water",
  },
  {
    id: "minimal_studio",
    name: "Studio Nghệ Thuật Editorial Tối Giản",
    category: "hien_dai",
    groupName: "📸 Hiện Đại & Nghệ Thuật",
    icon: "📸",
    promptSetting: "Contemporary minimalist fashion studio, refined warm travertine stone pedestal, dramatic high-fashion museum spotlight, elegant archival typography backdrop, sleek clean editorial aesthetic",
  },
  {
    id: "saigon_y2k_neon",
    name: "Phố Đi Bộ Sài Gòn Retro Y2K Neon",
    category: "hien_dai",
    groupName: "📸 Hiện Đại & Nghệ Thuật",
    icon: "⚡",
    promptSetting: "Bustling modern pedestrian boulevard in downtown Saigon at night, vibrant cinematic neon light reflections, bokeh city lights, stylish Vietnamese streetwear remix energy",
  },
  {
    id: "custom",
    name: "✍️ Tự Nhập Bối Cảnh Riêng (User Custom)...",
    category: "custom",
    groupName: "✍️ Tùy Biến Tự Do",
    icon: "✍️",
    promptSetting: "",
  },
];

// Bảng dịch chi tiết các món đồ sang mô tả thời trang văn hóa
export const ITEM_CULTURAL_TRANSLATIONS: Record<string, string> = {
  // Sample 1 - Tứ Thân
  "sample1-ao": "traditional northern Vietnamese Áo Tứ Thân (flowing four-flap silk tunic)",
  "sample1-yem": "traditional diamond-shaped Áo Yếm silk halter top",
  "sample1-vay": "flowing pleated traditional Vietnamese black silk skirt (váy đụp)",
  "sample1-nit": "ornate silk waist sash (dải nịt ngũ sắc)",
  "sample1-khan": "traditional black raven-beak headscarf (khăn mỏ quạ)",
  "sample1-giay": "traditional handcrafted wooden clogs (guốc mộc)",

  // Sample 2 - Áo Dài
  "sample2-ao": "authentic Vietnamese traditional royal Áo Dài with fine lotus silk embroidery",
  "sample2-quan": "flowing wide-leg white silk trousers",
  "sample2-kieng": "engraved solid silver lotus torque collar (kiềng bạc)",
  "sample2-khan": "traditional fabric crown turban (khăn vấn)",
  "sample2-non": "handcrafted conical bamboo leaf hat (nón lá) held gracefully in hand",
  "sample2-hai": "hand-embroidered floral silk slippers (hài sen)",

  // Sample 3 - Bà Ba
  "sample3-ao": "traditional southern Vietnamese Áo Bà Ba silk blouse with checkered scarf (khăn rằn)",
  "sample3-quan": "flowing loose black silk trousers",
  "sample3-hoa": "fresh plumeria (hoa sứ) flower hair ornament",
  "sample3-gio": "rustic woven bamboo shopping basket (giỏ mây tre)",
  "sample3-guoc": "traditional clattering wooden clogs",

  // Sample 4 - Ngũ Thân
  "sample4-ao": "regal Vietnamese Áo Ngũ Thân standing-collar five-panel robe",
  "sample4-quan": "pure white silk wide-leg trousers",
  "sample4-trang-hat": "sacred 108 wooden prayer beads necklace",
  "sample4-khan": "neatly folded dark indigo head turban (khăn vấn)",
  "sample4-hai": "refined black velvet imperial slippers",

  // Sample 5 - Nhật Bình
  "sample5-ao": "imperial royal Áo Nhật Bình court robe with multicolored rectangular neckband and Phoenix embroidery",
  "sample5-quan": "formal royal white silk trousers",
  "sample5-khan": "dignified royal golden pleated crown turban (khăn vành dây)",
  "sample5-hai": "imperial court velvet shoes with golden cloud embroidery",

  // Sample 6 - Áo Tấc
  "sample6-ao": "formal ceremonial Áo Tấc wide-sleeve robe with standing mandarin collar",
  "sample6-quan": "flowing white silk ceremonial trousers",
  "sample6-khan": "traditional black formal folding turban (khăn đóng)",
  "sample6-hai": "formal brocade ceremonial slippers",

  // Sample 7 - Thái
  "sample7-ao": "traditional Thai ethnic Áo Cóm blouse with silver butterfly buttons",
  "sample7-vay": "handwoven black brocade ethnic tube skirt with geometric border",
  "sample7-khan": "intricately embroidered ethnic Khăn Piêu shawl",
  "sample7-nit": "green woven silk sash belt with silver jingling chùm xà tích chains",
  "sample7-hai": "handcrafted ethnic floral slippers",

  // Sample 8 - Chàm
  "sample8-ao": "authentic Cham ethnic diagonal-buttoned indigo robe with brocade motifs",
  "sample8-quan": "straight-leg Cham ethnic dark trousers",
  "sample8-kieng": "sculpted tribal silver torque necklace",
  "sample8-nit": "tasseled woven tribal sash belt",
  "sample8-khan": "embroidered Cham ethnic head wrap",
  "sample8-sandal": "handcrafted genuine leather sandals",

  // Sample 9 - Công Sở 1
  "sample9-ao": "modern pleated neck silk office blouse",
  "sample9-vay": "chic high-waist pencil skirt with delicate bow knot",
  "sample9-bong-tai": "elegant minimalist pearl stud earrings",
  "sample9-vi": "sleek metallic silver evening clutch purse",
  "sample9-giay": "pointed-toe crystal-buckled high heel stilettos",

  // Sample 10 - Công Sở 2
  "sample10-ao": "crisp white button-down V-neck formal shirt",
  "sample10-quan": "high-waisted dark blue skinny denim jeans",
  "sample10-giay": "nude beige patent pointed-toe pumps",

  // Sample 11 - Y2K
  "sample11-ao": "Y2K cropped black sweater with distressed heritage texture",
  "sample11-vay": "flared black tulle layered mini skirt",
  "sample11-choker": "rebellious black leather choker with silver chain links",
  "sample11-headphone": "retro oversized over-ear headphones accessory",
  "sample11-bot": "chunky lace-up knee-high leather combat boots",
};

export interface OutfitItemSummary {
  category: string;
  categoryLabel: string;
  name: string;
  colorHex?: string;
  descriptionEn: string;
}

export function getEquippedOutfitSummary(
  equippedOutfit: EquippedOutfit,
  colorState: ColorState
): OutfitItemSummary[] {
  const categoryLabels: Record<string, string> = {
    outerTop: "Áo khoác / Áo ngoài",
    innerTop: "Áo trong / Yếm",
    bottom: "Quần / Váy",
    belt: "Thắt lưng / Dải nịt",
    headwear: "Khăn / Mũ / Tóc",
    neckwear: "Kiềng / Vòng cổ",
    shoes: "Giày / Guốc / Hài",
    handheld: "Phụ kiện cầm tay",
    base: "Hình thể",
  };

  const results: OutfitItemSummary[] = [];

  Object.entries(equippedOutfit).forEach(([category, item]) => {
    if (!item || category === "base") return;
    const colorHex = colorState[item.id] || item.defaultColor;
    const cleanName = item.name.replace(/^Sample\s*\d+\s*-\s*/i, "").replace(/^.*-\s*/, "").trim();
    const descriptionEn =
      ITEM_CULTURAL_TRANSLATIONS[item.id] ||
      `${cleanName} (${category})`;

    results.push({
      category,
      categoryLabel: categoryLabels[category] || category,
      name: cleanName || item.name,
      colorHex,
      descriptionEn: colorHex ? `${descriptionEn} in tone ${colorHex}` : descriptionEn,
    });
  });

  return results;
}

// Lấy danh sách item chi tiết của một bộ mẫu preset có sẵn
export function getPresetOutfitSummary(presetId: string): OutfitItemSummary[] {
  const preset = OUTFIT_PRESETS.find((p) => p.id === presetId);
  if (!preset) return [];
  const equipped = buildEquippedFromPreset(preset.id);
  return getEquippedOutfitSummary(equipped, {});
}

// Chế độ nguồn phục trang:
// 1. "mannequin": Lấy mẫu người dùng vừa phối trên bàn mannequin hiện tại
// 2. "preset": Chọn 1 trong 11 bộ mẫu truyền thống có sẵn trong Tủ Đồ
// 3. "custom": Người dùng tự do gõ prompt mô tả mẫu trang phục khác hoàn toàn
export type OutfitSourceMode = "mannequin" | "preset" | "custom";

// Helper sinh Prompt chất lượng cao gửi sang Google Stitch API
export interface StitchPromptOptions {
  equippedOutfit?: EquippedOutfit;
  colorState?: ColorState;
  outfitSourceMode?: OutfitSourceMode;
  presetOutfitId?: string;
  customOutfitDescription?: string;
  userCreativeText?: string;
  occasionId?: string;
  userVibe?: string;
  userGender?: "female" | "male" | "unisex";
  backgroundPresetId?: string;
  customBackground?: string;
  backgroundSetting?: string;
  quality?: GenerationQuality;
}

export function generateStitchFashionPrompt(options: StitchPromptOptions): string {
  const {
    equippedOutfit,
    colorState,
    outfitSourceMode = "mannequin",
    presetOutfitId = "sample2",
    customOutfitDescription = "",
    occasionId = "tet",
    userVibe = "High Fashion Editorial",
    userGender = "female",
    userCreativeText = "",
    backgroundPresetId = "hue_citadel",
    customBackground = "",
    backgroundSetting,
    quality = "standard",
  } = options;

  const occasion = STYLING_OCCASIONS.find((o) => o.id === occasionId) || STYLING_OCCASIONS[0];

  // 1. Phân tích chi tiết phục trang theo nguồn mà người dùng chỉ định
  let outfitListStr = "";
  let outfitThemeName = occasion.name;
  let customGuardrailEn = LOCKED_CULTURAL_GUARDRAIL_EN;

  if (outfitSourceMode === "custom") {
    // Chế độ 3: Người dùng tự do nhập mô tả mẫu phục trang mới (ví dụ: quần jean, áo sơ mi kỉ yếu...)
    if (customOutfitDescription && customOutfitDescription.trim()) {
      const rawDesc = customOutfitDescription.trim();
      outfitListStr = rawDesc;
      outfitThemeName = "Sáng Tạo Cá Nhân";

      // Khung chuẩn mực văn hóa thích ứng cho trang phục hiện đại/remix:
      customGuardrailEn =
        "Vietnamese Cultural Modesty & Aesthetic Standard: Elegant, stylish, and tasteful attire, graceful silhouette, decent and respectful posture (kín đáo, lịch sự, tôn trọng thuần phong mỹ tục), no indecent exposure, culturally appreciative.";
    } else {
      outfitListStr = "Stylized contemporary Vietnamese fashion ensemble";
      outfitThemeName = "Sáng Tạo Tự Do";
    }
  } else if (outfitSourceMode === "preset") {
    // Chế độ 2: Người dùng chọn 1 trong các bộ mẫu có sẵn
    const preset = OUTFIT_PRESETS.find((p) => p.id === presetOutfitId) || OUTFIT_PRESETS[1];
    outfitThemeName = preset.name;
    const presetSummaries = getPresetOutfitSummary(preset.id);
    if (presetSummaries.length > 0) {
      outfitListStr = presetSummaries.map((item) => item.descriptionEn).join(", ");
    } else {
      outfitListStr = preset.description || preset.name;
    }
  } else {
    // Chế độ 1: Mẫu người dùng vừa phối trên bàn Mannequin
    const outfitSummaries = equippedOutfit ? getEquippedOutfitSummary(equippedOutfit, colorState || {}) : [];
    if (outfitSummaries.length > 0) {
      outfitListStr = outfitSummaries.map((item) => item.descriptionEn).join(", ");
    } else {
      outfitListStr = "Traditional Vietnamese Royal Ao Dai with lotus silk embroidery";
    }
  }

  // 2. Xác định bối cảnh: ưu tiên bối cảnh do user tự gõ nếu có
  let effectiveSetting = backgroundSetting;
  if (!effectiveSetting) {
    if (customBackground && customBackground.trim()) {
      effectiveSetting = customBackground.trim();
    } else {
      const preset = CURATED_BACKGROUNDS.find((b) => b.id === backgroundPresetId) || CURATED_BACKGROUNDS[0];
      effectiveSetting = preset.promptSetting || "Hue Imperial Citadel stone courtyard with lotus pond and mist";
    }
  }

  // Giới tính hiển thị
  const genderTerm =
    userGender === "male"
      ? "Vietnamese male model"
      : userGender === "unisex"
      ? "Vietnamese fashion model"
      : "Vietnamese female model";

  const creativeDetailStr = userCreativeText && userCreativeText.trim()
    ? `Creative nuances & touches: ${userCreativeText.trim()}.`
    : "";

  // Bản nháp nhanh: tinh gọn token, không đòi hỏi 8K render, có khóa bảo vệ văn hóa
  if (quality === "fast") {
    return `Minimalist Vietnamese fashion lookbook card draft:
[LOCKED HERITAGE GUARDRAIL: ${customGuardrailEn}]
Subject: A stylish ${genderTerm} (${userVibe}).
Attire: ${outfitListStr}.
${creativeDetailStr ? `Details: ${creativeDetailStr}\n` : ""}Setting / Background: ${effectiveSetting}.
Layout: Clean single-column mobile lookbook card, title "VIETNAM FASHION LOOKBOOK - ${outfitThemeName.toUpperCase()}", minimalist vector layout, streamlined web rendering.`;
  }

  // Tiêu chuẩn HD: cân bằng màu sắc và ánh sáng
  if (quality === "standard") {
    return `Editorial lookbook fashion poster:
[LOCKED HERITAGE GUARDRAIL: ${customGuardrailEn}]
Subject: A young stylish ${genderTerm} (aesthetic: ${userVibe}) posing with elegance and poise.
Attire: ${outfitListStr}.
${creativeDetailStr ? `Creative Accents: ${creativeDetailStr}\n` : ""}Theme: ${outfitThemeName} (${occasion.tagline}).
Cultural Details: Refined textures, authentic collar neckline, handcrafted details and harmonious color palette.
Setting / Atmosphere: ${effectiveSetting}, warm soft golden hour sunset lighting, imperial elegance and gentle atmospheric depth.
Typography & Layout: Fashion lookbook poster with title "VIETNAM FASHION LOOKBOOK - ${outfitThemeName.toUpperCase()}", curated color palette swatch bar at bottom, clean HD editorial photography aesthetic.`;
  }

  // Siêu nét 8K: dành cho bản poster triển lãm cao cấp
  return `High-fashion full-body lookbook editorial poster:
[LOCKED HERITAGE GUARDRAIL: ${customGuardrailEn}]
Subject: A young stylish ${genderTerm} (aesthetic: ${userVibe}) posing gracefully in full figure.
Attire: ${outfitListStr}.
${creativeDetailStr ? `Creative Accents: ${creativeDetailStr}\n` : ""}Theme: ${outfitThemeName} (${occasion.tagline}).
Cultural Details: Exquisite fabric textures, layered silk robes, authentic neckline collar, traditional hand-crafted embroidery details.
Setting / Atmosphere: ${effectiveSetting}, soft cinematic sunset lighting, golden hour rim lights, subtle fog mist, dignified imperial atmosphere.
Typography & Layout: Premium magazine poster format, archival typography layout with elegant title "VIETNAM FASHION LOOKBOOK - ${outfitThemeName.toUpperCase()}", curated color palette swatch bar at bottom, museum exhibition grade composition, 8k resolution fashion photography aesthetic.`;
}

// ---- QUY TẮC BẢO CHỨNG THUẦN PHONG MỸ TỤC BẤT DI BẤT DỊCH (LOCKED INVARIANT) ----
export const LOCKED_CULTURAL_GUARDRAIL_VI =
  "Quy chuẩn Di sản & Thuần phong mỹ tục Việt Nam: Trang phục truyền thống đoan trang, kín đáo, đầy đủ áo và quần/váy truyền thống dài qua gối, phom dáng lịch sử chuẩn mực, chất liệu lụa gấm tự nhiên cao cấp, tuyệt đối không hở hang, không phản cảm, không làm sai lệch bản sắc văn hóa.";

export const LOCKED_CULTURAL_GUARDRAIL_EN =
  "Strict Authentic Vietnamese Heritage & Cultural Modesty Guardrails: Modest full-body attire strictly including traditional wide-leg trousers or pleated skirt, historically accurate Vietnamese silhouette, museum-grade silk and brocade textures, elegant dignified posture, strictly non-revealing, no indecent exposure, zero westernized distortion.";

// ---- HỆ THỐNG KIỂM TRA THUẦN PHONG MỸ TỤC KHI PHỐI TRANG PHỤC ----
export interface CulturalEtiquetteCheck {
  isCompliant: boolean;
  isMissingBottom: boolean;
  hasUpperGarment: boolean;
  upperGarmentName?: string;
  title: string;
  message: string;
  warningMessage: string;
  shortWarning: string;
  suggestedBottomItem?: WardrobeItem;
}

export function checkCulturalEtiquette(
  equippedOutfit: EquippedOutfit,
  layerVisibility: LayerStateMap
): CulturalEtiquetteCheck {
  const activeUpper =
    (equippedOutfit.outerTop && layerVisibility.outerTop ? equippedOutfit.outerTop : null) ||
    (equippedOutfit.innerTop && layerVisibility.innerTop ? equippedOutfit.innerTop : null);

  const hasUpper = Boolean(activeUpper);
  const hasBottom = Boolean(equippedOutfit.bottom && layerVisibility.bottom);

  // Nếu mặc áo mà KHÔNG mặc quần/váy -> Cảnh báo vi phạm thuần phong mỹ tục
  if (hasUpper && !hasBottom) {
    const setId = activeUpper?.setId || "sample2";
    // Tìm quần/váy phù hợp nhất với bộ trang phục đang mặc
    const matchingBottom =
      WARDROBE_ITEMS.find((it) => it.category === "bottom" && it.setId === setId) ||
      WARDROBE_ITEMS.find((it) => it.id === "sample2-quan") ||
      WARDROBE_ITEMS.find((it) => it.category === "bottom");

    const warnMsg =
      "Áo Dài và Cổ Phục Việt Nam mang nét đẹp đoan trang kín đáo. Cổ nhân quy định tà áo bắt buộc phải đi cùng quần lụa dài hoặc váy truyền thống để giữ gìn thuần phong mỹ tục!";

    return {
      isCompliant: false,
      isMissingBottom: true,
      hasUpperGarment: true,
      upperGarmentName: activeUpper?.name,
      title: "Cảnh Báo Thuần Phong Mỹ Tục",
      message: warnMsg,
      warningMessage: warnMsg,
      shortWarning: "Thiếu quần / hạ y",
      suggestedBottomItem: matchingBottom,
    };
  }

  const okMsg = "Trang phục phối hợp đoan trang, đúng chuẩn lễ nghi di sản văn hóa Việt.";

  return {
    isCompliant: true,
    isMissingBottom: false,
    hasUpperGarment: hasUpper,
    upperGarmentName: activeUpper?.name,
    title: "Trang Phục Chuẩn Mực",
    message: okMsg,
    warningMessage: okMsg,
    shortWarning: "Hài hòa lễ nghi",
  };
}

// ---- AI THẨM ĐỊNH & GÓP Ý PROMPT (PROMPT AUDIT & CULTURAL REVIEW) ----
export interface PromptAuditResult {
  status: "passed" | "warning";
  score: number; // 0 - 100
  modestyScore: number;
  isCulturallyModest: boolean;
  warnings: string[];
  suggestions: string[];
  enhancedPrompt: string;
}

export function auditAndEnhancePrompt(
  userCreativeText: string,
  outfitListStr: string,
  userVibe: string = "High Fashion Editorial",
  effectiveSetting: string = ""
): PromptAuditResult {
  const lower = (userCreativeText || "").toLowerCase();
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let score = 95;

  // 1. Kiểm tra từ khóa nhạy cảm / trái thuần phong mỹ tục
  const immodestWords = [
    "hở",
    "sexy",
    "gợi cảm quá đà",
    "bikini",
    "lộ",
    "thiếu quần",
    "không mặc quần",
    "xuyên thấu hở hang",
    "ngắn cũn",
    "cleavage",
    "revealing",
    "naked",
    "topless",
    "underwear",
    "no pants",
    "pantless",
    "provocative",
  ];

  const foundImmodest = immodestWords.filter((w) => lower.includes(w));
  if (foundImmodest.length > 0) {
    warnings.push(
      `Phát hiện từ khóa chưa phù hợp với thuần phong mỹ tục cổ phục: "${foundImmodest.join(
        '", "'
      )}". Đề xuất chuyển sang phong thái đoan trang, thanh tao.`
    );
    score -= 30;
  }

  // 2. Kiểm tra nếu prompt quá ngắn hoặc thiếu bối cảnh nghệ thuật
  if (userCreativeText.trim().length < 10) {
    suggestions.push(
      "Gợi ý bổ sung chi tiết ánh sáng: 'nắng sớm xuyên qua rèm trúc', 'hoàng hôn nhuộm vàng mái ngói rêu phong'."
    );
    suggestions.push(
      "Gợi ý bổ sung thần thái: 'ánh mắt mơ màng trầm tĩnh', 'nụ cười e ấp dịu dàng chuẩn mực phụ nữ Á Đông'."
    );
    score = Math.min(score, 85);
  }

  // 3. Gợi ý chất liệu dệt thêu di sản cao cấp
  if (
    !lower.includes("lụa") &&
    !lower.includes("gấm") &&
    !lower.includes("silk") &&
    !lower.includes("brocade")
  ) {
    suggestions.push(
      "Gợi ý thêm chất liệu di sản: 'lụa tơ tằm Vạn Phúc thêu chỉ vàng', 'gấm vân mây hoa cúc hoàng triều'."
    );
  }

  // 4. Tạo phiên bản Prompt Nâng Cấp Tinh Hoa Nghệ Thuật (Enhanced Prompt)
  let cleanedUserText = userCreativeText;
  foundImmodest.forEach((w) => {
    cleanedUserText = cleanedUserText.replace(new RegExp(w, "gi"), "đoan trang thanh lịch");
  });

  const enhancedParts = [
    `Authentic Vietnamese traditional attire ensemble: ${outfitListStr}`,
    `Poise: Elegant, modest, culturally dignified posture reflecting traditional Vietnamese virtue`,
    `Aesthetic: ${userVibe}, museum-grade textile authenticity, refined natural silk draping`,
  ];

  if (cleanedUserText.trim()) {
    enhancedParts.push(`User Creative Details: ${cleanedUserText.trim()}`);
  }

  if (effectiveSetting) {
    enhancedParts.push(
      `Atmosphere & Setting: ${effectiveSetting}, soft cinematic ambient lighting, golden hour warmth`
    );
  }

  enhancedParts.push(
    `Cultural Standard: Full traditional attire including modest trousers/skirt, historically faithful silhouette, high-fashion editorial composition`
  );

  const enhancedPrompt = enhancedParts.join(". ");

  return {
    status: warnings.length > 0 ? "warning" : "passed",
    score: Math.max(score, 50),
    modestyScore: Math.max(score, 50),
    isCulturallyModest: warnings.length === 0,
    warnings,
    suggestions,
    enhancedPrompt,
  };
}

// Helper áp dụng Preset & Màu đề xuất của Cố vấn AI vào Mannequin
export function applyRecommendedOccasion(
  occasionId: string,
  onApplyOutfit: (preset: OutfitPreset, colors: Record<string, string>) => void
): boolean {
  const occasion = STYLING_OCCASIONS.find((o) => o.id === occasionId);
  if (!occasion) return false;

  const preset = OUTFIT_PRESETS.find((p) => p.id === occasion.recommendedPresetId);
  if (!preset) return false;

  onApplyOutfit(preset, occasion.recommendedColors);
  return true;
}

