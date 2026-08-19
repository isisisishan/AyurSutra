import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  children,
  hover,
  padding = "md",
  className,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "bg-white rounded-lg border border-neutral-100",
        "shadow-[0_1px_2px_oklch(0_0_0/0.04),0_4px_12px_oklch(0_0_0/0.06)]",
        paddingClasses[padding],
        hover &&
          "transition-all duration-200 hover:shadow-[0_2px_4px_oklch(0_0_0/0.05),0_8px_24px_oklch(0_0_0/0.1)] hover:-translate-y-px cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <span className="flex-shrink-0 text-neutral-500 mt-0.5">{icon}</span>
        )}
        <div>
          <h3 className="font-semibold text-neutral-900 text-base leading-snug">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
