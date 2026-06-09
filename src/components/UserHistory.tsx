import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "../api";
import { useAuthStore } from "../store/useAuthStore";
import { Copy, Check, History, Inbox, Search, Loader2 } from "lucide-react";
import EmptyState from "./EmptyState";

interface UserHistoryProps {
  onBack: () => void;
  hideHeader?: boolean;
  viewMode?: "bought" | "transactions" | "all";
}

type TxFilter = "all" | "recharge" | "purchase" | "wheel";

interface PagedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

interface BoughtAccountItem {
  itemId: string;
  accountId: string;
  title: string;
  game: string;
  avatarUrl?: string;
  credentials: {
    username?: string;
    pass?: string;
    transferCode?: string;
  };
}

interface TransactionItem {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  time: string;
}

const ITEMS_PER_PAGE = 5;

const isRecharge = (type: string) =>
  type === "card" || type === "atm" ||
  type === "recharge_card" || type === "recharge_atm" || type === "recharge_bank";

// Khoản tiền VÀO ví (cộng số dư): nạp tiền hoặc admin tặng tiền.
const isCredit = (type: string) => isRecharge(type) || type === "admin_gift";

export default function UserHistory({
  onBack,
  hideHeader = false,
  viewMode = "all",
}: UserHistoryProps) {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);

  const [filterType, setFilterType] = useState<TxFilter>("all");
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  // Server-side pagination state
  const [boughtPage, setBoughtPage] = useState(1);
  const [txPage, setTxPage] = useState(1);

  // Product title filter (debounced) for the bought-accounts section
  const [titleInput, setTitleInput] = useState("");
  const [titleSearch, setTitleSearch] = useState("");

  const showBought = viewMode === "all" || viewMode === "bought";
  const showTx = viewMode === "all" || viewMode === "transactions";

  // Debounce the title search and reset to first page on change
  useEffect(() => {
    const handle = setTimeout(() => {
      setTitleSearch(titleInput.trim());
      setBoughtPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [titleInput]);

  const boughtQuery = useQuery({
    queryKey: ["boughtAccounts", token, boughtPage, titleSearch],
    queryFn: () =>
      api.get<PagedResult<BoughtAccountItem>>("/user/bought-accounts", {
        params: { page: boughtPage, limit: ITEMS_PER_PAGE, search: titleSearch || undefined },
      }),
    enabled: !!token && showBought,
    placeholderData: keepPreviousData,
  });

  const txQuery = useQuery({
    queryKey: ["transactions", token, filterType, txPage],
    queryFn: () =>
      api.get<PagedResult<TransactionItem>>("/user/transactions", {
        params: { type: filterType, page: txPage, limit: ITEMS_PER_PAGE },
      }),
    enabled: !!token && showTx,
    placeholderData: keepPreviousData,
  });

  const boughtAccounts = boughtQuery.data?.data ?? [];
  const totalBoughtPages = Math.max(1, boughtQuery.data?.totalPages ?? 1);

  const transactions = txQuery.data?.data ?? [];
  const totalTxPages = Math.max(1, txQuery.data?.totalPages ?? 1);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const handleFilterChange = (type: TxFilter) => {
    setFilterType(type);
    setTxPage(1);
  };

  return (
    <div className={`${hideHeader ? "" : "max-w-5xl mx-auto my-6"} space-y-8`}>
      {/* Back control header */}
      {!hideHeader && (
        <div className="flex items-center justify-between border-b-2 border-amber-500/20 pb-4">
          <h2 className="text-xl sm:text-2xl font-black uppercase text-amber-300 tracking-wider">
            {t("history.pageTitle")}
          </h2>
          <button
            onClick={onBack}
            className="bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 text-amber-400 py-1.5 px-4 rounded-xl border border-amber-500/20 text-xs font-bold uppercase transition"
          >
            {t("history.backHome")}
          </button>
        </div>
      )}

      {/* SECTION 1: KHO ĐỒ TÀI KHOẢN ĐÃ MUA */}
      {showBought && (
        <div className="bg-[#4d0808] p-4 sm:p-6 rounded-3xl border-2 border-amber-500/40 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-amber-500/15 pb-3 gap-3">
            <div className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg md:text-xl font-black text-amber-300 uppercase tracking-wider">
                {t("history.boughtTitle")}
              </h3>
            </div>

            {/* Filter by product title */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-amber-400/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder={t("history.searchTitlePlaceholder")}
                className="w-full bg-red-950 border border-amber-500/20 rounded-xl py-2 pl-9 pr-3 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500/60 transition"
              />
              {boughtQuery.isFetching && (
                <Loader2 className="w-4 h-4 text-amber-400 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
              )}
            </div>
          </div>

          {boughtAccounts.length === 0 ? (
            <EmptyState
              title={titleSearch ? t("history.noBoughtMatch") : t("emptyStates.noBoughtTitle")}
              description={titleSearch ? "" : t("emptyStates.noBoughtDesc")}
              iconType="inbox"
            />
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full text-xs text-left text-stone-200">
                  <thead className="text-[10px] text-amber-400 uppercase bg-[#2c0404] border-b border-amber-500/20">
                    <tr>
                      <th scope="col" className="px-3 py-3 font-black text-center w-12">
                        {t("history.colNo")}
                      </th>
                      <th scope="col" className="px-3 py-3 w-32">
                        {t("history.colCode")}
                      </th>
                      <th scope="col" className="px-3 py-3 min-w-[150px]">
                        {t("history.colProduct")}
                      </th>
                      <th scope="col" className="px-3 py-3 min-w-[160px]">
                        {t("history.colLoginAccount")}
                      </th>
                      <th scope="col" className="px-3 py-3 min-w-[160px]">
                        {t("history.colPassword")}
                      </th>
                      <th scope="col" className="px-3 py-3 min-w-[160px]">
                        {t("history.colTransferCode")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-500/5 bg-[#2c0404]/30">
                    {boughtAccounts.map((acc, index) => {
                      const globalIdx = (boughtPage - 1) * ITEMS_PER_PAGE + index;
                      return (
                        <tr key={acc.itemId} className="hover:bg-red-950/30 transition">
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
                                {acc.accountId}
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
                                onClick={() => handleCopy(acc.credentials.username || "", `user_${globalIdx}`)}
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
                                onClick={() => handleCopy(acc.credentials.pass || "", `pass_${globalIdx}`)}
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
                    {t("history.prev")}
                  </button>
                  <span className="text-xs text-stone-300 font-black">
                    {t("history.pageOf", { current: boughtPage, total: totalBoughtPages })}
                  </span>
                  <button
                    disabled={boughtPage === totalBoughtPages}
                    onClick={() => setBoughtPage(boughtPage + 1)}
                    className="px-3 py-1.5 rounded-xl bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 disabled:opacity-30 disabled:hover:bg-stone-900/50 disabled:hover:text-amber-400 text-amber-400 text-xs font-bold transition uppercase border border-amber-500/20"
                  >
                    {t("history.next")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: LỊCH SỬ TẤT CẢ CÁC GIAO DỊCH */}
      {showTx && (
        <div className="bg-[#4d0808] p-4 sm:p-6 rounded-3xl border-2 border-amber-500/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-amber-500/15 pb-3 gap-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg md:text-xl font-black text-amber-300 uppercase tracking-wider">
              {t("history.txTitle")}
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
              {t("history.filterAll")}
            </button>
            <button
              onClick={() => handleFilterChange("recharge")}
              className={`py-1 px-2.5 rounded-lg font-bold transition ${
                filterType === "recharge"
                  ? "bg-amber-500 text-red-950 font-black"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              {t("history.filterRecharge")}
            </button>
            <button
              onClick={() => handleFilterChange("purchase")}
              className={`py-1 px-2.5 rounded-lg font-bold transition ${
                filterType === "purchase"
                  ? "bg-amber-500 text-red-950 font-black"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              {t("history.filterPurchase")}
            </button>
            <button
              onClick={() => handleFilterChange("wheel")}
              className={`py-1 px-2.5 rounded-lg font-bold transition ${
                filterType === "wheel"
                  ? "bg-amber-500 text-red-950 font-black"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              {t("history.filterWheel")}
            </button>
          </div>
        </div>

        {transactions.length === 0 ? (
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
                      {t("history.colNo")}
                    </th>
                    <th scope="col" className="px-3 py-3 w-24">
                      {t("history.colType")}
                    </th>
                    <th scope="col" className="px-3 py-3 min-w-[200px]">
                      {t("history.colDescription")}
                    </th>
                    <th scope="col" className="px-3 py-3 text-right w-28">
                      {t("history.colAmount")}
                    </th>
                    <th scope="col" className="px-3 py-3 text-center w-28">
                      {t("history.colStatus")}
                    </th>
                    <th scope="col" className="px-3 py-3 text-right w-36">
                      {t("history.colTime")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/5 bg-[#2c0404]/30">
                  {transactions.map((tx, idx) => {
                    const globalIdx = (txPage - 1) * ITEMS_PER_PAGE + idx;
                    return (
                      <tr key={tx.id} className="hover:bg-red-950/30 transition">
                        <td className="px-3 py-3.5 text-center font-mono text-stone-400 font-bold">
                          {globalIdx + 1}
                        </td>
                        <td className="px-3 py-3.5">
                          {isRecharge(tx.type) ? (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-0.5 px-2 rounded font-extrabold block text-center max-w-20">
                              {t("history.badgeRecharge")}
                            </span>
                          ) : tx.type === "admin_gift" ? (
                            <span className="bg-pink-500/10 text-pink-300 border border-pink-500/20 py-0.5 px-2 rounded font-extrabold block text-center max-w-20">
                              Quà tặng
                            </span>
                          ) : tx.type === "buy_account" ? (
                            <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 py-0.5 px-2 rounded font-extrabold block text-center max-w-20">
                              {t("history.badgePurchase")}
                            </span>
                          ) : (
                            <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 py-0.5 px-2 rounded font-extrabold block text-center max-w-20">
                              {t("history.badgeWheel")}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3.5 font-bold text-stone-200">
                          {tx.description}
                        </td>
                        <td className="px-3 py-3.5 text-right font-black font-sans text-xs">
                          {isCredit(tx.type) ? (
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
                          <span className="text-emerald-400">{t("history.statusSuccess")}</span>
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
                  {t("history.prev")}
                </button>
                <span className="text-xs text-stone-300 font-black">
                  {t("history.pageOf", { current: txPage, total: totalTxPages })}
                </span>
                <button
                  disabled={txPage === totalTxPages}
                  onClick={() => setTxPage(txPage + 1)}
                  className="px-3 py-1.5 rounded-xl bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 disabled:opacity-30 disabled:hover:bg-stone-900/50 disabled:hover:text-amber-400 text-amber-400 text-xs font-bold transition uppercase border border-amber-500/20"
                >
                  {t("history.next")}
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
