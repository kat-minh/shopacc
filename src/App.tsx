"use client";

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import LoadingState from "./components/LoadingState";
import EmptyState from "./components/EmptyState";
import ToastContainer from "./components/ToastContainer";
import ConfirmDialog from "./components/ConfirmDialog";
import { useToastStore } from "./store/useToastStore";
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
  Smartphone,
  Zap,
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
  const { t } = useTranslation();
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
  const { addToast } = useToastStore();

  // Confirmation dialog states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAccountToBuy, setPendingAccountToBuy] = useState<GameAccount | null>(null);

  // Gacha spin anim state proxies
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Banner Intro Animation states
  const [showBannerIntro, setShowBannerIntro] = useState(false);
  const [bannerIntroShrink, setBannerIntroShrink] = useState(false);
  const [bannerRect, setBannerRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

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

  // Web Content Customization States
  const [tickerNews, setTickerNews] = useState<string>("Hệ thống bán acc Dragon Ball Legends tự động hainagaming.com đang tặng giftcode mừng máy chủ mới! Nạp Momo / ATM cộng 10% giá trị.");
  const [atmBank, setAtmBank] = useState<string>("ACB");
  const [atmAccountNumber, setAtmAccountNumber] = useState<string>("17506391");
  const [atmAccountOwner, setAtmAccountOwner] = useState<string>("DOAN KHAC Y");
  const [momoPhone, setMomoPhone] = useState<string>("0399881122");
  const [momoAccountOwner, setMomoAccountOwner] = useState<string>("DOAN KHAC Y");

  // Load and bootstrap initial state from local storage securely
  useEffect(() => {
    // Accounts
    const savedAccounts = localStorage.getItem("haina_accounts");
    if (savedAccounts) {
      try {
        let parsed = JSON.parse(savedAccounts);
        let migrated = false;
        parsed = parsed.map((acc: any) => {
          if (acc.category === "DANH MỤC ACC REROL ANDROID") {
            acc.category = "DANH MỤC ACC Android";
            migrated = true;
          } else if (acc.category === "DANH MỤC ACC REROL IOS") {
            acc.category = "DANH MỤC ACC IOS";
            migrated = true;
          } else if (acc.category === "DANH MỤC ACC SIÊU VIP") {
            acc.category = acc.id.includes("VIP02") ? "DANH MỤC ACC IOS" : "DANH MỤC ACC Android";
            migrated = true;
          }
          return acc;
        });
        setAccounts(parsed);
        if (migrated) {
          localStorage.setItem("haina_accounts", JSON.stringify(parsed));
        }
      } catch (e) {
        setAccounts(INITIAL_ACCOUNTS);
        localStorage.setItem("haina_accounts", JSON.stringify(INITIAL_ACCOUNTS));
      }
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

    // Web content settings
    const savedTickerNews = localStorage.getItem("haina_ticker_news");
    if (savedTickerNews) setTickerNews(savedTickerNews);

    const savedAtmBank = localStorage.getItem("haina_atm_bank");
    if (savedAtmBank) setAtmBank(savedAtmBank);

    const savedAtmAccountNumber = localStorage.getItem("haina_atm_number");
    if (savedAtmAccountNumber) setAtmAccountNumber(savedAtmAccountNumber);

    const savedAtmAccountOwner = localStorage.getItem("haina_atm_owner");
    if (savedAtmAccountOwner) setAtmAccountOwner(savedAtmAccountOwner);

    const savedMomoPhone = localStorage.getItem("haina_momo_phone");
    if (savedMomoPhone) setMomoPhone(savedMomoPhone);

    const savedMomoAccountOwner = localStorage.getItem("haina_momo_owner");
    if (savedMomoAccountOwner) setMomoAccountOwner(savedMomoAccountOwner);

    setIsBootstrapped(true);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    }
  }, [theme]);

  // Trigger Banner Intro Animation when on home page
  useEffect(() => {
    if (activeView === "home" && isBootstrapped) {
      const timer = setTimeout(() => {
        if (bannerRef.current) {
          const rect = bannerRef.current.getBoundingClientRect();
          setBannerRect({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height,
          });
          setShowBannerIntro(true);
          setBannerIntroShrink(false);

          // After 1 second, start shrinking
          const shrinkTimer = setTimeout(() => {
            setBannerIntroShrink(true);
          }, 1000);

          // After 1.55s (1s wait + 550ms animation), end intro
          const endTimer = setTimeout(() => {
            setShowBannerIntro(false);
          }, 1550);

          return () => {
            clearTimeout(shrinkTimer);
            clearTimeout(endTimer);
          };
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [activeView, isBootstrapped]);

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
      addToast("Vui lòng đăng nhập tài khoản trước khi thực hiện giao dịch!", "error");
      setActiveView("login");
      navigate("/login");
      return;
    }

    if (account.status === "Sold") {
      addToast("Tài khoản này đã bán! Vui lòng lựa chọn mã nick Dragon Ball Legends khác.", "error");
      return;
    }

    if (currentUser.balance < account.price) {
      addToast(`Số dư ví của bạn không đủ! Thiếu ${(account.price - currentUser.balance).toLocaleString("vi-VN")}đ để mua tài khoản này.`, "error");
      setActiveView("recharge");
      navigate("/recharge");
      return;
    }

    setPendingAccountToBuy(account);
    setIsConfirmOpen(true);
  };

  const executeBuyAccount = () => {
    if (!pendingAccountToBuy) return;
    const account = pendingAccountToBuy;

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

    addToast(`Mua thành công tài khoản mã số ${account.id}!`, "success");
    setCheckoutReceipt(account);
    setIsConfirmOpen(false);
    setPendingAccountToBuy(null);
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

  // Web content updates
  const handleUpdateTickerNews = (text: string) => {
    setTickerNews(text);
    localStorage.setItem("haina_ticker_news", text);
  };

  const handleUpdateBilling = (billing: {
    atmBank: string;
    atmAccountNumber: string;
    atmAccountOwner: string;
    momoPhone: string;
    momoAccountOwner: string;
  }) => {
    setAtmBank(billing.atmBank);
    setAtmAccountNumber(billing.atmAccountNumber);
    setAtmAccountOwner(billing.atmAccountOwner);
    setMomoPhone(billing.momoPhone);
    setMomoAccountOwner(billing.momoAccountOwner);

    localStorage.setItem("haina_atm_bank", billing.atmBank);
    localStorage.setItem("haina_atm_number", billing.atmAccountNumber);
    localStorage.setItem("haina_atm_owner", billing.atmAccountOwner);
    localStorage.setItem("haina_momo_phone", billing.momoPhone);
    localStorage.setItem("haina_momo_owner", billing.momoAccountOwner);
  };

  // Reset entire simulation database
  const handleResetShopAdmin = () => {
    localStorage.removeItem("haina_accounts");
    localStorage.removeItem("haina_transactions");
    localStorage.removeItem("haina_bought_accounts");
    localStorage.removeItem("haina_user");
    localStorage.removeItem("haina_is_admin");
    localStorage.removeItem("haina_ticker_news");
    localStorage.removeItem("haina_atm_bank");
    localStorage.removeItem("haina_atm_number");
    localStorage.removeItem("haina_atm_owner");
    localStorage.removeItem("haina_momo_phone");
    localStorage.removeItem("haina_momo_owner");

    setAccounts(INITIAL_ACCOUNTS);
    setTransactions([]);
    setBoughtAccounts([]);
    setTickerNews("Hệ thống bán acc Dragon Ball Legends tự động hainagaming.com đang tặng giftcode mừng máy chủ mới! Nạp Momo / ATM cộng 10% giá trị.");
    setAtmBank("ACB");
    setAtmAccountNumber("17506391");
    setAtmAccountOwner("DOAN KHAC Y");
    setMomoPhone("0399881122");
    setMomoAccountOwner("DOAN KHAC Y");

    const defaultUser = { username: "hoang_gamer99", balance: 500000 };
    syncUser(defaultUser, false);
    setSelectedAccount(null);

    addToast("Đã khôi phục phục hồi toàn bộ dữ liệu ban đầu thành công!", "success");
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
    "DANH MỤC ACC Android",
    "DANH MỤC ACC IOS",
  ];

  if (!isBootstrapped) {
    return <LoadingState message={t("loading.bootstrap")} fullScreen />;
  }

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
      className="min-h-screen text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-red-950 transition-colors duration-300 relative"
      style={{
        backgroundColor: theme === "light" ? "transparent" : "rgba(28, 2, 2, 0.2)"
      }}
      data-theme={theme}
    >
      {/* GLOBAL WALLPAPER BACKGROUND */}
      <div
        className="fixed inset-0 z-[-10] pointer-events-none overflow-hidden"
        style={{
          backgroundImage: "url('https://wallpapers-clan.com/wp-content/uploads/2025/05/shenron-goku-dragonball-epic-scene-pc-desktop-laptop-wallpaper-preview.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: theme === "light" ? "brightness(0.95)" : "brightness(0.48)",
          transform: "scale(1.02)",
          opacity: theme === "light" ? 0.55 : 0.9,
        }}
      />
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
          <p className="uppercase tracking-wider truncate">
            {tickerNews}
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
                  {t("header.accountSettings")}
                </h2>
                <button
                  onClick={() => {
                    setActiveView("home");
                    navigate("/");
                  }}
                  className="bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 text-amber-400 py-1.5 px-4 rounded-xl border border-amber-500/20 text-xs font-bold uppercase transition"
                >
                  {t("productDetail.backHome")}
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
                    {t("header.personalInfo")}
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
                    {t("header.changePassword")}
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
                    {t("header.purchasedAcc")}
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
                    {t("header.transactionHistory")}
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
            tickerNews={tickerNews}
            onUpdateTickerNews={handleUpdateTickerNews}
            atmBank={atmBank}
            atmAccountNumber={atmAccountNumber}
            atmAccountOwner={atmAccountOwner}
            momoPhone={momoPhone}
            momoAccountOwner={momoAccountOwner}
            onUpdateBilling={handleUpdateBilling}
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
              atmBank={atmBank}
              atmAccountNumber={atmAccountNumber}
              atmAccountOwner={atmAccountOwner}
              momoPhone={momoPhone}
              momoAccountOwner={momoAccountOwner}
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
                <div
                  ref={bannerRef}
                  style={{
                    opacity: showBannerIntro && !bannerIntroShrink ? 0 : 1,
                    transition: "opacity 0.3s ease",
                  }}
                  className="relative bg-[#3d0303] border-2 border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden w-full"
                >
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
                          {t("home.topRankTitle")}
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
                            <h5 className="font-bold text-amber-300 uppercase mb-1.5 border-b border-amber-500/20 pb-1">{t("home.topRankRules")}</h5>
                            <ul className="space-y-1.5">
                              <li className="flex items-start gap-1">
                                <span>{t("home.topRankRule1")}</span>
                              </li>
                              <li className="flex items-start gap-1">
                                <span>{t("home.topRankRule2")}</span>
                              </li>
                              <li className="flex items-start gap-1">
                                <span>{t("home.topRankRule3")}</span>
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
                          {t("home.monthJune")}
                        </button>
                        <button
                          onClick={() => setActiveMonthTab("may")}
                          className={`py-0.5 px-1 rounded font-bold transition ${activeMonthTab === "may"
                            ? "bg-amber-500 text-red-950 font-black"
                            : "text-stone-300"
                            }`}
                        >
                          {t("home.monthMay")}
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
                    {t("home.top1Reward")}
                  </div>
                </div>
              </div>
            </div>


            {/* CATALOG LISTINGS SECTION */}
            <div className="space-y-6" id="cua-hang">


              {/* Grid Products Cards divided by categories */}
              {filteredAccounts.length === 0 ? (
                <EmptyState
                  title={t("home.noAccountsFound")}
                  description={t("emptyStates.noAccountsDesc")}
                  iconType="folder"
                  actionText={t("home.resetFilters")}
                  onAction={() => {
                    setSelectedCategory("Tất cả");
                    setSearchTerm("");
                  }}
                />
              ) : (
                <div className="space-y-12">
                  {categoriesList
                    .filter((cat) => cat !== "Tất cả" && (selectedCategory === "Tất cả" || selectedCategory === cat))
                    .map((cat) => {
                      const accountsInCat = filteredAccounts.filter((acc) => acc.category === cat);
                      if (accountsInCat.length === 0) return null;

                      return (
                        <div key={cat} className="space-y-6">
                          {/* Category Section Header */}
                          <div className="flex items-center justify-between border-b-2 border-amber-500/20 pb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                                {cat.includes("ANDROID") ? (
                                  <Smartphone className="w-5 h-5 text-amber-400" />
                                ) : cat.includes("IOS") ? (
                                  <svg className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 24 24">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.1.08 2.16-.52 2.82-1.33z" />
                                  </svg>
                                ) : (
                                  <Zap className="w-5 h-5 text-amber-400" />
                                )}
                              </div>
                              <h3 className="font-extrabold uppercase text-stone-100 tracking-wider text-base sm:text-lg">
                                {t("categories." + cat, cat)}
                              </h3>
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-amber-500 bg-amber-500/10 py-1 px-3 rounded-full border border-amber-500/15">
                              {accountsInCat.length} acc
                            </span>
                          </div>

                          {/* Accounts Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {accountsInCat.map((acc) => (
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
                        </div>
                      );
                    })}
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
        <div
          onClick={() => setCheckoutReceipt(null)}
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#4d0808] max-w-lg w-full p-6 sm:p-8 rounded-3xl border-2 border-emerald-400 text-stone-200 space-y-5 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-250"
          >
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
      {/* Dynamic Toasts Container */}
      <ToastContainer />

      {/* Account Purchase Confirmation Alert Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Xác nhận mua tài khoản"
        message={
          pendingAccountToBuy
            ? `Bạn có chắc chắn muốn mua tài khoản ${pendingAccountToBuy.id} với giá ${pendingAccountToBuy.price.toLocaleString("vi-VN")}đ không? Số tiền sẽ được trừ trực tiếp từ số dư tài khoản của bạn.`
            : ""
        }
        confirmText="Đồng ý mua"
        cancelText="Hủy"
        onConfirm={executeBuyAccount}
        onCancel={() => {
          setIsConfirmOpen(false);
          setPendingAccountToBuy(null);
        }}
      />
      {/* FULL SCREEN BANNER INTRO OVERLAY */}
      {showBannerIntro && bannerRect && (
        <div
          className="fixed z-[100] overflow-hidden pointer-events-none transition-all"
          style={{
            backgroundColor: bannerIntroShrink ? "transparent" : "#1c0202",
            top: bannerIntroShrink ? bannerRect.top - window.scrollY : 0,
            left: bannerIntroShrink ? bannerRect.left - window.scrollX : 0,
            width: bannerIntroShrink ? bannerRect.width : "100vw",
            height: bannerIntroShrink ? bannerRect.height : "100vh",
            transition: "all 0.55s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.55s ease",
          }}
        >
          <img
            src={heroBannerGif}
            alt="Intro Banner"
            className="w-full h-full transition-all duration-550"
            style={{
              objectFit: "contain",
              borderRadius: bannerIntroShrink ? "1.5rem" : "0px",
            }}
          />
        </div>
      )}
    </div>
  );
}
