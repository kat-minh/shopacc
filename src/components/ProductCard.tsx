import { GameAccount } from "../data";
import { useTranslation } from "react-i18next";
import { Gamepad2, ArrowRight, ShoppingBag } from "lucide-react";

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
  const isIOS = account.category.toLowerCase().includes("ios") || account.title.toLowerCase().includes("ios");
  const platformText = isIOS ? "IOS" : "ANDROID";
  const platformBg = isIOS ? "bg-blue-500" : "bg-emerald-600";

  return (
    <div className="bg-[#1c0202]/90 rounded-2xl border border-amber-500/10 hover:border-amber-400/50 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative flex flex-col h-full justify-between p-3.5">
      <div>
        {/* Top Image Banner Section */}
        {/* translateZ(0) isolates this onto its own GPU layer so the constantly
            repainting hero video + marquee don't force an animated GIF here to
            re-rasterize (which caused the flicker). */}
        <div
          className="h-36 sm:h-44 w-full bg-stone-900 relative rounded-xl overflow-hidden mb-3"
          style={{ transform: "translateZ(0)", willChange: "transform" }}
        >
          {/* Detect large base64 images and show placeholder instead */}
          {account.imageUrl && account.imageUrl.startsWith("data:") ? (
            <div
              className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-900 to-red-950/50 cursor-pointer select-none"
              onClick={() => onSelect(account)}
            >
              <Gamepad2 className="w-10 h-10 text-amber-500/60 mb-1" />
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wide">Game Account</span>
            </div>
          ) : (
            <img
              src={account.imageUrl}
              alt={account.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-500 cursor-pointer"
              style={{ backfaceVisibility: "hidden" }}
              onClick={() => onSelect(account)}
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.classList.add("flex", "items-center", "justify-center", "bg-gradient-to-br", "from-stone-900", "to-red-950/50");
                }
              }}
            />
          )}

          {/* Platform Badge (Top Left) */}
          <div className="absolute top-2.5 left-2.5">
            <span className={`text-white font-extrabold text-[10px] px-2.5 py-1 rounded shadow uppercase ${platformBg}`}>
              {platformText}
            </span>
          </div>

          {/* Discount Badge (Top Right) */}
          {account.originalPrice > account.price && (
            <div className="absolute top-2.5 right-2.5">
              <span className="bg-orange-600 text-white font-black text-[10px] px-2 py-1 rounded shadow">
                -{Math.round(((account.originalPrice - account.price) / account.originalPrice) * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Product Information Body */}
        <h4
          className="font-extrabold text-[#ffffff] text-sm leading-snug line-clamp-2 hover:underline cursor-pointer transition min-h-10"
          onClick={() => onSelect(account)}
        >
          {account.title}
        </h4>

        {/* Stock & Sold Display Row */}
        <div className="flex items-center justify-between text-[11px] text-stone-400 font-bold mt-2 border-t border-amber-500/5 pt-2">
          <div className="flex items-center gap-1.5">
            <Gamepad2 className="w-3.5 h-3.5 text-amber-500/70" />
            <span>{t("productCard.stockCount", { count: account.quantity ?? 1 })}</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400/90">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t("productCard.soldCount", { count: account.soldCount ?? Math.floor((account.price % 900) / 15) + 12 })}</span>
          </div>
        </div>

        {/* Price & Original Price Row */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-base font-black text-amber-400">
            {account.price.toLocaleString("vi-VN")} đ
          </span>
          {account.originalPrice > account.price && (
            <span className="text-xs text-stone-400 line-through">
              {account.originalPrice.toLocaleString("vi-VN")} đ
            </span>
          )}
        </div>
      </div>

      {/* Full-width Button */}
      <div className="mt-4">
        {isAvailable ? (
          <button
            onClick={() => onBuy(account)}
            className="w-full bg-linear-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-red-950 py-2.5 rounded-xl text-xs font-black shadow-md transition duration-150 transform active:scale-95 cursor-pointer uppercase"
          >
            {t("productCard.buyNow")}
          </button>
        ) : (
          <button
            disabled
            className="w-full bg-stone-850 text-stone-500 py-2.5 rounded-xl text-xs font-bold cursor-not-allowed text-center uppercase"
          >
            {t("productCard.outOfStock")}
          </button>
        )}
      </div>
    </div>
  );
}
