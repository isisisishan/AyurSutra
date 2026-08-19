import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercent?: boolean;
  color?: "default" | "vata" | "pitta" | "kapha" | "success" | "warning";
  size?: "sm" | "md";
  className?: string;
  animated?: boolean;
}

const colorClasses = {
  default: "bg-black",
  vata: "bg-blue-500",
  pitta: "bg-orange-500",
  kapha: "bg-green-500",
  success: "bg-green-500",
  warning: "bg-amber-500",
};

const trackClasses = {
  default: "bg-neutral-100",
  vata: "bg-blue-100",
  pitta: "bg-orange-100",
  kapha: "bg-green-100",
  success: "bg-green-100",
  warning: "bg-amber-100",
};

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
};

export function ProgressBar({
  value,
  label,
  showPercent,
  color = "default",
  size = "md",
  className,
  animated,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-xs font-medium text-neutral-600">{label}</span>
          )}
          {showPercent && (
            <span className="text-xs font-semibold text-neutral-800">
              {clampedValue}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full rounded-full overflow-hidden",
          trackClasses[color],
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            colorClasses[color],
            animated && "animate-pulse-slow"
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
