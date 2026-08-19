import { cn } from "@/lib/utils";
import { BookOpen, Leaf, Scale, Info, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { BKKRecord } from "@/lib/services/bkk-engine";
import type { SafetyAlert } from "@/lib/services/bkk-safety-rules";
import { SafetyAlertSummary } from "./SafetyAlertBadge";

interface FormulationCardProps {
  record: BKKRecord;
  mode: "public" | "doctor";
  score?: number;
  matchReasons?: string[];
  matchedTags?: string[];
  safetyAlerts?: SafetyAlert[];
  isExcluded?: boolean;
  isSelected?: boolean;
  isInCompare?: boolean;
  onViewDetail?: () => void;
  onToggleCompare?: () => void;
  onSelectForReview?: () => void;
  onReject?: () => void;
  className?: string;
}

const TYPE_COLORS: Record<string, string> = {
  "Churna": "bg-green-50 text-green-700 border-green-200",
  "Vati/Gutika": "bg-blue-50 text-blue-700 border-blue-200",
  "Ghrita": "bg-amber-50 text-amber-700 border-amber-200",
  "Taila": "bg-orange-50 text-orange-700 border-orange-200",
  "Asava/Arishta": "bg-purple-50 text-purple-700 border-purple-200",
  "Avaleha/Leha": "bg-rose-50 text-rose-700 border-rose-200",
  "Kwatha/Kashayam": "bg-teal-50 text-teal-700 border-teal-200",
  "Bhasma/Pishti": "bg-neutral-100 text-neutral-700 border-neutral-300",
};

function getTypeColor(type: string): string {
  return TYPE_COLORS[type] ?? "bg-neutral-100 text-neutral-600 border-neutral-200";
}

export function FormulationCard({
  record,
  mode,
  score,
  matchReasons = [],
  matchedTags = [],
  safetyAlerts = [],
  isExcluded = false,
  isSelected = false,
  isInCompare = false,
  onViewDetail,
  onToggleCompare,
  onSelectForReview,
  onReject,
  className,
}: FormulationCardProps) {
  const excludedAlert = safetyAlerts.filter((a) => a.severity === "exclude");
  const otherAlerts = safetyAlerts.filter((a) => a.severity !== "exclude");

  return (
    <div
      className={cn(
        "bg-white rounded-xl border transition-all duration-200",
        isExcluded ? "border-red-200 opacity-70" : isSelected ? "border-neutral-900 shadow-md" : "border-neutral-100 hover:border-neutral-200 hover:shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-semibold text-neutral-900 text-base leading-tight">{record.name}</h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border", getTypeColor(record.type))}>
                {record.type}
              </span>
              <span className="text-[10px] text-neutral-400">{record.category}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <Badge variant="info" size="sm">Source cited</Badge>
            {mode === "doctor" && score !== undefined && score > 0 && (
              <span className="text-[10px] text-neutral-400 font-mono">score: {score}</span>
            )}
          </div>
        </div>

        {/* Safety alerts in doctor mode */}
        {mode === "doctor" && safetyAlerts.length > 0 && (
          <SafetyAlertSummary alerts={safetyAlerts} className="mb-2" />
        )}
        {mode === "doctor" && isExcluded && (
          <p className="text-xs text-red-600 font-medium mb-2">⚠ Excluded due to patient allergy match</p>
        )}

        {/* Main ingredients */}
        <div className="flex items-start gap-1.5 mb-2">
          <Leaf className="w-3 h-3 text-neutral-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-neutral-600 leading-relaxed">
            <span className="font-medium">Main ingredients: </span>
            {record.main_ingredients.length > 0 ? record.main_ingredients.slice(0, 4).join(", ") + (record.main_ingredients.length > 4 ? ` +${record.main_ingredients.length - 4} more` : "") : "Not available in source record."}
          </p>
        </div>

        {/* Classical reference */}
        <div className="flex items-start gap-1.5 mb-2">
          <BookOpen className="w-3 h-3 text-neutral-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-neutral-500 italic leading-relaxed">
            {record.reference || "Not available in source record."}
          </p>
        </div>

        {/* Matched tags */}
        {matchedTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {matchedTags.slice(0, 4).map((tag) => (
              <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100">
                ✓ {tag}
              </span>
            ))}
          </div>
        )}

        {/* Why shown explanation */}
        {mode === "doctor" && matchReasons.length > 0 && (
          <div className="bg-neutral-50 rounded-lg p-2.5 mb-2 border border-neutral-100">
            <div className="flex items-start gap-1.5">
              <Info className="w-3 h-3 text-neutral-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-neutral-600 mb-0.5">Why shown?</p>
                {matchReasons.slice(0, 2).map((r, i) => (
                  <p key={i} className="text-[10px] text-neutral-500 leading-relaxed">{r}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-4 pb-4 flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant="secondary"
          onClick={onViewDetail}
          rightIcon={<ChevronRight className="w-3 h-3" />}
          id={`view-detail-${record.id}`}
        >
          View details
        </Button>
        {!isExcluded && (
          <Button
            size="sm"
            variant={isInCompare ? "primary" : "outline"}
            onClick={onToggleCompare}
            leftIcon={<Scale className="w-3 h-3" />}
            id={`compare-${record.id}`}
          >
            {isInCompare ? "Remove from comparison" : "Compare"}
          </Button>
        )}
        {mode === "doctor" && !isExcluded && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={onSelectForReview}
              className="text-emerald-700 hover:bg-emerald-50"
              id={`select-${record.id}`}
            >
              Select for review
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onReject}
              className="text-red-600 hover:bg-red-50"
              id={`reject-${record.id}`}
            >
              Reject
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
