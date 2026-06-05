import { useToastStore } from "../store/useToastStore";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => {
        let bgClass = "bg-[#2a0404]";
        let borderClass = "border-amber-500/30";
        let icon = <Info className="w-5 h-5 text-blue-400" />;

        if (toast.type === "success") {
          bgClass = "bg-emerald-950/95";
          borderClass = "border-emerald-500/40 text-emerald-300";
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        } else if (toast.type === "error") {
          bgClass = "bg-rose-950/95";
          borderClass = "border-rose-500/40 text-rose-300";
          icon = <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />;
        } else if (toast.type === "warning") {
          bgClass = "bg-amber-950/95";
          borderClass = "border-amber-500/40 text-amber-300";
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
        } else if (toast.type === "info") {
          bgClass = "bg-blue-950/95";
          borderClass = "border-blue-500/40 text-blue-300";
          icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`${bgClass} border ${borderClass} p-4 rounded-2xl shadow-2xl flex items-start justify-between gap-3 text-xs sm:text-sm font-semibold animate-in slide-in-from-right duration-250`}
          >
            <div className="flex items-start gap-2.5">
              {icon}
              <span className="leading-snug">{toast.message}</span>
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-white shrink-0 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
