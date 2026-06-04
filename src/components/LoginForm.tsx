import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  User,
  Key,
  KeyRound,
  Info,
  LogIn,
  ArrowLeft,
} from "lucide-react";

interface LoginFormProps {
  onLoginSuccess: (
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
  const [role, setRole] = useState<"user" | "admin">("user");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [balance, setBalance] = useState<number>(500000); // Default dynamic balance
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (role === "admin") {
      if (password === "admin123") {
        const adminUser = {
          username: "HAINA_ADMIN_VIP",
          balance: 99999999,
        };
        onLoginSuccess(adminUser, true);
      } else {
        setError("Mật khẩu Admin không chính xác! (Gợi ý: admin123)");
      }
    } else {
      const cleanUsername = username.trim() || "Hoi_Vien_Haina";

      // Optional check if user exists in registered users
      const existingUsersStr = localStorage.getItem("haina_registered_users");
      const existingUsers = existingUsersStr
        ? JSON.parse(existingUsersStr)
        : [];
      const foundUser = existingUsers.find(
        (u: any) => u.username.toLowerCase() === cleanUsername.toLowerCase(),
      );

      const normalUser = {
        username: cleanUsername,
        balance: foundUser ? foundUser.balance : balance,
      };
      onLoginSuccess(normalUser, false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#1c0202] text-stone-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full p-8 bg-[#4d0808] rounded-3xl border-2 border-amber-500/40 shadow-2xl relative overflow-hidden">
        {/* Decorative floral elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-amber-400/10 to-transparent rounded-bl-full pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-red-950 rounded-full border border-amber-500/30 mb-3 text-amber-400">
            <KeyRound className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-amber-300 tracking-wider font-sans uppercase">
            ĐĂNG NHẬP HỆ THỐNG
          </h3>
          <p className="text-xs text-rose-300 font-semibold uppercase mt-1">
            Hải Na Gaming - Giao dịch tự động siêu tốc
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
            KHÁCH HÀNG
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
            QUẢN TRỊ VIÊN
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {role === "user" ? (
            <>
              <div>
                <label className="block text-xs text-amber-300 font-bold uppercase mb-2">
                  Tài khoản ID khách hàng
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-rose-300" />
                  <input
                    type="text"
                    placeholder="Nhập tên đăng nhập của bạn..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-red-950 border border-amber-500/30 rounded-xl py-2 pl-10 pr-4 text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-bold"
                    required
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Nhập tài khoản đã đăng ký hoặc tên bất kỳ để thử nghiệm.
                </p>
              </div>

              <div>
                <label className="block text-xs text-amber-300 font-bold uppercase mb-2">
                  Số dư ban đầu (Chỉ cho tài khoản mới)
                </label>
                <select
                  value={balance}
                  onChange={(e) => setBalance(Number(e.target.value))}
                  className="w-full bg-red-950 border border-amber-500/30 rounded-xl py-2 px-4 text-sm text-amber-300 font-black focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                >
                  <option value={100000}>100,000 đ (Khởi động)</option>
                  <option value={500000}>
                    500,000 đ (Mua acc Rerol + Quay hũ)
                  </option>
                  <option value={1500000}>
                    1,500,000 đ (Mua acc VIP sành điệu)
                  </option>
                  <option value={5000000}>
                    5,000,000 đ (Phá đảo vòng quay ngọc rồng)
                  </option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs text-amber-300 font-bold uppercase mb-2">
                  Tài khoản Quản trị
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-2.5 w-4 h-4 text-red-400" />
                  <input
                    type="text"
                    value="HAINA_ADMIN_VIP"
                    disabled
                    className="w-full bg-red-950/40 border border-red-900/40 rounded-xl py-2 pl-10 pr-4 text-sm text-stone-400 font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-amber-300 font-bold uppercase mb-2">
                  Mật khẩu Quản trị viên
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-red-400" />
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu Admin ban đầu..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-red-950 border border-red-500/30 rounded-xl py-2 pl-10 pr-4 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono tracking-widest"
                    required
                  />
                </div>
                <p className="text-[10px] text-amber-400 font-semibold mt-1.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Gợi ý mật khẩu:{" "}
                  <strong className="underline text-stone-200">admin123</strong>
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
              QUAY LẠI
            </button>

            <button
              type="submit"
              className="bg-linear-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-red-950 py-3 px-4 rounded-xl text-xs font-black shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5 transition"
            >
              <LogIn className="w-4 h-4" />
              ĐĂNG NHẬP
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              Chưa có tài khoản? Đăng ký tại đây
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
