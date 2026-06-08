import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User, KeyRound, LogIn, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { api } from "../api";

interface RegisterFormProps {
  onCancel: () => void;
}

export default function RegisterForm({ onCancel }: RegisterFormProps) {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError(t("registerForm.errUsernameRequired"));
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError(t("registerForm.errPasswordConfirm"));
      return;
    }

    try {
      // Register
      await api.post("/auth/register", {
        username: cleanUsername,
        password: password,
      });

      // Automatically log in
      const loginResult = await api.post<{ token: string; user: { username: string; balance: number; isAdmin: boolean } }>("/auth/login", {
        username: cleanUsername,
        password: password,
      });

      login(loginResult.token, loginResult.user);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại!");
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
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-amber-400/10 to-transparent rounded-bl-full pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-red-950 rounded-full border border-amber-500/30 mb-3 text-amber-400">
            <KeyRound className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-amber-300 tracking-wider font-sans uppercase">
            {t("registerForm.title")}
          </h3>
          <p className="text-xs text-rose-300 font-semibold uppercase mt-1">
            {t("registerForm.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs text-amber-300 font-bold uppercase mb-2">
              {t("registerForm.usernameLabel")}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-rose-300" />
              <input
                type="text"
                placeholder={t("registerForm.usernamePlaceholder")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-red-950 border border-amber-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-amber-300 font-bold uppercase mb-2">
              {t("registerForm.passwordLabel")}
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-rose-300" />
              <input
                type="password"
                placeholder={t("registerForm.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-red-950 border border-amber-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-amber-300 font-bold uppercase mb-2">
              {t("registerForm.confirmPasswordLabel")}
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-rose-300" />
              <input
                type="password"
                placeholder={t("registerForm.confirmPasswordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-red-950 border border-amber-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-bold"
                required
              />
            </div>
          </div>

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
              {t("registerForm.back")}
            </button>

            <button
              type="submit"
              className="bg-linear-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-red-950 py-3 px-4 rounded-xl text-xs font-black shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5 transition"
            >
              {t("registerForm.submit")}
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              {t("registerForm.hasAccount")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
