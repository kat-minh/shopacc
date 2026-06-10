"use client";

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import {
  GameAccount,
  LuckyWheelGame,
  LuckyWheelPrize,
  Transaction,
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
import heroBannerMp4 from "./assets/images/enhanced_final.mp4";
import heroBannerPoster from "./assets/images/final.gif";

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
  AlertTriangle,
  X,
  ArrowUpDown,
  Tag,
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

// Derive a Messenger chat link from the configured Facebook fanpage URL.
// Examples:
//   https://www.facebook.com/profile.php?id=61590028476569
//     -> https://www.messenger.com/e2ee/t/61590028476569
//   https://facebook.com/hainagaming -> https://m.me/hainagaming
const buildMessengerLink = (facebookUrl: string): string => {
  if (!facebookUrl) return "";
  // profile.php?id=<numeric id>
  const idMatch = facebookUrl.match(/[?&]id=(\d+)/);
  if (idMatch) return `https://www.messenger.com/e2ee/t/${idMatch[1]}`;
  // username form: facebook.com/<username>
  const userMatch = facebookUrl.match(/facebook\.com\/([^/?#]+)/i);
  if (userMatch && userMatch[1] !== "profile.php") return `https://m.me/${userMatch[1]}`;
  return facebookUrl;
};

export default function App() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    token,
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
  const [categories, setCategories] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [boughtAccounts, setBoughtAccounts] = useState<GameAccount[]>([]);

  const queryClient = useQueryClient();

  // Price sort/filter (user-facing on home catalog) — gửi lên API để lọc/sắp xếp phía server.
  const [priceSort, setPriceSort] = useState<"default" | "asc" | "desc">("default");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  // Debounce ô nhập giá để không gọi API mỗi lần gõ phím.
  const [appliedMinPrice, setAppliedMinPrice] = useState<string>("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<string>("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedMinPrice(minPrice.trim());
      setAppliedMaxPrice(maxPrice.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]);

  const apiSortValue =
    priceSort === "asc" ? "price_asc" : priceSort === "desc" ? "price_desc" : undefined;

  // 1. Get available accounts (lọc & sắp xếp theo giá ngay trên server)
  const { data: apiAccounts } = useQuery({
    queryKey: ["accounts", apiSortValue ?? "default", appliedMinPrice, appliedMaxPrice],
    queryFn: () =>
      api.get<GameAccount[]>("/accounts", {
        params: {
          sort: apiSortValue,
          minPrice: appliedMinPrice !== "" ? Number(appliedMinPrice) : undefined,
          maxPrice: appliedMaxPrice !== "" ? Number(appliedMaxPrice) : undefined,
        },
      }),
  });

  // 2. Get user me details
  const { data: userMe } = useQuery({
    queryKey: ["userMe", token],
    queryFn: () => api.get<{ username: string; balance: number; isAdmin: boolean }>("/auth/me"),
    enabled: !!token,
  });

  // 3. Get user bought accounts (kho đồ)
  const { data: apiBought } = useQuery({
    queryKey: ["boughtAccounts", token],
    queryFn: () => api.get<{ data: GameAccount[] }>("/user/bought-accounts"),
    enabled: !!token,
  });

  // 4. Get transactions
  const { data: apiTransactions } = useQuery({
    queryKey: ["transactions", token, isAdmin],
    queryFn: () => {
      if (isAdmin) {
        return api.get<{ data: Transaction[] }>("/admin/transactions?limit=1000");
      }
      return api.get<{ data: Transaction[] }>("/user/transactions");
    },
    enabled: !!token,
  });

  // 5. Get admin dashboard stats
  const { data: adminDashboardStats } = useQuery({
    queryKey: ["adminDashboardStats", token, isAdmin],
    queryFn: () => api.get<any>("/admin/dashboard"),
    enabled: !!token && isAdmin,
  });

  // 6. Get categories
  const { data: apiCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<{ id: string; name: string; game: string }[]>("/categories"),
  });

  // 7. Get system settings (web content config)
  const { data: apiSettings } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: () => api.get<{
      tickerNews: string;
      atmBank: string;
      atmAccountNumber: string;
      atmAccountOwner: string;
      momoPhone: string;
      momoAccountOwner: string;
      footerPhone: string;
      footerZalo: string;
      footerFacebook: string;
      footerBrandName: string;
      footerAboutText: string;
      footerHours: string;
      footerPolicy: string;
      footerCopyright: string;
    }>("/settings"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // 8. Leaderboard nạp tiền (đua top) — tháng hiện tại & tháng trước
  type LeaderboardResult = {
    year: number;
    month: number;
    items: { rank: number; username: string; amount: number }[];
  };

  const currentLeaderboard = useQuery({
    queryKey: ["leaderboard", "current"],
    queryFn: () =>
      api.get<LeaderboardResult>("/leaderboard/recharge", {
        params: { period: "current", limit: 5 },
      }),
    staleTime: 5 * 60 * 1000,
  });

  const previousLeaderboard = useQuery({
    queryKey: ["leaderboard", "previous"],
    queryFn: () =>
      api.get<LeaderboardResult>("/leaderboard/recharge", {
        params: { period: "previous", limit: 5 },
      }),
    staleTime: 5 * 60 * 1000,
  });

  // Nhãn 2 tab = 2 tháng gần nhất (lấy year/month từ API; fallback theo ngày hiện tại khi chưa tải xong)
  const nowDate = new Date();
  const prevDate = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1, 1);
  const currentMonthMeta = currentLeaderboard.data ?? { year: nowDate.getFullYear(), month: nowDate.getMonth() + 1 };
  const previousMonthMeta = previousLeaderboard.data ?? { year: prevDate.getFullYear(), month: prevDate.getMonth() + 1 };
  const formatMonthLabel = (meta: { year: number; month: number }) =>
    new Intl.DateTimeFormat(i18n.language, { month: "short" }).format(new Date(meta.year, meta.month - 1, 1));

  // Sync userMe data to store
  useEffect(() => {
    if (userMe) {
      syncUser({ username: userMe.username, balance: userMe.balance }, userMe.isAdmin);
    }
  }, [userMe, syncUser]);

  // Sync accounts from API
  useEffect(() => {
    if (apiAccounts) {
      const mapped = apiAccounts.map((acc: any) => ({
        ...acc,
        quantity: acc.stock,
        status: acc.stock > 0 ? "Available" : "Sold",
      }));
      setAccounts(mapped);
    }
  }, [apiAccounts]);

  // Sync categories from API
  useEffect(() => {
    if (apiCategories) {
      setCategories(apiCategories.map((c) => c.name));
    }
  }, [apiCategories]);

  // Sync bought accounts
  useEffect(() => {
    if (apiBought?.data) {
      setBoughtAccounts(apiBought.data);
    }
  }, [apiBought]);

  // Sync transactions
  useEffect(() => {
    if (apiTransactions?.data) {
      setTransactions(apiTransactions.data);
    }
  }, [apiTransactions]);

  // Sync system settings from API (overrides localStorage defaults)
  useEffect(() => {
    if (apiSettings) {
      if (apiSettings.tickerNews) setTickerNews(apiSettings.tickerNews);
      if (apiSettings.atmBank) setAtmBank(apiSettings.atmBank);
      if (apiSettings.atmAccountNumber) setAtmAccountNumber(apiSettings.atmAccountNumber);
      if (apiSettings.atmAccountOwner) setAtmAccountOwner(apiSettings.atmAccountOwner);
      if (apiSettings.momoPhone) setMomoPhone(apiSettings.momoPhone);
      if (apiSettings.momoAccountOwner) setMomoAccountOwner(apiSettings.momoAccountOwner);
      if (apiSettings.footerPhone) setFooterPhone(apiSettings.footerPhone);
      if (apiSettings.footerZalo) setFooterZalo(apiSettings.footerZalo);
      if (apiSettings.footerFacebook) setFooterFacebook(apiSettings.footerFacebook);
      if (apiSettings.footerBrandName) setFooterBrandName(apiSettings.footerBrandName);
      if (apiSettings.footerAboutText) setFooterAboutText(apiSettings.footerAboutText);
      if (apiSettings.footerHours) setFooterHours(apiSettings.footerHours);
      if (apiSettings.footerPolicy) setFooterPolicy(apiSettings.footerPolicy);
      if (apiSettings.footerCopyright) setFooterCopyright(apiSettings.footerCopyright);
    }
  }, [apiSettings]);

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
  const [pendingQtyToBuy, setPendingQtyToBuy] = useState<number>(1);

  // Gacha spin anim state proxies
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Banner Intro Animation states
  const [showBannerIntro, setShowBannerIntro] = useState(() => {
    if (typeof window !== "undefined") {
      return pathToView(window.location.pathname) === "home";
    }
    return true;
  });
  const [bannerIntroShrink, setBannerIntroShrink] = useState(false);
  const [bannerRect, setBannerRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const videoBannerRef = useRef<HTMLVideoElement>(null);
  const [hasIntroPlayed, setHasIntroPlayed] = useState(false);

  // Checkout modal confirmations
  const [checkoutReceipt, setCheckoutReceipt] = useState<GameAccount | null>(
    null,
  );
  const [copiedReceiptItem, setCopiedReceiptItem] = useState<string | null>(
    null,
  );

  // Top recharger ranking display tabs
  const [activeMonthTab, setActiveMonthTab] = useState<"current" | "previous">("current");

  // Track expanded state for categories product grids
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== "undefined" ? window.innerWidth >= 1024 : true);
  const [postLoginRedirect, setPostLoginRedirect] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Recharge sub-tabs
  const [rechargeTab, setRechargeTab] = useState<"card" | "atm">("card");

  // Web Content Customization States
  const [tickerNews, setTickerNews] = useState<string>("Hệ thống bán acc Dragon Ball Legends tự động hainagaming.com đang tặng giftcode mừng máy chủ mới! Nạp Momo / ATM cộng 10% giá trị.");
  const [atmBank, setAtmBank] = useState<string>("ACB");
  const [atmAccountNumber, setAtmAccountNumber] = useState<string>("17506391");
  const [atmAccountOwner, setAtmAccountOwner] = useState<string>("DOAN KHAC Y");
  const [momoPhone, setMomoPhone] = useState<string>("0399881122");
  const [momoAccountOwner, setMomoAccountOwner] = useState<string>("DOAN KHAC Y");
  const [footerPhone, setFooterPhone] = useState<string>("0399.88.11.22");
  const [footerZalo, setFooterZalo] = useState<string>("https://zalo.me/17506391");
  const [footerFacebook, setFooterFacebook] = useState<string>("https://www.facebook.com/profile.php?id=61590028476569");
  const [footerBrandName, setFooterBrandName] = useState<string>("Hainagaming || Siêu Thị Account Reroll Dragon Ball Legend");
  const [footerAboutText, setFooterAboutText] = useState<string>("Siêu thị Account Reroll Dragon Ball Legends tự động số 1 Việt Nam. Uy tín, chất lượng và an toàn bảo mật tuyệt đối.");
  const [footerHours, setFooterHours] = useState<string>("07:00 - 24:00 (Cả CN & Ngày lễ)");
  const [footerPolicy, setFooterPolicy] = useState<string>("Hệ thống giao dịch hoàn toàn tự động 24/7. Vui lòng đọc kỹ điều khoản mua acc trước khi thanh toán.");
  const [footerCopyright, setFooterCopyright] = useState<string>("Hainagaming.com không liên kết trực tiếp với Bandai Namco. Bản quyền game thuộc về chủ sở hữu.");

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
          if (acc.quantity === undefined) {
            acc.quantity = acc.id.includes("VIP") ? 1 : 15;
            migrated = true;
          }
          return acc;
        });
        setAccounts(parsed);
        if (migrated) {
          localStorage.setItem("haina_accounts", JSON.stringify(parsed));
        }
      } catch (e) {
        const initialWithQty = INITIAL_ACCOUNTS.map(acc => ({
          ...acc,
          quantity: acc.quantity ?? (acc.id.includes("VIP") ? 1 : 15)
        }));
        setAccounts(initialWithQty);
        localStorage.setItem("haina_accounts", JSON.stringify(initialWithQty));
      }
    } else {
      const initialWithQty = INITIAL_ACCOUNTS.map(acc => ({
        ...acc,
        quantity: acc.quantity ?? (acc.id.includes("VIP") ? 1 : 15)
      }));
      setAccounts(initialWithQty);
      localStorage.setItem("haina_accounts", JSON.stringify(initialWithQty));
    }

    // Categories
    const savedCategories = localStorage.getItem("haina_categories");
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      const initialCats = ["DANH MỤC ACC Android", "DANH MỤC ACC IOS"];
      setCategories(initialCats);
      localStorage.setItem("haina_categories", JSON.stringify(initialCats));
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

    const savedPhone = localStorage.getItem("haina_footer_phone");
    if (savedPhone) setFooterPhone(savedPhone);

    const savedZalo = localStorage.getItem("haina_footer_zalo");
    if (savedZalo) setFooterZalo(savedZalo);

    const savedFb = localStorage.getItem("haina_footer_fb");
    if (savedFb) setFooterFacebook(savedFb);

    const savedBrand = localStorage.getItem("haina_footer_brand");
    if (savedBrand) setFooterBrandName(savedBrand);

    const savedAbout = localStorage.getItem("haina_footer_about");
    if (savedAbout) setFooterAboutText(savedAbout);

    const savedHours = localStorage.getItem("haina_footer_hours");
    if (savedHours) setFooterHours(savedHours);

    const savedPolicy = localStorage.getItem("haina_footer_policy");
    if (savedPolicy) setFooterPolicy(savedPolicy);

    const savedCopyright = localStorage.getItem("haina_footer_copyright");
    if (savedCopyright) setFooterCopyright(savedCopyright);

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
    if (activeView === "home" && isBootstrapped && !hasIntroPlayed) {
      const timer = setTimeout(() => {
        if (bannerRef.current) {
          const rect = bannerRef.current.getBoundingClientRect();
          setBannerRect({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height,
          });
          setBannerIntroShrink(false);

          // After 1 second, start shrinking
          const shrinkTimer = setTimeout(() => {
            setBannerIntroShrink(true);
          }, 1000);

          // After 1.55s (1s wait + 550ms animation), end intro
          const endTimer = setTimeout(() => {
            setShowBannerIntro(false);
            setHasIntroPlayed(true);
          }, 1550);

          return () => {
            clearTimeout(shrinkTimer);
            clearTimeout(endTimer);
          };
        }
      }, 50);

      return () => clearTimeout(timer);
    } else if (isBootstrapped) {
      setShowBannerIntro(false);
      if (activeView !== "home") {
        setHasIntroPlayed(true);
      }
    }
  }, [activeView, isBootstrapped, hasIntroPlayed]);

  // Seamless video looping check using requestAnimationFrame (60fps accuracy)
  useEffect(() => {
    let active = true;
    let frameId: number;
    const checkLoop = () => {
      const video = videoBannerRef.current;
      if (video && video.duration) {
        if (video.currentTime >= video.duration - 0.1) {
          video.currentTime = 0;
          video.play().catch(() => { });
        }
      }
      if (active) {
        frameId = requestAnimationFrame(checkLoop);
      }
    };
    frameId = requestAnimationFrame(checkLoop);
    return () => {
      active = false;
      cancelAnimationFrame(frameId);
    };
  }, []);

  // Ensure the hero video actually autoplays on real mobile devices.
  // React doesn't reliably reflect the `muted` JSX prop to the DOM `muted`
  // property, so mobile browsers treat the video as unmuted and block
  // autoplay (desktop is more lenient, which is why it works in PC responsive
  // testing but the banner appears blank on a real phone). Force-mute via the
  // DOM property and retry play() once the data is ready.
  useEffect(() => {
    const video = videoBannerRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    const tryPlay = () => {
      video.play().catch(() => { });
    };
    tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
    };
  }, []);

  useEffect(() => {
    const routeView = pathToView(location.pathname);
    const isGuest = currentUser.username === "Khách";
    const protectedViews: AppView[] = ["profile", "change-password", "user-history", "history", "admin", "recharge"];

    if (isGuest && protectedViews.includes(routeView)) {
      setPostLoginRedirect(location.pathname);
      setActiveView("login");
      navigate("/login");
      return;
    }

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
    token: string,
    user: { username: string; balance: number },
    adminState: boolean,
  ) => {
    login(token, { ...user, isAdmin: adminState });
    const destination = postLoginRedirect ?? (adminState ? "/admin" : "/");
    navigate(destination);
    setPostLoginRedirect(null);
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
    try {
      const result = await api.post<{ message: string; status: string }>("/recharge/card", {
        provider,
        amount,
        serial,
        pin,
      });
      addToast(result.message || "Gửi thẻ cào thành công và đang chờ xử lý!", "success");

      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["userMe"] });
      return true;
    } catch (err: any) {
      addToast(err.message || "Gạch thẻ thất bại!", "error");
      return false;
    }
  };

  // Product Purchase logic
  const handleBuyAccount = (account: GameAccount, quantity: number = 1) => {
    if (currentUser.username === "Khách") {
      addToast("Vui lòng đăng nhập tài khoản trước khi thực hiện giao dịch!", "error");
      setActiveView("login");
      navigate("/login");
      return;
    }

    if (account.status === "Sold" || (account.quantity !== undefined && account.quantity <= 0)) {
      addToast("Tài khoản này đã hết hàng! Vui lòng lựa chọn mã nick Dragon Ball Legends khác.", "error");
      return;
    }

    const totalCost = account.price * quantity;
    if (currentUser.balance < totalCost) {
      addToast(`Số dư ví của bạn không đủ! Thiếu ${(totalCost - currentUser.balance).toLocaleString("vi-VN")}đ để mua tài khoản này.`, "error");
      setActiveView("recharge");
      navigate("/recharge");
      return;
    }

    setPendingAccountToBuy(account);
    setPendingQtyToBuy(quantity);
    setIsConfirmOpen(true);
  };

  const executeBuyAccount = async () => {
    if (!pendingAccountToBuy) return;
    const account = pendingAccountToBuy;
    try {
      const result = await api.post<{ message: string; account: any }>(
        `/accounts/${account.id}/buy`,
        { quantity: pendingQtyToBuy }
      );

      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["userMe"] });
      queryClient.invalidateQueries({ queryKey: ["boughtAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });

      addToast(result.message || `Mua thành công tài khoản mã số ${account.id}!`, "success");
      setCheckoutReceipt(result.account);
      setIsConfirmOpen(false);
      setPendingAccountToBuy(null);
      setPendingQtyToBuy(1);
    } catch (err: any) {
      addToast(err.message || "Giao dịch thất bại!", "error");
      setIsConfirmOpen(false);
    }
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
  const handleAddAccountAdmin = async (newAcc: GameAccount) => {
    try {
      const payload = {
        category: newAcc.category,
        title: newAcc.title,
        price: newAcc.price,
        originalPrice: newAcc.originalPrice,
        imageUrl: newAcc.imageUrl,
        avatarUrl: newAcc.avatarUrl,
        stats: newAcc.stats,
        fileContent: (newAcc as any).fileContent,
      };
      await api.post("/admin/accounts", payload);
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      addToast("Thêm tài khoản thành công!", "success");
    } catch (err: any) {
      addToast(err.message || "Thêm thất bại!", "error");
    }
  };

  // Admin Account deletions
  const handleDeleteAccountAdmin = async (id: string) => {
    try {
      await api.delete(`/admin/accounts/${id}`);
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      addToast("Xóa tài khoản thành công!", "success");
    } catch (err: any) {
      addToast(err.message || "Xóa thất bại!", "error");
    }
  };

  // Admin Account updates
  const handleEditAccountAdmin = async (updatedAcc: GameAccount) => {
    try {
      await api.put(`/admin/accounts/${updatedAcc.id}`, updatedAcc);
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      addToast("Cập nhật tài khoản thành công!", "success");
    } catch (err: any) {
      addToast(err.message || "Cập nhật thất bại!", "error");
    }
  };

  const handleAddCategory = async (newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    try {
      await api.post("/admin/categories", { name: trimmed });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      addToast(`Đã thêm danh mục "${trimmed}" thành công!`, "success");
    } catch (err: any) {
      addToast(err.message || "Thêm danh mục thất bại!", "error");
    }
  };

  const handleEditCategory = async (oldCat: string, newCat: string) => {
    const trimmedOld = oldCat.trim();
    const trimmedNew = newCat.trim();
    if (!trimmedNew || trimmedOld === trimmedNew) return;

    try {
      const cat = apiCategories?.find(c => c.name === trimmedOld);
      if (!cat) {
        addToast("Không tìm thấy danh mục để chỉnh sửa!", "error");
        return;
      }
      await api.put(`/admin/categories/${cat.id}`, { name: trimmedNew });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      addToast(`Đã đổi tên danh mục thành "${trimmedNew}"!`, "success");
    } catch (err: any) {
      addToast(err.message || "Cập nhật danh mục thất bại!", "error");
    }
  };

  const handleDeleteCategory = async (catToDelete: string) => {
    const trimmed = catToDelete.trim();
    try {
      const cat = apiCategories?.find(c => c.name === trimmed);
      if (!cat) {
        addToast("Không tìm thấy danh mục để xóa!", "error");
        return;
      }
      await api.delete(`/admin/categories/${cat.id}`);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      addToast(`Đã xóa danh mục "${trimmed}" thành công!`, "success");
    } catch (err: any) {
      addToast(err.message || "Xóa danh mục thất bại!", "error");
    }
  };

  // Helper: persist all current settings to the backend API
  const persistSettingsToApi = async (patch: Partial<{
    tickerNews: string;
    atmBank: string;
    atmAccountNumber: string;
    atmAccountOwner: string;
    momoPhone: string;
    momoAccountOwner: string;
    footerPhone: string;
    footerZalo: string;
    footerFacebook: string;
    footerBrandName: string;
    footerAboutText: string;
    footerHours: string;
    footerPolicy: string;
    footerCopyright: string;
  }>) => {
    try {
      await api.put("/settings", {
        tickerNews: patch.tickerNews ?? tickerNews,
        atmBank: patch.atmBank ?? atmBank,
        atmAccountNumber: patch.atmAccountNumber ?? atmAccountNumber,
        atmAccountOwner: patch.atmAccountOwner ?? atmAccountOwner,
        momoPhone: patch.momoPhone ?? momoPhone,
        momoAccountOwner: patch.momoAccountOwner ?? momoAccountOwner,
        footerPhone: patch.footerPhone ?? footerPhone,
        footerZalo: patch.footerZalo ?? footerZalo,
        footerFacebook: patch.footerFacebook ?? footerFacebook,
        footerBrandName: patch.footerBrandName ?? footerBrandName,
        footerAboutText: patch.footerAboutText ?? footerAboutText,
        footerHours: patch.footerHours ?? footerHours,
        footerPolicy: patch.footerPolicy ?? footerPolicy,
        footerCopyright: patch.footerCopyright ?? footerCopyright,
      });
      queryClient.invalidateQueries({ queryKey: ["systemSettings"] });
    } catch (err: any) {
      addToast(err.message || "Lưu cấu hình thất bại!", "error");
    }
  };

  // Web content updates — save to state, localStorage (fallback), and backend API
  const handleUpdateTickerNews = async (text: string) => {
    setTickerNews(text);
    localStorage.setItem("haina_ticker_news", text);
    await persistSettingsToApi({ tickerNews: text });
  };

  const handleUpdateFooterLinks = async (links: {
    tickerNews?: string;
    phone: string;
    zalo: string;
    facebook: string;
    brandName?: string;
    aboutText?: string;
    hours?: string;
    policy?: string;
    copyright?: string;
  }) => {
    if (links.tickerNews !== undefined) {
      setTickerNews(links.tickerNews);
      localStorage.setItem("haina_ticker_news", links.tickerNews);
    }
    setFooterPhone(links.phone);
    setFooterZalo(links.zalo);
    setFooterFacebook(links.facebook);
    localStorage.setItem("haina_footer_phone", links.phone);
    localStorage.setItem("haina_footer_zalo", links.zalo);
    localStorage.setItem("haina_footer_fb", links.facebook);

    const newBrand = links.brandName ?? footerBrandName;
    const newAbout = links.aboutText ?? footerAboutText;
    const newHours = links.hours ?? footerHours;
    const newPolicy = links.policy ?? footerPolicy;
    const newCopyright = links.copyright ?? footerCopyright;

    if (links.brandName !== undefined) {
      setFooterBrandName(links.brandName);
      localStorage.setItem("haina_footer_brand", links.brandName);
    }
    if (links.aboutText !== undefined) {
      setFooterAboutText(links.aboutText);
      localStorage.setItem("haina_footer_about", links.aboutText);
    }
    if (links.hours !== undefined) {
      setFooterHours(links.hours);
      localStorage.setItem("haina_footer_hours", links.hours);
    }
    if (links.policy !== undefined) {
      setFooterPolicy(links.policy);
      localStorage.setItem("haina_footer_policy", links.policy);
    }
    if (links.copyright !== undefined) {
      setFooterCopyright(links.copyright);
      localStorage.setItem("haina_footer_copyright", links.copyright);
    }

    await persistSettingsToApi({
      ...(links.tickerNews !== undefined ? { tickerNews: links.tickerNews } : {}),
      footerPhone: links.phone,
      footerZalo: links.zalo,
      footerFacebook: links.facebook,
      footerBrandName: newBrand,
      footerAboutText: newAbout,
      footerHours: newHours,
      footerPolicy: newPolicy,
      footerCopyright: newCopyright,
    });
  };

  const handleUpdateBilling = async (billing: {
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

    await persistSettingsToApi({
      atmBank: billing.atmBank,
      atmAccountNumber: billing.atmAccountNumber,
      atmAccountOwner: billing.atmAccountOwner,
      momoPhone: billing.momoPhone,
      momoAccountOwner: billing.momoAccountOwner,
    });
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
    localStorage.removeItem("haina_footer_phone");
    localStorage.removeItem("haina_footer_zalo");
    localStorage.removeItem("haina_footer_fb");

    setAccounts(INITIAL_ACCOUNTS);
    setTransactions([]);
    setBoughtAccounts([]);
    setTickerNews("Hệ thống bán acc Dragon Ball Legends tự động hainagaming.com đang tặng giftcode mừng máy chủ mới! Nạp Momo / ATM cộng 10% giá trị.");
    setAtmBank("ACB");
    setAtmAccountNumber("17506391");
    setAtmAccountOwner("DOAN KHAC Y");
    setMomoPhone("0399881122");
    setMomoAccountOwner("DOAN KHAC Y");
    setFooterPhone("0399.88.11.22");
    setFooterZalo("https://zalo.me/17506391");
    setFooterFacebook("https://www.facebook.com/profile.php?id=61590028476569");

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

  // Catalog item filtering. Lọc giá & sắp xếp đã làm ở server (API /accounts);
  // ở client chỉ lọc thêm theo danh mục & từ khóa tìm kiếm, GIỮ NGUYÊN thứ tự server trả về.
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

  const isPriceFilterActive =
    priceSort !== "default" || minPrice.trim() !== "" || maxPrice.trim() !== "";

  const resetPriceFilters = () => {
    setPriceSort("default");
    setMinPrice("");
    setMaxPrice("");
  };

  const categoriesList = [
    "Tất cả",
    ...categories,
  ];

  // Danh mục để render. Gộp danh mục cấu hình (/categories) VỚI các category thực tế
  // có trong dữ liệu sản phẩm — nếu không, một acc có category không nằm trong list sẽ
  // bị "mất tích" (filteredAccounts > 0 nên không hiện EmptyState mà cũng không có nhóm nào render).
  const categoriesToRender =
    selectedCategory === "Tất cả"
      ? Array.from(
          new Set([
            ...categoriesList.filter((c) => c !== "Tất cả"),
            ...filteredAccounts.map((a) => a.category),
          ]),
        ).filter(Boolean)
      : [selectedCategory];

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
        <div className="bg-linear-to-r from-amber-500 via-yellow-400 to-amber-500 text-red-950 font-black text-xs py-2 shadow overflow-hidden relative w-full">
          <div className="animate-marquee-text whitespace-nowrap uppercase tracking-wider">
            {tickerNews}
          </div>
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
            dashboardStats={adminDashboardStats}
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
            categories={categories}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            footerPhone={footerPhone}
            footerZalo={footerZalo}
            footerFacebook={footerFacebook}
            footerBrandName={footerBrandName}
            footerAboutText={footerAboutText}
            footerHours={footerHours}
            footerPolicy={footerPolicy}
            footerCopyright={footerCopyright}
            onUpdateFooterLinks={handleUpdateFooterLinks}
          />
        )}

        {/* DYNAMIC TOP-UP CHARGE SECTIONS PAGE */}
        {activeView === "recharge" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-amber-500/20 pb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black uppercase text-amber-300 tracking-wider">
                  {t("recharge.titleRechargeArea")}
                </h2>
              </div>
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
        <div
          className="space-y-12"
          style={activeView === "home" ? {} : {
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
            width: "100%",
            height: "0px",
            overflow: "hidden",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          {/* HERO & RANKING GRID SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch w-full">
            {/* LEFT COLUMN: HERO BANNER (70% width, i.e. col-span-7) */}
            <div className="lg:col-span-7 flex items-center justify-start relative aspect-video border-2 border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden bg-transparent">
              {/* Ghost container to reserve size */}
              <div ref={bannerRef} className="w-full h-full" />

              {/* The single animated banner node */}
              <div
                style={{
                  position: showBannerIntro ? "fixed" : "absolute",
                  zIndex: showBannerIntro ? 100 : 10,
                  top: showBannerIntro
                    ? (bannerIntroShrink && bannerRect ? bannerRect.top - window.scrollY : 0)
                    : 0,
                  left: showBannerIntro
                    ? (bannerIntroShrink && bannerRect ? bannerRect.left - window.scrollX : 0)
                    : 0,
                  width: showBannerIntro
                    ? (bannerIntroShrink && bannerRect ? bannerRect.width : "100vw")
                    : "100%",
                  height: showBannerIntro
                    ? (bannerIntroShrink && bannerRect ? bannerRect.height : "100vh")
                    : "100%",
                  backgroundColor: "#1c0202",
                  borderRadius: showBannerIntro && !(bannerIntroShrink && bannerRect) ? "0px" : "1.5rem",
                  transition: showBannerIntro ? "all 0.55s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.55s ease" : "none",
                  pointerEvents: showBannerIntro ? "none" : "auto",
                  overflow: "hidden",
                  transform: "translate3d(0, 0, 0)",
                  willChange: "transform",
                }}
                className="inset-0"
              >
                <video
                  ref={videoBannerRef}
                  src={heroBannerMp4}
                  poster={heroBannerPoster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover relative z-10"
                  style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                  }}
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
                        onClick={() => setActiveMonthTab("current")}
                        className={`py-0.5 px-1 rounded font-bold transition uppercase ${activeMonthTab === "current"
                          ? "bg-amber-500 text-red-950 font-black"
                          : "text-stone-300"
                          }`}
                      >
                        {formatMonthLabel(currentMonthMeta)}
                      </button>
                      <button
                        onClick={() => setActiveMonthTab("previous")}
                        className={`py-0.5 px-1 rounded font-bold transition uppercase ${activeMonthTab === "previous"
                          ? "bg-amber-500 text-red-950 font-black"
                          : "text-stone-300"
                          }`}
                      >
                        {formatMonthLabel(previousMonthMeta)}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mt-3">
                    {(() => {
                      const items =
                        (activeMonthTab === "current"
                          ? currentLeaderboard.data?.items
                          : previousLeaderboard.data?.items) ?? [];
                      if (items.length === 0) {
                        return (
                          <p className="text-[10px] text-stone-400 text-center py-4 italic">
                            {t("home.topRankEmpty")}
                          </p>
                        );
                      }
                      return items.map((re, rank) => (
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
                      ));
                    })()}
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
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-amber-500/10">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-2 px-4.5 rounded-xl text-xs font-bold transition uppercase cursor-pointer ${selectedCategory === cat
                    ? "bg-amber-500 text-stone-950 font-black shadow-md shadow-amber-500/20"
                    : "bg-stone-900/40 text-stone-300 border border-amber-500/10 hover:bg-stone-900/80 hover:text-amber-400"
                    }`}
                >
                  {t("categories." + cat, cat)}
                </button>
              ))}
            </div>

            {/* Price Sort & Filter Bar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Sort by price */}
              <div className="flex items-center gap-2 bg-stone-900/40 border border-amber-500/10 rounded-xl pl-3 pr-2 py-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 hidden sm:inline">
                  {t("home.sortLabel", "Sắp xếp")}
                </span>
                <select
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value as "default" | "asc" | "desc")}
                  className="bg-transparent text-xs font-bold text-stone-100 focus:outline-none cursor-pointer"
                >
                  <option value="default" className="bg-stone-900 text-stone-100">
                    {t("home.sortDefault", "Mặc định")}
                  </option>
                  <option value="asc" className="bg-stone-900 text-stone-100">
                    {t("home.sortPriceAsc", "Giá: Thấp → Cao")}
                  </option>
                  <option value="desc" className="bg-stone-900 text-stone-100">
                    {t("home.sortPriceDesc", "Giá: Cao → Thấp")}
                  </option>
                </select>
              </div>

              {/* Price range filter */}
              <div className="flex items-center gap-1.5 bg-stone-900/40 border border-amber-500/10 rounded-xl px-3 py-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder={t("home.priceFrom", "Giá từ")}
                  className="w-16 sm:w-20 bg-transparent text-xs font-bold text-stone-100 placeholder-stone-500 focus:outline-none"
                />
                <span className="text-stone-500 text-xs">–</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder={t("home.priceTo", "Đến")}
                  className="w-16 sm:w-20 bg-transparent text-xs font-bold text-stone-100 placeholder-stone-500 focus:outline-none"
                />
                <span className="text-[10px] text-stone-500 font-bold">đ</span>
              </div>

              {/* Active filter summary + clear */}
              <span className="text-[10px] font-bold text-amber-500/80 hidden md:inline">
                {filteredAccounts.length} {t("home.resultsLabel", "kết quả")}
              </span>
              {isPriceFilterActive && (
                <button
                  onClick={resetPriceFilters}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-300 bg-stone-900/60 border border-amber-500/10 rounded-xl px-2.5 py-1.5 hover:text-amber-400 hover:border-amber-400/40 transition cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  {t("home.clearPriceFilter", "Xóa lọc giá")}
                </button>
              )}
            </div>

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
                  resetPriceFilters();
                }}
              />
            ) : (
              <div className="space-y-12">
                {categoriesToRender
                  .map((cat) => {
                    const accountsInCat = filteredAccounts.filter((acc) => acc.category === cat);
                    const limit = isDesktop ? 8 : 4;
                    const isExpanded = !!expandedCategories[cat];
                    const displayedAccounts = isExpanded ? accountsInCat : accountsInCat.slice(0, limit);
                    const hasMore = accountsInCat.length > limit;

                    return (
                      <div key={cat} className="space-y-6">
                        {/* Category Section Header */}
                        <div className="flex items-center justify-between border-b-2 border-amber-500/20 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                              {cat.includes("ANDROID") || cat.includes("Android") ? (
                                <Smartphone className="w-5 h-5 text-amber-400" />
                              ) : cat.includes("IOS") || cat.includes("iOS") ? (
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

                        {accountsInCat.length === 0 ? (
                          <div className="text-center py-8 bg-[#2a0404]/40 rounded-2xl border border-dashed border-amber-500/15 text-stone-400 text-xs font-bold">
                            Chưa có tài khoản nào thuộc danh mục này.
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Accounts Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                              {displayedAccounts.map((acc) => (
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
                            {hasMore && (
                              <div className="flex justify-end pt-2">
                                <button
                                  onClick={() => {
                                    setExpandedCategories((prev) => ({
                                      ...prev,
                                      [cat]: !isExpanded,
                                    }));
                                  }}
                                  className="bg-linear-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-red-950 font-black px-6 py-2 rounded-xl text-xs uppercase transition cursor-pointer shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 duration-200"
                                >
                                  {isExpanded ? t("home.showLess") : t("home.showMore")}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>




        </div>
      </main>

      {/* FOOTER SECTION */}
      {activeView !== "admin" && (
        <Footer
          phone={footerPhone}
          zalo={footerZalo}
          facebook={footerFacebook}
          brandName={footerBrandName}
          aboutText={footerAboutText}
          hours={footerHours}
          policy={footerPolicy}
          copyright={footerCopyright}
        />
      )}

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
                    {checkoutReceipt.quantity && checkoutReceipt.quantity > 1 && ` | Số lượng: ${checkoutReceipt.quantity}`}
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
            href={footerZalo}
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
            href={buildMessengerLink(footerFacebook)}
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
      {isConfirmOpen && pendingAccountToBuy && (
        <div
          onClick={() => {
            setIsConfirmOpen(false);
            setPendingAccountToBuy(null);
            setPendingQtyToBuy(1);
          }}
          className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[999] overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#4d0808] border-2 border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-200 text-stone-200"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setIsConfirmOpen(false);
                setPendingAccountToBuy(null);
                setPendingQtyToBuy(1);
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-amber-500/20 pb-3">
              <div className="p-2 bg-amber-500/10 rounded-full border border-amber-500/25">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <h4 className="font-extrabold uppercase text-sm text-stone-100">
                {t("checkout.titleConfirm")}
              </h4>
            </div>

            {/* Body */}
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-stone-300 font-semibold leading-relaxed">
                {t("checkout.msgConfirm", { id: pendingAccountToBuy.id })}
              </p>

              {/* Quantity selector inside popup - show only if quantity > 1 */}
              {pendingAccountToBuy.quantity !== undefined && pendingAccountToBuy.quantity > 1 && (
                <div className="flex items-center justify-between gap-3 bg-red-950/40 p-2.5 rounded-xl border border-amber-500/10">
                  <span className="text-xs text-stone-300 font-bold">
                    {t("productDetail.buyQuantity")}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPendingQtyToBuy(Math.max(1, pendingQtyToBuy - 1))}
                      className="w-8 h-8 rounded-lg bg-stone-900 hover:bg-amber-500 hover:text-stone-950 text-amber-400 font-bold transition flex items-center justify-center border border-amber-500/20 cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={pendingAccountToBuy.quantity}
                      value={pendingQtyToBuy}
                      onChange={(e) => {
                        const val = Math.min(pendingAccountToBuy.quantity || 1, Math.max(1, parseInt(e.target.value) || 1));
                        setPendingQtyToBuy(val);
                      }}
                      className="w-12 text-center bg-red-950 border border-amber-500/25 rounded-lg py-1 text-xs text-stone-100 focus:outline-none font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setPendingQtyToBuy(Math.min(pendingAccountToBuy.quantity || 1, pendingQtyToBuy + 1))}
                      className="w-8 h-8 rounded-lg bg-stone-900 hover:bg-amber-500 hover:text-stone-950 text-amber-400 font-bold transition flex items-center justify-center border border-amber-500/20 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-xs font-bold text-stone-300 pt-2 border-t border-amber-500/5">
                <span>{t("checkout.totalPayment")}</span>
                <span className="text-amber-400 font-black text-sm">
                  {(pendingAccountToBuy.price * pendingQtyToBuy).toLocaleString()} đ
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setIsConfirmOpen(false);
                  setPendingAccountToBuy(null);
                  setPendingQtyToBuy(1);
                }}
                className="flex-1 bg-stone-900 hover:bg-neutral-850 text-stone-300 py-2.5 px-4 rounded-xl border border-amber-500/15 text-xs font-black uppercase transition cursor-pointer"
              >
                {t("checkout.cancel")}
              </button>

              <button
                onClick={executeBuyAccount}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-red-950 py-2.5 px-4 rounded-xl text-xs font-black uppercase transition cursor-pointer shadow-lg shadow-amber-500/20"
              >
                {t("checkout.confirmBuy")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
