import { GameAccount } from "../data";
import {
  ArrowLeft,
  ShieldCheck,
  Gamepad2,
  Layers,
  Cpu,
  Award,
  Zap,
  HelpCircle,
} from "lucide-react";

interface ProductDetailProps {
  account: GameAccount;
  userBalance: number;
  onBack: () => void;
  onBuy: (account: GameAccount) => void;
}

export default function ProductDetailView({
  account,
  userBalance,
  onBack,
  onBuy,
}: ProductDetailProps) {
  const isAvailable = account.status === "Available";

  return (
    <div className="max-w-4xl mx-auto my-0 space-y-6">
      {/* Back control header */}
      <div className="flex items-center justify-between border-b-2 border-amber-500/20 pb-4">
        <h2 className="text-xl sm:text-2xl font-black uppercase text-amber-300 tracking-wider">
          CHI TIẾT TÀI KHOẢN
        </h2>
        <button
          onClick={onBack}
          id="detail-back-btn"
          className="bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 text-amber-400 py-1.5 px-4 rounded-xl border border-amber-500/20 text-xs font-bold uppercase transition"
        >
          ← Về Trang Chủ
        </button>
      </div>

      {/* Main product card wrapper splits: Images on left/top, Specifications on right */}
      <div className="bg-[#4d0808] border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* LEFT SECTION: IMAGE GALLERIES & HIGH-RES ART */}
          <div className="space-y-4">
            <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border-2 border-amber-500/20 bg-stone-900 relative">
              <img
                src={account.imageUrl}
                alt={account.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                <span className="bg-red-800 text-white font-black px-3 py-1 rounded text-xs border border-amber-400">
                  MÃ ACC: {account.id}
                </span>
                <span className="bg-amber-400 text-red-950 font-black px-2 py-0.5 rounded text-[10px] uppercase">
                  SERVER: {account.stats.server?.split(" ")[0]}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-red-950/60 p-4 rounded-2xl border border-amber-500/10">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-800 shrink-0">
                <img
                  src={account.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h5 className="font-extrabold text-amber-200 text-sm">
                  HẢI NA GAMING AUTO
                </h5>
                <p className="text-[10px] text-stone-400">
                  Đại lý bảo hành đổi trả trong 24 Giờ
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: DETAILS INFO & OFFERS */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <span className="text-amber-400 text-xs font-black uppercase tracking-widest bg-amber-500/10 py-1 px-2.5 rounded border border-amber-500/15 inline-block mb-2">
                {account.category}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-stone-50 leading-snug">
                {account.title}
              </h3>

              {/* Server, Power metrics */}
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div className="bg-red-950/80 p-3 rounded-xl border border-amber-500/5">
                  <span className="text-stone-400 block mb-0.5 text-[10px] uppercase font-bold">
                    Máy Chủ / Thiết bị
                  </span>
                  <span className="font-extrabold text-amber-200">
                    {account.stats.server || "Global Android/iOS"}
                  </span>
                </div>
                <div className="bg-red-950/80 p-3 rounded-xl border border-amber-500/5">
                  <span className="text-stone-400 block mb-0.5 text-[10px] uppercase font-bold">
                    Chrono Crystals
                  </span>
                  <span className="font-extrabold text-emerald-400">
                    {account.stats.chronoCrystals?.toLocaleString() || "1,200"}{" "}
                    CC
                  </span>
                </div>
                <div className="bg-red-950/80 p-3 rounded-xl border border-amber-500/5">
                  <span className="text-stone-400 block mb-0.5 text-[10px] uppercase font-bold">
                    Độ nổi tiếng (Sao)
                  </span>
                  <span className="font-extrabold text-rose-300">
                    ★ {account.stats.starsCount || "7"} Sao VIP
                  </span>
                </div>
                <div className="bg-red-950/80 p-3 rounded-xl border border-amber-500/5">
                  <span className="text-stone-400 block mb-0.5 text-[10px] uppercase font-bold">
                    Cấp lực chiến VIP
                  </span>
                  <span className="font-extrabold text-sky-300">
                    PL {account.stats.powerLevel || "100"}
                  </span>
                </div>
              </div>
            </div>

            {/* Buying box container */}
            <div className="bg-[#2c0404]/80 p-4 rounded-2xl border border-amber-500/20 shadow-inner">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <span className="text-[10px] text-stone-500 line-through">
                    Thị trường: {account.originalPrice.toLocaleString()} đ
                  </span>
                  <p className="text-2xl font-black text-amber-400">
                    {account.price.toLocaleString()} đ
                  </p>
                </div>

                <span className="bg-red-600/20 text-red-300 font-black text-xs px-2 py-1 rounded border border-red-500/20">
                  TIẾT KIỆM{" "}
                  {Math.round(
                    ((account.originalPrice - account.price) /
                      account.originalPrice) *
                    100,
                  )}
                  %
                </span>
              </div>

              <div className="space-y-2">
                {isAvailable ? (
                  <button
                    onClick={() => onBuy(account)}
                    className="w-full bg-linear-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-red-950 font-black text-base py-3 px-4 rounded-xl shadow-lg border-y-2 border-amber-300 active:scale-[0.99] transition flex items-center justify-center gap-2"
                  >
                    🚀 MUA TÀI KHOẢN NÀY KHẨN CẤP
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-stone-700 text-stone-400 font-extrabold text-base py-3 px-4 rounded-xl cursor-not-allowed text-center"
                  >
                    TÀI KHOẢN NÀY ĐÃ ĐƯỢC BÁN
                  </button>
                )}

                <div className="flex items-center justify-between text-[11px] text-stone-400 px-1 pt-1">
                  <span>
                    Số dư ví của bạn:{" "}
                    <strong className="text-amber-400">
                      {userBalance.toLocaleString()}đ
                    </strong>
                  </span>
                  {userBalance < account.price ? (
                    <span className="text-rose-400 font-bold">
                      Thiếu: {(account.price - userBalance).toLocaleString()}đ
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold">
                      Số dư ĐỦ để mua!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: SYSTEM SPECIFICATIONS DETAILS & INSTRUCTIONS */}
        <div className="border-t border-amber-500/20 p-6 bg-red-950/40 space-y-6">


          {/* Secure details reminder box */}
          <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-9 space-y-1 text-xs">
              <p className="font-extrabold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> BẢO HÀNH
                GIAO DỊCH AN TOÀN TỪ HAINAGAMING.COM
              </p>
              <p className="text-stone-300 leading-relaxed">
                Tài khoản này được bán động quyền bởi đại lý Hải Na. Sau khi
                nhấp "MUA TÀI KHOẢN", mật mã tài khoản, Code Transfer và hướng
                dẫn đổi mật khẩu Gmail liên kết sẽ tự động gửi cho bạn trong
                lịch sử giao dịch. Đảm bảo an toàn, không ai khác có thể truy
                cập!
              </p>
            </div>
            <div className="sm:col-span-3 text-center">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                Cơ chế giao hàng
              </span>
              <span className="bg-emerald-600/20 text-emerald-400 py-1.5 px-3 rounded-lg border border-emerald-500/20 font-black text-xs inline-block">
                ⚡ GIAO ACC TỰ ĐỘNG
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
