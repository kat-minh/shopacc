import videoConvertedGif from "./assets/images/video_converted.gif";

export interface GameAccount {
  id: string;
  game: string;
  category: string;
  title: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  avatarUrl: string;
  stats: {
    chronoCrystals?: number;
    vipCharacters?: string[];
    powerLevel?: number;
    starsCount?: string;
    server?: string;
  };
  details: string[];
  status: "Available" | "Sold";
  quantity?: number;
  soldCount?: number;
  credentials: {
    username: string;
    pass: string;
    transferCode?: string;
  };
}

export interface LuckyWheelPrize {
  id: number;
  name: string;
  chance: number; // Percentage
  type: "crystals" | "cash" | "account" | "xp" | "miss";
  value: number; // quantity of Crystals / VNĐ cash etc
  color: string;
}

export interface LuckyWheelGame {
  id: string;
  title: string;
  price: number;
  playedCount: number;
  status: "Active" | "Maintenance";
  imageUrl: string;
  prizes: LuckyWheelPrize[];
}

export interface Transaction {
  id: string;
  type: "card" | "atm" | "buy_account" | "wheel_spin";
  username: string;
  amount: number;
  description: string;
  status: "Success" | "Pending" | "Failed";
  time: string;
}

export interface TopRecharger {
  username: string;
  amount: number;
}

export const INITIAL_TOP_RECHARGERS_JUNE: TopRecharger[] = [
  { username: "hoang_legends", amount: 418000 },
  { username: "Kien_Rerol", amount: 374000 },
  { username: "hteln_pro", amount: 341000 },
  { username: "vuvant_saiyan", amount: 302500 },
  { username: "Tinti_Gamer", amount: 264000 },
];

export const INITIAL_TOP_RECHARGERS_MAY: TopRecharger[] = [
  { username: "goku_ssj4", amount: 850000 },
  { username: "broly_angry", amount: 620000 },
  { username: "vegets_pride", amount: 480000 },
  { username: "gohan_beast", amount: 450000 },
  { username: "frieza_gold", amount: 390000 },
];

export const INITIAL_ACCOUNTS: GameAccount[] = [
  {
    id: "DBL-888",
    game: "Dragon Ball Legends",
    category: "DANH MỤC ACC Android",
    title: "ACC REROL RỒNG THẦN: 35,000 Chrono Crystals + UL Broly 5★",
    price: 65000,
    originalPrice: 120000,
    imageUrl: videoConvertedGif,
    avatarUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80",
    stats: {
      chronoCrystals: 35000,
      vipCharacters: ["UL Broly (Green)", "LL Super Saiyan Goku"],
      powerLevel: 55,
      starsCount: "★ 5 Sao VIP",
      server: "Global (Android/iOS)",
    },
    details: [
      "Crystals siêu khủng để roll sự kiện mới",
      "Đã mở khóa cốt truyện Chương 1 để lấy thêm nguyên liệu",
      "Chế độ PVP chưa bắt đầu, nguyên đai nguyên kiện",
      "Đại lý uy tín, bảo hành hồi phục tài khoản",
    ],
    status: "Available",
    soldCount: 142,
    credentials: {
      username: "sale_reroll_01",
      pass: "god_goku_crystals_999",
      transferCode: "TC-998811AAB",
    },
  },
  {
    id: "DBL-902",
    game: "Dragon Ball Legends",
    category: "DANH MỤC ACC Android",
    title: "ACC TÂN THỦ METAL GOD: UL Gogeta Blue 8★ + 22,000 Crystals",
    price: 90000,
    originalPrice: 180000,
    imageUrl:
      "https://shopgamedbl.com/tep-tin/28077606311.gif",
    avatarUrl:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100&auto=format&fit=crop&q=80",
    stats: {
      chronoCrystals: 22000,
      vipCharacters: ["UL Gogeta Blue", "LL Beast Gohan"],
      powerLevel: 62,
      starsCount: "★ 8 Sao VIP",
      server: "Global (Android/iOS)",
    },
    details: [
      "Giao dịch tức thì qua Transfer Code",
      "Có sẵn UL Gogeta Blue - Meta PvP thống trị",
      "Sạch bóng, không nạp bẩn, bảo hành trọn đời",
    ],
    status: "Available",
    soldCount: 89,
    credentials: {
      username: "meta_legend_902",
      pass: "gogetablue8888",
      transferCode: "TC-483542ZZZ",
    },
  },
  {
    id: "DBL-VIP01",
    game: "Dragon Ball Legends",
    category: "DANH MỤC ACC Android",
    title: "CHỦ PRE-SERVED: UL Vegito Blue Red 3★ + 4★ Gohan Beast + UL Cryhan",
    price: 390000,
    originalPrice: 850000,
    imageUrl:
      "https://shopgamedbl.com/tep-tin/28077606311.gif",
    avatarUrl:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=100&auto=format&fit=crop&q=80",
    stats: {
      chronoCrystals: 1200,
      vipCharacters: [
        "UL Vegito Blue (Red 3★)",
        "UL Cryhan (YEL)",
        "LL Gohan Beast",
      ],
      powerLevel: 250,
      starsCount: "★ 14 Sao VIP",
      server: "Global (All platforms)",
    },
    details: [
      "Acc tâm huyết siêu VIP đầy đủ các nhân vật mạnh nhất meta hiện tại",
      "Trang bị (Equips) Z+ thần thánh đầy đủ",
      "Vé năng lượng và tài nguyên thừa mứa cực đỉnh",
      "Chỉ cần đăng nhập và leo hạng PVP thế giới",
    ],
    status: "Available",
    soldCount: 14,
    credentials: {
      username: "vip_owner_shop_001",
      pass: "vegitoredstar_gg",
      transferCode: "TC-777666VIP",
    },
  },
  {
    id: "DBL-VIP02",
    game: "Dragon Ball Legends",
    category: "DANH MỤC ACC IOS",
    title:
      "ACC PVP TOP 500: Full 5 Siêu Ultra (Vegito, Gogeta, Gohan, Broly, UUI)",
    price: 850000,
    originalPrice: 1500000,
    imageUrl:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80",
    avatarUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&auto=format&fit=crop&q=80",
    stats: {
      chronoCrystals: 4500,
      vipCharacters: [
        "UL Ultra UI Goku",
        "UL Super Saiyan Vegito",
        "UL Super Gogeta Blue",
        "UL Cryhan",
      ],
      powerLevel: 310,
      starsCount: "★ 22 Sao VIP",
      server: "Global (All platforms)",
    },
    details: [
      "Acc Top Rank thế giới PvP không có đối thủ",
      "Đầy đủ thẻ sự kiện, mốc thưởng bang hội tối đa",
      "Thích hợp cho tuyển thủ thi đấu giải hoặc gáy cực mạnh",
      "Bàn giao nguyên bản, bảo mật email tuyệt đối",
    ],
    status: "Available",
    soldCount: 3,
    credentials: {
      username: "gamers_destiny_top",
      pass: "gamers_goku_legend1",
      transferCode: "TC-TOP500DBL",
    },
  },
  {
    id: "DBL-IOS-01",
    game: "Dragon Ball Legends",
    category: "DANH MỤC ACC IOS",
    title: "ACC IOS SIÊU HOT: 40,000 CC + UL Gohan Beast 5★",
    price: 75000,
    originalPrice: 150000,
    imageUrl: "https://shopgamedbl.com/tep-tin/28077606311.gif",
    avatarUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=100&auto=format&fit=crop&q=80",
    stats: {
      chronoCrystals: 40000,
      vipCharacters: ["UL Gohan Beast", "LL Gogeta"],
      powerLevel: 58,
      starsCount: "★ 5 Sao VIP",
      server: "Global (iOS)",
    },
    details: [
      "Tài khoản Reroll dành riêng cho hệ điều hành iOS",
      "Có sẵn 40k Chrono Crystals cực khủng",
      "Đại lý uy tín bảo hành trọn đời",
    ],
    status: "Available",
    credentials: {
      username: "reroll_ios_01",
      pass: "gohan_ios_crystal_999",
      transferCode: "TC-IOS888999",
    },
  },
  {
    id: "DBL-IOS-02",
    game: "Dragon Ball Legends",
    category: "DANH MỤC ACC IOS",
    title: "ACC TÂN THỦ IOS: 30,000 CC + UL Super Vegito 5★",
    price: 60000,
    originalPrice: 110000,
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&auto=format&fit=crop&q=80",
    stats: {
      chronoCrystals: 30000,
      vipCharacters: ["UL Super Vegito"],
      powerLevel: 50,
      starsCount: "★ 5 Sao VIP",
      server: "Global (iOS)",
    },
    details: [
      "Phù hợp cho người dùng iPhone/iPad",
      "Roll thoải mái banner mới nhất",
      "Bảo hành đầy đủ, an toàn 100%",
    ],
    status: "Available",
    credentials: {
      username: "reroll_ios_02",
      pass: "vegito_ios_crystals_777",
      transferCode: "TC-IOS777555",
    },
  },
  {
    id: "DBL-SOLD-01",
    game: "Dragon Ball Legends",
    category: "DANH MỤC ACC Android",
    title: "ACC KHỦNG RA MẮT: UL Gogeta 5★ + 15k CC Giá Học Sinh",
    price: 45000,
    originalPrice: 90000,
    imageUrl:
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    avatarUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80",
    stats: {
      chronoCrystals: 15000,
      vipCharacters: ["UL Super Gogeta Blue"],
      powerLevel: 45,
      starsCount: "★ 5 Sao VIP",
      server: "Global (Android)",
    },
    details: [
      "Tài khoản ngon giá rẻ đã bán cực nhanh",
      "Thanh toán chuyển khoản tự động",
    ],
    status: "Sold",
    credentials: {
      username: "sold_user_account_1",
      pass: "acc_da_ban_roi_nhe",
      transferCode: "TC-SOLD011",
    },
  },
  {
    id: "DBL-104",
    game: "Dragon Ball Legends",
    category: "DANH MỤC ACC Android",
    title: "CHỦ PRE-SERVED: UL Vegito Blue Red 3★ + 4★ Gohan Beast + UL Cryhan",
    price: 390000,
    originalPrice: 850000,
    imageUrl:
      "https://shopgamedbl.com/tep-tin/28077606311.gif",
    avatarUrl:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=100&auto=format&fit=crop&q=80",
    stats: {
      chronoCrystals: 1200,
      vipCharacters: [
        "UL Vegito Blue (Red 3★)",
        "UL Cryhan (YEL)",
        "LL Gohan Beast",
      ],
      powerLevel: 250,
      starsCount: "★ 14 Sao VIP",
      server: "Global (All platforms)",
    },
    details: [
      "Acc tâm huyết siêu VIP đầy đủ các nhân vật mạnh nhất meta hiện tại",
      "Trang bị (Equips) Z+ thần thánh đầy đủ",
      "Vé năng lượng và tài nguyên thừa mứa cực đỉnh",
      "Chỉ cần đăng nhập và leo hạng PVP thế giới",
    ],
    status: "Available",
    credentials: {
      username: "vip_owner_shop_001",
      pass: "vegitoredstar_gg",
      transferCode: "TC-777666VIP",
    },
  },
  {
    id: "DBL-889",
    game: "Dragon Ball Legends",
    category: "DANH MỤC ACC Android",
    title: "ACC REROL RỒNG THẦN: 35,000 Chrono Crystals + UL Broly 5★",
    price: 65000,
    originalPrice: 120000,
    imageUrl: videoConvertedGif,
    avatarUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80",
    stats: {
      chronoCrystals: 35000,
      vipCharacters: ["UL Broly (Green)", "LL Super Saiyan Goku"],
      powerLevel: 55,
      starsCount: "★ 5 Sao VIP",
      server: "Global (Android/iOS)",
    },
    details: [
      "Crystals siêu khủng để roll sự kiện mới",
      "Đã mở khóa cốt truyện Chương 1 để lấy thêm nguyên liệu",
      "Chế độ PVP chưa bắt đầu, nguyên đai nguyên kiện",
      "Đại lý uy tín, bảo hành hồi phục tài khoản",
    ],
    status: "Available",
    credentials: {
      username: "sale_reroll_01",
      pass: "god_goku_crystals_999",
      transferCode: "TC-998811AAB",
    },
  },
  {
    id: "DBL-890",
    game: "Dragon Ball Legends",
    category: "DANH MỤC ACC Android",
    title: "ACC REROL RỒNG THẦN: 35,000 Chrono Crystals + UL Broly 5★",
    price: 65000,
    originalPrice: 120000,
    imageUrl: videoConvertedGif,
    avatarUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80",
    stats: {
      chronoCrystals: 35000,
      vipCharacters: ["UL Broly (Green)", "LL Super Saiyan Goku"],
      powerLevel: 55,
      starsCount: "★ 5 Sao VIP",
      server: "Global (Android/iOS)",
    },
    details: [
      "Crystals siêu khủng để roll sự kiện mới",
      "Đã mở khóa cốt truyện Chương 1 để lấy thêm nguyên liệu",
      "Chế độ PVP chưa bắt đầu, nguyên đai nguyên kiện",
      "Đại lý uy tín, bảo hành hồi phục tài khoản",
    ],
    status: "Available",
    credentials: {
      username: "sale_reroll_01",
      pass: "god_goku_crystals_999",
      transferCode: "TC-998811AAB",
    },
  },
  {
    id: "DBL-891",
    game: "Dragon Ball Legends",
    category: "DANH MỤC ACC Android",
    title: "ACC REROL RỒNG THẦN: 35,000 Chrono Crystals + UL Broly 5★",
    price: 65000,
    originalPrice: 120000,
    imageUrl: videoConvertedGif,
    avatarUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80",
    stats: {
      chronoCrystals: 35000,
      vipCharacters: ["UL Broly (Green)", "LL Super Saiyan Goku"],
      powerLevel: 55,
      starsCount: "★ 5 Sao VIP",
      server: "Global (Android/iOS)",
    },
    details: [
      "Crystals siêu khủng để roll sự kiện mới",
      "Đã mở khóa cốt truyện Chương 1 để lấy thêm nguyên liệu",
      "Chế độ PVP chưa bắt đầu, nguyên đai nguyên kiện",
      "Đại lý uy tín, bảo hành hồi phục tài khoản",
    ],
    status: "Available",
    credentials: {
      username: "sale_reroll_01",
      pass: "god_goku_crystals_999",
      transferCode: "TC-998811AAB",
    },
  },
  {
    id: "DBL-892",
    game: "Dragon Ball Legends",
    category: "DANH MỤC ACC Android",
    title: "ACC REROL RỒNG THẦN: 35,000 Chrono Crystals + UL Broly 5★",
    price: 65000,
    originalPrice: 120000,
    imageUrl: videoConvertedGif,
    avatarUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80",
    stats: {
      chronoCrystals: 35000,
      vipCharacters: ["UL Broly (Green)", "LL Super Saiyan Goku"],
      powerLevel: 55,
      starsCount: "★ 5 Sao VIP",
      server: "Global (Android/iOS)",
    },
    details: [
      "Crystals siêu khủng để roll sự kiện mới",
      "Đã mở khóa cốt truyện Chương 1 để lấy thêm nguyên liệu",
      "Chế độ PVP chưa bắt đầu, nguyên đai nguyên kiện",
      "Đại lý uy tín, bảo hành hồi phục tài khoản",
    ],
    status: "Available",
    credentials: {
      username: "sale_reroll_01",
      pass: "god_goku_crystals_999",
      transferCode: "TC-998811AAB",
    },
  },
  {
    id: "DBL-893",
    game: "Dragon Ball Legends",
    category: "DANH MỤC ACC Android",
    title: "ACC REROL RỒNG THẦN: 35,000 Chrono Crystals + UL Broly 5★",
    price: 65000,
    originalPrice: 120000,
    imageUrl: videoConvertedGif,
    avatarUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80",
    stats: {
      chronoCrystals: 35000,
      vipCharacters: ["UL Broly (Green)", "LL Super Saiyan Goku"],
      powerLevel: 55,
      starsCount: "★ 5 Sao VIP",
      server: "Global (Android/iOS)",
    },
    details: [
      "Crystals siêu khủng để roll sự kiện mới",
      "Đã mở khóa cốt truyện Chương 1 để lấy thêm nguyên liệu",
      "Chế độ PVP chưa bắt đầu, nguyên đai nguyên kiện",
      "Đại lý uy tín, bảo hành hồi phục tài khoản",
    ],
    status: "Available",
    credentials: {
      username: "sale_reroll_01",
      pass: "god_goku_crystals_999",
      transferCode: "TC-998811AAB",
    },
  },
  {
    id: "DBL-894",
    game: "Dragon Ball Legends",
    category: "DANH MỤC ACC Android",
    title: "ACC REROL RỒNG THẦN: 35,000 Chrono Crystals + UL Broly 5★",
    price: 65000,
    originalPrice: 120000,
    imageUrl: videoConvertedGif,
    avatarUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80",
    stats: {
      chronoCrystals: 35000,
      vipCharacters: ["UL Broly (Green)", "LL Super Saiyan Goku"],
      powerLevel: 55,
      starsCount: "★ 5 Sao VIP",
      server: "Global (Android/iOS)",
    },
    details: [
      "Crystals siêu khủng để roll sự kiện mới",
      "Đã mở khóa cốt truyện Chương 1 để lấy thêm nguyên liệu",
      "Chế độ PVP chưa bắt đầu, nguyên đai nguyên kiện",
      "Đại lý uy tín, bảo hành hồi phục tài khoản",
    ],
    status: "Available",
    credentials: {
      username: "sale_reroll_01",
      pass: "god_goku_crystals_999",
      transferCode: "TC-998811AAB",
    },
  },
  {
    id: "DBL-895",
    game: "Dragon Ball Legends",
    category: "DANH MỤC ACC Android",
    title: "ACC REROL RỒNG THẦN: 35,000 Chrono Crystals + UL Broly 5★",
    price: 65000,
    originalPrice: 120000,
    imageUrl: videoConvertedGif,
    avatarUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80",
    stats: {
      chronoCrystals: 35000,
      vipCharacters: ["UL Broly (Green)", "LL Super Saiyan Goku"],
      powerLevel: 55,
      starsCount: "★ 5 Sao VIP",
      server: "Global (Android/iOS)",
    },
    details: [
      "Crystals siêu khủng để roll sự kiện mới",
      "Đã mở khóa cốt truyện Chương 1 để lấy thêm nguyên liệu",
      "Chế độ PVP chưa bắt đầu, nguyên đai nguyên kiện",
      "Đại lý uy tín, bảo hành hồi phục tài khoản",
    ],
    status: "Available",
    credentials: {
      username: "sale_reroll_01",
      pass: "god_goku_crystals_999",
      transferCode: "TC-998811AAB",
    },
  },
  {
    id: "DBL-896",
    game: "Dragon Ball Legends",
    category: "DANH MỤC ACC Android",
    title: "ACC REROL RỒNG THẦN: 35,000 Chrono Crystals + UL Broly 5★",
    price: 65000,
    originalPrice: 120000,
    imageUrl: videoConvertedGif,
    avatarUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80",
    stats: {
      chronoCrystals: 35000,
      vipCharacters: ["UL Broly (Green)", "LL Super Saiyan Goku"],
      powerLevel: 55,
      starsCount: "★ 5 Sao VIP",
      server: "Global (Android/iOS)",
    },
    details: [
      "Crystals siêu khủng để roll sự kiện mới",
      "Đã mở khóa cốt truyện Chương 1 để lấy thêm nguyên liệu",
      "Chế độ PVP chưa bắt đầu, nguyên đai nguyên kiện",
      "Đại lý uy tín, bảo hành hồi phục tài khoản",
    ],
    status: "Available",
    credentials: {
      username: "sale_reroll_01",
      pass: "god_goku_crystals_999",
      transferCode: "TC-998811AAB",
    },
  },
  {
    id: "DBL-897",
    game: "Dragon Ball Legends",
    category: "DANH MỤC ACC Android",
    title: "ACC REROL RỒNG THẦN: 35,000 Chrono Crystals + UL Broly 5★",
    price: 65000,
    originalPrice: 120000,
    imageUrl: videoConvertedGif,
    avatarUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80",
    stats: {
      chronoCrystals: 35000,
      vipCharacters: ["UL Broly (Green)", "LL Super Saiyan Goku"],
      powerLevel: 55,
      starsCount: "★ 5 Sao VIP",
      server: "Global (Android/iOS)",
    },
    details: [
      "Crystals siêu khủng để roll sự kiện mới",
      "Đã mở khóa cốt truyện Chương 1 để lấy thêm nguyên liệu",
      "Chế độ PVP chưa bắt đầu, nguyên đai nguyên kiện",
      "Đại lý uy tín, bảo hành hồi phục tài khoản",
    ],
    status: "Available",
    credentials: {
      username: "sale_reroll_01",
      pass: "god_goku_crystals_999",
      transferCode: "TC-998811AAB",
    },
  },
];

export const CARD_PROVIDERS = [
  { name: "VIETTEL", discount: 10, logoColor: "bg-teal-600" },
  { name: "VINAPHONE", discount: 10, logoColor: "bg-blue-600" },
  { name: "MOBIFONE", discount: 10, logoColor: "bg-blue-500" },
  { name: "ZING CARD", discount: 5, logoColor: "bg-purple-600" },
  { name: "GATE CARD", discount: 5, logoColor: "bg-orange-600" },
];

export const CARD_VALUES = [
  { label: "10,000đ", value: 10000 },
  { label: "20,000đ", value: 20000 },
  { label: "50,000đ", value: 50000 },
  { label: "100,000đ", value: 100000 },
  { label: "200,000đ", value: 200000 },
  { label: "500,000đ", value: 500000 },
  { label: "1,000,000đ", value: 1000000 },
];
