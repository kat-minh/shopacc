import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToastStore } from "../store/useToastStore";
import { LuckyWheelGame, LuckyWheelPrize } from "../data";
import {
  Star,
  Play,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  HelpCircle as Help,
} from "lucide-react";

interface LuckyWheelProps {
  wheels: LuckyWheelGame[];
  userBalance: number;
  onSpinSuccess: (
    price: number,
    prize: LuckyWheelPrize,
    wheelTitle: string,
  ) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

export default function LuckyWheel({
  wheels,
  userBalance,
  onSpinSuccess,
  isSpinning,
  setIsSpinning,
}: LuckyWheelProps) {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const [activeWheel, setActiveWheel] = useState<LuckyWheelGame | null>(null);
  const [spinRotation, setSpinRotation] = useState<number>(0);
  const [spinRewardResult, setSpinRewardResult] =
    useState<LuckyWheelPrize | null>(null);
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);

  useEffect(() => {
    if (wheels.length > 0 && !activeWheel) {
      setActiveWheel(wheels[0]);
    }
  }, [wheels]);

  const wheelRef = useRef<HTMLDivElement>(null);

  // Helper vectors for SVG slice divisions
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const currentWheel = activeWheel || wheels[0];

  const handleSpinClick = () => {
    if (isSpinning || !currentWheel) return;

    if (userBalance < currentWheel.price) {
      addToast(
        t("luckyWheel.errBalance", {
          price: currentWheel.price.toLocaleString(),
          balance: userBalance.toLocaleString(),
        }),
        "error"
      );
      document
        .getElementById("recharge-anchor")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setIsSpinning(true);
    setSpinRewardResult(null);

    // Rate-based award logic matching database chances config
    const r = Math.random() * 100;
    let accumulated = 0;
    let selectedIndex = 0;

    for (let i = 0; i < currentWheel.prizes.length; i++) {
      accumulated += currentWheel.prizes[i].chance;
      if (r <= accumulated) {
        selectedIndex = i;
        break;
      }
    }

    const reward = currentWheel.prizes[selectedIndex];
    setSpinRewardResult(reward);

    // Mathematical rotation placement
    const totalSlices = currentWheel.prizes.length;
    const degreePerSlice = 360 / totalSlices;
    const targetSliceDegree =
      360 - selectedIndex * degreePerSlice - degreePerSlice / 2;
    // Rotate several full rounds (between 5 and 7) + exact slice destination offsets
    const extraRounds = 360 * 6;
    const totalRotation = extraRounds + targetSliceDegree;

    // Reset current styling angles
    setSpinRotation(spinRotation % 360);

    // Boot animation
    setTimeout(() => {
      setSpinRotation(totalRotation);
    }, 50);

    // Timeout execution
    setTimeout(() => {
      setIsSpinning(false);
      setShowRewardModal(true);

      // Raise up results to state synchronized
      onSpinSuccess(currentWheel.price, reward, currentWheel.title);
    }, 4100);
  };

  return (
    <section
      className="bg-[#4d0808] p-4 sm:p-6 rounded-3xl border-2 border-amber-500/40 shadow-xl"
      id="quay-thu"
    >
      <div className="flex items-center justify-between border-b border-amber-500/15 pb-3 mb-6">
        <h3 className="text-xl md:text-2xl font-black text-amber-300 tracking-wide flex items-center gap-2 uppercase">
          <span className="animate-spin text-amber-400">☸</span> {t("luckyWheel.title")}
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-red-950/40 p-4 sm:p-6 rounded-2xl border border-amber-500/10">
        {/* LEFT COLUMN: VISUAL SEGMENTS WHEEL */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-red-950 rounded-2xl border border-amber-500/20 relative overflow-hidden text-center">
          <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-amber-400/40 to-transparent"></div>

          <h4 className="text-amber-400 font-extrabold text-sm uppercase tracking-wide">
            {currentWheel?.title || t("luckyWheel.updatingGame")}
          </h4>
          <p className="text-stone-300 text-xs mt-1 mb-6">
            {t("luckyWheel.spinPrice", { price: currentWheel?.price.toLocaleString() || "35,000" })}
          </p>

          <div className="relative w-64 h-64 sm:w-72 sm:h-72 select-none mb-6">
            {/* Top Triangle Pin Indicator */}
            <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 z-30 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-amber-400"></div>
              <div className="w-1.5 h-6 bg-amber-400 mx-auto rounded-b"></div>
            </div>

            {/* Glowing outer circle bumper */}
            <div className="absolute inset-0 rounded-full border-[8px] border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] z-10 pointer-events-none"></div>

            {/* Rotary SVG panel */}
            <div
              ref={wheelRef}
              style={{
                transform: `rotate(${spinRotation}deg)`,
                transition: isSpinning
                  ? "transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)"
                  : "none",
              }}
              className="w-full h-full rounded-full overflow-hidden border-4 border-amber-300 flex items-center justify-center bg-[#1c0202]"
            >
              {currentWheel && currentWheel.prizes.length > 0 ? (
                <svg viewBox="-1 -1 2 2" className="w-full h-full -rotate-90">
                  {currentWheel.prizes.map((prize, idx, arr) => {
                    const total = arr.length;
                    const startPercent = idx / total;
                    const endPercent = (idx + 1) / total;

                    const [startX, startY] =
                      getCoordinatesForPercent(startPercent);
                    const [endX, endY] = getCoordinatesForPercent(endPercent);

                    const pathData = [
                      `M 0 0`,
                      `L ${startX} ${startY}`,
                      `A 1 1 0 0 1 ${endX} ${endY}`,
                      `Z`,
                    ].join(" ");

                    const midAngle = (360 * (startPercent + endPercent)) / 2;

                    return (
                      <g key={idx}>
                        <path
                          d={pathData}
                          fill={prize.color}
                          stroke="#2c0404"
                          strokeWidth="0.015"
                        />
                        <g
                          transform={`rotate(${midAngle}) translate(0.65) rotate(90)`}
                        >
                          <text
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="0.08"
                            fontWeight="extrabold"
                            className="font-sans fill-stone-100 font-black tracking-tighter select-none"
                          >
                            {prize.name.slice(0, 15)}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>
              ) : null}

              {/* Center pointer circle wheel pin */}
              <div className="absolute w-12 h-12 bg-amber-400 rounded-full z-20 flex items-center justify-center shadow-lg border-2 border-red-950">
                <span className="text-red-950 font-black text-[9px] uppercase tracking-tighter">
                  SPIN
                </span>
              </div>
            </div>
          </div>

          <button
            disabled={isSpinning || !currentWheel}
            onClick={handleSpinClick}
            id="spin-trigger-btn"
            className={`w-full max-w-xs font-black py-3 px-6 rounded-xl border-y-2 border-amber-300 text-xs sm:text-sm uppercase tracking-widest shadow-lg transform active:scale-95 transition-all duration-200 ${
              isSpinning
                ? "bg-stone-600 text-stone-300 border-none cursor-not-allowed"
                : "bg-linear-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white"
            }`}
          >
            {isSpinning ? t("luckyWheel.spinning") : t("luckyWheel.spinNow")}
          </button>
        </div>

        {/* RIGHT COLUMN: LIST OF AVAILABLE WHEEL GAMES */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 text-xs sm:text-sm leading-relaxed text-stone-300">
            💡 <strong className="text-amber-300">{t("luckyWheel.rulesTitle")}</strong>{" "}
            {t("luckyWheel.rulesDesc")}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wheels.map((wh) => (
              <div
                key={wh.id}
                onClick={() => {
                  if (!isSpinning) {
                    setActiveWheel(wh);
                  }
                }}
                className={`bg-[#2c0404] p-4 rounded-2xl border transition duration-200 cursor-pointer ${
                  currentWheel?.id === wh.id
                    ? "border-2 border-amber-400 ring-2 ring-amber-500/20 bg-red-900/40"
                    : "border-amber-500/10 hover:border-amber-500/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-stone-900 overflow-hidden shrink-0 border border-amber-500/20">
                    <img
                      src={wh.imageUrl}
                      alt={wh.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="bg-[#4d0808] text-amber-300 font-bold px-2 py-0.5 rounded text-[9px] uppercase">
                      {t("luckyWheel.playedCount", { count: wh.playedCount })}
                    </span>
                    <h5 className="font-extrabold text-stone-100 text-xs uppercase leading-snug line-clamp-1">
                      {wh.title}
                    </h5>
                    <p className="text-rose-300 text-xs font-bold">
                      {t("luckyWheel.priceLabel", { price: wh.price.toLocaleString() })}
                    </p>
                  </div>
                </div>

                {/* Slices representation bullet list info */}
                <div className="mt-3 pt-2.5 border-t border-amber-500/5 grid grid-cols-2 gap-1.5 text-[10px] text-stone-400">
                  {wh.prizes.slice(0, 4).map((pri) => (
                    <div key={pri.id} className="flex items-center gap-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: pri.color }}
                      ></span>
                      <span className="truncate">{pri.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* POPUP REWARD NOTICE MODAL */}
      {showRewardModal && spinRewardResult && (
        <div 
          onClick={() => {
            setShowRewardModal(false);
            setSpinRewardResult(null);
          }}
          className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#4d0808] max-w-sm w-full p-6 h-auto rounded-3xl border-2 border-amber-400/80 text-center space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-200"
          >
            <div className="inline-flex p-3 bg-red-950 rounded-full text-amber-300 border border-amber-400 animate-pulse">
              <Sparkles className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-black text-amber-300 uppercase">
                {t("luckyWheel.modalCongratulation")}
              </h4>
              <p className="text-xs text-stone-300">
                {t("luckyWheel.modalSubtitle")}
              </p>
            </div>

            <div className="bg-[#2c0404] p-4 rounded-2xl border border-amber-400/30">
              <span className="text-[10px] text-stone-400 block uppercase font-bold mb-1">
                {t("luckyWheel.modalPrizeLabel")}
              </span>
              <p
                className="text-lg font-black text-amber-400 font-sans"
                style={{ color: spinRewardResult.color }}
              >
                {spinRewardResult.name}
              </p>
              <p className="text-[10px] text-stone-300 mt-2">
                {t("luckyWheel.modalChanceLabel", { chance: spinRewardResult.chance })}
              </p>
            </div>

            <button
              onClick={() => {
                setShowRewardModal(false);
                setSpinRewardResult(null);
              }}
              className="w-full bg-linear-to-r from-amber-400 to-yellow-400 text-red-950 font-black py-2.5 rounded-xl text-xs uppercase cursor-pointer"
            >
              {t("luckyWheel.modalBtnAccept")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
