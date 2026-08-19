import { cn } from "@/lib/utils";
import type { AlertSeverity } from "@/lib/services/bkk-safety-rules";
import type { SafetyAlert } from "@/lib/services/bkk-safety-rules";
import { AlertTriangle, XCircle, Info } from "lucide-react";

const configs: Record<
  AlertSeverity,
  { label: string; icon: typeof AlertTriangle; classes: string; iconClass: string }
> = {
  exclude: {
    label: "Excluded",
    icon: XCircle,
    classes: "bg-red-50 border-red-200 text-red-800",
    iconClass: "text-red-500",
  },
  caution: {
    label: "Caution",
    icon: AlertTriangle,
    classes: "bg-amber-50 border-amber-200 text-amber-800",
    iconClass: "text-amber-500",
  },
  review: {
    label: "Review Required",
    icon: Info,
    classes: "bg-blue-50 border-blue-200 text-blue-800",
    iconClass: "text-blue-500",
  },
};

interface SafetyAlertBadgeProps {
  alert: SafetyAlert;
  compact?: boolean;
  className?: string;
}

export function SafetyAlertBadge({ alert, compact = false, className }: SafetyAlertBadgeProps) {
  const config = configs[alert.severity];
  const Icon = config.icon;

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
          config.classes,
          className
        )}
        title={alert.message}
      >
        <Icon className={cn("w-3 h-3", config.iconClass)} />
        {config.label}
      </span>
    );
  }

  return (
    <div className={cn("rounded-lg border p-3 text-sm", config.classes, className)}>
      <div className="flex items-start gap-2">
        <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", config.iconClass)} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-xs">{alert.title}</p>
          <p className="text-xs mt-0.5 leading-relaxed opacity-90">{alert.message}</p>
          <p className="text-[10px] mt-1 font-medium opacity-80">{alert.recommendation}</p>
        </div>
      </div>
    </div>
  );
}

interface SafetyAlertSummaryProps {
  alerts: SafetyAlert[];
  className?: string;
}

export function SafetyAlertSummary({ alerts, className }: SafetyAlertSummaryProps) {
  if (alerts.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {alerts.map((a) => (
        <SafetyAlertBadge key={a.ruleId} alert={a} compact />
      ))}
    </div>
  );
}
