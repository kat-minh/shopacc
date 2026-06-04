import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { User, KeyRound, LogIn, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

interface RegisterFormProps {
  onCancel: () => void;
}

export default function RegisterForm({ onCancel }: RegisterFormProps) {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError("Vui lòng nhập tên đăng nhập!");
      return;
    }

    if (password.length < 4) {
      setError("Mật khẩu phải từ 4 ký tự trở lên!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    // Retrieve existing accounts
    const existingUsersStr = localStorage.getItem("haina_registered_users");
    const existingUsers = existingUsersStr ? JSON.parse(existingUsersStr) : [];

    // Check if user already exists
    if (
      existingUsers.some(
        (u: any) => u.username.toLowerCase() === cleanUsername.toLowerCase(),
      )
    ) {
      setError("Tài khoản này đã tồn tại trên hệ thống!");
      return;
    }

    // Save user
    const newUser = {
      username: cleanUsername,
      password: password,
      balance: 500000, // default mock balance
    };
    existingUsers.push(newUser);
    localStorage.setItem(
      "haina_registered_users",
      JSON.stringify(existingUsers),
    );

    // Automatically log in
    login({ username: cleanUsername, balance: 500000 }, false);
  };

  return (
    <div className="min-h-screen w-screen bg-[#1c0202] text-stone-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full p-8 bg-[#4d0808] rounded-3xl border-2 border-amber-500/40 shadow-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-amber-400/10 to-transparent rounded-bl-full pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-red-950 rounded-full border border-amber-500/30 mb-3 text-amber-400">
            <KeyRound className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-amber-300 tracking-wider font-sans uppercase">
            ĐĂNG KÝ THÀNH VIÊN
          </h3>
          <p className="text-xs text-rose-300 font-semibold uppercase mt-1">
            Tạo tài khoản Hải Na Gaming
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs text-amber-300 font-bold uppercase mb-2">
              Tài khoản / Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-rose-300" />
              <input
                type="text"
                placeholder="Nhập tên tài khoản..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-red-950 border border-amber-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-amber-300 font-bold uppercase mb-2">
              Mật khẩu / Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-rose-300" />
              <input
                type="password"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-red-950 border border-amber-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-amber-300 font-bold uppercase mb-2">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-rose-300" />
              <input
                type="password"
                placeholder="Nhập lại mật khẩu..."
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
              QUAY LẠI
            </button>

            <button
              type="submit"
              className="bg-linear-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-red-950 py-3 px-4 rounded-xl text-xs font-black shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5 transition"
            >
              ĐĂNG KÝ
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              Đã có tài khoản? Đăng nhập ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
