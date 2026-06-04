import { GameAccount } from "../data";
import { useTranslation } from "react-i18next";
import { Gamepad2, ArrowRight } from "lucide-react";

interface ProductCardProps {
  key?: string;
  account: GameAccount;
  onSelect: (account: GameAccount) => void;
  onBuy: (account: GameAccount) => void;
}

export default function ProductCard({
  account,
  onSelect,
  onBuy,
}: ProductCardProps) {
  const { t } = useTranslation();
  const isAvailable = account.status === "Available";

  return (
    <div className="bg-[#2a0404]/90 rounded-2xl border-2 border-amber-500/10 hover:border-amber-400 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative flex flex-col h-full justify-between">
      {/* Top Image Banner Section */}
      <div className="h-44 w-full bg-stone-900 relative overflow-hidden">
        <img
          src={account.imageUrl}
          alt={account.title}
          className="w-full h-full object-cover transition transform hover:scale-105 duration-500 cursor-pointer"
          onClick={() => onSelect(account)}
        />

        {/* Absolute indicators */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <span className="bg-red-800/90 border border-amber-300 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded shadow">
            {t("productCard.code")}: {account.id}
          </span>
          <span className="bg-[#4d0808]/90 text-amber-300 border border-amber-500/20 font-black text-[9px] px-2 py-0.5 rounded shadow uppercase">
            {account.game.replace("Dragon Ball ", "DB ")}
          </span>
        </div>

        {/* Status Label */}
        <div className="absolute top-3 right-3">
          {isAvailable ? (
            <span className="bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-full uppercase border border-emerald-400 shadow animate-pulse">
              {t("productCard.inStock")}
            </span>
          ) : (
            <span className="bg-stone-600 text-stone-200 font-extrabold text-xs px-2.5 py-1 rounded-full uppercase border border-stone-500 shadow">
              {t("productCard.sold")}
            </span>
          )}
        </div>

        {/* Gems / Crystals Overlay */}
        {account.stats.chronoCrystals ? (
          <div className="absolute bottom-2 right-2 bg-linear-to-r from-teal-950/90 to-blue-900/90 border border-amber-300/40 text-amber-300 text-xs px-2.5 py-1 rounded-lg font-black shadow-md flex items-center gap-1 shrink-0">
            💎 {account.stats.chronoCrystals.toLocaleString()} CC
          </div>
        ) : null}
      </div>

      {/* Product Information Body */}
      <div className="p-4 grow flex flex-col justify-between">
        <div>
          <span className="text-[10px] text-amber-400/90 uppercase tracking-widest font-black block mb-1">
            {t("categories." + account.category, account.category)}
          </span>
          <h4
            className="font-extrabold text-stone-100 text-sm leading-snug line-clamp-2 hover:underline cursor-pointer transition"
            onClick={() => onSelect(account)}
          >
            {account.title}
          </h4>

          {/* Core Star / Character Badges */}
          <div className="flex flex-wrap gap-1 mt-3">
            {account.stats.vipCharacters?.slice(0, 3).map((char, index) => (
              <span
                key={index}
                className="bg-amber-500/10 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-500/10 truncate max-w-30"
              >
                {char}
              </span>
            ))}
            {account.stats.starsCount ? (
              <span className="bg-rose-500/10 text-rose-300 text-[10px] px-2 py-0.5 rounded border border-rose-500/15">
                ✦ {account.stats.starsCount} ⭐
              </span>
            ) : null}
          </div>

          {/* Details specs preview list */}
          <ul className="mt-4 text-[11px] text-stone-300/90 space-y-1 bg-red-950/40 p-2.5 rounded-xl border border-amber-500/5">
            {account.details.slice(0, 2).map((detail, index) => (
              <li
                key={index}
                className="flex items-center gap-1.5 truncate text-stone-300 text-left"
              >
                <span className="text-amber-400">✔</span> {detail}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 pt-3 border-t border-amber-500/10">
          {/* Prices Row */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-[10px] text-stone-400 line-through">
                {account.originalPrice.toLocaleString("vi-VN")} đ
              </p>
              <p className="text-base font-black text-amber-400">
                {account.price.toLocaleString("vi-VN")} đ
              </p>
            </div>
            {account.originalPrice > account.price ? (
              <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded">
                {t("productCard.discount")}{" "}
                {Math.round(
                  ((account.originalPrice - account.price) /
                    account.originalPrice) *
                    100,
                )}
                %
              </span>
            ) : null}
          </div>

          {/* Navigation Action Buttons (Detail & Purchase Buy) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelect(account)}
              className="bg-red-950 hover:bg-red-900 border border-amber-500/25 text-amber-200 py-2 px-1 rounded-xl text-xs font-black transition flex items-center justify-center gap-1"
            >
              {t("productCard.viewDetails")}
            </button>

            {isAvailable ? (
              <button
                onClick={() => onBuy(account)}
                className="bg-linear-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-red-950 py-2 px-1 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1 transition"
              >
                {t("productCard.buyNow")}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                disabled
                className="bg-stone-800 text-stone-400/80 py-2 px-1 rounded-xl text-xs font-bold cursor-not-allowed text-center"
              >
                {t("productCard.outOfStock")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
