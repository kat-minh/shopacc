import { useState, FormEvent } from "react";
import { GameAccount, Transaction } from "../data";
import {
  Shield,
  Plus,
  Trash2,
  RefreshCw,
  Coins,
  History,
  Inbox,
  X,
  Search,
  Eye,
  Info,
  LayoutDashboard,
  BarChart3,
  PieChart,
  TrendingUp,
} from "lucide-react";
import EmptyState from "./EmptyState";
import ConfirmDialog from "./ConfirmDialog";
import { useToastStore } from "../store/useToastStore";

interface AdminPanelProps {
  accounts: GameAccount[];
  transactions: Transaction[];
  onAddAccount: (newAcc: GameAccount) => void;
  onDeleteAccount: (id: string) => void;
  onResetShop: () => void;
  onBack: () => void;
  onEditAccount?: (updatedAcc: GameAccount) => void;
}

export default function AdminPanel({
  accounts,
  transactions,
  onAddAccount,
  onDeleteAccount,
  onResetShop,
  onBack,
  onEditAccount,
}: AdminPanelProps) {
  // Navigation & tabs states
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = useState<"dashboard" | "transactions" | "accounts">("dashboard");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedAcc, setSelectedAcc] = useState<GameAccount | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAcc, setEditingAcc] = useState<GameAccount | null>(null);

  // Confirmations
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Pagination states
  const [txPage, setTxPage] = useState(1);
  const [accPage, setAccPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Search filter states
  const [txSearch, setTxSearch] = useState("");
  const [accSearch, setAccSearch] = useState("");

  // Transaction filters
  const [txPriceRange, setTxPriceRange] = useState<string>("All");
  const [txUserFilter, setTxUserFilter] = useState<string>("All");

  // Account filters
  const [accGameFilter, setAccGameFilter] = useState<string>("All");
  const [accPriceRange, setAccPriceRange] = useState<string>("All");
  const [accStatusFilter, setAccStatusFilter] = useState<string>("All");

  // Add account form states
  const [id, setId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<number>(90000);
  const [originalPrice, setOriginalPrice] = useState<number>(185000);
  const [category, setCategory] = useState<string>(
    "DANH MỤC ACC Android",
  );
  const [chronoCrystals, setChronoCrystals] = useState<number>(25000);
  const [stars, setStars] = useState<number>(8);
  const [characters, setCharacters] = useState<string>(
    "UL Vegito Blue, LL Super Goku",
  );
  const [details, setDetails] = useState<string>(
    "Acc sạch 100%, bảo hành 30 ngày lỗi hoàn bổ sung",
  );
  const [accountUser, setAccountUser] = useState<string>("");
  const [accountPass, setAccountPass] = useState<string>("");
  const [transferCode, setTransferCode] = useState<string>("");

  // Edit account form states
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editOriginalPrice, setEditOriginalPrice] = useState(0);
  const [editCategory, setEditCategory] = useState("");
  const [editChronoCrystals, setEditChronoCrystals] = useState(0);
  const [editStars, setEditStars] = useState(0);
  const [editCharacters, setEditCharacters] = useState("");
  const [editDetails, setEditDetails] = useState("");
  const [editAccountUser, setEditAccountUser] = useState("");
  const [editAccountPass, setEditAccountPass] = useState("");
  const [editTransferCode, setEditTransferCode] = useState("");
  const [editStatus, setEditStatus] = useState<"Available" | "Sold">("Available");

  const [notif, setNotif] = useState<string>("");

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!id || !title || !accountUser || !accountPass) {
      addToast(
        "Vui lòng điền các trường bắt buộc: Mã Acc, Tên Tiêu đề, Tài khoản và Mật khẩu!",
        "error"
      );
      return;
    }

    const vipCharactersList = characters
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const detailsList = details
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    const newGameAccount: GameAccount = {
      id: id.trim().toUpperCase(),
      game: "Dragon Ball Legends",
      category: category,
      title: title.trim(),
      price: price,
      originalPrice: originalPrice,
      imageUrl:
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
      avatarUrl:
        "https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80",
      stats: {
        chronoCrystals: chronoCrystals,
        vipCharacters: vipCharactersList,
        powerLevel: Math.floor(chronoCrystals / 400) + 10,
        starsCount: stars,
        server: "Global (Android & iOS)",
      },
      details:
        detailsList.length > 0
          ? detailsList
          : ["Giao dịch tự động siêu tốc", "Cam kết an toàn và sạch sẽ"],
      status: "Available",
      credentials: {
        username: accountUser.trim(),
        pass: accountPass.trim(),
        transferCode: transferCode.trim() || undefined,
      },
    };

    onAddAccount(newGameAccount);
    setNotif(`Đã đăng bán thành công tài khoản mã ${id}!`);
    setTimeout(() => setNotif(""), 3000);

    // Reset forms & close modal
    setId("");
    setTitle("");
    setAccountUser("");
    setAccountPass("");
    setTransferCode("");
    setShowAddForm(false);
  };

  const startEditAccount = (acc: GameAccount) => {
    setEditId(acc.id);
    setEditTitle(acc.title);
    setEditPrice(acc.price);
    setEditOriginalPrice(acc.originalPrice);
    setEditCategory(acc.category);
    setEditChronoCrystals(acc.stats.chronoCrystals);
    setEditStars(acc.stats.starsCount);
    setEditCharacters(acc.stats.vipCharacters?.join(", ") || "");
    setEditDetails(acc.details?.join(", ") || "");
    setEditAccountUser(acc.credentials.username);
    setEditAccountPass(acc.credentials.pass);
    setEditTransferCode(acc.credentials.transferCode || "");
    setEditStatus(acc.status);

    setSelectedAcc(null); // Close detail modal if open
    setEditingAcc(acc);
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editId || !editTitle || !editAccountUser || !editAccountPass) {
      addToast("Vui lòng điền các trường bắt buộc!", "error");
      return;
    }

    const vipCharactersList = editCharacters
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const detailsList = editDetails
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    const updatedAcc: GameAccount = {
      ...editingAcc!,
      id: editId.trim().toUpperCase(),
      category: editCategory,
      title: editTitle.trim(),
      price: editPrice,
      originalPrice: editOriginalPrice,
      stats: {
        ...editingAcc!.stats,
        chronoCrystals: editChronoCrystals,
        starsCount: editStars,
        vipCharacters: vipCharactersList,
        powerLevel: Math.floor(editChronoCrystals / 400) + 10,
      },
      details: detailsList.length > 0 ? detailsList : ["Giao dịch tự động"],
      status: editStatus,
      credentials: {
        username: editAccountUser.trim(),
        pass: editAccountPass.trim(),
        transferCode: editTransferCode.trim() || undefined,
      },
    };

    onEditAccount?.(updatedAcc);
    setNotif(`Đã cập nhật thành công tài khoản mã ${editId}!`);
    setTimeout(() => setNotif(""), 3000);
    setEditingAcc(null);
  };

  // Compute stat metrics
  const totalRevenue = transactions
    .filter((tx) => tx.type === "buy_account" || tx.type === "wheel_spin")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalRecharged = transactions
    .filter((tx) => tx.type === "card" || tx.type === "atm")
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Extract unique users list dynamically
  const uniqueUsers = Array.from(new Set(transactions.map((t) => t.username))).filter(Boolean);

  // Filter transactions
  const filteredTxs = transactions.filter((tx) => {
    const q = txSearch.toLowerCase();
    const matchesSearch =
      tx.id.toLowerCase().includes(q) ||
      tx.username.toLowerCase().includes(q) ||
      tx.description.toLowerCase().includes(q) ||
      tx.type.toLowerCase().includes(q);

    // User filter dropdown check
    const matchesUser = txUserFilter === "All" || tx.username === txUserFilter;

    // Price range dropdown check
    let matchesPrice = true;
    if (txPriceRange === "under_50k") {
      matchesPrice = tx.amount < 50000;
    } else if (txPriceRange === "50k_200k") {
      matchesPrice = tx.amount >= 50000 && tx.amount <= 200000;
    } else if (txPriceRange === "200k_500k") {
      matchesPrice = tx.amount >= 200000 && tx.amount <= 500000;
    } else if (txPriceRange === "over_500k") {
      matchesPrice = tx.amount > 500000;
    }

    return matchesSearch && matchesUser && matchesPrice;
  });

  // Filter accounts
  const filteredAccs = accounts.filter((acc) => {
    const q = accSearch.toLowerCase();
    const matchesSearch =
      acc.id.toLowerCase().includes(q) ||
      acc.title.toLowerCase().includes(q) ||
      acc.category.toLowerCase().includes(q);

    const matchesGame = accGameFilter === "All" || acc.game.toLowerCase().includes(accGameFilter.toLowerCase());
    const matchesStatus = accStatusFilter === "All" || acc.status === accStatusFilter;

    // Price range dropdown check
    let matchesPrice = true;
    if (accPriceRange === "under_100k") {
      matchesPrice = acc.price < 100000;
    } else if (accPriceRange === "100k_300k") {
      matchesPrice = acc.price >= 100000 && acc.price <= 300000;
    } else if (accPriceRange === "300k_1m") {
      matchesPrice = acc.price >= 300000 && acc.price <= 1000000;
    } else if (accPriceRange === "over_1m") {
      matchesPrice = acc.price > 1000000;
    }

    return matchesSearch && matchesGame && matchesStatus && matchesPrice;
  });

  // Paginated elements
  const totalTxPages = Math.max(1, Math.ceil(filteredTxs.length / ITEMS_PER_PAGE));
  const paginatedTxs = filteredTxs.slice((txPage - 1) * ITEMS_PER_PAGE, txPage * ITEMS_PER_PAGE);

  const totalAccPages = Math.max(1, Math.ceil(filteredAccs.length / ITEMS_PER_PAGE));
  const paginatedAccs = filteredAccs.slice((accPage - 1) * ITEMS_PER_PAGE, accPage * ITEMS_PER_PAGE);

  // Helper to query account purchaser
  const getBuyerUsername = (accountId: string) => {
    const tx = transactions.find(
      (t) => t.type === "buy_account" && t.description.includes(accountId)
    );
    return tx ? tx.username : "Không rõ";
  };

  // --- DASHBOARD DATA PROCESSING ---
  // 1. Monthly Revenue Chart (type: buy_account, wheel_spin)
  const monthlyRevenueData: { [key: string]: number } = {};
  transactions.forEach((tx) => {
    if (tx.type === "buy_account" || tx.type === "wheel_spin") {
      const match = tx.time.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      const monthKey = match ? `${match[2]}/${match[3]}` : "06/2026";
      monthlyRevenueData[monthKey] = (monthlyRevenueData[monthKey] || 0) + tx.amount;
    }
  });

  // Ensure current and previous months are represented
  const currentMonthStr = `${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
  const prevMonthVal = new Date().getMonth() === 0 ? 12 : new Date().getMonth();
  const prevYearVal = new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear();
  const prevMonthStr = `${prevMonthVal}/${prevYearVal}`;

  if (Object.keys(monthlyRevenueData).length === 0) {
    // Seed with mock data for display aesthetics if empty
    monthlyRevenueData[prevMonthStr] = 850000;
    monthlyRevenueData[currentMonthStr] = 450000;
  } else {
    if (monthlyRevenueData[currentMonthStr] === undefined) monthlyRevenueData[currentMonthStr] = 0;
    if (monthlyRevenueData[prevMonthStr] === undefined) monthlyRevenueData[prevMonthStr] = 0;
  }

  const sortedMonths = Object.keys(monthlyRevenueData).sort((a, b) => {
    const [ma, ya] = a.split("/").map(Number);
    const [mb, yb] = b.split("/").map(Number);
    return ya !== yb ? ya - yb : ma - mb;
  });

  const maxRevenue = Math.max(...Object.values(monthlyRevenueData), 100000);

  // 2. Sales Status Ratio (Available vs. Sold)
  const soldCount = accounts.filter((a) => a.status === "Sold").length;
  const availableCount = accounts.filter((a) => a.status === "Available").length;
  const maxProductStat = Math.max(soldCount, availableCount, 5);

  // 3. Recharge Methods Donut Chart
  let momoSum = 0;
  let bankSum = 0;
  let cardSum = 0;
  transactions.forEach((tx) => {
    if (tx.type === "atm") {
      if (tx.description.toLowerCase().includes("momo")) {
        momoSum += tx.amount;
      } else {
        bankSum += tx.amount;
      }
    } else if (tx.type === "card") {
      cardSum += tx.amount;
    }
  });

  // Fallbacks if no data exists
  if (momoSum === 0 && bankSum === 0 && cardSum === 0) {
    momoSum = 1200000;
    bankSum = 2500000;
    cardSum = 800000;
  }
  const totalRechargeSum = momoSum + bankSum + cardSum;

  return (
    <div className="max-w-6xl mx-auto my-6 space-y-8 text-stone-200">
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b-2 border-amber-500/20 pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-rose-500 animate-pulse" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300 uppercase">
              HỆ THỐNG QUẢN TRỊ ADMIN
            </h2>
            <p className="text-xs text-rose-300">
              hainagaming.com - Bảo mật bảng điều khiển nội bộ
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          id="admin-back-btn"
          className="bg-stone-900/50 hover:bg-rose-500 hover:text-stone-950 text-rose-400 py-1.5 px-4 rounded-xl border border-rose-500/20 text-xs font-bold uppercase transition"
        >
          Đăng xuất
        </button>
      </div>

      {/* Stats row cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#2c0404] p-4 rounded-2xl border border-amber-500/15">
          <span className="text-[10px] text-stone-400 block font-bold uppercase">
            Tổng tài khoản đang đăng
          </span>
          <span className="text-xl font-black text-amber-400 font-mono">
            {accounts.length} nick
          </span>
        </div>
        <div className="bg-[#2c0404] p-4 rounded-2xl border border-amber-500/15">
          <span className="text-[10px] text-stone-400 block font-bold uppercase">
            Tài khoản còn trống bán
          </span>
          <span className="text-xl font-black text-emerald-400 font-mono">
            {accounts.filter((a) => a.status === "Available").length} nick
          </span>
        </div>
        <div className="bg-[#2c0404] p-4 rounded-2xl border border-amber-500/15">
          <span className="text-[10px] text-stone-400 block font-bold uppercase">
            Ước tính Doanh Thu mua
          </span>
          <span className="text-xl font-black text-[#ffffff] font-mono">
            {totalRevenue.toLocaleString()} đ
          </span>
        </div>
        <div className="bg-[#2c0404] p-4 rounded-2xl border border-amber-500/15">
          <span className="text-[10px] text-stone-400 block font-bold uppercase">
            Dòng tiền vốn nạp vào hệ thống
          </span>
          <span className="text-xl font-black text-amber-500 font-mono">
            {totalRecharged.toLocaleString()} đ
          </span>
        </div>
      </div>

      {/* Main Grid Wrapper with Left Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar */}
        <div className="md:col-span-3 space-y-4 bg-[#2c0404]/80 p-4 rounded-3xl border border-amber-500/10">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${activeTab === "dashboard"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                : "text-stone-300 hover:bg-stone-900/50 hover:text-amber-400"
                }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              Bảng điều khiển Dashboard
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${activeTab === "transactions"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                : "text-stone-300 hover:bg-stone-900/50 hover:text-amber-400"
                }`}
            >
              <History className="w-4 h-4 shrink-0" />
              Bảng giao dịch hệ thống
            </button>
            <button
              onClick={() => setActiveTab("accounts")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${activeTab === "accounts"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                : "text-stone-300 hover:bg-stone-900/50 hover:text-amber-400"
                }`}
            >
              <Inbox className="w-4 h-4 shrink-0" />
              Quản lý Acc Game
            </button>
          </div>

          <div className="border-t border-amber-500/10 pt-4 text-center">
            <button
              onClick={() => {
                setResetConfirmOpen(true);
              }}
              className="w-full bg-red-800 hover:bg-red-700 text-amber-300 py-2 px-3 rounded-xl font-bold text-[10px] border border-amber-500/15 transition flex items-center justify-center gap-1 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" /> RESET DATA SHOP
            </button>
          </div>
        </div>

        {/* Right content tab pane */}
        <div className="md:col-span-9 space-y-4">
          {/* TAB 0: DASHBOARD TAB WITH CHARTS */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Charts grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Monthly Revenue Chart (Column Chart) */}
                <div className="bg-[#4d0808] p-5 rounded-3xl border border-amber-500/20 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
                    <h5 className="font-extrabold uppercase text-xs text-stone-100 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Doanh thu cửa hàng theo tháng
                    </h5>
                    <span className="text-[10px] text-stone-400 font-bold uppercase">Biểu đồ cột</span>
                  </div>

                  <div className="flex justify-center items-center py-2 bg-red-950/20 rounded-2xl border border-amber-500/5">
                    <svg width="100%" height="200" viewBox="0 0 400 200" className="overflow-visible">
                      {/* Grid Lines */}
                      <line x1="40" y1="30" x2="380" y2="30" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.1" />
                      <line x1="40" y1="90" x2="380" y2="90" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.1" />
                      <line x1="40" y1="150" x2="380" y2="150" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.2" />

                      {/* X & Y Axis */}
                      <line x1="40" y1="30" x2="40" y2="150" stroke="#f59e0b" strokeWidth="1" opacity="0.2" />

                      {/* Render columns */}
                      {sortedMonths.map((m, i) => {
                        const val = monthlyRevenueData[m] || 0;
                        const colHeight = maxRevenue > 0 ? (val / maxRevenue) * 110 : 0;
                        const colWidth = 45;
                        const gap = 40;
                        const startX = 80;
                        const x = startX + i * (colWidth + gap);
                        const y = 150 - colHeight;

                        return (
                          <g key={m} className="group cursor-pointer">
                            {/* Bar gradient / hover effect */}
                            <rect
                              x={x}
                              y={y}
                              width={colWidth}
                              height={Math.max(colHeight, 4)}
                              rx="6"
                              className="fill-amber-500 hover:fill-amber-400 transition-colors duration-200"
                              opacity="0.85"
                            />
                            {/* Value label on top */}
                            <text
                              x={x + colWidth / 2}
                              y={y - 8}
                              textAnchor="middle"
                              className="fill-stone-200 font-mono font-bold text-[9px]"
                            >
                              {val.toLocaleString()}đ
                            </text>
                            {/* X-axis label */}
                            <text
                              x={x + colWidth / 2}
                              y="168"
                              textAnchor="middle"
                              className="fill-stone-400 font-bold text-[9px]"
                            >
                              {m}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* 2. Product Sales Ratio (Column Chart) */}
                <div className="bg-[#4d0808] p-5 rounded-3xl border border-amber-500/20 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
                    <h5 className="font-extrabold uppercase text-xs text-stone-100 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-amber-400" />
                      Tỷ lệ sản phẩm Đã bán / Chưa bán
                    </h5>
                    <span className="text-[10px] text-stone-400 font-bold uppercase">Biểu đồ so sánh</span>
                  </div>

                  <div className="flex justify-center items-center py-2 bg-red-950/20 rounded-2xl border border-amber-500/5">
                    <svg width="100%" height="200" viewBox="0 0 320 200" className="overflow-visible">
                      {/* Grid Lines */}
                      <line x1="40" y1="30" x2="280" y2="30" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.1" />
                      <line x1="40" y1="90" x2="280" y2="90" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.1" />
                      <line x1="40" y1="150" x2="280" y2="150" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.2" />

                      {/* Bar 1: Available */}
                      {(() => {
                        const hAvail = maxProductStat > 0 ? (availableCount / maxProductStat) * 110 : 0;
                        const yAvail = 150 - hAvail;
                        return (
                          <g className="group cursor-pointer">
                            <rect
                              x="70"
                              y={yAvail}
                              width="50"
                              height={Math.max(hAvail, 4)}
                              rx="6"
                              className="fill-emerald-500 hover:fill-emerald-400 transition-colors duration-200"
                              opacity="0.85"
                            />
                            <text x="95" y={yAvail - 8} textAnchor="middle" className="fill-emerald-300 font-mono font-black text-[10px]">
                              {availableCount}
                            </text>
                            <text x="95" y="168" textAnchor="middle" className="fill-emerald-400 font-extrabold text-[9px]">
                              Chưa bán
                            </text>
                          </g>
                        );
                      })()}

                      {/* Bar 2: Sold */}
                      {(() => {
                        const hSold = maxProductStat > 0 ? (soldCount / maxProductStat) * 110 : 0;
                        const ySold = 150 - hSold;
                        return (
                          <g className="group cursor-pointer">
                            <rect
                              x="180"
                              y={ySold}
                              width="50"
                              height={Math.max(hSold, 4)}
                              rx="6"
                              className="fill-rose-500 hover:fill-rose-400 transition-colors duration-200"
                              opacity="0.85"
                            />
                            <text x="205" y={ySold - 8} textAnchor="middle" className="fill-rose-300 font-mono font-black text-[10px]">
                              {soldCount}
                            </text>
                            <text x="205" y="168" textAnchor="middle" className="fill-rose-400 font-extrabold text-[9px]">
                              Đã bán
                            </text>
                          </g>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

              </div>

              {/* 3. Recharge Methods (Pie/Donut Chart) */}
              <div className="bg-[#4d0808] p-5 rounded-3xl border border-amber-500/20 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
                  <h5 className="font-extrabold uppercase text-xs text-stone-100 flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-purple-400" />
                    Cơ cấu nguồn dòng tiền nạp hệ thống
                  </h5>
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Biểu đồ tròn / Donut</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-4 px-2 bg-red-950/20 rounded-2xl border border-amber-500/5">
                  {/* SVG Donut */}
                  <div className="flex justify-center relative">
                    <svg width="160" height="160" viewBox="0 0 120 120" className="transform -rotate-90">
                      {/* Background circle */}
                      <circle cx="60" cy="60" r="50" fill="transparent" stroke="#2c0404" strokeWidth="12" />

                      {/* Render Pie segments using dash offset */}
                      {(() => {
                        const r = 50;
                        const circ = 2 * Math.PI * r; // 314.159

                        const pMomo = totalRechargeSum > 0 ? (momoSum / totalRechargeSum) * 100 : 0;
                        const pBank = totalRechargeSum > 0 ? (bankSum / totalRechargeSum) * 100 : 0;
                        const pCard = totalRechargeSum > 0 ? (cardSum / totalRechargeSum) * 100 : 0;

                        const dMomo = (pMomo / 100) * circ;
                        const dBank = (pBank / 100) * circ;
                        const dCard = (pCard / 100) * circ;

                        return (
                          <>
                            {/* Momo segment - Purple */}
                            {dMomo > 0 && (
                              <circle
                                cx="60"
                                cy="60"
                                r={r}
                                fill="transparent"
                                stroke="#d946ef"
                                strokeWidth="12"
                                strokeDasharray={`${dMomo} ${circ}`}
                                strokeDashoffset={0}
                                className="transition-all duration-300"
                              />
                            )}
                            {/* Bank/ATM segment - Blue */}
                            {dBank > 0 && (
                              <circle
                                cx="60"
                                cy="60"
                                r={r}
                                fill="transparent"
                                stroke="#3b82f6"
                                strokeWidth="12"
                                strokeDasharray={`${dBank} ${circ}`}
                                strokeDashoffset={-dMomo}
                                className="transition-all duration-300"
                              />
                            )}
                            {/* Card segment - Orange */}
                            {dCard > 0 && (
                              <circle
                                cx="60"
                                cy="60"
                                r={r}
                                fill="transparent"
                                stroke="#f97316"
                                strokeWidth="12"
                                strokeDasharray={`${dCard} ${circ}`}
                                strokeDashoffset={-(dMomo + dBank)}
                                className="transition-all duration-300"
                              />
                            )}
                          </>
                        );
                      })()}
                    </svg>

                    {/* Donut Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Tổng nạp</span>
                      <span className="text-sm font-black text-amber-300 font-mono">
                        {totalRechargeSum.toLocaleString()}đ
                      </span>
                    </div>
                  </div>

                  {/* Legends & percentages */}
                  <div className="space-y-3 font-semibold text-xs text-stone-300">
                    <div className="flex items-center justify-between border-b border-amber-500/5 pb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-purple-500 shrink-0" />
                        <span>Ví điện tử MoMo</span>
                      </div>
                      <span className="font-mono text-[#ffffff] font-bold">
                        {momoSum.toLocaleString()}đ ({totalRechargeSum > 0 ? Math.round((momoSum / totalRechargeSum) * 100) : 0}%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-amber-500/5 pb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-500 shrink-0" />
                        <span>Ngân hàng (ATM)</span>
                      </div>
                      <span className="font-mono text-[#ffffff] font-bold">
                        {bankSum.toLocaleString()}đ ({totalRechargeSum > 0 ? Math.round((bankSum / totalRechargeSum) * 100) : 0}%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-amber-500/5 pb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-orange-500 shrink-0" />
                        <span>Nạp thẻ cào tự động</span>
                      </div>
                      <span className="font-mono text-[#ffffff] font-bold">
                        {cardSum.toLocaleString()}đ ({totalRechargeSum > 0 ? Math.round((cardSum / totalRechargeSum) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: TRANSACTIONS LIST */}
          {activeTab === "transactions" && (
            <div className="bg-[#4d0808] p-5 rounded-3xl border border-amber-500/20 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/15">
                <h4 className="font-extrabold uppercase text-sm text-stone-100 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-amber-400" />
                  Bảng giao dịch hệ thống ({filteredTxs.length})
                </h4>

                {/* Search query input */}
                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm giao dịch, User, loại..."
                    value={txSearch}
                    onChange={(e) => {
                      setTxSearch(e.target.value);
                      setTxPage(1);
                    }}
                    className="w-full bg-red-950/80 border border-amber-500/15 rounded-xl py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Advanced transaction filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-red-950/20 rounded-2xl border border-amber-500/10 text-xs">
                <div>
                  <label className="block text-[10px] text-stone-400 uppercase font-black mb-1">Chọn Người Dùng</label>
                  <select
                    value={txUserFilter}
                    onChange={(e) => {
                      setTxUserFilter(e.target.value);
                      setTxPage(1);
                    }}
                    className="w-full bg-red-950/80 border border-amber-500/15 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-200 font-bold"
                  >
                    <option value="All">Tất cả Người dùng</option>
                    {uniqueUsers.map((user) => (
                      <option key={user} value={user}>
                        {user}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-stone-400 uppercase font-black mb-1">Khoảng Giá Biến Động</label>
                  <select
                    value={txPriceRange}
                    onChange={(e) => {
                      setTxPriceRange(e.target.value);
                      setTxPage(1);
                    }}
                    className="w-full bg-red-950/80 border border-amber-500/15 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-200 font-bold"
                  >
                    <option value="All">Tất cả Mức giá</option>
                    <option value="under_50k">Dưới 50,000đ</option>
                    <option value="50k_200k">50,000đ - 200,000đ</option>
                    <option value="200k_500k">200,000đ - 500,000đ</option>
                    <option value="over_500k">Trên 500,000đ</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setTxPriceRange("All");
                      setTxUserFilter("All");
                      setTxSearch("");
                      setTxPage(1);
                    }}
                    className="w-full bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 text-amber-400 py-2 px-3 rounded-xl border border-amber-500/20 text-[10px] font-black uppercase transition cursor-pointer"
                  >
                    Reset Bộ lọc
                  </button>
                </div>
              </div>

              {paginatedTxs.length === 0 ? (
                <EmptyState
                  title="Không tìm thấy giao dịch"
                  description="Không có lịch sử giao dịch nào phù hợp với bộ lọc tìm kiếm hiện tại."
                  iconType="database"
                  actionText="Reset bộ lọc"
                  onAction={() => {
                    setTxPriceRange("All");
                    setTxUserFilter("All");
                    setTxSearch("");
                    setTxPage(1);
                  }}
                />
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-xl">
                    <table className="w-full text-xs text-left text-stone-200">
                      <thead className="text-[10px] text-amber-400 uppercase bg-[#2c0404] border-b border-amber-500/20">
                        <tr>
                          <th className="px-3 py-3 text-center w-12">STT</th>
                          <th className="px-3 py-3 w-28">Mã GD</th>
                          <th className="px-3 py-3 w-24">Tài khoản</th>
                          <th className="px-3 py-3">Nội dung</th>
                          <th className="px-3 py-3 text-right w-24">Biến động</th>
                          <th className="px-3 py-3 text-center w-20">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-500/5 bg-[#2c0404]/30">
                        {paginatedTxs.map((tx, idx) => {
                          const globalIdx = (txPage - 1) * ITEMS_PER_PAGE + idx;
                          return (
                            <tr key={tx.id} className="hover:bg-red-950/20 transition">
                              <td className="px-3 py-3 text-center font-mono font-bold text-stone-400">
                                {globalIdx + 1}
                              </td>
                              <td className="px-3 py-3 font-mono font-black text-rose-300 truncate max-w-[110px]">
                                {tx.id}
                              </td>
                              <td className="px-3 py-3 font-bold text-stone-100">
                                {tx.username}
                              </td>
                              <td className="px-3 py-3 truncate max-w-xs text-stone-300">
                                {tx.description}
                              </td>
                              <td className="px-3 py-3 text-right font-black">
                                {tx.type === "card" || tx.type === "atm" ? (
                                  <span className="text-emerald-400">+{tx.amount.toLocaleString()}đ</span>
                                ) : (
                                  <span className="text-rose-400">-{tx.amount.toLocaleString()}đ</span>
                                )}
                              </td>
                              <td className="px-3 py-3 text-center">
                                <button
                                  onClick={() => setSelectedTx(tx)}
                                  className="p-1 bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 text-amber-400 rounded-lg border border-amber-500/20 transition inline-flex items-center justify-center cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination control for transactions */}
                  {totalTxPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        disabled={txPage === 1}
                        onClick={() => setTxPage(txPage - 1)}
                        className="px-3 py-1 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 disabled:opacity-30 disabled:hover:bg-stone-900 disabled:hover:text-amber-400 text-amber-400 text-[10px] font-bold transition uppercase border border-amber-500/20 rounded-lg"
                      >
                        ← Trước
                      </button>
                      <span className="text-[10px] text-stone-400 font-bold">
                        Trang {txPage} / {totalTxPages}
                      </span>
                      <button
                        disabled={txPage === totalTxPages}
                        onClick={() => setTxPage(txPage + 1)}
                        className="px-3 py-1 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 disabled:opacity-30 disabled:hover:bg-stone-900 disabled:hover:text-amber-400 text-amber-400 text-[10px] font-bold transition uppercase border border-amber-500/20 rounded-lg"
                      >
                        Sau →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GAME ACCOUNTS MANAGEMENT */}
          {activeTab === "accounts" && (
            <div className="bg-[#4d0808] p-5 rounded-3xl border border-amber-500/20 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/15">
                <div className="flex items-center gap-3">
                  <h4 className="font-extrabold uppercase text-sm text-stone-100 flex items-center gap-1.5">
                    <Inbox className="w-4 h-4 text-amber-400" />
                    Danh sách sản phẩm acc ({filteredAccs.length})
                  </h4>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-stone-950 py-1 px-3 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Đăng Acc Mới
                  </button>
                </div>

                {/* Search accounts query */}
                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm theo Mã Nick, Tiêu đề..."
                    value={accSearch}
                    onChange={(e) => {
                      setAccSearch(e.target.value);
                      setAccPage(1);
                    }}
                    className="w-full bg-red-950/80 border border-amber-500/15 rounded-xl py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Advanced account filters */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-red-950/20 rounded-2xl border border-amber-500/10 text-xs">
                <div>
                  <label className="block text-[10px] text-stone-400 uppercase font-black mb-1">Loại Game</label>
                  <select
                    value={accGameFilter}
                    onChange={(e) => {
                      setAccGameFilter(e.target.value);
                      setAccPage(1);
                    }}
                    className="w-full bg-red-950/80 border border-amber-500/15 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-200 font-bold"
                  >
                    <option value="All">Tất cả Game</option>
                    <option value="Dragon Ball Legends">Dragon Ball Legends</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-stone-400 uppercase font-black mb-1">Trạng thái</label>
                  <select
                    value={accStatusFilter}
                    onChange={(e) => {
                      setAccStatusFilter(e.target.value);
                      setAccPage(1);
                    }}
                    className="w-full bg-red-950/80 border border-amber-500/15 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-200 font-bold"
                  >
                    <option value="All">Tất cả Trạng thái</option>
                    <option value="Available">Chưa bán</option>
                    <option value="Sold">Đã bán</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-stone-400 uppercase font-black mb-1">Khoảng Giá ACC</label>
                  <select
                    value={accPriceRange}
                    onChange={(e) => {
                      setAccPriceRange(e.target.value);
                      setAccPage(1);
                    }}
                    className="w-full bg-red-950/80 border border-amber-500/15 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-200 font-bold"
                  >
                    <option value="All">Tất cả Mức giá</option>
                    <option value="under_100k">Dưới 100,000đ</option>
                    <option value="100k_300k">100,000đ - 300,000đ</option>
                    <option value="300k_1m">300,000đ - 1,000,000đ</option>
                    <option value="over_1m">Trên 1,000,000đ</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setAccGameFilter("All");
                      setAccStatusFilter("All");
                      setAccPriceRange("All");
                      setAccSearch("");
                      setAccPage(1);
                    }}
                    className="w-full bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 text-amber-400 py-2 px-3 rounded-xl border border-amber-500/20 text-[10px] font-black uppercase transition cursor-pointer"
                  >
                    Reset Bộ lọc
                  </button>
                </div>
              </div>

              {paginatedAccs.length === 0 ? (
                <EmptyState
                  title="Không tìm thấy tài khoản"
                  description="Không tìm thấy tài khoản game nào phù hợp với bộ lọc tìm kiếm hiện tại."
                  iconType="folder"
                  actionText="Reset bộ lọc"
                  onAction={() => {
                    setAccGameFilter("All");
                    setAccStatusFilter("All");
                    setAccPriceRange("All");
                    setAccSearch("");
                    setAccPage(1);
                  }}
                />
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-xl">
                    <table className="w-full text-xs text-left text-stone-200">
                      <thead className="text-[10px] text-amber-400 uppercase bg-[#2c0404] border-b border-amber-500/20">
                        <tr>
                          <th className="px-3 py-3 text-center w-12">STT</th>
                          <th className="px-3 py-3 w-28">Mã Acc</th>
                          <th className="px-3 py-3">Tên Tiêu Đề</th>
                          <th className="px-3 py-3 text-right w-24">Giá Nick</th>
                          <th className="px-3 py-3 text-center w-24">Trạng Thái</th>
                          <th className="px-3 py-3 text-center w-16">Xem</th>
                          <th className="px-3 py-3 text-center w-16">Sửa</th>
                          <th className="px-3 py-3 text-center w-12">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-500/5 bg-[#2c0404]/30">
                        {paginatedAccs.map((acc, idx) => {
                          const globalIdx = (accPage - 1) * ITEMS_PER_PAGE + idx;
                          return (
                            <tr key={acc.id} className="hover:bg-red-950/20 transition">
                              <td className="px-3 py-3 text-center font-mono font-bold text-stone-400">
                                {globalIdx + 1}
                              </td>
                              <td className="px-3 py-3 font-mono font-black text-amber-400">
                                {acc.id}
                              </td>
                              <td className="px-3 py-3 truncate max-w-xs font-bold text-stone-200">
                                {acc.title}
                              </td>
                              <td className="px-3 py-3 text-right font-black text-rose-300">
                                {acc.price.toLocaleString()}đ
                              </td>
                              <td className="px-3 py-3 text-center">
                                {acc.status === "Available" ? (
                                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 py-0.5 px-2 rounded-full text-[10px] font-black inline-block whitespace-nowrap">
                                    Chưa bán
                                  </span>
                                ) : (
                                  <span className="bg-stone-800 text-stone-400 border border-stone-700 py-0.5 px-2 rounded-full text-[10px] font-black inline-block whitespace-nowrap">
                                    Đã bán
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-3 text-center">
                                <button
                                  onClick={() => setSelectedAcc(acc)}
                                  className="p-1 bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 text-amber-400 rounded-lg border border-amber-500/20 transition inline-flex items-center justify-center cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <button
                                  onClick={() => startEditAccount(acc)}
                                  className="p-1 bg-stone-900/50 hover:bg-emerald-500 hover:text-[#1a0202] text-emerald-400 rounded-lg border border-amber-500/20 transition inline-flex items-center justify-center cursor-pointer"
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <button
                                  onClick={() => setDeleteConfirmId(acc.id)}
                                  className="p-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-400 rounded-lg transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination control for accounts */}
                  {totalAccPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        disabled={accPage === 1}
                        onClick={() => setAccPage(accPage - 1)}
                        className="px-3 py-1 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 disabled:opacity-30 disabled:hover:bg-stone-900 disabled:hover:text-amber-400 text-amber-400 text-[10px] font-bold transition uppercase border border-amber-500/20 rounded-lg"
                      >
                        ← Trước
                      </button>
                      <span className="text-[10px] text-stone-400 font-bold">
                        Trang {accPage} / {totalAccPages}
                      </span>
                      <button
                        disabled={accPage === totalAccPages}
                        onClick={() => setAccPage(accPage + 1)}
                        className="px-3 py-1 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 disabled:opacity-30 disabled:hover:bg-stone-900 disabled:hover:text-amber-400 text-amber-400 text-[10px] font-bold transition uppercase border border-amber-500/20 rounded-lg"
                      >
                        Sau →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: ADD NEW GAME ACCOUNT */}
      {showAddForm && (
        <div
          onClick={() => setShowAddForm(false)}
          className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#4d0808] border-2 border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-200"
          >
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 border-b border-amber-500/20 pb-2">
              <Plus className="w-5 h-5 text-amber-300" />
              <h4 className="font-extrabold uppercase text-sm text-stone-100">
                Đăng bán tài khoản mới
              </h4>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs sm:text-sm max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Mã Số ACC (Bắt buộc)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: DBL-999"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-stone-100 font-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Danh Mục Bán</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2.5 px-3 focus:outline-none text-amber-300 font-bold"
                  >
                    <option value="DANH MỤC ACC Android">DANH MỤC ACC Android</option>
                    <option value="DANH MỤC ACC IOS">DANH MỤC ACC IOS</option>
                    <option value="DANH MỤC ACC CHƯA PHÂN LOẠI">DANH MỤC ACC KHÁC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Tiêu Đề Quảng Cáo (Bắt buộc)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: ACC SIÊU NGON 50K CRYSTALS..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-stone-100 font-extrabold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Giá Bán Thực tế (đ)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-amber-300 font-black"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Giá gốc thị trường (đ)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-stone-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Chrono Crystals chứa (Gems)</label>
                  <input
                    type="number"
                    value={chronoCrystals}
                    onChange={(e) => setChronoCrystals(Number(e.target.value))}
                    className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-teal-300 font-black"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Hạng Sao</label>
                  <input
                    type="number"
                    value={stars}
                    onChange={(e) => setStars(Number(e.target.value))}
                    className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-rose-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Nhân Vật VIP (Phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  placeholder="UL Vegito Blue, LL Super Goku"
                  value={characters}
                  onChange={(e) => setCharacters(e.target.value)}
                  className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Mô tả đặc điểm acc (Phân cách bằng dấu phẩy)</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-stone-300 h-16 text-xs"
                />
              </div>

              <div className="bg-red-950/80 p-3 rounded-2xl border border-rose-500/20 space-y-3">
                <span className="text-[10px] bg-rose-600 text-stone-100 py-0.5 px-2 rounded font-black uppercase">
                  Thông tin mật đăng nhập
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-300 text-[10px] font-bold mb-1">Tài khoản Gmail *</label>
                    <input
                      type="text"
                      value={accountUser}
                      onChange={(e) => setAccountUser(e.target.value)}
                      className="w-full bg-black/40 border border-amber-500/10 rounded-lg py-1.5 px-2 text-xs text-amber-300 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 text-[10px] font-bold mb-1">Mật khẩu *</label>
                    <input
                      type="text"
                      value={accountPass}
                      onChange={(e) => setAccountPass(e.target.value)}
                      className="w-full bg-black/40 border border-amber-500/10 rounded-lg py-1.5 px-2 text-xs text-amber-300 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 text-[10px] font-bold mb-1">Transfer Code</label>
                    <input
                      type="text"
                      value={transferCode}
                      onChange={(e) => setTransferCode(e.target.value)}
                      className="w-full bg-black/40 border border-amber-500/10 rounded-lg py-1.5 px-2 text-xs text-emerald-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase transition cursor-pointer"
              >
                Lên Sàn Đăng Bán Ngay
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT GAME ACCOUNT */}
      {editingAcc && (
        <div
          onClick={() => setEditingAcc(null)}
          className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#4d0808] border-2 border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-200"
          >
            <button
              onClick={() => setEditingAcc(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 border-b border-amber-500/20 pb-2">
              <svg className="w-5 h-5 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <h4 className="font-extrabold uppercase text-sm text-stone-100">
                Chỉnh sửa tài khoản {editId}
              </h4>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs sm:text-sm max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Mã Số ACC (Không thể đổi)</label>
                  <input
                    type="text"
                    value={editId}
                    disabled
                    className="w-full bg-red-950/40 border border-amber-500/10 rounded-xl py-2 px-3 text-stone-500 font-black cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Danh Mục Bán</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2.5 px-3 focus:outline-none text-amber-300 font-bold"
                  >
                    <option value="DANH MỤC ACC Android">DANH MỤC ACC Android</option>
                    <option value="DANH MỤC ACC IOS">DANH MỤC ACC IOS</option>
                    <option value="DANH MỤC ACC CHƯA PHÂN LOẠI">DANH MỤC ACC KHÁC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Tiêu Đề Quảng Cáo (Bắt buộc)</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-stone-100 font-extrabold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Giá Bán Thực tế (đ)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-amber-300 font-black"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Giá gốc thị trường (đ)</label>
                  <input
                    type="number"
                    value={editOriginalPrice}
                    onChange={(e) => setEditOriginalPrice(Number(e.target.value))}
                    className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-stone-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Chrono Crystals chứa (Gems)</label>
                  <input
                    type="number"
                    value={editChronoCrystals}
                    onChange={(e) => setEditChronoCrystals(Number(e.target.value))}
                    className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-teal-300 font-black"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Hạng Sao</label>
                  <input
                    type="number"
                    value={editStars}
                    onChange={(e) => setEditStars(Number(e.target.value))}
                    className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-rose-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Trạng thái bán</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as "Available" | "Sold")}
                    className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2.5 px-3 focus:outline-none text-stone-100 font-bold"
                  >
                    <option value="Available">Chưa bán (Available)</option>
                    <option value="Sold">Đã bán (Sold)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Nhân Vật VIP (Phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={editCharacters}
                  onChange={(e) => setEditCharacters(e.target.value)}
                  className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Mô tả đặc điểm acc (Phân cách bằng dấu phẩy)</label>
                <textarea
                  value={editDetails}
                  onChange={(e) => setEditDetails(e.target.value)}
                  className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-stone-300 h-16 text-xs"
                />
              </div>

              <div className="bg-red-950/80 p-3 rounded-2xl border border-rose-500/20 space-y-3">
                <span className="text-[10px] bg-rose-600 text-stone-100 py-0.5 px-2 rounded font-black uppercase">
                  Thông tin mật đăng nhập
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-300 text-[10px] font-bold mb-1">Tài khoản Gmail *</label>
                    <input
                      type="text"
                      value={editAccountUser}
                      onChange={(e) => setEditAccountUser(e.target.value)}
                      className="w-full bg-black/40 border border-amber-500/10 rounded-lg py-1.5 px-2 text-xs text-amber-300 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 text-[10px] font-bold mb-1">Mật khẩu *</label>
                    <input
                      type="text"
                      value={editAccountPass}
                      onChange={(e) => setEditAccountPass(e.target.value)}
                      className="w-full bg-black/40 border border-amber-500/10 rounded-lg py-1.5 px-2 text-xs text-amber-300 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 text-[10px] font-bold mb-1">Transfer Code</label>
                    <input
                      type="text"
                      value={editTransferCode}
                      onChange={(e) => setEditTransferCode(e.target.value)}
                      className="w-full bg-black/40 border border-amber-500/10 rounded-lg py-1.5 px-2 text-xs text-emerald-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase transition cursor-pointer"
              >
                Lưu thay đổi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TRANSACTION DETAIL POPUP */}
      {selectedTx && (
        <div
          onClick={() => setSelectedTx(null)}
          className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#4d0808] border-2 border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative"
          >
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 border-b border-amber-500/20 pb-2">
              <Info className="w-5 h-5 text-amber-300" />
              <h4 className="font-extrabold uppercase text-sm text-stone-100">Chi tiết giao dịch</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400">Mã giao dịch:</span>
                <span className="font-mono font-black text-rose-300">{selectedTx.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400">Loại:</span>
                <span className="font-black text-amber-300 uppercase">{selectedTx.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400">Người thực hiện:</span>
                <span className="font-bold text-stone-200">{selectedTx.username}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400">Số tiền biến động:</span>
                <span className="font-black text-stone-100">
                  {selectedTx.type === "card" || selectedTx.type === "atm" ? (
                    <span className="text-emerald-400">+{selectedTx.amount.toLocaleString()}đ</span>
                  ) : (
                    <span className="text-rose-400">-{selectedTx.amount.toLocaleString()}đ</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400">Nội dung / Mô tả:</span>
                <span className="font-semibold text-stone-200 text-right max-w-[65%]">{selectedTx.description}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400">Trạng thái:</span>
                <span className="font-black text-emerald-400">Thành công</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400">Mốc thời gian:</span>
                <span className="font-mono text-stone-300">{selectedTx.time}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: GAME ACCOUNT DETAIL POPUP */}
      {selectedAcc && (
        <div
          onClick={() => setSelectedAcc(null)}
          className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#4d0808] border-2 border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-200"
          >
            <button
              onClick={() => setSelectedAcc(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 border-b border-amber-500/20 pb-2">
              <Info className="w-5 h-5 text-amber-300" />
              <h4 className="font-extrabold uppercase text-sm text-stone-100">Chi tiết sản phẩm</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400">Mã Số ACC:</span>
                <span className="font-mono font-black text-amber-400">{selectedAcc.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400">Danh Mục:</span>
                <span className="font-bold text-stone-200">{selectedAcc.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400">Tiêu đề:</span>
                <span className="font-semibold text-stone-200 text-right max-w-[65%]">{selectedAcc.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400">Giá bán:</span>
                <span className="font-black text-rose-300">{selectedAcc.price.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400">Trạng thái:</span>
                <span className="font-bold">
                  {selectedAcc.status === "Available" ? (
                    <span className="text-emerald-400">Còn trống (Chưa bán)</span>
                  ) : (
                    <span className="text-stone-400">Đã bán</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400 font-extrabold text-amber-300">Khách hàng mua:</span>
                <span className="font-black text-stone-100 uppercase bg-red-950/60 px-2 py-0.5 rounded border border-amber-500/10">
                  {selectedAcc.status === "Sold" ? getBuyerUsername(selectedAcc.id) : "Chưa bán"}
                </span>
              </div>

              {/* Secure Credentials Data */}
              <div className="bg-red-950/40 p-3 rounded-xl border border-rose-500/20 space-y-1.5 mt-2">
                <span className="text-[10px] text-stone-400 uppercase font-black tracking-widest block mb-1">
                  Thông tin bảo mật đăng nhập
                </span>
                <div>
                  <span className="text-[9px] text-stone-400 font-semibold block">Tài khoản:</span>
                  <code className="text-amber-300 font-mono font-bold select-all text-xs block bg-black/40 p-1 rounded mt-0.5">{selectedAcc.credentials.username}</code>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 font-semibold block">Mật khẩu:</span>
                  <code className="text-amber-300 font-mono font-bold select-all text-xs block bg-black/40 p-1 rounded mt-0.5">{selectedAcc.credentials.pass}</code>
                </div>
                {selectedAcc.credentials.transferCode && (
                  <div>
                    <span className="text-[9px] text-stone-400 font-semibold block">Transfer Code:</span>
                    <code className="text-emerald-300 font-mono font-bold select-all text-xs block bg-black/40 p-1 rounded mt-0.5">{selectedAcc.credentials.transferCode}</code>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Dialog for Resetting Data Shop */}
      <ConfirmDialog
        isOpen={resetConfirmOpen}
        title="RESET DỮ LIỆU CỬA HÀNG"
        message="Hành động này sẽ xóa toàn bộ lịch sử giao dịch, khôi phục danh sách tài khoản mặc định và đặt lại số dư người dùng. Bạn có chắc chắn muốn thực hiện không?"
        confirmText="Xác nhận Reset"
        cancelText="Hủy bỏ"
        onConfirm={() => {
          onResetShop();
          setResetConfirmOpen(false);
        }}
        onCancel={() => setResetConfirmOpen(false)}
      />

      {/* Confirm Dialog for Deleting Account */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        title="XÓA TÀI KHOẢN"
        message={`Bạn có chắc chắn muốn xóa mã Nick ${deleteConfirmId} khỏi cửa hàng không?`}
        confirmText="Xóa tài khoản"
        cancelText="Hủy bỏ"
        onConfirm={() => {
          if (deleteConfirmId) {
            onDeleteAccount(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
