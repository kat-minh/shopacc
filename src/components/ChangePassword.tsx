import { useState, FormEvent } from "react";
import { KeyRound, ShieldAlert } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

interface ChangePasswordProps {
  onBack: () => void;
}

export default function ChangePassword({ onBack }: ChangePasswordProps) {
  const { currentUser } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 4) {
      setError("Mật khẩu mới phải từ 4 ký tự trở lên!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận mới không khớp!");
      return;
    }

    // Attempt to update password in local storage registered users list
    const usersStr = localStorage.getItem("haina_registered_users");
    const users = usersStr ? JSON.parse(usersStr) : [];

    const userIndex = users.findIndex(
      (u: any) =>
        u.username.toLowerCase() === currentUser.username.toLowerCase(),
    );

    if (userIndex !== -1) {
      // Validate current password
      if (users[userIndex].password !== currentPassword) {
        setError("Mật khẩu hiện tại không chính xác!");
        return;
      }
      users[userIndex].password = newPassword;
      localStorage.setItem("haina_registered_users", JSON.stringify(users));
    }

    setSuccess("Đổi mật khẩu thành công!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#4d0808] p-6 sm:p-8 rounded-3xl border-2 border-amber-500/40 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-amber-400/5 to-transparent rounded-bl-full pointer-events-none"></div>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-red-950 rounded-full border border-amber-500/30 mb-3 text-amber-400">
            <KeyRound className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-amber-300 tracking-wider font-sans uppercase">
            Thay Đổi Mật Khẩu
          </h3>
          <p className="text-xs text-rose-300 font-semibold mt-1">
            Đảm bảo an toàn thông tin tài khoản đại lý
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-amber-300 font-bold uppercase mb-2">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              placeholder="Nhập mật khẩu hiện tại..."
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-red-950 border border-amber-500/30 rounded-xl py-2 px-4 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-amber-300 font-bold uppercase mb-2">
              Mật khẩu mới
            </label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-red-950 border border-amber-500/30 rounded-xl py-2 px-4 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-amber-300 font-bold uppercase mb-2">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-red-950 border border-amber-500/30 rounded-xl py-2 px-4 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              required
            />
          </div>

          {error && (
            <div className="bg-rose-950 border border-rose-800 text-rose-200 text-xs px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-950 border border-emerald-800 text-emerald-200 text-xs px-3 py-2 rounded-xl font-semibold">
              🎉 {success}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-linear-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-red-950 py-3 px-4 rounded-xl text-xs font-black shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5 transition uppercase tracking-wider"
          >
            Lưu thay đổi
          </button>
        </form>
      </div>
    </div>
  );
}
