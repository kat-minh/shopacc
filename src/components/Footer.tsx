import { ShieldCheck, HelpCircle, Gamepad2, Info, Facebook, MessageCircle, Phone } from 'lucide-react';
import { useTranslation } from "react-i18next";

interface FooterProps {
  phone: string;
  zalo: string;
  facebook: string;
  brandName?: string;
  aboutText?: string;
  hours?: string;
  policy?: string;
  copyright?: string;
}

export default function Footer({
  phone,
  zalo,
  facebook,
  brandName,
  aboutText,
  hours,
  policy,
  copyright
}: FooterProps) {
  const { t } = useTranslation();
  return (
    <footer className="bg-[#1a0202] border-t-4 border-amber-600/60 mt-20 text-stone-300 pb-12 pt-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* About column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-black text-amber-400 uppercase tracking-widest">
              {brandName || t("header.title")}
            </h4>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            {aboutText || t("footer.about")}
          </p>
          <div className="flex items-center gap-2 bg-[#2d0505] p-2.5 rounded-lg border border-amber-500/10">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-[11px]">
              <p className="font-bold text-stone-200">{t("footer.securityCommitment")}</p>
              <p className="text-stone-400">{t("footer.securityWarning")}</p>
            </div>
          </div>
        </div>

        {/* Categories / Games column */}
        <div>
          <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
            {t("footer.productsTitle")}
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <a href="#cua-hang" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                {t("footer.prodReroll")}
              </a>
            </li>
            <li>
              <a href="#cua-hang" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                {t("footer.prodCrystals")}
              </a>
            </li>
            <li>
              <a href="#cua-hang" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                {t("footer.prodVip")}
              </a>
            </li>
            <li>
              <a href="#quay-thu" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                {t("footer.prodWheel")}
              </a>
            </li>
          </ul>
        </div>

        {/* Contact info support details */}
        <div>
          <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
            {t("footer.supportTitle")}
          </h4>
          <ul className="space-y-2.5 text-xs text-stone-400">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t("footer.hotline")} <strong className="text-amber-400">{phone}</strong></span>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{t("footer.zalo")} <strong className="text-amber-400"><a href={zalo} target="_blank" rel="noopener noreferrer" className="hover:underline">{phone}</a></strong></span>
            </li>
            <li className="flex items-center gap-2">
              <Facebook className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{t("footer.fanpage")} <a href={facebook} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Fanpage Facebook</a></span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose-400">⏱</span>
              <span>{t("footer.hours")} <strong className="text-stone-200">{hours || t("footer.hoursValue")}</strong></span>
            </li>
          </ul>
        </div>

        {/* Guidelines Terms Column */}
        <div className="space-y-3 text-xs">
          <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider border-l-2 border-amber-500 pl-2">
            {t("footer.policyTitle")}
          </h4>
          <p className="text-stone-400 text-xs leading-relaxed">
            {policy || t("footer.policyDesc")}
          </p>
          <div className="bg-red-950/40 p-2 rounded-lg border border-red-800/20 text-[10px] text-justify text-stone-500 leading-normal text-wrap">
            {copyright || t("footer.copyright")}
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-amber-950/80 text-center text-xs text-stone-500">
        <p>© {new Date().getFullYear()} {brandName || "Hainagaming || Siêu Thị Account Reroll Dragon Ball Legend"}. {t("footer.footerRights")}</p>
      </div>
    </footer>
  );
}
