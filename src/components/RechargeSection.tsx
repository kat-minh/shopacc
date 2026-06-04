import { useState, FormEvent, useRef } from "react";
import { CARD_PROVIDERS, CARD_VALUES } from "../data";
import {
  DollarSign,
  CreditCard,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

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
}

export default function RechargeSection({
  onRechargeCard,
  currentUser,
  activeTab,
  setActiveTab,
}: RechargeSectionProps) {
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
  const [atmValue, setAtmValue] = useState<number>(100000);
  const [momoValue, setMomoValue] = useState<number>(100000);

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
        text: "Vui lòng nhập đầy đủ Số Serial và Mã Thẻ Cào!",
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
        text: `Nạp thẻ ${selectedProvider} thành công! Số tiền gốc ${selectedAmount.toLocaleString("vi-VN")}đ đã được cộng vào số dư tài khoản của bạn.`,
      });
      setCardSerial("");
      setCardPin("");
    } else {
      setRechargeAlert({
        type: "error",
        text: "Lỗi nạp thẻ cào! Vui lòng kiểm tra lại tính hợp lệ của serial và mã pin.",
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
          Nạp Thẻ Cào
        </button>
        <button
          onClick={() => setActiveTab("atm")}
          className={`py-2.5 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition ${activeTab === "atm"
            ? "bg-emerald-500 text-stone-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-black"
            : "bg-red-950/40 text-stone-300 border border-amber-500/10 hover:bg-red-950/80"
            }`}
        >
          Nạp ATM / MoMo
        </button>
      </div>

      <div className="w-full">
        {/* SUB-SECTION 1: NẠP CARD CHẬM CHIẾT KHẤU */}
        {activeTab === "card" && (
          <div className="bg-[#4d0808]/80 p-5 rounded-2xl border border-amber-500/10 space-y-5">
            <div>
              <h4 className="font-extrabold text-stone-100 uppercase text-lg">
                Nạp Thẻ Cào
              </h4>
              <p className="text-xs text-rose-300 font-semibold mt-1">
                Tự động 24/7 - Nhập sai mệnh giá sẽ mất thẻ.
              </p>
            </div>

            <form
              onSubmit={handleCardSubmit}
              className="space-y-4 text-xs sm:text-sm"
            >
              {/* Publisher selection */}
              <div>
                <label className="block font-bold text-amber-300 text-xs uppercase mb-2">
                  Nhà mạng (Ưu tiên Viettel, Vinaphone)
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
                  Mệnh giá
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
                      Thẻ {val.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Serial input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-300 text-xs uppercase mb-1.5">
                    Serial thẻ
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập mã serial thẻ..."
                    value={cardSerial}
                    onChange={(e) => setCardSerial(e.target.value)}
                    className="w-full bg-red-950 border border-amber-500/20 rounded-xl py-2 px-3 text-xs sm:text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-300 text-xs uppercase mb-1.5">
                    Mã thẻ
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập mã pin thẻ..."
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
                {isRecharging ? "Đang xác thực thẻ cào..." : "Nạp Thẻ"}
              </button>
            </form>

            <div className="border-t border-amber-500/10 pt-4 text-xs space-y-2 text-stone-400 leading-relaxed">
              <p className="font-bold text-stone-300 text-[13px]">Lưu ý:</p>
              <p>- Vui lòng nạp đúng mệnh giá, sai mệnh giá sẽ không được cộng tiền vào tài khoản.</p>
              <p>- Thẻ cào bị treo ĐANG XỬ LÝ quá 10p kể từ lúc nạp thẻ xin vui lòng liên hện page để được hỗ trợ.</p>
            </div>

          </div>
        )}

        {/* SUB-SECTION 2: NẠP ATM / MOMO AUTO */}
        {activeTab === "atm" && (
          <div className="bg-[#4d0808]/80 p-5 sm:p-6 rounded-2xl border border-amber-500/10 space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-b border-rose-900/40 pb-5 w-full">
              {/* LEFT SIDE: BANKING */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 bg-red-950/30 p-4 rounded-xl border border-amber-500/10 w-full">
                <div className="space-y-1">
                  <h4 className="font-black text-amber-300 uppercase text-xs sm:text-sm tracking-wide">
                    THÔNG TIN NGÂN HÀNG
                  </h4>
                  <div className="space-y-1 mt-2 text-xs sm:text-xs font-bold text-stone-200">
                    <p>NGÂN HÀNG: <span className="text-red-500 font-extrabold">ACB</span></p>
                    <p>SỐ TÀI KHOẢN: <span className="text-red-500 font-extrabold font-mono">17506391</span></p>
                    <p>CHỦ TÀI KHOẢN: <span className="text-red-500 font-extrabold">DOAN KHAC Y</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy("17506391", "stk_acb")}
                    className="mt-3 bg-stone-600 hover:bg-stone-500 text-white px-3 py-1.5 text-[10px] font-bold rounded transition transform active:scale-95 duration-150 uppercase"
                  >
                    {copiedText === "stk_acb" ? "Đã copy!" : "COPY SỐ TÀI KHOẢN"}
                  </button>
                </div>
                {/* QR Code on the right */}
                <div className="bg-white p-1.5 rounded-lg border border-stone-200 self-center shrink-0 flex items-center justify-center">
                  <div className="w-20 h-20 relative bg-stone-50 flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=STK:17506391_BANK:ACB_MEMO:NAP_${currentUser.username}`}
                      alt="VietQR Bank"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: MOMO */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 bg-red-950/30 p-4 rounded-xl border border-amber-500/10 w-full">
                <div className="space-y-1">
                  <h4 className="font-black text-amber-300 uppercase text-xs sm:text-sm tracking-wide">
                    THÔNG TIN VÍ MOMO
                  </h4>
                  <div className="space-y-1 mt-2 text-xs sm:text-xs font-bold text-stone-200">
                    <p>VÍ ĐIỆN TỬ: <span className="text-red-500 font-extrabold">MOMO</span></p>
                    <p>SỐ ĐIỆN THOẠI: <span className="text-red-500 font-extrabold font-mono">0399881122</span></p>
                    <p>CHỦ TÀI KHOẢN: <span className="text-red-500 font-extrabold">DOAN KHAC Y</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy("0399881122", "sdt_momo")}
                    className="mt-3 bg-stone-600 hover:bg-stone-500 text-white px-3 py-1.5 text-[10px] font-bold rounded transition transform active:scale-95 duration-150 uppercase"
                  >
                    {copiedText === "sdt_momo" ? "Đã copy!" : "COPY SỐ ĐIỆN THOẠI"}
                  </button>
                </div>
                {/* QR Code on the right */}
                <div className="bg-white p-1.5 rounded-lg border border-stone-200 self-center shrink-0 flex items-center justify-center">
                  <div className="w-20 h-20 relative bg-stone-50 flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PHONE:0399881122_MEMO:NAP_${currentUser.username}`}
                      alt="Momo QR"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Transfer notes syntax section */}
            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-bold text-stone-200">Nội dung chuyển khoản:</p>
              <div className="border-2 border-dashed border-red-500 bg-red-950/20 p-4 rounded-xl text-center">
                <span className="font-extrabold text-red-500 text-xl tracking-wider select-all cursor-pointer">
                  NAP {currentUser.username}
                </span>
              </div>

              <button
                onClick={() => {
                  alert("Hệ thống đã nhận lệnh xác nhận! Giao dịch của bạn đang được kiểm tra tự động.");
                }}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-black py-2.5 px-6 rounded-lg text-sm uppercase transition active:scale-95 duration-150"
              >
                Xác nhận. Tôi đã chuyển
              </button>
            </div>

            {/* Warning rules footer block */}
            <div className="text-xs sm:text-xs text-stone-300 space-y-2 pt-2 leading-relaxed">
              <p className="text-red-500 italic font-semibold">
                Lưu ý: Sau khi chuyển khoản xong, hãy chờ "vài phút" rồi ấn "Xác nhận. Tôi đã chuyển".
              </p>
              <p className="flex items-center gap-1.5 font-semibold text-stone-200">
                Khi chuyển khoản qua Ngân hàng (ATM) bạn cần ghi nội dung <span className="text-red-500 font-bold font-mono">NAP {currentUser.username}</span> bên trên.
              </p>
              <p className="text-red-400 font-medium">
                Các giao dịch chuyển sai "Nội dung chuyển khoản" sẽ không được xử lý tự động. Hãy liên hệ Fanpage để được hỗ trợ.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
