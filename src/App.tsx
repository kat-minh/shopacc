"use client";

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  GameAccount,
  LuckyWheelGame,
  LuckyWheelPrize,
  Transaction,
  TopRecharger,
  INITIAL_TOP_RECHARGERS_JUNE,
  INITIAL_TOP_RECHARGERS_MAY,
  INITIAL_ACCOUNTS,
} from "./data";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ProductCard from "./components/ProductCard";
import ProductDetailView from "./components/ProductDetailView";
import LuckyWheel from "./components/LuckyWheel";
import RechargeSection from "./components/RechargeSection";
import AdminPanel from "./components/AdminPanel";
import HistoryPanel from "./components/HistoryPanel";
import UserProfile from "./components/UserProfile";
import ChangePassword from "./components/ChangePassword";
import UserHistory from "./components/UserHistory";
import { AppView, useAuthStore } from "./store/useAuthStore";
import heroBannerGif from "./assets/images/final.gif";

import {
  Trophy,
  ShieldCheck,
  Heart,
  Star,
  Flame,
  LayoutGrid,
  HelpCircle,
  Bell,
  ArrowRight,
  Check,
  Copy,
  User,
  KeyRound,
  History,
  Inbox,
} from "lucide-react";

const viewToPath = (view: AppView, accountId?: string | null) => {
  switch (view) {
    case "login":
      return "/login";
    case "register":
      return "/register";
    case "admin":
      return "/admin";
    case "history":
      return "/history";
    case "profile":
      return "/profile";
    case "change-password":
      return "/change-password";
    case "user-history":
      return "/user-history";
    case "recharge":
      return "/recharge";
    case "product-detail":
      return accountId ? `/product/${accountId}` : "/";
    case "home":
    default:
      return "/";
  }
};

const pathToView = (pathname: string): AppView => {
  if (pathname.startsWith("/login")) return "login";
  if (pathname.startsWith("/register")) return "register";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/history")) return "history";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/change-password")) return "change-password";
  if (pathname.startsWith("/user-history")) return "user-history";
  if (pathname.startsWith("/recharge")) return "recharge";
  if (pathname.startsWith("/product/")) return "product-detail";
  return "home";
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentUser,
    isAdmin,
    activeView,
    theme,
    login,
    logout,
    setActiveView,
    addBalance,
    deductBalance,
    syncUser,
    toggleTheme,
  } = useAuthStore();

  const [accounts, setAccounts] = useState<GameAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [boughtAccounts, setBoughtAccounts] = useState<GameAccount[]>([]);

  // Filtering states in the Home Catalog
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<GameAccount | null>(
    null,
  );
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  // Gacha spin anim state proxies
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Checkout modal confirmations
  const [checkoutReceipt, setCheckoutReceipt] = useState<GameAccount | null>(
    null,
  );
  const [copiedReceiptItem, setCopiedReceiptItem] = useState<string | null>(
    null,
  );

  // Top recharger ranking display tabs
  const [activeMonthTab, setActiveMonthTab] = useState<"june" | "may">("june");

  // Recharge sub-tabs
  const [rechargeTab, setRechargeTab] = useState<"card" | "atm">("card");

  // Load and bootstrap initial state from local storage securely
  useEffect(() => {
    // Accounts
    const savedAccounts = localStorage.getItem("haina_accounts");
    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    } else {
      setAccounts(INITIAL_ACCOUNTS);
      localStorage.setItem("haina_accounts", JSON.stringify(INITIAL_ACCOUNTS));
    }

    // Transactions log
    const savedTransactions = localStorage.getItem("haina_transactions");
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      setTransactions([]);
    }

    // Bought accounts inventory list
    const savedBought = localStorage.getItem("haina_bought_accounts");
    if (savedBought) {
      setBoughtAccounts(JSON.parse(savedBought));
    } else {
      setBoughtAccounts([]);
    }

    setIsBootstrapped(true);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    }
  }, [theme]);

  useEffect(() => {
    const routeView = pathToView(location.pathname);

    if (isAdmin) {
      if (routeView !== "admin") {
        setActiveView("admin");
        navigate("/admin");
        return;
      }
    }

    setActiveView(routeView);

    if (!isBootstrapped) {
      return;
    }

    if (routeView === "product-detail") {
      const accountId = location.pathname.split("/")[2];
      const matchedAccount =
        accounts.find((account) => account.id === accountId) ?? null;
      setSelectedAccount(matchedAccount);

      if (!matchedAccount) {
        navigate("/");
      }
      return;
    }

    setSelectedAccount(null);
  }, [accounts, isBootstrapped, location.pathname, navigate, setActiveView, isAdmin]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLoginSuccess = (
    user: { username: string; balance: number },
    adminState: boolean,
  ) => {
    login(user, adminState);
    navigate(adminState ? "/admin" : "/");
  };

  // Quick sandbox fund utility
  const handleQuickAddMoney = (amount: number) => {
    const updated = { ...currentUser, balance: currentUser.balance + amount };
    syncUser(updated, isAdmin);

    const newTx: Transaction = {
      id: "SANDBOX-" + Date.now().toString().slice(-6),
      type: "atm",
      username: currentUser.username,
      amount: amount,
      description: `Đăng ký Thử Quỹ Sandbox +${amount.toLocaleString("vi-VN")}đ`,
      status: "Success",
      time:
        new Date().toLocaleTimeString("vi-VN") +
        " " +
        new Date().toLocaleDateString("vi-VN"),
    };

    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    localStorage.setItem("haina_transactions", JSON.stringify(updatedTxs));
  };

  // Card Recharge Submission trigger
  const handleCardRecharge = async (
    provider: string,
    amount: number,
    serial: string,
    pin: string,
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const addedBalance = amount;
        const updated = {
          ...currentUser,
          balance: currentUser.balance + addedBalance,
        };
        syncUser(updated, isAdmin);

        const newTx: Transaction = {
          id: "CARD-" + Date.now().toString().slice(-8),
          type: "card",
          username: currentUser.username,
          amount: addedBalance,
          description: `Thẻ cào ${provider} mệnh giá ${amount.toLocaleString("vi-VN")}đ (Serial: ${serial.slice(0, 4)}***, Pin: ${pin.slice(0, 4)}***)`,
          status: "Success",
          time:
            new Date().toLocaleTimeString("vi-VN") +
            " " +
            new Date().toLocaleDateString("vi-VN"),
        };

        const updatedTxs = [newTx, ...transactions];
        setTransactions(updatedTxs);
        localStorage.setItem("haina_transactions", JSON.stringify(updatedTxs));

        resolve(true);
      }, 1500);
    });
  };

  // Product Purchase logic
  const handleBuyAccount = (account: GameAccount) => {
    if (currentUser.username === "Khách") {
      alert("Vui lòng đăng nhập tài khoản trước khi thực hiện giao dịch!");
      setActiveView("login");
      navigate("/login");
      return;
    }

    if (account.status === "Sold") {
      alert(
        "Tài khoản này đã bán! Vui lòng lựa chọn mã nick Dragon Ball Legends khác.",
      );
      return;
    }

    if (currentUser.balance < account.price) {
      alert(
        `Số dư ví của bạn không đủ! Thiếu ${(account.price - currentUser.balance).toLocaleString("vi-VN")}đ. Nhấn OK để đi dịch chuyển nạp card tự động.`,
      );
      setActiveView("recharge");
      navigate("/recharge");
      return;
    }

    // Process payment
    const updatedUser = {
      ...currentUser,
      balance: currentUser.balance - account.price,
    };
    syncUser(updatedUser, isAdmin);

    // Update account inventory state
    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === account.id) {
        return { ...acc, status: "Sold" as const };
      }
      return acc;
    });
    setAccounts(updatedAccounts);
    localStorage.setItem("haina_accounts", JSON.stringify(updatedAccounts));

    // Log transaction history
    const newTx: Transaction = {
      id: "BUY-" + account.id + "-" + Date.now().toString().slice(-4),
      type: "buy_account",
      username: currentUser.username,
      amount: account.price,
      description: `Mua Tài Khoản mã số ${account.id} - ${account.title.slice(0, 30)}...`,
      status: "Success",
      time:
        new Date().toLocaleTimeString("vi-VN") +
        " " +
        new Date().toLocaleDateString("vi-VN"),
    };
    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    localStorage.setItem("haina_transactions", JSON.stringify(updatedTxs));

    // Append to bought accounts
    const updatedBought = [account, ...boughtAccounts];
    setBoughtAccounts(updatedBought);
    localStorage.setItem(
      "haina_bought_accounts",
      JSON.stringify(updatedBought),
    );

    // Trigger Success Checkout Bill Modal and navigate away from detail
    setCheckoutReceipt(account);
  };

  // Lucky Wheel Prize handler callback
  const handleSpinSuccess = (
    price: number,
    prize: LuckyWheelPrize,
    wheelTitle: string,
  ) => {
    let updatedBalance = currentUser.balance - price;
    let descReward = `Quay vòng [${wheelTitle.slice(0, 15)}...] trúng: ${prize.name}`;

    // Add cash award back directly if configured
    if (prize.type === "cash") {
      updatedBalance += prize.value;
    }

    const updatedUser = { ...currentUser, balance: updatedBalance };
    syncUser(updatedUser, isAdmin);

    const newTx: Transaction = {
      id: "SPIN-" + Date.now().toString().slice(-6),
      type: "wheel_spin",
      username: currentUser.username,
      amount: price,
      description: descReward,
      status: "Success",
      time:
        new Date().toLocaleTimeString("vi-VN") +
        " " +
        new Date().toLocaleDateString("vi-VN"),
    };

    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    localStorage.setItem("haina_transactions", JSON.stringify(updatedTxs));
  };

  // Admin Account additions
  const handleAddAccountAdmin = (newAcc: GameAccount) => {
    const updated = [newAcc, ...accounts];
    setAccounts(updated);
    localStorage.setItem("haina_accounts", JSON.stringify(updated));
  };

  // Admin Account deletions
  const handleDeleteAccountAdmin = (id: string) => {
    const updated = accounts.filter((acc) => acc.id !== id);
    setAccounts(updated);
    localStorage.setItem("haina_accounts", JSON.stringify(updated));
  };

  // Admin Account updates
  const handleEditAccountAdmin = (updatedAcc: GameAccount) => {
    const updated = accounts.map((acc) =>
      acc.id === updatedAcc.id ? updatedAcc : acc,
    );
    setAccounts(updated);
    localStorage.setItem("haina_accounts", JSON.stringify(updated));
  };

  // Reset entire simulation database
  const handleResetShopAdmin = () => {
    localStorage.removeItem("haina_accounts");
    localStorage.removeItem("haina_transactions");
    localStorage.removeItem("haina_bought_accounts");
    localStorage.removeItem("haina_user");
    localStorage.removeItem("haina_is_admin");

    setAccounts(INITIAL_ACCOUNTS);
    setTransactions([]);
    setBoughtAccounts([]);

    const defaultUser = { username: "hoang_gamer99", balance: 500000 };
    syncUser(defaultUser, false);
    setSelectedAccount(null);

    alert("Đã khôi phục phục hồi toàn bộ dữ liệu ban đầu thành công!");
    setActiveView("home");
    navigate("/");
  };

  // Copy receipt tool helper
  const handleCopyReceipt = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReceiptItem(label);
    setTimeout(() => setCopiedReceiptItem(null), 2000);
  };

  // Catalog item filtering calculations
  const filteredAccounts = accounts.filter((acc) => {
    const matchesCategory =
      selectedCategory === "Tất cả" || acc.category === selectedCategory;
    const matchesSearch =
      acc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.stats.vipCharacters?.some((char) =>
        char.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    return matchesCategory && matchesSearch;
  });

  const categoriesList = [
    "Tất cả",
    "DANH MỤC ACC REROL ANDROID",
    "DANH MỤC ACC SIÊU VIP",
  ];

  if (activeView === "login") {
    return (
      <LoginForm
        onLoginSuccess={handleLoginSuccess}
        onCancel={() => {
          setActiveView("home");
          navigate("/");
        }}
      />
    );
  }

  if (activeView === "register") {
    return (
      <RegisterForm
        onCancel={() => {
          setActiveView("login");
          navigate("/login");
        }}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-[#1c0202] text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-red-950 transition-colors duration-300"
      data-theme={theme}
    >
      {/* HEADER SECTION */}
      {activeView !== "admin" && (
        <Header
          currentUser={currentUser}
          onNavigate={(view, subTab) => {
            setActiveView(view);
            if (view === "recharge" && subTab) {
              setRechargeTab(subTab);
            }
            setSelectedAccount(null);
            navigate(viewToPath(view));
          }}
          activeView={activeView}
          onLogout={handleLogout}
          onQuickAddMoney={handleQuickAddMoney}
          isAdmin={isAdmin}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {/* FLASH PROMOTIONAL TICKER NEWS BANNER */}
      {activeView !== "admin" && (
        <div className="bg-linear-to-r from-amber-500 via-yellow-400 to-amber-500 text-red-950 font-black text-xs py-2 px-4 shadow text-center flex items-center justify-center gap-2 overflow-hidden">
          <span className="animate-bounce">📣</span>
          <p className="uppercase tracking-wider truncate">
            Hệ thống bán acc Dragon Ball Legends tự động hainagaming.com đang tặng
            giftcode mừng máy chủ mới! Nạp Momo / ATM cộng 10% giá trị.
          </p>
        </div>
      )}

      {/* CORE DYNAMIC BODY CONTENT AREA */}
      <main className="grow max-w-7xl w-full mx-auto px-4 py-8">
        {/* ACCOUNT SETTINGS VIEW WRAPPER */}
        {(activeView === "profile" ||
          activeView === "change-password" ||
          activeView === "user-history" ||
          activeView === "history") && (
            <div className="max-w-6xl mx-auto my-0 space-y-6">
              {/* Back control header */}
              <div className="flex items-center justify-between border-b-2 border-amber-500/20 pb-4">
                <h2 className="text-xl sm:text-2xl font-black uppercase text-amber-300 tracking-wider">
                  THÔNG TIN TÀI KHOẢN
                </h2>
                <button
                  onClick={() => {
                    setActiveView("home");
                    navigate("/");
                  }}
                  className="bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 text-amber-400 py-1.5 px-4 rounded-xl border border-amber-500/20 text-xs font-bold uppercase transition"
                >
                  ← Về Trang Chủ
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mt-6">
                {/* Sidebar */}
                <div className="md:col-span-3 space-y-2 bg-[#2c0404]/80 p-4 rounded-3xl border border-amber-500/10">
                  <button
                    onClick={() => {
                      setActiveView("profile");
                      navigate("/profile");
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${activeView === "profile"
                        ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                        : "text-stone-300 hover:bg-stone-900/50 hover:text-amber-400"
                      }`}
                  >
                    <User className="w-4 h-4 shrink-0" />
                    Thông tin cá nhân
                  </button>
                  <button
                    onClick={() => {
                      setActiveView("change-password");
                      navigate("/change-password");
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${activeView === "change-password"
                        ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                        : "text-stone-300 hover:bg-stone-900/50 hover:text-amber-400"
                      }`}
                  >
                    <KeyRound className="w-4 h-4 shrink-0" />
                    Đổi mật khẩu
                  </button>
                  <button
                    onClick={() => {
                      setActiveView("user-history");
                      navigate("/user-history");
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${activeView === "user-history"
                        ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                        : "text-stone-300 hover:bg-stone-900/50 hover:text-amber-400"
                      }`}
                  >
                    <Inbox className="w-4 h-4 shrink-0" />
                    Tài khoản đã mua
                  </button>
                  <button
                    onClick={() => {
                      setActiveView("history");
                      navigate("/history");
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${activeView === "history"
                        ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                        : "text-stone-300 hover:bg-stone-900/50 hover:text-amber-400"
                      }`}
                  >
                    <History className="w-4 h-4 shrink-0" />
                    Lịch sử giao dịch
                  </button>
                </div>

                {/* Tab Content Panel */}
                <div className="md:col-span-9">
                  {activeView === "profile" && (
                    <UserProfile
                      onBack={() => {
                        setActiveView("home");
                        navigate("/");
                      }}
                    />
                  )}
                  {activeView === "change-password" && (
                    <ChangePassword
                      onBack={() => {
                        setActiveView("home");
                        navigate("/");
                      }}
                    />
                  )}
                  {activeView === "user-history" && (
                    <UserHistory
                      transactions={transactions}
                      boughtAccounts={boughtAccounts}
                      onBack={() => {
                        setActiveView("home");
                        navigate("/");
                      }}
                      hideHeader={true}
                      viewMode="bought"
                    />
                  )}
                  {activeView === "history" && (
                    <UserHistory
                      transactions={transactions}
                      boughtAccounts={boughtAccounts}
                      onBack={() => {
                        setActiveView("home");
                        navigate("/");
                      }}
                      hideHeader={true}
                      viewMode="transactions"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

        {/* ADMIN MANAGEMENT VIEW */}
        {activeView === "admin" && (
          <AdminPanel
            accounts={accounts}
            transactions={transactions}
            onAddAccount={handleAddAccountAdmin}
            onDeleteAccount={handleDeleteAccountAdmin}
            onResetShop={handleResetShopAdmin}
            onBack={handleLogout}
            onEditAccount={handleEditAccountAdmin}
          />
        )}

        {/* DYNAMIC TOP-UP CHARGE SECTIONS PAGE */}
        {activeView === "recharge" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-amber-500/20 pb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black uppercase text-amber-300 tracking-wider">
                  KHU VỰC NẠP QUỸ SỐ DƯ TỰ ĐỘNG
                </h2>
              </div>
              <button
                onClick={() => {
                  setActiveView("home");
                  navigate("/");
                }}
                className="bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 text-amber-400 py-1.5 px-4 rounded-xl border border-amber-500/20 text-xs font-bold uppercase transition"
              >
                ← Về Trang Chủ
              </button>
            </div>
            <RechargeSection
              onRechargeCard={handleCardRecharge}
              currentUser={currentUser}
              activeTab={rechargeTab}
              setActiveTab={setRechargeTab}
            />
          </div>
        )}

        {/* INDIVIDUAL PRODUCT DETAILED SPECIFICATION VIEW (NO POPUP) */}
        {activeView === "product-detail" && selectedAccount && (
          <ProductDetailView
            account={selectedAccount}
            userBalance={currentUser.balance}
            onBack={() => {
              setActiveView("home");
              setSelectedAccount(null);
              navigate("/");
            }}
            onBuy={handleBuyAccount}
          />
        )}

        {/* MAIN STORE FRONT & PRODUCTS CATALOG */}
        {activeView === "home" && (
          <div className="space-y-12">
            {/* HERO & RANKING GRID SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch w-full">
              {/* LEFT COLUMN: HERO BANNER (70% width, i.e. col-span-7) */}
              <div className="lg:col-span-7 flex items-center justify-start">
                <div className="relative bg-[#3d0303] border-2 border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden w-full">
                  <img
                    src={heroBannerGif}
                    alt="Banner Hainagaming"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN: MONTHLY TOP RECHARGERS RANKING (30% width, i.e. col-span-3) */}
              <div className="lg:col-span-3 flex">
                <div className="bg-[#4d0808] p-4 sm:p-5 rounded-3xl border-2 border-amber-500/40 shadow-xl space-y-4 flex flex-col justify-between w-full">
                  <div>
                    <div className="flex items-center justify-between border-b border-rose-900/60 pb-3">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
                        <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                          ĐUA TOP
                        </h3>
                        {/* Interactive Tooltip for Quy định */}
                        <div className="group relative cursor-pointer flex items-center justify-center">
                          <HelpCircle className="w-3.5 h-3.5 text-stone-400 hover:text-amber-400 transition" />
                          <div
                            className="absolute bottom-full right-0 mb-2 w-64 p-3 border rounded-xl shadow-2xl text-[10px] font-normal leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                            style={{
                              backgroundColor: theme === "light" ? "var(--app-card-strong)" : "rgba(28, 2, 2, 0.98)",
                              borderColor: theme === "light" ? "var(--app-border)" : "rgba(245, 158, 11, 0.4)",
                              color: theme === "light" ? "var(--app-text-primary)" : "#d4d1c8",
                            }}
                          >
                            <h5 className="font-bold text-amber-300 uppercase mb-1.5 border-b border-amber-500/20 pb-1">QUY ĐỊNH ĐUA TOP</h5>
                            <ul className="space-y-1.5">
                              <li className="flex items-start gap-1">
                                <span>🎁</span>
                                <span><strong>Top 1:</strong> Acc VIP DBL 500k tự chọn.</span>
                              </li>
                              <li className="flex items-start gap-1">
                                <span>🎁</span>
                                <span><strong>Top 2-3:</strong> Nhận giftcode 200k/100k ví.</span>
                              </li>
                              <li className="flex items-start gap-1">
                                <span>⏱</span>
                                <span>Chốt <strong>23:59 ngày 30 hàng tháng</strong>. Trao thưởng tự động qua hộp thư.</span>
                              </li>
                            </ul>
                            <div
                              className="absolute top-full right-1.5 border-8 border-transparent"
                              style={{
                                borderTopColor: theme === "light" ? "var(--app-card-strong)" : "rgba(28, 2, 2, 0.98)"
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Month selectors */}
                      <div className="flex bg-red-950 p-0.5 rounded-lg text-[9px] border border-amber-500/10">
                        <button
                          onClick={() => setActiveMonthTab("june")}
                          className={`py-0.5 px-1 rounded font-bold transition ${activeMonthTab === "june"
                            ? "bg-amber-500 text-red-950 font-black"
                            : "text-stone-300"
                            }`}
                        >
                          T.6
                        </button>
                        <button
                          onClick={() => setActiveMonthTab("may")}
                          className={`py-0.5 px-1 rounded font-bold transition ${activeMonthTab === "may"
                            ? "bg-amber-500 text-red-950 font-black"
                            : "text-stone-300"
                            }`}
                        >
                          T.5
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 mt-3">
                      {(activeMonthTab === "june"
                        ? INITIAL_TOP_RECHARGERS_JUNE
                        : INITIAL_TOP_RECHARGERS_MAY
                      ).map((re, rank) => (
                        <div
                          key={rank}
                          className="flex items-center justify-between bg-red-950/60 p-2 rounded-xl border border-amber-500/10 text-[10px]"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[9px] ${rank === 0
                                ? "bg-yellow-400 text-red-950"
                                : rank === 1
                                  ? "bg-stone-300 text-red-950"
                                  : rank === 2
                                    ? "bg-amber-600 text-white"
                                    : "bg-red-950 text-stone-400"
                                }`}
                            >
                              {rank + 1}
                            </span>
                            <span className="font-extrabold text-stone-100 font-mono">
                              {re.username}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-black">
                              {re.amount.toLocaleString()}đ
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-red-600/20 text-red-300 text-[9px] font-black px-2 py-1 rounded border border-red-500/20 text-center mt-2">
                    🎁 TOP 1: ACC 50K CRYSTALS VIP
                  </div>
                </div>
              </div>
            </div>


            {/* CATALOG LISTINGS SECTION */}
            <div className="space-y-6" id="cua-hang">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-amber-500/20 pb-4 gap-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
                  <div>
                    <h3 className="text-lg md:text-xl font-black uppercase tracking-wider text-amber-300">
                      DANH MỤC NICK RỒNG THẦN ĐANG BÁN
                    </h3>
                    <p className="text-[10px] text-stone-400">
                      Nhấn vào "CHI TIẾT ACC" để xem đầy đủ lực chiến và nhân
                      vật
                    </p>
                  </div>
                </div>

                {/* Interactive Category Selectors & Search Input */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm: crystals, UL, Gogeta..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-60 bg-red-950 border border-amber-500/25 rounded-xl py-2 px-3 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1 bg-red-950 p-1 rounded-xl border border-amber-500/10 text-xs">
                    {categoriesList.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`py-1 px-3 rounded-lg font-bold transition text-[10px] uppercase ${selectedCategory === cat
                          ? "bg-amber-500 text-red-950 font-black shadow-md"
                          : "text-stone-300 hover:text-[#ffffff]"
                          }`}
                      >
                        {cat === "Tất cả"
                          ? "Tất cả"
                          : cat.replace("DANH MỤC ACC ", "")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid Products Cards */}
              {filteredAccounts.length === 0 ? (
                <div className="text-center py-12 bg-red-950/20 rounded-2xl border border-dashed border-amber-500/15">
                  <span className="text-3xl">🧩</span>
                  <p className="text-stone-400 font-bold mt-2 text-sm">
                    Không tìm thấy tài khoản Dragon Ball Legends nào khớp yêu
                    cầu.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("Tất cả");
                      setSearchTerm("");
                    }}
                    className="mt-3 bg-amber-500 text-red-950 font-black text-xs py-1.5 px-3 rounded transition hover:bg-amber-400"
                  >
                    RESET BỘ LỌC TÌM KIẾM
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredAccounts.map((acc) => (
                    <ProductCard
                      key={acc.id}
                      account={acc}
                      onSelect={(account) => {
                        setSelectedAccount(account);
                        setActiveView("product-detail");
                        navigate(`/product/${account.id}`);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      onBuy={handleBuyAccount}
                    />
                  ))}
                </div>
              )}
            </div>




          </div>
        )}
      </main>

      {/* FOOTER SECTION */}
      {activeView !== "admin" && <Footer />}

      {/* SUCCESS CHECKOUT INVOICE RECEIPT MODAL */}
      {checkoutReceipt && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#4d0808] max-w-lg w-full p-6 sm:p-8 rounded-3xl border-2 border-emerald-400 text-stone-200 space-y-5 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-250">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-emerald-950 rounded-full border border-emerald-500/30 mb-1 text-emerald-400 animate-pulse">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-emerald-400 uppercase tracking-wide">
                THANH TOÁN ACC THÀNH CÔNG!
              </h4>
              <p className="text-xs text-stone-300">
                Cảm ơn bạn đã tin tưởng dịch vụ giao dịch tự động của
                hainagaming.com
              </p>
            </div>

            {/* Account specifics receipt */}
            <div className="bg-[#2a0404] p-4 rounded-2xl border border-amber-500/10 space-y-3">
              <span className="text-[10px] text-stone-400 uppercase font-black tracking-widest block">
                Biên lai thông tin mua tài khoản
              </span>

              <div className="flex gap-3 pb-3 border-b border-amber-500/10">
                <div className="w-12 h-12 bg-stone-900 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={checkoutReceipt.avatarUrl}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h5 className="font-extrabold text-[#ffffff] text-xs uppercase line-clamp-1">
                    {checkoutReceipt.title}
                  </h5>
                  <p className="text-[10px] text-amber-400 font-extrabold">
                    MÃ ACC: {checkoutReceipt.id} | Giá:{" "}
                    {checkoutReceipt.price.toLocaleString()}đ
                  </p>
                </div>
              </div>

              {/* Secrets display for copy */}
              <div className="space-y-2.5 pt-1 text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">
                    Tài khoản ID / Gmail đăng nhập
                  </span>
                  <div className="flex items-center justify-between bg-red-950/60 p-2.5 rounded-xl border border-amber-500/10">
                    <code className="text-amber-300 font-mono font-bold select-all text-sm">
                      {checkoutReceipt.credentials.username}
                    </code>
                    <button
                      onClick={() =>
                        handleCopyReceipt(
                          checkoutReceipt.credentials.username,
                          "r_user",
                        )
                      }
                      className="text-amber-400 hover:text-white"
                    >
                      {copiedReceiptItem === "r_user" ? (
                        <span className="text-emerald-400 text-[10px] font-bold">
                          Copied
                        </span>
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">
                    Mật khẩu tài khoản
                  </span>
                  <div className="flex items-center justify-between bg-red-950/60 p-2.5 rounded-xl border border-amber-500/10">
                    <code className="text-amber-300 font-mono font-bold select-all text-sm">
                      {checkoutReceipt.credentials.pass}
                    </code>
                    <button
                      onClick={() =>
                        handleCopyReceipt(
                          checkoutReceipt.credentials.pass,
                          "r_pass",
                        )
                      }
                      className="text-amber-400 hover:text-white"
                    >
                      {copiedReceiptItem === "r_pass" ? (
                        <span className="text-emerald-400 text-[10px] font-bold">
                          Copied
                        </span>
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {checkoutReceipt.credentials.transferCode && (
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">
                      Mã Transfer Code đồng bộ
                    </span>
                    <div className="flex items-center justify-between bg-red-950/60 p-2.5 rounded-xl border border-amber-500/20">
                      <code className="text-emerald-300 font-mono font-bold select-all text-sm">
                        {checkoutReceipt.credentials.transferCode}
                      </code>
                      <button
                        onClick={() =>
                          handleCopyReceipt(
                            checkoutReceipt.credentials.transferCode || "",
                            "r_code",
                          )
                        }
                        className="text-amber-400 hover:text-white"
                      >
                        {copiedReceiptItem === "r_code" ? (
                          <span className="text-emerald-400 text-[10px] font-bold">
                            Copied
                          </span>
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-[11px] text-stone-300 bg-red-950/40 p-3.5 rounded-2xl border border-red-900/40 space-y-1 text-justify">
              <p>
                📌 <strong>Chú thích quan trọng:</strong> Biên lai này cũng được
                lưu vĩnh viễn trong mục{" "}
                <strong className="text-amber-300">Kho Acc / Lịch Sử</strong> ở
                thanh Header phía trên. Bạn có thể ghé thăm để copy lấy mật mã
                này bất cứ lúc nào mà không sợ bị quên mất!
              </p>
            </div>

            {/* Buttons wrapper */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setCheckoutReceipt(null);
                  setActiveView("history");
                  navigate("/history");
                }}
                className="bg-red-950 hover:bg-neutral-900 border border-amber-500/10 py-2.5 px-4 rounded-xl text-xs font-black text-amber-200 transition text-center"
              >
                XEM KHO ACC
              </button>

              <button
                onClick={() => setCheckoutReceipt(null)}
                className="bg-linear-to-r from-[#10b981] to-[#059669] text-[#1a0202] py-2.5 px-4 rounded-xl text-xs font-black transition text-center"
              >
                TIẾP TỤC CHỢ NICK
              </button>
            </div>
          </div>
        </div>
      )}
      {/* FLOATING CONTACT WIDGETS (MESSENGER & ZALO) */}
      {activeView !== "admin" && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3.5 z-40 select-none">
          {/* Zalo Button */}
          <a
            href="https://zalo.me/17506391"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-[#0068ff] hover:bg-[#005ad9] flex items-center justify-center text-white shadow-lg shadow-blue-500/30 hover:scale-110 hover:rotate-6 transition duration-300 relative group animate-pulse cursor-pointer"
            title="Chat qua Zalo"
          >
            <span className="absolute -left-24 bg-stone-900 text-stone-100 text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none uppercase border border-amber-500/20 whitespace-nowrap">
              Zalo Hỗ Trợ
            </span>
            <span className="font-extrabold text-[11px] tracking-tighter uppercase font-sans">Zalo</span>
          </a>

          {/* Messenger Button */}
          <a
            href="https://m.me/hainagaming"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-linear-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:scale-110 hover:-rotate-6 transition duration-300 relative group animate-pulse cursor-pointer"
            title="Chat qua Facebook Messenger"
          >
            <span className="absolute -left-28 bg-stone-900 text-stone-100 text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none uppercase border border-amber-500/20 whitespace-nowrap">
              Messenger Chat
            </span>
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.914 1.46 5.513 3.733 7.218v3.524l3.328-1.828c.928.258 1.91.4 2.939.4 5.523 0 10-4.146 10-9.258S17.523 2 12 2zm1.082 12.193l-2.582-2.753-5.045 2.753 5.545-5.887 2.582 2.753 5.045-2.753-5.545 5.887z" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
