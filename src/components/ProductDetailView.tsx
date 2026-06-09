import { useState } from "react";
import { GameAccount } from "../data";
import { useTranslation } from "react-i18next";
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
  onBuy: (account: GameAccount, quantity: number) => void;
}

export default function ProductDetailView({
  account,
  userBalance,
  onBack,
  onBuy,
}: ProductDetailProps) {
  const { t } = useTranslation();
  const [qtyToBuy, setQtyToBuy] = useState(1);
  const isAvailable = account.status === "Available" && (account.quantity === undefined || account.quantity > 0);

  return (
    <div className="max-w-4xl mx-auto my-0 space-y-6">
      {/* Back control header */}
      <div className="flex items-center justify-between border-b-2 border-amber-500/20 pb-4">
        <h2 className="text-xl sm:text-2xl font-black uppercase text-amber-300 tracking-wider">
          {t("productDetail.title")}
        </h2>
        <button
          onClick={onBack}
          id="detail-back-btn"
          className="bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 text-amber-400 py-1.5 px-4 rounded-xl border border-amber-500/20 text-xs font-bold uppercase transition"
        >
          {t("productDetail.backHome")}
        </button>
      </div>

      {/* Main product card wrapper splits: Images on left/top, Specifications on right */}
      <div className="bg-[#4d0808] border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* LEFT SECTION: IMAGE GALLERIES & HIGH-RES ART */}
          <div className="space-y-4">
            <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border-2 border-amber-500/20 bg-stone-900 relative">
              {account.imageUrl && account.imageUrl.startsWith("data:") ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-900 to-red-950/50 select-none">
                  <Gamepad2 className="w-14 h-14 text-amber-500/50 mb-2" />
                  <span className="text-xs text-stone-500 font-bold uppercase tracking-wide">Game Account</span>
                </div>
              ) : (
                <img
                  src={account.imageUrl}
                  alt={account.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                <span className="bg-red-800 text-white font-black px-3 py-1 rounded text-xs border border-amber-400">
                  {t("productDetail.accCode", { id: account.id })}
                </span>
                <span className="bg-amber-400 text-red-950 font-black px-2 py-0.5 rounded text-[10px] uppercase">
                  {t("productDetail.serverShort", { server: account.stats.server?.split(" ")[0] })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-red-950/60 p-4 rounded-2xl border border-amber-500/10">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-800 shrink-0">
                {account.avatarUrl && !account.avatarUrl.startsWith("data:") ? (
                  <img
                    src={account.avatarUrl}
                    alt="Avatar"
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <Gamepad2 className="w-6 h-6 text-amber-500/60 m-auto mt-3" />
                )}
              </div>
              <div>
                <h5 className="font-extrabold text-amber-200 text-sm">
                  {t("productDetail.warrantyTitle")}
                </h5>
                <p className="text-[10px] text-stone-400">
                  {t("productDetail.warrantySub")}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: DETAILS INFO & OFFERS */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <span className="text-amber-400 text-xs font-black uppercase tracking-widest bg-amber-500/10 py-1 px-2.5 rounded border border-amber-500/15 inline-block mb-2">
                {t("categories." + account.category, account.category)}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-stone-50 leading-snug">
                {account.title}
              </h3>

              {/* Server, Power metrics */}
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div className="bg-red-950/80 p-3 rounded-xl border border-amber-500/5">
                  <span className="text-stone-400 block mb-0.5 text-[10px] uppercase font-bold">
                    {t("productDetail.labelServerDevice")}
                  </span>
                  <span className="font-extrabold text-amber-200">
                    {account.stats.server || "Global Android/iOS"}
                  </span>
                </div>
                <div className="bg-red-950/80 p-3 rounded-xl border border-amber-500/5">
                  <span className="text-stone-400 block mb-0.5 text-[10px] uppercase font-bold">
                    {t("productDetail.labelChrono")}
                  </span>
                  <span className="font-extrabold text-emerald-400">
                    {account.stats.chronoCrystals?.toLocaleString() || "1,200"}{" "}
                    CC
                  </span>
                </div>
                <div className="bg-red-950/80 p-3 rounded-xl border border-amber-500/5">
                  <span className="text-stone-400 block mb-0.5 text-[10px] uppercase font-bold">
                    {t("productDetail.labelStars")}
                  </span>
                  <span className="font-extrabold text-rose-300 whitespace-pre-line">
                    {account.stats.starsCount || t("productDetail.starsValue", { count: "7" })}
                  </span>
                </div>
                <div className="bg-red-950/80 p-3 rounded-xl border border-amber-500/5">
                  <span className="text-stone-400 block mb-0.5 text-[10px] uppercase font-bold">
                    {t("productDetail.labelPowerLevel")}
                  </span>
                  <span className="font-extrabold text-sky-300">
                    {t("productDetail.powerLevelValue", { level: account.stats.powerLevel || "100" })}
                  </span>
                </div>
              </div>
            </div>

            {/* Buying box container */}
            <div className="bg-[#2c0404]/80 p-4 rounded-2xl border border-amber-500/20 shadow-inner">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <span className="text-[10px] text-stone-500 line-through">
                    {t("productDetail.marketPrice", { price: account.originalPrice.toLocaleString() })}
                  </span>
                  <p className="text-2xl font-black text-amber-400">
                    {account.price.toLocaleString()} đ
                  </p>
                </div>

                <div className="text-right">
                  <span className="bg-red-600/20 text-red-300 font-black text-xs px-2 py-1 rounded border border-red-500/20 block mb-1">
                    {t("productDetail.savePercent", {
                      percent: Math.round(
                        ((account.originalPrice - account.price) /
                          account.originalPrice) *
                          100,
                      )
                    })}
                  </span>
                  <span className="text-stone-300 text-xs font-bold">
                    {t("productDetail.remainingStock", { count: account.quantity ?? 1 })}
                  </span>
                </div>
              </div>

              {/* Quantity Selector - show only if quantity > 1 */}
              {isAvailable && account.quantity !== undefined && account.quantity > 1 && (
                <div className="flex items-center justify-between gap-3 mb-4 bg-red-950/40 p-2.5 rounded-xl border border-amber-500/10">
                  <span className="text-xs text-stone-300 font-bold">{t("productDetail.buyQuantity")}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setQtyToBuy(Math.max(1, qtyToBuy - 1))}
                      className="w-8 h-8 rounded-lg bg-stone-900 hover:bg-amber-500 hover:text-stone-950 text-amber-400 font-bold transition flex items-center justify-center border border-amber-500/20"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={account.quantity}
                      value={qtyToBuy}
                      onChange={(e) => {
                        const val = Math.min(account.quantity || 1, Math.max(1, parseInt(e.target.value) || 1));
                        setQtyToBuy(val);
                      }}
                      className="w-12 text-center bg-red-950 border border-amber-500/25 rounded-lg py-1 text-xs text-stone-100 focus:outline-none font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setQtyToBuy(Math.min(account.quantity || 1, qtyToBuy + 1))}
                      className="w-8 h-8 rounded-lg bg-stone-900 hover:bg-amber-500 hover:text-stone-950 text-amber-400 font-bold transition flex items-center justify-center border border-amber-500/20"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {qtyToBuy > 1 && (
                <div className="flex justify-between items-center text-xs font-bold text-stone-300 mb-3 px-1">
                  <span>{t("checkout.totalPayment")} ({qtyToBuy} {t("productDetail.items", "sản phẩm")}):</span>
                  <span className="text-amber-400 font-black text-sm">{(account.price * qtyToBuy).toLocaleString()} đ</span>
                </div>
              )}

              <div className="space-y-2">
                {isAvailable ? (
                  <button
                    onClick={() => onBuy(account, qtyToBuy)}
                    className="w-full bg-linear-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-red-950 font-black text-base py-3 px-4 rounded-xl shadow-lg border-y-2 border-amber-300 active:scale-[0.99] transition flex items-center justify-center gap-2"
                  >
                    {t("productDetail.btnBuyNow")}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-stone-700 text-stone-400 font-extrabold text-base py-3 px-4 rounded-xl cursor-not-allowed text-center"
                  >
                    {t("productDetail.btnSoldOut")}
                  </button>
                )}

                <div className="flex items-center justify-between text-[11px] text-stone-400 px-1 pt-1">
                  <span>
                    {t("productDetail.userBalance", { balance: userBalance.toLocaleString() })}
                  </span>
                  {userBalance < account.price * qtyToBuy ? (
                    <span className="text-rose-400 font-bold">
                      {t("productDetail.missingBalance", { amount: (account.price * qtyToBuy - userBalance).toLocaleString() })}
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold">
                      {t("productDetail.sufficientBalance")}
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
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> {t("productDetail.warrantyBoxTitle")}
              </p>
              <p className="text-stone-300 leading-relaxed">
                {t("productDetail.warrantyBoxDesc")}
              </p>
            </div>
            <div className="sm:col-span-3 text-center">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                {t("productDetail.deliveryMechanism")}
              </span>
              <span className="bg-emerald-600/20 text-emerald-400 py-1.5 px-3 rounded-lg border border-emerald-500/20 font-black text-xs inline-block">
                {t("productDetail.deliveryAuto")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
