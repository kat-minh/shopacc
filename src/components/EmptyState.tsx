import { Inbox, FolderOpen, Database } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  iconType?: "inbox" | "folder" | "database";
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title = "Không tìm thấy dữ liệu",
  description = "Hiện tại không có mục nào khớp với điều kiện tìm kiếm của bạn.",
  iconType = "inbox",
  actionText,
  onAction,
}: EmptyStateProps) {
  
  const renderIcon = () => {
    const iconClass = "w-10 h-10 text-amber-500/60 animate-bounce duration-1000";
    switch (iconType) {
      case "folder":
        return <FolderOpen className={iconClass} />;
      case "database":
        return <Database className={iconClass} />;
      case "inbox":
      default:
        return <Inbox className={iconClass} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 py-12 text-center bg-red-950/10 rounded-3xl border border-dashed border-amber-500/15 max-w-lg mx-auto space-y-4">
      {/* Icon Frame */}
      <div className="p-4 bg-red-950/30 rounded-full border border-amber-500/10">
        {renderIcon()}
      </div>

      {/* Description text */}
      <div className="space-y-1">
        <h6 className="text-sm font-black text-stone-200 uppercase tracking-wide">
          {title}
        </h6>
        <p className="text-xs text-stone-400 font-semibold leading-relaxed max-w-sm">
          {description}
        </p>
      </div>

      {/* Optional action CTA */}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="bg-amber-500 hover:bg-amber-400 text-red-950 font-black text-xs py-2 px-5 rounded-xl shadow-md transition transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
