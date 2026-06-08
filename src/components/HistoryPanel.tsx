import { useState } from "react";
import { Transaction, GameAccount } from "../data";
import {
  Copy,
  Check,
  Filter,
  Layers,
  HelpCircle,
  History,
  Inbox,
  ShieldCheck,
} from "lucide-react";

interface HistoryPanelProps {
  transactions: Transaction[];
  boughtAccounts: GameAccount[];
  onBack: () => void;
}

export default function HistoryPanel({
  transactions,
  boughtAccounts,
  onBack,
}: HistoryPanelProps) {
  const [filterType, setFilterType] = useState<
    "all" | "recharge" | "purchase" | "wheel"
  >("all");
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === "all") return true;
    if (filterType === "recharge") return t.type === "card" || t.type === "atm" || t.type === "recharge_card" || t.type === "recharge_atm";
    if (filterType === "purchase") return t.type === "buy_account";
    if (filterType === "wheel") return t.type === "wheel_spin" || t.type === "wheel";
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto my-6 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          id="history-back-btn"
          className="bg-red-950 hover:bg-red-900 text-amber-300 font-black text-xs sm:text-sm py-2.5 px-4 rounded-xl border border-amber-500/10 transition flex items-center gap-1.5"
        >
          ← QUAY VỀ TRANG CHỦ HAINA
        </button>
      </div>

      {/* SECTION 1: KHO ĐỒ TÀI KHOẢN ĐÃ MUA */}
      <div className="bg-[#4d0808] p-4 sm:p-6 rounded-3xl border-2 border-amber-500/40 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-amber-500/15 pb-3">
          <Inbox className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg md:text-xl font-black text-amber-300 uppercase tracking-wider">
            HÒM ĐỒ TÀI KHOẢN GAME ĐÃ MUA
          </h3>
        </div>

        {boughtAccounts.length === 0 ? (
          <div className="text-center py-10 bg-red-950/30 rounded-2xl border border-dashed border-amber-500/10">
            <span className="text-3xl">📦</span>
            <p className="text-stone-300 font-bold text-sm mt-2">
              Bạn chưa sở hữu tài khoản game Dragon Ball Legends nào.
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Các giao dịch mua acc thành công sẽ lưu trữ thông tin đăng nhập
              trực tiếp tại đây.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boughtAccounts.map((acc, index) => (
              <div
                key={index}
                className="bg-red-950/90 p-4 rounded-2xl border border-amber-500/30 space-y-3 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-bl from-emerald-500/15 to-transparent rounded-bl-full pointer-events-none"></div>

                <div className="flex gap-3 pb-2.5 border-b border-amber-500/15">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-900 shrink-0">
                    <img
                      src={acc.avatarUrl}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-[#ffffff] text-xs uppercase line-clamp-1">
                      {acc.title}
                    </h5>
                    <p className="text-[10px] text-amber-400 font-black flex items-center gap-2">
                      <span>MÃ SỐ ACC: {acc.id}</span>
                      {acc.quantity && acc.quantity > 1 && (
                        <span className="bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded text-[9px] font-black">
                          x{acc.quantity}
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-stone-400">
                      Game: {acc.game}
                    </p>
                  </div>
                </div>

                {/* Secret credentials */}
                <div className="space-y-2 pt-1 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">
                      Tài khoản (ID/Gmail)
                    </span>
                    <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-amber-500/10">
                      <code className="text-amber-300 font-mono font-bold select-all">
                        {acc.credentials.username}
                      </code>
                      <button
                        onClick={() =>
                          handleCopy(acc.credentials.username, `user_${index}`)
                        }
                        className="text-amber-400 hover:text-white"
                      >
                        {copiedLabel === `user_${index}` ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">
                      Mật khẩu
                    </span>
                    <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-amber-500/10">
                      <code className="text-amber-300 font-mono font-bold select-all">
                        {acc.credentials.pass}
                      </code>
                      <button
                        onClick={() =>
                          handleCopy(acc.credentials.pass, `pass_${index}`)
                        }
                        className="text-amber-400 hover:text-white"
                      >
                        {copiedLabel === `pass_${index}` ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {acc.credentials.transferCode && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">
                        Mã Transfer Code
                      </span>
                      <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-amber-500/10">
                        <code className="text-emerald-300 font-mono font-bold select-all">
                          {acc.credentials.transferCode}
                        </code>
                        <button
                          onClick={() =>
                            handleCopy(
                              acc.credentials.transferCode || "",
                              `code_${index}`,
                            )
                          }
                          className="text-amber-400 hover:text-white"
                        >
                          {copiedLabel === `code_${index}` ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-[#2a0404]/60 p-2.5 rounded-xl border border-amber-500/10 text-[10px] text-stone-400 leading-normal">
                  💡 <strong className="text-amber-300">Hướng dẫn:</strong> Tải
                  game Dragon Ball Legends, vào phần màn hình chờ{" "}
                  <strong className="text-stone-100">"Data Transfer"</strong>,
                  dán mã Transfer Code để đồng bộ hóa hoặc đăng nhập qua TK/Mật
                  khẩu Gmail đính kèm. Khuyến cáo đổi mật khẩu email ngay sau
                  khi nhận.
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: LỊCH SỬ TẤT CẢ CÁC GIAO DỊCH */}
      <div className="bg-[#4d0808] p-4 sm:p-6 rounded-3xl border-2 border-amber-500/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-amber-500/15 pb-3 gap-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg md:text-xl font-black text-amber-300 uppercase tracking-wider">
              SAO KÊ CHI TIẾT GIAO DỊCH GẦN ĐÂY
            </h3>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs bg-red-950 p-1 rounded-xl border border-amber-500/10 self-start">
            <button
              onClick={() => setFilterType("all")}
              className={`py-1 px-2.5 rounded-lg font-bold transition ${
                filterType === "all"
                  ? "bg-amber-500 text-red-950 font-black"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType("recharge")}
              className={`py-1 px-2.5 rounded-lg font-bold transition ${
                filterType === "recharge"
                  ? "bg-amber-500 text-red-950 font-black"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              Nạp tiền
            </button>
            <button
              onClick={() => setFilterType("purchase")}
              className={`py-1 px-2.5 rounded-lg font-bold transition ${
                filterType === "purchase"
                  ? "bg-amber-500 text-red-950 font-black"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              Mua Nick
            </button>
            <button
              onClick={() => setFilterType("wheel")}
              className={`py-1 px-2.5 rounded-lg font-bold transition ${
                filterType === "wheel"
                  ? "bg-amber-500 text-red-950 font-black"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              Vòng Quay
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 bg-red-950/30 rounded-2xl border border-dashed border-amber-500/10 text-xs sm:text-sm text-stone-500 font-bold">
            Không tìm thấy sao kê giao dịch nào khớp với danh mục bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-xs text-left text-stone-200">
              <thead className="text-[10px] text-amber-400 uppercase bg-[#2c0404] border-b border-amber-500/20">
                <tr>
                  <th scope="col" className="px-3 py-3 font-black text-center">
                    STT
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Loại
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Mô tả giao dịch
                  </th>
                  <th scope="col" className="px-3 py-3 text-right">
                    Chi phí / Quỹ
                  </th>
                  <th scope="col" className="px-3 py-3 text-center">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-3 py-3 text-right">
                    Mốc thời gian (UTC)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/5 bg-[#2c0404]/30">
                {filteredTransactions.map((tx, idx) => (
                  <tr key={tx.id} className="hover:bg-red-950/30 transition">
                    <td className="px-3 py-3.5 text-center font-mono text-stone-400 font-bold">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-3.5">
                      {tx.type === "card" || tx.type === "atm" || tx.type === "recharge_card" || tx.type === "recharge_atm" ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-0.5 px-2 rounded font-extrabold block text-center max-w-20">
                          NẠP TIỀN
                        </span>
                      ) : tx.type === "buy_account" ? (
                        <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 py-0.5 px-2 rounded font-extrabold block text-center max-w-20">
                          MUA NICK
                        </span>
                      ) : (
                        <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 py-0.5 px-2 rounded font-extrabold block text-center max-w-20">
                          VÒNG QUAY
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 font-bold text-stone-200">
                      {tx.description}
                    </td>
                    <td className="px-3 py-3.5 text-right font-black font-sans">
                      {tx.type === "card" || tx.type === "atm" || tx.type === "recharge_card" || tx.type === "recharge_atm" ? (
                        <span className="text-emerald-400">
                          +{tx.amount.toLocaleString()}đ
                        </span>
                      ) : (
                        <span className="text-rose-400">
                          -{tx.amount.toLocaleString()}đ
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-center font-black">
                      <span className="text-emerald-400">Thành công</span>
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono text-stone-400">
                      {tx.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
