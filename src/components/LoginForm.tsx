import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Shield,
  User,
  Key,
  KeyRound,
  Info,
  LogIn,
  ArrowLeft,
} from "lucide-react";
import { api } from "../api";

interface LoginFormProps {
  onLoginSuccess: (
    token: string,
    user: { username: string; balance: number },
    isAdmin: boolean,
  ) => void;
  onCancel: () => void;
}

export default function LoginForm({
  onLoginSuccess,
  onCancel,
}: LoginFormProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [role, setRole] = useState<"user" | "admin">("user");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [balance, setBalance] = useState<number>(500000); // Default dynamic balance
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await api.post<{ token: string; user: { username: string; balance: number; isAdmin: boolean } }>("/auth/login", {
        username: role === "admin" ? "admin@example.com" : username.trim(),
        password: password
      });
      onLoginSuccess(result.token, result.user, result.user.isAdmin);
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  const isLightTheme = typeof document !== "undefined" && document.documentElement.dataset.theme === "light";

  return (
    <div className="min-h-screen w-screen text-stone-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Blurred Goku Wallpaper */}
      <div
        className="absolute inset-0 z-[-10] pointer-events-none"
        style={{
          backgroundImage: "url('https://wallpapers-clan.com/wp-content/uploads/2025/05/shenron-goku-dragonball-epic-scene-pc-desktop-laptop-wallpaper-preview.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: isLightTheme ? "brightness(0.95)" : "brightness(0.48)",
          transform: "scale(1.02)",
          opacity: isLightTheme ? 0.55 : 0.9,
        }}
      />
      <div 
        className="absolute inset-0 z-[-10] pointer-events-none" 
        style={{
          backgroundColor: isLightTheme ? "transparent" : "rgba(28, 2, 2, 0.2)"
        }}
      />
      <div className="max-w-md w-full p-8 bg-[#4d0808] rounded-3xl border-2 border-amber-500/40 shadow-2xl relative overflow-hidden z-10">
        {/* Decorative floral elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-amber-400/10 to-transparent rounded-bl-full pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-red-950 rounded-full border border-amber-500/30 mb-3 text-amber-400">
            <KeyRound className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-amber-300 tracking-wider font-sans uppercase">
            {t("loginForm.title")}
          </h3>
          <p className="text-xs text-rose-300 font-semibold uppercase mt-1">
            {t("loginForm.subtitle")}
          </p>
        </div>

        {/* Role Picker (Tabs) */}
        <div className="grid grid-cols-2 mb-6 bg-red-950 p-1.5 rounded-2xl border border-amber-500/20">
          <button
            type="button"
            onClick={() => {
              setRole("user");
              setError("");
            }}
            className={`py-2 px-3 rounded-xl font-bold text-xs md:text-sm transition flex items-center justify-center gap-1.5 ${
              role === "user"
                ? "bg-amber-500 text-red-950 font-black shadow-md"
                : "text-stone-300 hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            {t("loginForm.tabCustomer")}
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("admin");
              setError("");
            }}
            className={`py-2 px-3 rounded-xl font-bold text-xs md:text-sm transition flex items-center justify-center gap-1.5 ${
              role === "admin"
                ? "bg-red-600 text-white font-black shadow-md"
                : "text-stone-300 hover:text-stone-100"
            }`}
          >
            <Shield className="w-4 h-4" />
            {t("loginForm.tabAdmin")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {role === "user" ? (
            <>
              <div>
                <label className="block text-xs text-amber-300 font-bold uppercase mb-2">
                  {t("loginForm.customerIdLabel")}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-rose-300" />
                  <input
                    type="text"
                    placeholder={t("loginForm.customerIdPlaceholder")}
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError("");
                    }}
                    className="w-full bg-red-950 border border-amber-500/30 rounded-xl py-2 pl-10 pr-4 text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-bold disabled:opacity-50"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-amber-300 font-bold uppercase mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-rose-300" />
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu..."
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    className="w-full bg-red-950 border border-amber-500/30 rounded-xl py-2 pl-10 pr-4 text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-bold disabled:opacity-50"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs text-amber-300 font-bold uppercase mb-2">
                  {t("loginForm.adminAccount")}
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-2.5 w-4 h-4 text-red-400" />
                  <input
                    type="text"
                    value="admin@example.com"
                    disabled
                    className="w-full bg-red-950/40 border border-red-900/40 rounded-xl py-2 pl-10 pr-4 text-sm text-stone-400 font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-amber-300 font-bold uppercase mb-2">
                  {t("loginForm.adminPassword")}
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-red-400" />
                  <input
                    type="password"
                    placeholder={t("loginForm.adminPasswordPlaceholder")}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    className="w-full bg-red-950 border border-red-500/30 rounded-xl py-2 pl-10 pr-4 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono tracking-widest disabled:opacity-50"
                    required
                    disabled={isLoading}
                  />
                </div>
                <p className="text-[10px] text-amber-400 font-semibold mt-1.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Mật khẩu mặc định là admin123 hoặc tương tự.
                </p>
              </div>
            </>
          )}

          {error && (
            <div className="bg-rose-950 border border-rose-800 text-rose-200 text-xs px-3 py-2 rounded-xl font-semibold">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="bg-red-950 hover:bg-red-900 text-amber-200 py-3 px-4 rounded-xl text-xs font-bold border border-amber-500/15 transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("loginForm.back")}
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={`bg-linear-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-red-950 py-3 px-4 rounded-xl text-xs font-black shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5 transition ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-red-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isLoading ? "Đang xử lý..." : t("loginForm.submit")}
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              {t("loginForm.noAccount")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
