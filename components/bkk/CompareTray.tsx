import { cn } from "@/lib/utils";
import { Scale, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CompareTrayProps {
  selectedCount: number;
  maxCount?: number;
  selectedNames: string[];
  onClear: (index: number) => void;
  onClearAll: () => void;
  onCompare: () => void;
  className?: string;
}

export function CompareTray({
  selectedCount,
  maxCount = 3,
  selectedNames,
  onClear,
  onClearAll,
  onCompare,
  className,
}: CompareTrayProps) {
  if (selectedCount === 0) return null;

  const buttonLabel =
    selectedCount === 1
      ? "Select 1 more to compare"
      : `Compare ${selectedCount} formulations`;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-40",
        "bg-neutral-900 rounded-xl shadow-2xl border border-neutral-700",
        "px-4 py-3 flex items-center gap-3",
        "animate-fade-in",
        "w-[calc(100vw-2rem)] max-w-[640px]",
        className
      )}
    >
      <Scale className="w-4 h-4 text-neutral-400 flex-shrink-0" />

      {/* Chips */}
      <div className="flex-1 flex items-center gap-2 flex-wrap min-w-0 overflow-hidden">
        {selectedNames.map((name, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-neutral-800 rounded-full px-2.5 py-1 text-xs text-white flex-shrink-0"
          >
            <span className="max-w-[120px] truncate">
              {name}
            </span>
            <button
              onClick={() => onClear(i)}
              className="text-neutral-400 hover:text-white transition-colors ml-0.5 flex-shrink-0"
              aria-label={`Remove ${name} from comparison`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onClearAll}
          className="text-xs text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
        >
          Clear all
        </button>
        <Button
          size="sm"
          variant="primary"
          onClick={onCompare}
          disabled={selectedCount < 2}
          className="bg-white text-neutral-900 hover:bg-neutral-100 whitespace-nowrap"
          id="compare-now-btn"
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
