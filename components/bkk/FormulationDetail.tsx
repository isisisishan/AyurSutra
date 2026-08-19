import { cn } from "@/lib/utils";
import { BookOpen, Leaf, X, ExternalLink, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { BKKRecord } from "@/lib/services/bkk-engine";
import type { SafetyAlert } from "@/lib/services/bkk-safety-rules";
import { SafetyAlertBadge } from "./SafetyAlertBadge";
import { DisclaimerBanner } from "./DisclaimerBanner";

const FIELD_NA = "Not available in source record.";

function Field({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  const isNA = value === FIELD_NA || !value;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">{label}</p>
      <p className={cn("text-sm leading-relaxed", isNA ? "text-neutral-400 italic text-xs" : "text-neutral-800", highlight && "font-medium")}>
        {value || FIELD_NA}
      </p>
    </div>
  );
}

function DataCompletenessIndicator({ record }: { record: BKKRecord }) {
  const fields = [
    { label: "Ingredients", present: record.ingredients !== FIELD_NA },
    { label: "Reference", present: record.reference !== FIELD_NA },
    { label: "Indications", present: record.indications !== FIELD_NA },
    { label: "Dosage", present: record.dosage !== FIELD_NA },
    { label: "Anupana", present: record.anupana !== FIELD_NA },
  ];
  const presentCount = fields.filter((f) => f.present).length;
  const pct = Math.round((presentCount / fields.length) * 100);

  return (
    <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Source record completeness</p>
        <span className="text-[10px] font-mono text-neutral-600">{pct}%</span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {fields.map((f) => (
          <span
            key={f.label}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]",
              f.present ? "bg-green-50 text-green-700 border border-green-200" : "bg-neutral-100 text-neutral-400 border border-neutral-200"
            )}
          >
            {f.present ? <CheckCircle className="w-2.5 h-2.5" /> : <span className="w-2.5 h-2.5 rounded-full border border-neutral-300 inline-block" />}
            {f.label}
          </span>
        ))}
      </div>
    </div>
  );
}

interface FormulationDetailProps {
  record: BKKRecord;
  mode: "public" | "doctor";
  safetyAlerts?: SafetyAlert[];
  relatedRecords?: BKKRecord[];
  onClose?: () => void;
  onViewRelated?: (id: string) => void;
}

export function FormulationDetail({
  record,
  mode,
  safetyAlerts = [],
  relatedRecords = [],
  onClose,
  onViewRelated,
}: FormulationDetailProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-6 border-b border-neutral-100">
        <div className="flex-1 min-w-0">
          <h2 className="font-serif font-semibold text-2xl text-neutral-900 leading-tight mb-1">
            {record.name}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="muted">{record.type}</Badge>
            <Badge variant="muted">{record.category}</Badge>
            <Badge variant="info" size="sm">Source cited</Badge>
            <Badge variant="outline" size="sm">
              Unreviewed tags · expert validation pending
            </Badge>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
            aria-label="Close detail"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Safety alerts (doctor only) */}
        {mode === "doctor" && safetyAlerts.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Safety Review</p>
            {safetyAlerts.map((a) => (
              <SafetyAlertBadge key={a.ruleId} alert={a} />
            ))}
          </div>
        )}

        {/* Data completeness */}
        <DataCompletenessIndicator record={record} />

        {/* Core fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Formulation Type" value={record.type} />
          <Field label="Category / System" value={record.category} />
        </div>

        <div className="border-t border-neutral-100 pt-4">
          <Field label="Main Ingredients" value={record.main_ingredients.join(", ") || FIELD_NA} highlight />
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Full Ingredients</p>
          <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
            <p className="text-sm text-neutral-700 leading-relaxed">{record.ingredients || FIELD_NA}</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Classical Indications</p>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
            <p className="text-sm text-neutral-700 leading-relaxed italic">{record.indications || FIELD_NA}</p>
          </div>
          {/* Parsed tags */}
          {record.indicationTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {record.indicationTags.slice(0, 12).map((tag) => (
                <span key={tag.tag} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 text-neutral-600 border border-neutral-200">
                  {tag.displayText}
                  <span className="text-neutral-400">(unreviewed)</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Anupana (Vehicle)</p>
          <p className="text-sm text-neutral-700">{record.anupana || FIELD_NA}</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">Source record only — not a personalised recommendation.</p>
        </div>

        {mode === "doctor" && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-1">Source Dosage — Reference only</p>
            <p className="text-sm text-amber-800 font-medium">{record.dosage || FIELD_NA}</p>
            <p className="text-[10px] text-amber-600 mt-1">
              Source record dosage. Doctor verification required. Do not use without clinical judgement and adjustment for patient context.
            </p>
          </div>
        )}

        <div className="border-t border-neutral-100 pt-4">
          <div className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-0.5">Classical Reference</p>
              <p className="text-sm text-neutral-700 font-medium">{record.reference || FIELD_NA}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Verify against the cited text before prescribing.</p>
            </div>
          </div>
        </div>

        {/* Attribution */}
        <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100 flex items-start gap-2">
          <ExternalLink className="w-3.5 h-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-neutral-500 leading-relaxed">
            Source: Bhaishajya Kalpana Kosha · CC BY 4.0 · github.com/sciencewithsaucee-sudo/Bhaishajya-Kalpana-Kosha · Original record ID: {record.id}
          </p>
        </div>

        {/* Public disclaimer */}
        {mode === "public" && (
          <DisclaimerBanner compact className="mt-2" />
        )}

        {/* Related formulations */}
        {relatedRecords.length > 0 && (
          <div className="border-t border-neutral-100 pt-4">
            <p className="text-xs font-semibold text-neutral-600 mb-2">Related Formulations</p>
            <div className="space-y-2">
              {relatedRecords.map((r) => (
                <button
                  key={r.id}
                  onClick={() => onViewRelated?.(r.id)}
                  className="w-full text-left flex items-center justify-between gap-3 p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-100 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{r.name}</p>
                    <p className="text-xs text-neutral-500">{r.type} · {r.category}</p>
                  </div>
                  <Leaf className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
