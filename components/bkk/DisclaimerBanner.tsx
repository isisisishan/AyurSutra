"use client";
import { ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DisclaimerBannerProps {
  dismissible?: boolean;
  className?: string;
  compact?: boolean;
}

export function DisclaimerBanner({ dismissible = false, className, compact = false }: DisclaimerBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className={cn("bg-amber-50 border border-amber-200 rounded-lg", className)}>
      <div className={cn("flex items-start gap-3", compact ? "p-3" : "p-4")}>
        <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className={cn("text-amber-800 leading-relaxed", compact ? "text-xs" : "text-sm")}>
            <span className="font-semibold">For learning and wellness awareness</span>
          </p>
          <p className={cn("text-amber-700 leading-relaxed mt-1", compact ? "text-xs" : "text-sm")}>
            Explore Ayurvedic knowledge to understand traditional formulations and ingredients.
            This tool does not diagnose conditions, recommend personalised treatment, or replace
            advice from a qualified Ayurvedic practitioner.
          </p>
        </div>
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 text-amber-400 hover:text-amber-600 transition-colors"
            aria-label="Dismiss disclaimer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
