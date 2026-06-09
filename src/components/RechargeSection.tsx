import { useState, FormEvent, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useToastStore } from "../store/useToastStore";
import { api } from "../api";
import { CARD_PROVIDERS, CARD_VALUES } from "../data";
import {
  DollarSign,
  CreditCard,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  HelpCircle,
  QrCode,
  Loader2,
} from "lucide-react";

/** Thông tin chuyển khoản ngân hàng tự động (SePay) trả về từ GET /api/recharge/bank. */
interface BankRechargeInfo {
  transferContent: string;
  accountNumber: string;
  bankCode: string;
  accountName: string;
  amount: number | null;
  qrUrl: string;
}

/** Mệnh giá gợi ý cho nạp chuyển khoản (đ). null = để trống, tự nhập trong app ngân hàng. */
const BANK_AMOUNTS: number[] = [50000, 100000, 200000, 500000, 1000000, 2000000];

interface RechargeSectionProps {
  onRechargeCard: (
    provider: string,
    amount: number,
    serial: string,
    pin: string,
  ) => Promise<boolean>;
  currentUser: { username: string; balance: number };
  activeTab: "card" | "atm";
  setActiveTab: (tab: "card" | "atm") => void;
  atmBank: string;
  atmAccountNumber: string;
  atmAccountOwner: string;
  momoPhone: string;
  momoAccountOwner: string;
}

export default function RechargeSection({
  onRechargeCard,
  currentUser,
  activeTab,
  setActiveTab,
  atmBank,
  atmAccountNumber,
  atmAccountOwner,
  momoPhone,
  momoAccountOwner,
}: RechargeSectionProps) {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  // Card formulation states
  const [selectedProvider, setSelectedProvider] = useState<string>("VIETTEL");
  const [selectedAmount, setSelectedAmount] = useState<number>(50000);
  const [cardSerial, setCardSerial] = useState<string>("");
  const [cardPin, setCardPin] = useState<string>("");
  const [isRecharging, setIsRecharging] = useState<boolean>(false);
  const [rechargeAlert, setRechargeAlert] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ATM formulary states
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Nạp chuyển khoản ngân hàng (SePay – tự động cộng tiền qua webhook)
  const queryClient = useQueryClient();
  // Số tiền điền sẵn vào QR; null = để trống, người dùng tự nhập trong app ngân hàng.
  const [bankAmount, setBankAmount] = useState<number | null>(100000);

  // Chỉ gọi API (cần đăng nhập) khi đã đăng nhập — tránh 401 làm interceptor tự logout → bị đá về home.
  const isLoggedIn = currentUser.username !== "Khách";
  const bankQuery = useQuery({
    queryKey: ["bankRecharge", bankAmount],
    queryFn: () =>
      api.get<BankRechargeInfo>("/recharge/bank", {
        params: { amount: bankAmount ?? undefined },
      }),
    enabled: activeTab === "atm" && isLoggedIn,
    placeholderData: keepPreviousData,
  });
  const bankInfo = bankQuery.data;

  // Trong lúc ở tab chuyển khoản, định kỳ làm mới /auth/me để phát hiện tiền vào (webhook cộng tiền).
  useEffect(() => {
    if (activeTab !== "atm" || !isLoggedIn) return;
    const id = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["userMe"] });
    }, 5000);
    return () => clearInterval(id);
  }, [activeTab, isLoggedIn, queryClient]);

  // Mốc số dư khi mở tab; số dư tăng lên => đã nhận được tiền nạp.
  const baselineBalanceRef = useRef<number | null>(null);
  useEffect(() => {
    if (activeTab === "atm") {
      if (baselineBalanceRef.current === null) baselineBalanceRef.current = currentUser.balance;
    } else {
      baselineBalanceRef.current = null;
    }
  }, [activeTab, currentUser.balance]);

  useEffect(() => {
    if (activeTab !== "atm" || baselineBalanceRef.current === null) return;
    if (currentUser.balance > baselineBalanceRef.current) {
      const delta = currentUser.balance - baselineBalanceRef.current;
      addToast(`Nạp tiền thành công! Đã cộng ${delta.toLocaleString("vi-VN")}đ vào ví.`, "success");
      baselineBalanceRef.current = currentUser.balance;
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    }
  }, [currentUser.balance, activeTab, addToast, queryClient]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleCardSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!cardSerial.trim() || !cardPin.trim()) {
      setRechargeAlert({
        type: "error",
        text: t("recharge.errMissingFields"),
      });
      return;
    }

    setIsRecharging(true);
    setRechargeAlert(null);

    // Dynamic timeout emulation
    const success = await onRechargeCard(
      selectedProvider,
      selectedAmount,
      cardSerial,
      cardPin,
    );

    setIsRecharging(false);
    if (success) {
      setRechargeAlert({
        type: "success",
        text: t("recharge.successCard", { provider: selectedProvider, amount: selectedAmount.toLocaleString("vi-VN") }),
      });
      setCardSerial("");
      setCardPin("");
    } else {
      setRechargeAlert({
        type: "error",
        text: t("recharge.errCard"),
      });
    }
  };

  return (
    <div
      className="bg-[#4d0808] p-4 sm:p-6 rounded-3xl border-2 border-amber-500/40 shadow-xl space-y-6"
      id="recharge-anchor"
    >
      {/* Tab Switcher */}
      <div className="flex border-b border-amber-500/20 pb-3 gap-2">
        <button
          onClick={() => setActiveTab("card")}
          className={`py-2.5 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition ${activeTab === "card"
            ? "bg-amber-500 text-red-950 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-black"
            : "bg-red-950/40 text-stone-300 border border-amber-500/10 hover:bg-red-950/80"
            }`}
        >
          {t("recharge.tabCard")}
        </button>
        <button
          onClick={() => setActiveTab("atm")}
          className={`py-2.5 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition ${activeTab === "atm"
            ? "bg-emerald-500 text-stone-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-black"
            : "bg-red-950/40 text-stone-300 border border-amber-500/10 hover:bg-red-950/80"
            }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5" /> Chuyển khoản QR
          </span>
        </button>
      </div>

      <div className="w-full">
        {/* SUB-SECTION 1: NẠP CARD CHẬM CHIẾT KHẤU */}
        {activeTab === "card" && (
          <div className="bg-[#4d0808]/80 p-5 rounded-2xl border border-amber-500/10 space-y-5">
            <div>
              <h4 className="font-extrabold text-stone-100 uppercase text-lg">
                {t("recharge.titleCard")}
              </h4>
              <p className="text-xs text-rose-300 font-semibold mt-1">
                {t("recharge.descCard")}
              </p>
            </div>

            <form
              onSubmit={handleCardSubmit}
              className="space-y-4 text-xs sm:text-sm"
            >
              {/* Publisher selection */}
              <div>
                <label className="block font-bold text-amber-300 text-xs uppercase mb-2">
                  {t("recharge.labelProvider")}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {CARD_PROVIDERS.map((provider) => (
                    <button
                      key={provider.name}
                      type="button"
                      onClick={() => setSelectedProvider(provider.name)}
                      className={`py-2 px-1 rounded-lg font-black text-[10px] text-center transition border ${selectedProvider === provider.name
                        ? "bg-amber-500 text-red-950 border-amber-400 font-black shadow-md"
                        : "bg-red-950/80 text-stone-300 border-amber-500/10 hover:bg-red-900"
                        }`}
                    >
                      {provider.name}
                      <span className="block text-[8px] font-mono text-center font-normal">
                        CK: {provider.discount}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price values Selection */}
              <div>
                <label className="block font-bold text-amber-300 text-xs uppercase mb-2">
                  {t("recharge.labelAmount")}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {CARD_VALUES.map((val) => (
                    <button
                      key={val.value}
                      type="button"
                      onClick={() => setSelectedAmount(val.value)}
                      className={`py-2 px-1.5 rounded-lg text-xs font-extrabold text-center border transition ${selectedAmount === val.value
                        ? "bg-amber-400 text-red-950 border-amber-300 font-black shadow-md"
                        : "bg-red-950/60 text-stone-300 border-amber-500/5 hover:bg-neutral-900"
                        }`}
                    >
                      {t("recharge.cardLabel", { amount: val.label })}
                    </button>
                  ))}
                </div>
              </div>

              {/* Serial input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-300 text-xs uppercase mb-1.5">
                    {t("recharge.labelSerial")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("recharge.placeholderSerial")}
                    value={cardSerial}
                    onChange={(e) => setCardSerial(e.target.value)}
                    className="w-full bg-red-950 border border-amber-500/20 rounded-xl py-2 px-3 text-xs sm:text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-300 text-xs uppercase mb-1.5">
                    {t("recharge.labelPin")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("recharge.placeholderPin")}
                    value={cardPin}
                    onChange={(e) => setCardPin(e.target.value)}
                    className="w-full bg-red-950 border border-amber-500/20 rounded-xl py-2 px-3 text-xs sm:text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {rechargeAlert && (
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2 text-xs ${rechargeAlert.type === "success"
                    ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                    : "bg-rose-950 text-rose-300 border-rose-800"
                    }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{rechargeAlert.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isRecharging}
                className={`w-full font-black py-3 px-4 rounded-xl shadow-lg border-y-2 border-amber-300 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 ${isRecharging
                  ? "bg-stone-700 text-stone-400 border-none cursor-not-allowed"
                  : "bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white"
                  }`}
              >
                {isRecharging ? t("recharge.btnVerifyingCard") : t("recharge.btnSubmitCard")}
              </button>
            </form>

            <div className="border-t border-amber-500/10 pt-4 text-xs space-y-2 text-stone-400 leading-relaxed">
              <p className="font-bold text-stone-300 text-[13px]">{t("recharge.noticeTitle")}</p>
              <p>{t("recharge.notice1")}</p>
              <p>{t("recharge.notice2")}</p>
            </div>

          </div>
        )}

        {/* SUB-SECTION 2: NẠP CHUYỂN KHOẢN NGÂN HÀNG (SePay – tự động) */}
        {activeTab === "atm" && (
          <div className="bg-[#4d0808]/80 p-5 sm:p-6 rounded-2xl border border-amber-500/10 space-y-5">
            <div>
              <h4 className="font-extrabold text-stone-100 uppercase text-lg flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" /> Nạp tiền qua chuyển khoản ngân hàng
              </h4>
              <p className="text-xs text-emerald-300 font-semibold mt-1">
                Quét mã QR hoặc chuyển khoản đúng nội dung bên dưới. Tiền được cộng <b>tự động</b> ngay khi ngân hàng xác nhận — không cần bấm xác nhận.
              </p>
            </div>

            {/* Chọn mệnh giá điền sẵn vào QR */}
            <div>
              <label className="block font-bold text-amber-300 text-xs uppercase mb-2">
                Số tiền muốn nạp
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {BANK_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setBankAmount(val)}
                    className={`py-2 px-1.5 rounded-lg text-xs font-extrabold text-center border transition ${bankAmount === val
                      ? "bg-emerald-400 text-stone-950 border-emerald-300 font-black shadow-md"
                      : "bg-red-950/60 text-stone-300 border-amber-500/5 hover:bg-neutral-900"
                      }`}
                  >
                    {val.toLocaleString("vi-VN")}đ
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setBankAmount(null)}
                  className={`py-2 px-1.5 rounded-lg text-[11px] font-extrabold text-center border transition ${bankAmount === null
                    ? "bg-emerald-400 text-stone-950 border-emerald-300 font-black shadow-md"
                    : "bg-red-950/60 text-stone-300 border-amber-500/5 hover:bg-neutral-900"
                    }`}
                >
                  Tự nhập trong app
                </button>
              </div>
            </div>

            {bankQuery.isError ? (
              <div className="p-3 rounded-xl border bg-rose-950 text-rose-300 border-rose-800 flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Không tải được thông tin chuyển khoản. Vui lòng thử lại sau.</span>
              </div>
            ) : !bankInfo ? (
              <div className="flex items-center justify-center gap-2 text-stone-300 text-xs py-10">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang tạo mã QR...
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-y border-emerald-900/40 py-5 w-full">
                {/* QR thật từ API */}
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="bg-white p-2 rounded-xl border border-stone-200 shrink-0">
                    <img
                      src={bankInfo.qrUrl}
                      alt="VietQR chuyển khoản"
                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-stone-400 text-center">
                    Mở app ngân hàng → quét QR là tự điền sẵn{bankInfo.amount ? " số tiền và" : ""} nội dung.
                  </p>
                </div>

                {/* Thông tin chuyển khoản thủ công */}
                <div className="space-y-3 bg-red-950/30 p-4 rounded-xl border border-amber-500/10">
                  <h5 className="font-black text-amber-300 uppercase text-xs tracking-wide">
                    Hoặc chuyển khoản thủ công
                  </h5>

                  <div className="space-y-1 text-xs font-bold text-stone-200">
                    <p>Ngân hàng: <span className="text-emerald-400 font-extrabold">{bankInfo.bankCode}</span></p>
                    <p>Chủ tài khoản: <span className="text-emerald-400 font-extrabold">{bankInfo.accountName}</span></p>
                  </div>

                  {/* Số tài khoản */}
                  <div className="flex items-center justify-between gap-2 bg-red-950/60 rounded-lg px-3 py-2 border border-amber-500/10">
                    <div className="min-w-0">
                      <p className="text-[10px] text-stone-400 uppercase font-bold">Số tài khoản</p>
                      <p className="text-sm font-mono font-extrabold text-emerald-300 truncate">{bankInfo.accountNumber}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(bankInfo.accountNumber, "bank_acc")}
                      className="shrink-0 bg-stone-600 hover:bg-stone-500 text-white p-2 rounded transition active:scale-95"
                      title="Sao chép số tài khoản"
                    >
                      {copiedText === "bank_acc" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Nội dung chuyển khoản — BẮT BUỘC đúng */}
                  <div className="flex items-center justify-between gap-2 bg-red-950/60 rounded-lg px-3 py-2 border-2 border-dashed border-emerald-500">
                    <div className="min-w-0">
                      <p className="text-[10px] text-stone-400 uppercase font-bold">Nội dung CK (bắt buộc đúng)</p>
                      <p className="text-base font-mono font-black text-emerald-400 truncate select-all tracking-wider">{bankInfo.transferContent}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(bankInfo.transferContent, "bank_content")}
                      className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded transition active:scale-95"
                      title="Sao chép nội dung chuyển khoản"
                    >
                      {copiedText === "bank_content" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {bankInfo.amount != null && (
                    <p className="text-xs font-bold text-stone-200">
                      Số tiền: <span className="text-emerald-400 font-extrabold">{bankInfo.amount.toLocaleString("vi-VN")}đ</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Trạng thái chờ tiền vào (tự cập nhật) */}
            <div className="flex items-center justify-center gap-2 text-emerald-300 text-xs font-semibold bg-emerald-950/30 border border-emerald-800/40 rounded-xl py-2.5">
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang chờ chuyển khoản — số dư sẽ tự động cập nhật khi nhận được tiền.
            </div>

            {/* Lưu ý */}
            <div className="text-xs text-stone-300 space-y-1.5 leading-relaxed">
              <p className="text-emerald-400 font-semibold">• Chuyển khoản <b>đúng nội dung</b> ở trên để hệ thống cộng tiền tự động.</p>
              <p className="text-stone-300">• Tiền được cộng theo đúng số tiền thực nhận, thường trong vài giây đến 1–2 phút.</p>
              <p className="text-red-400 font-medium">• Sai nội dung có thể khiến giao dịch phải đối soát thủ công, chậm hơn.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
