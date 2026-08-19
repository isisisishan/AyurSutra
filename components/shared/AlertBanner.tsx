import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { AlertTriangle, Info, CheckCircle, XCircle, X } from "lucide-react";
import { useState } from "react";

type AlertType = "info" | "success" | "warning" | "error" | "emergency";

interface AlertBannerProps {
  type: AlertType;
  title?: string;
  message: string;
  dismissible?: boolean;
  action?: ReactNode;
  className?: string;
}

const typeConfig: Record<
  AlertType,
  { bg: string; border: string; icon: ReactNode; titleColor: string; msgColor: string }
> = {
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <Info className="w-4 h-4 text-blue-500" />,
    titleColor: "text-blue-800",
    msgColor: "text-blue-700",
  },
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: <CheckCircle className="w-4 h-4 text-green-500" />,
    titleColor: "text-green-800",
    msgColor: "text-green-700",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    titleColor: "text-amber-800",
    msgColor: "text-amber-700",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: <XCircle className="w-4 h-4 text-red-500" />,
    titleColor: "text-red-800",
    msgColor: "text-red-700",
  },
  emergency: {
    bg: "bg-red-600",
    border: "border-red-700",
    icon: <AlertTriangle className="w-4 h-4 text-white" />,
    titleColor: "text-white",
    msgColor: "text-red-100",
  },
};

export function AlertBanner({
  type,
  title,
  message,
  dismissible,
  action,
  className,
}: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const config = typeConfig[type];

  return (
    <div
      className={cn(
        "rounded-lg border p-4 flex items-start gap-3",
        config.bg,
        config.border,
        className
      )}
      role="alert"
    >
      <span className="flex-shrink-0 mt-0.5">{config.icon}</span>
      <div className="flex-1">
        {title && (
          <p className={cn("font-semibold text-sm", config.titleColor)}>{title}</p>
        )}
        <p className={cn("text-sm", title ? "mt-0.5" : "", config.msgColor)}>
          {message}
        </p>
        {action && <div className="mt-2">{action}</div>}
      </div>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
