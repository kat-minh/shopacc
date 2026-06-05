import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingState({ message, fullScreen = false }: LoadingStateProps) {
  const { t } = useTranslation();
  const loadingText = message || t("loading.default", "Đang tải dữ liệu, vui lòng chờ...");

  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      {/* Premium thematic spinner */}
      <div className="relative flex items-center justify-center">
        {/* Glow backdrop ring */}
        <div className="absolute w-16 h-16 rounded-full border-4 border-amber-500/20 animate-ping duration-1000" />
        {/* Secondary energy pulse */}
        <div className="absolute w-12 h-12 rounded-full border-4 border-rose-500/10 animate-pulse" />
        {/* Master Spinner */}
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
      
      {/* Branding & description */}
      <div className="space-y-1">
        <h5 className="text-xs uppercase tracking-widest font-black text-amber-300 font-mono animate-pulse">
          HAINAGAMING.COM
        </h5>
        <p className="text-stone-400 text-xs font-bold font-sans">
          {loadingText}
        </p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#1c0202] z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center py-12">
      {content}
    </div>
  );
}
