import { Shield, User, Coins } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/useAuthStore";

interface UserProfileProps {
  onBack: () => void;
}

export default function UserProfile({ onBack }: UserProfileProps) {
  const { currentUser, isAdmin } = useAuthStore();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="bg-[#4d0808] p-6 sm:p-8 rounded-3xl border-2 border-amber-500/40 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-amber-400/5 to-transparent rounded-bl-full pointer-events-none"></div>

        <div className="border-b border-amber-500/15 pb-4">
          <h3 className="text-xl md:text-2xl font-black text-amber-300 uppercase tracking-wider">
            {t("userProfile.title")}
          </h3>
          <p className="text-xs text-rose-300 font-semibold mt-1">
            {t("userProfile.subtitle")}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-950/60 rounded-2xl border border-amber-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-black block">
                  {t("userProfile.usernameId")}
                </span>
                <span className="text-sm font-bold text-stone-100">
                  {currentUser.username}
                </span>
              </div>
            </div>
            <span className="bg-amber-500 text-red-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-300">
              {isAdmin ? t("userProfile.roleAdmin") : t("userProfile.roleMember")}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-950/60 rounded-2xl border border-amber-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-black block">
                  {t("userProfile.currentBalance")}
                </span>
                <span className="text-sm font-bold text-stone-100">
                  {(currentUser.balance ?? 0).toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
            <span className="text-xs text-amber-400 font-black">{t("userProfile.available")}</span>
          </div>

          <div className="flex items-center gap-3 p-4 bg-red-950/60 rounded-2xl border border-amber-500/10">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-black block">
                {t("userProfile.security")}
              </span>
              <span className="text-xs font-semibold text-emerald-400">
                {t("userProfile.securityStatus")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
