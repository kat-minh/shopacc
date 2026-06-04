import { useState } from "react";
import {
  DollarSign,
  CreditCard,
  History,
  User,
  LogIn,
  LogOut,
  ShieldAlert,
  Coins,
  Menu,
  X,
  ChevronDown,
  KeyRound,
  SunMedium,
  MoonStar,
  Inbox,
} from "lucide-react";

interface HeaderProps {
  currentUser: { username: string; balance: number };
  onNavigate: (
    view:
      | "home"
      | "login"
      | "admin"
      | "history"
      | "profile"
      | "change-password"
      | "user-history"
      | "recharge",
  ) => void;
  activeView:
  | "home"
  | "login"
  | "admin"
  | "history"
  | "product-detail"
  | "profile"
  | "change-password"
  | "user-history"
  | "recharge";
  onLogout: () => void;
  onQuickAddMoney: (amount: number) => void;
  isAdmin: boolean;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function Header({
  currentUser,
  onNavigate,
  activeView,
  onLogout,
  onQuickAddMoney,
  isAdmin,
  theme,
  onToggleTheme,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isGuest = currentUser.username === "Khách";

  return (
    <header className="bg-stone-900/95 backdrop-blur-md border-b-2 border-amber-500/40 shadow-[0_4px_30px_rgba(0,0,0,0.5)] sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo with Premium Glow */}
        <div
          className="flex items-center gap-1.5 sm:gap-3 cursor-pointer group shrink-0"
          onClick={() => {
            onNavigate("home");
            setMobileMenuOpen(false);
          }}
          id="brand-logo"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-linear-to-tr from-amber-500 to-yellow-300 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative bg-linear-to-tr from-amber-500 to-yellow-400 text-stone-950 rounded-full font-black border-2 border-amber-300/60 flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10">
              <span className="text-xs sm:text-base tracking-tighter">HG</span>
            </div>
          </div>
          <div>
            <h1 className="text-[13px] min-[360px]:text-base sm:text-xl lg:text-2xl font-black bg-linear-to-r from-amber-400 via-yellow-200 to-amber-400 bg-clip-text text-transparent tracking-widest font-sans uppercase drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
              HAINAGAMING.COM
            </h1>
            <p className="text-[7px] sm:text-[9px] text-stone-400 font-semibold tracking-wider uppercase">
              SIÊU THỊ ACC GAME CHUYÊN NGHIỆP
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5">
          <button
            onClick={() => {
              onNavigate("recharge");
            }}
            id="nav-recharge-card"
            className="flex items-center gap-1.5 bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500 text-stone-950 hover:brightness-110 active:scale-95 transform transition duration-305 font-black py-2 px-4.5 rounded-xl border border-amber-300/40 shadow-[0_0_15px_rgba(245,158,11,0.4)] text-xs uppercase tracking-wider cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5" />
            Nạp Thẻ Cào
          </button>

          <button
            onClick={() => {
              onNavigate("recharge");
            }}
            id="nav-recharge-atm"
            className="flex items-center gap-1.5 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 text-stone-950 hover:brightness-110 active:scale-95 transform transition duration-305 font-black py-2 px-4.5 rounded-xl border border-emerald-300/40 shadow-[0_0_15px_rgba(16,185,129,0.4)] text-xs uppercase tracking-wider cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            ATM / MoMo
          </button>

          {isAdmin && !isGuest && (
            <button
              onClick={() => onNavigate("admin")}
              id="nav-admin"
              className={`flex items-center gap-1.5 font-extrabold py-2 px-4 rounded-xl text-xs uppercase tracking-wider transition duration-300 border ${activeView === "admin"
                ? "bg-red-600 text-white border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                : "bg-stone-900/50 text-red-400 border-red-950 hover:bg-red-950/30"
                }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Quản Trị
            </button>
          )}
        </nav>

        {/* User Account area (Desktop) / Login Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            className="hidden sm:flex items-center gap-2 rounded-xl border border-amber-500/15 bg-stone-900/70 px-3 py-2 text-xs font-bold uppercase tracking-wider text-stone-200 transition hover:border-amber-400/50 hover:text-amber-300"
            aria-label="Chuyển giao diện sáng tối"
            title={theme === "dark" ? "Bật light mode" : "Bật dark mode"}
          >
            {theme === "dark" ? (
              <SunMedium className="w-4 h-4" />
            ) : (
              <MoonStar className="w-4 h-4" />
            )}
            {theme === "dark" ? "Light" : "Dark"}
          </button>

          {isGuest ? (
            <button
              onClick={() => onNavigate("login")}
              id="header-login-btn"
              className="bg-linear-to-r from-amber-500 to-yellow-400 text-stone-950 py-2 px-5 rounded-xl text-xs font-black transition shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:brightness-110 active:scale-95 flex items-center gap-1.5 uppercase tracking-wider"
            >
              <LogIn className="w-4 h-4" />
              Đăng Nhập
            </button>
          ) : (
            /* User Panel with Dropdown */
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="flex items-center gap-1 sm:gap-2 bg-stone-900/90 border border-stone-800 px-1.5 py-1 sm:px-3 sm:py-1.5 rounded-2xl shadow-inner cursor-pointer hover:border-amber-500/40 transition duration-300">
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-stone-200 font-bold">
                      {currentUser.username}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                  </div>
                  <span className="text-[9px] text-stone-500 block -mt-0.5">
                    {isAdmin ? "Quản trị viên" : "Hội viên"}
                  </span>
                </div>

                <div className="sm:border-l sm:border-stone-800 sm:pl-2 text-right">
                  <span className="text-[8px] text-amber-500/70 hidden sm:block uppercase font-bold tracking-wider">
                    Số dư
                  </span>
                  <span className="text-[10px] sm:text-xs font-black text-amber-400 font-mono flex items-center gap-0.5">
                    <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-500 animate-spin-slow shrink-0" />
                    {currentUser.balance.toLocaleString("vi-VN")}đ
                  </span>
                </div>


              </div>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full pt-1.5 w-52 z-50">
                  <div className="haina-dropdown-menu bg-stone-950 border border-amber-500/25 rounded-2xl shadow-2xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    {isAdmin ? (
                      <button
                        onClick={() => {
                          onNavigate("admin");
                          setDropdownOpen(false);
                        }}
                        className="haina-dropdown-item w-full text-left px-4 py-2 text-xs font-bold text-stone-300 hover:bg-stone-900 hover:text-amber-400 flex items-center gap-2 transition"
                      >
                        <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                        Trang quản trị Admin
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            onNavigate("profile");
                            setDropdownOpen(false);
                          }}
                          className="haina-dropdown-item w-full text-left px-4 py-2 text-xs font-bold text-stone-300 hover:bg-stone-900 hover:text-amber-400 flex items-center gap-2 transition"
                        >
                          <User className="w-4 h-4 text-amber-500" />
                          Thông tin cá nhân
                        </button>
                        <button
                          onClick={() => {
                            onNavigate("change-password");
                            setDropdownOpen(false);
                          }}
                          className="haina-dropdown-item w-full text-left px-4 py-2 text-xs font-bold text-stone-300 hover:bg-stone-900 hover:text-amber-400 flex items-center gap-2 transition"
                        >
                          <KeyRound className="w-4 h-4 text-amber-500" />
                          Đổi mật khẩu
                        </button>
                        <button
                          onClick={() => {
                            onNavigate("user-history");
                            setDropdownOpen(false);
                          }}
                          className="haina-dropdown-item w-full text-left px-4 py-2 text-xs font-bold text-stone-300 hover:bg-stone-900 hover:text-amber-400 flex items-center gap-2 transition"
                        >
                          <Inbox className="w-4 h-4 text-amber-500" />
                          Tài khoản đã mua
                        </button>
                        <button
                          onClick={() => {
                            onNavigate("history");
                            setDropdownOpen(false);
                          }}
                          className="haina-dropdown-item w-full text-left px-4 py-2 text-xs font-bold text-stone-300 hover:bg-stone-900 hover:text-amber-400 flex items-center gap-2 transition"
                        >
                          <History className="w-4 h-4 text-amber-500" />
                          Lịch sử giao dịch
                        </button>
                      </>
                    )}
                    <div className="border-t border-stone-900 my-1"></div>
                    <button
                      onClick={() => {
                        onLogout();
                        setDropdownOpen(false);
                      }}
                      className="haina-dropdown-item haina-dropdown-item-danger w-full text-left px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/20 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-stone-300 hover:text-amber-400 p-1.5 bg-stone-900 border border-stone-800 rounded-xl transition"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-stone-950/95 border-t border-amber-500/10 py-4 px-4 space-y-2 animate-in slide-in-from-top duration-300">
          <button
            onClick={() => {
              onNavigate("recharge");
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500 text-stone-950 font-black text-xs uppercase tracking-wider transition"
          >
            <DollarSign className="w-4 h-4" />
            Nạp Thẻ Cào
          </button>

          <button
            onClick={() => {
              onNavigate("recharge");
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 text-stone-950 font-black text-xs uppercase tracking-wider transition"
          >
            <CreditCard className="w-4 h-4" />
            ATM / MoMo
          </button>

          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-stone-900 text-stone-200 font-black text-xs uppercase tracking-wider transition border border-stone-800"
          >
            {theme === "dark" ? (
              <SunMedium className="w-4 h-4" />
            ) : (
              <MoonStar className="w-4 h-4" />
            )}
            {theme === "dark" ? "Bật giao diện sáng" : "Bật giao diện tối"}
          </button>

          {!isGuest && (
            <>
              <div className="border-t border-stone-900 my-2"></div>
              <button
                onClick={() => {
                  onNavigate("profile");
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left flex items-center gap-3 py-2.5 px-4 rounded-xl text-stone-300 hover:bg-stone-900 hover:text-amber-400 font-bold text-xs uppercase transition"
              >
                <User className="w-4 h-4 text-amber-500" />
                Thông tin cá nhân
              </button>
              <button
                onClick={() => {
                  onNavigate("change-password");
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left flex items-center gap-3 py-2.5 px-4 rounded-xl text-stone-300 hover:bg-stone-900 hover:text-amber-400 font-bold text-xs uppercase transition"
              >
                <KeyRound className="w-4 h-4 text-amber-500" />
                Đổi mật khẩu
              </button>
              <button
                onClick={() => {
                  onNavigate("user-history");
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left flex items-center gap-3 py-2.5 px-4 rounded-xl text-stone-300 hover:bg-stone-900 hover:text-amber-400 font-bold text-xs uppercase transition"
              >
                <History className="w-4 h-4 text-amber-400" />
                Lịch sử hoạt động
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left flex items-center gap-3 py-2.5 px-4 rounded-xl text-rose-400 hover:bg-rose-950/20 font-bold text-xs uppercase transition"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </>
          )}

          {isAdmin && !isGuest && (
            <button
              onClick={() => {
                onNavigate("admin");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left flex items-center gap-3 py-2.5 px-4 rounded-xl text-red-400 hover:bg-red-950/20 font-bold text-xs uppercase transition"
            >
              <ShieldAlert className="w-4 h-4" />
              Quản Trị Hệ Thống
            </button>
          )}
        </div>
      )}
    </header>
  );
}
