import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title = "Xác nhận hành động",
  message,
  confirmText = "Đồng ý",
  cancelText = "Hủy bỏ",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div 
      onClick={onCancel}
      className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[999] overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#4d0808] border-2 border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-200"
      >
        
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-stone-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dialog Header */}
        <div className="flex items-center gap-3 border-b border-amber-500/20 pb-3">
          <div className="p-2 bg-amber-500/10 rounded-full border border-amber-500/25">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <h4 className="font-extrabold uppercase text-sm text-stone-100">
            {title}
          </h4>
        </div>

        {/* Dialog Body */}
        <p className="text-xs sm:text-sm text-stone-300 font-semibold leading-relaxed">
          {message}
        </p>

        {/* Dialog Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-stone-900 hover:bg-neutral-800 text-stone-300 py-2 px-4 rounded-xl border border-amber-500/15 text-xs font-black uppercase transition cursor-pointer"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-red-950 py-2 px-4 rounded-xl text-xs font-black uppercase transition cursor-pointer shadow-lg shadow-amber-500/20"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
