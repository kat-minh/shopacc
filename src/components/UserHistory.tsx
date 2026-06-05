import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Transaction, GameAccount } from "../data";
import { Copy, Check, History, Inbox } from "lucide-react";
import EmptyState from "./EmptyState";

interface UserHistoryProps {
  transactions: Transaction[];
  boughtAccounts: GameAccount[];
  onBack: () => void;
  hideHeader?: boolean;
  viewMode?: "bought" | "transactions" | "all";
}

export default function UserHistory({
  transactions,
  boughtAccounts,
  onBack,
  hideHeader = false,
  viewMode = "all",
}: UserHistoryProps) {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState<
    "all" | "recharge" | "purchase" | "wheel"
  >("all");
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  // Pagination states
  const [boughtPage, setBoughtPage] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const BOUGHT_ITEMS_PER_PAGE = 5;
  const TX_ITEMS_PER_PAGE = 5;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const handleFilterChange = (type: "all" | "recharge" | "purchase" | "wheel") => {
    setFilterType(type);
    setTxPage(1);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === "all") return true;
    if (filterType === "recharge") return t.type === "card" || t.type === "atm";
    if (filterType === "purchase") return t.type === "buy_account";
    if (filterType === "wheel") return t.type === "wheel_spin";
    return true;
  });

  // Paginated calculations
  const totalBoughtPages = Math.max(1, Math.ceil(boughtAccounts.length / BOUGHT_ITEMS_PER_PAGE));
  const paginatedBoughtAccounts = boughtAccounts.slice(
    (boughtPage - 1) * BOUGHT_ITEMS_PER_PAGE,
    boughtPage * BOUGHT_ITEMS_PER_PAGE
  );

  const totalTxPages = Math.max(1, Math.ceil(filteredTransactions.length / TX_ITEMS_PER_PAGE));
  const paginatedTransactions = filteredTransactions.slice(
    (txPage - 1) * TX_ITEMS_PER_PAGE,
    txPage * TX_ITEMS_PER_PAGE
  );

  return (
    <div className={`${hideHeader ? "" : "max-w-5xl mx-auto my-6"} space-y-8`}>
      {/* Back control header */}
      {!hideHeader && (
        <div className="flex items-center justify-between border-b-2 border-amber-500/20 pb-4">
          <h2 className="text-xl sm:text-2xl font-black uppercase text-amber-300 tracking-wider">
            LỊCH SỬ GIAO DỊCH
          </h2>
          <button
            onClick={onBack}
            className="bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 text-amber-400 py-1.5 px-4 rounded-xl border border-amber-500/20 text-xs font-bold uppercase transition"
          >
            ← Về Trang Chủ
          </button>
        </div>
      )}

      {/* SECTION 1: KHO ĐỒ TÀI KHOẢN ĐÃ MUA */}
      {(viewMode === "all" || viewMode === "bought") && (
        <div className="bg-[#4d0808] p-4 sm:p-6 rounded-3xl border-2 border-amber-500/40 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-amber-500/15 pb-3">
            <Inbox className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg md:text-xl font-black text-amber-300 uppercase tracking-wider">
              Tài khoản game đã mua
            </h3>
          </div>

          {boughtAccounts.length === 0 ? (
            <EmptyState
              title={t("emptyStates.noBoughtTitle")}
              description={t("emptyStates.noBoughtDesc")}
              iconType="inbox"
            />
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full text-xs text-left text-stone-200">
                  <thead className="text-[10px] text-amber-400 uppercase bg-[#2c0404] border-b border-amber-500/20">
                    <tr>
                      <th scope="col" className="px-3 py-3 font-black text-center w-12">
                        STT
                      </th>
                      <th scope="col" className="px-3 py-3 w-32">
                        Mã Nick
                      </th>
                      <th scope="col" className="px-3 py-3 min-w-[150px]">
                        Tên sản phẩm
                      </th>
                      <th scope="col" className="px-3 py-3 min-w-[160px]">
                        Tài khoản đăng nhập
                      </th>
                      <th scope="col" className="px-3 py-3 min-w-[160px]">
                        Mật khẩu
                      </th>
                      <th scope="col" className="px-3 py-3 min-w-[160px]">
                        Transfer Code
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-500/5 bg-[#2c0404]/30">
                    {paginatedBoughtAccounts.map((acc, index) => {
                      const globalIdx = (boughtPage - 1) * BOUGHT_ITEMS_PER_PAGE + index;
                      return (
                        <tr key={acc.id} className="hover:bg-red-950/30 transition">
                          <td className="px-3 py-3.5 text-center font-mono text-stone-400 font-bold">
                            {globalIdx + 1}
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="flex items-center gap-2">
                              <img
                                src={acc.avatarUrl}
                                className="w-8 h-8 rounded object-cover border border-amber-500/20 shrink-0"
                              />
                              <span className="font-black text-amber-400 font-mono text-xs">
                                {acc.id}
                                {acc.quantity && acc.quantity > 1 && ` (x${acc.quantity})`}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3.5 font-bold text-stone-200 truncate max-w-[200px]">
                            {acc.title}
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded border border-amber-500/10 justify-between">
                              <code className="text-amber-300 font-mono font-bold truncate select-all">{acc.credentials.username}</code>
                              <button
                                onClick={() => handleCopy(acc.credentials.username, `user_${globalIdx}`)}
                                className="text-amber-400 hover:text-white shrink-0"
                              >
                                {copiedLabel === `user_${globalIdx}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded border border-amber-500/10 justify-between">
                              <code className="text-amber-300 font-mono font-bold truncate select-all">{acc.credentials.pass}</code>
                              <button
                                onClick={() => handleCopy(acc.credentials.pass, `pass_${globalIdx}`)}
                                className="text-amber-400 hover:text-white shrink-0"
                              >
                                {copiedLabel === `pass_${globalIdx}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-3.5">
                            {acc.credentials.transferCode ? (
                              <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded border border-amber-500/10 justify-between">
                                <code className="text-emerald-300 font-mono font-bold truncate select-all">{acc.credentials.transferCode}</code>
                                <button
                                  onClick={() => handleCopy(acc.credentials.transferCode || "", `code_${globalIdx}`)}
                                  className="text-amber-400 hover:text-white shrink-0"
                                >
                                  {copiedLabel === `code_${globalIdx}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-stone-500 font-mono">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls for Bought Accounts */}
              {totalBoughtPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    disabled={boughtPage === 1}
                    onClick={() => setBoughtPage(boughtPage - 1)}
                    className="px-3 py-1.5 rounded-xl bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 disabled:opacity-30 disabled:hover:bg-stone-900/50 disabled:hover:text-amber-400 text-amber-400 text-xs font-bold transition uppercase border border-amber-500/20"
                  >
                    ← Trước
                  </button>
                  <span className="text-xs text-stone-300 font-black">
                    Trang {boughtPage} / {totalBoughtPages}
                  </span>
                  <button
                    disabled={boughtPage === totalBoughtPages}
                    onClick={() => setBoughtPage(boughtPage + 1)}
                    className="px-3 py-1.5 rounded-xl bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 disabled:opacity-30 disabled:hover:bg-stone-900/50 disabled:hover:text-amber-400 text-amber-400 text-xs font-bold transition uppercase border border-amber-500/20"
                  >
                    Sau →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: LỊCH SỬ TẤT CẢ CÁC GIAO DỊCH */}
      {(viewMode === "all" || viewMode === "transactions") && (
        <div className="bg-[#4d0808] p-4 sm:p-6 rounded-3xl border-2 border-amber-500/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-amber-500/15 pb-3 gap-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg md:text-xl font-black text-amber-300 uppercase tracking-wider">
              Lịch sử giao dịch & nạp ví
            </h3>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs bg-red-950 p-1 rounded-xl border border-amber-500/10 self-start">
            <button
              onClick={() => handleFilterChange("all")}
              className={`py-1 px-2.5 rounded-lg font-bold transition ${
                filterType === "all"
                  ? "bg-amber-500 text-red-950 font-black"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => handleFilterChange("recharge")}
              className={`py-1 px-2.5 rounded-lg font-bold transition ${
                filterType === "recharge"
                  ? "bg-amber-500 text-red-950 font-black"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              Lịch sử nạp
            </button>
            <button
              onClick={() => handleFilterChange("purchase")}
              className={`py-1 px-2.5 rounded-lg font-bold transition ${
                filterType === "purchase"
                  ? "bg-amber-500 text-red-950 font-black"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              Lịch sử mua nick
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <EmptyState
            title={t("emptyStates.noTxTitle")}
            description={t("emptyStates.noTxDesc")}
            iconType="database"
            actionText={t("emptyStates.viewAll")}
            onAction={() => handleFilterChange("all")}
          />
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-xs text-left text-stone-200">
                <thead className="text-[10px] text-amber-400 uppercase bg-[#2c0404] border-b border-amber-500/20">
                  <tr>
                    <th scope="col" className="px-3 py-3 font-black text-center w-12">
                      STT
                    </th>
                    <th scope="col" className="px-3 py-3 w-24">
                      Loại
                    </th>
                    <th scope="col" className="px-3 py-3 min-w-[200px]">
                      Mô tả giao dịch
                    </th>
                    <th scope="col" className="px-3 py-3 text-right w-28">
                      Mức phí
                    </th>
                    <th scope="col" className="px-3 py-3 text-center w-28">
                      Trạng thái
                    </th>
                    <th scope="col" className="px-3 py-3 text-right w-36">
                      Mốc thời gian
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/5 bg-[#2c0404]/30">
                  {paginatedTransactions.map((tx, idx) => {
                    const globalIdx = (txPage - 1) * TX_ITEMS_PER_PAGE + idx;
                    return (
                      <tr key={tx.id} className="hover:bg-red-950/30 transition">
                        <td className="px-3 py-3.5 text-center font-mono text-stone-400 font-bold">
                          {globalIdx + 1}
                        </td>
                        <td className="px-3 py-3.5">
                          {tx.type === "card" || tx.type === "atm" ? (
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
                        <td className="px-3 py-3.5 text-right font-black font-sans text-xs">
                          {tx.type === "card" || tx.type === "atm" ? (
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
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination controls for Transactions */}
            {totalTxPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  disabled={txPage === 1}
                  onClick={() => setTxPage(txPage - 1)}
                  className="px-3 py-1.5 rounded-xl bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 disabled:opacity-30 disabled:hover:bg-stone-900/50 disabled:hover:text-amber-400 text-amber-400 text-xs font-bold transition uppercase border border-amber-500/20"
                >
                  ← Trước
                </button>
                <span className="text-xs text-stone-300 font-black">
                  Trang {txPage} / {totalTxPages}
                </span>
                <button
                  disabled={txPage === totalTxPages}
                  onClick={() => setTxPage(txPage + 1)}
                  className="px-3 py-1.5 rounded-xl bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 disabled:opacity-30 disabled:hover:bg-stone-900/50 disabled:hover:text-amber-400 text-amber-400 text-xs font-bold transition uppercase border border-amber-500/20"
                >
                  Sau →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
