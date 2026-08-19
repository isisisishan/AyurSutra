import { cn } from "@/lib/utils";
import { X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { compareFormulations } from "@/lib/services/bkk-engine";
import type { PatientClinicalContext } from "@/lib/services/bkk-safety-rules";
import { evaluateSafetyRules } from "@/lib/services/bkk-safety-rules";
import { SafetyAlertSummary } from "./SafetyAlertBadge";

const FIELD_NA = "Not listed";

interface ComparePanelProps {
  ids: string[];
  mode: "public" | "doctor";
  patientContext?: PatientClinicalContext;
  onClose?: () => void;
}

export function ComparePanel({ ids, mode, patientContext, onClose }: ComparePanelProps) {
  const comparison = compareFormulations(ids);
  const { formulations, fields } = comparison;

  if (formulations.length < 2) {
    return null; // shouldn't happen based on tray state, but just in case
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-neutral-900/60 backdrop-blur-sm animate-fade-in">
      {/* Background click handler (optional, but good practice. We'll leave it simple per instructions) */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-white z-10 flex-shrink-0">
          <div>
            <h2 className="font-serif font-semibold text-neutral-900 text-xl">Formulation Comparison</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Explore key differences between selected Ayurvedic formulations.
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              aria-label="Close comparison"
              id="close-compare-modal-icon"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Table — horizontally scrollable on mobile */}
        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full" style={{ minWidth: `${formulations.length * 280 + 160}px` }}>
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-neutral-100 shadow-sm">
                <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 w-40 bg-neutral-50 border-r border-neutral-100">
                  Field
                </th>
                {formulations.map((f) => (
                  <th key={f.id} className="text-left px-6 py-4 bg-white border-r border-neutral-100 last:border-r-0">
                    <p className="font-serif font-semibold text-base text-neutral-900">{f.name}</p>
                    <p className="text-[11px] text-neutral-500 mt-1 font-medium">{f.type} · {f.category}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Doctor-mode safety flags row */}
              {mode === "doctor" && patientContext && (
                <tr className="border-b border-neutral-100 bg-amber-50/30">
                  <td className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 align-top bg-amber-50/50 border-r border-neutral-100">
                    Safety Flags
                  </td>
                  {formulations.map((f) => {
                    const alerts = evaluateSafetyRules(f, patientContext);
                    return (
                      <td key={f.id} className="px-6 py-4 align-top border-r border-neutral-100 last:border-r-0">
                        {alerts.length > 0 ? (
                          <SafetyAlertSummary alerts={alerts} />
                        ) : (
                          <span className="text-xs text-green-600 font-medium">No flags for this patient context</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              )}

              {fields.map((field, rowIdx) => {
                // In public mode, skip dosage if it shouldn't be shown, wait instructions say "Dosage information, if available", so we shouldn't skip it.
                // Wait, previously dosage was skipped in public mode. I'll leave it in for public mode since the prompt requested it specifically as a row.
                const allSame = field.values.every((v) => v === field.values[0]);
                return (
                  <tr
                    key={field.key}
                    className={cn(
                      "border-b border-neutral-100",
                      rowIdx % 2 === 0 ? "bg-white" : "bg-neutral-50/50"
                    )}
                  >
                    <td className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 align-top whitespace-nowrap bg-neutral-50/80 border-r border-neutral-100">
                      {field.label}
                    </td>
                    {field.values.map((val, i) => {
                      const isNA = !val || val === "Not available in source record." || val === "Not listed";
                      const isDiff = !allSame && !isNA;
                      return (
                        <td
                          key={i}
                          className={cn(
                            "px-6 py-4 text-sm align-top leading-relaxed border-r border-neutral-100 last:border-r-0",
                            isNA
                              ? "text-neutral-400 italic text-xs"
                              : isDiff
                              ? "text-neutral-900 font-medium bg-blue-50/30"
                              : "text-neutral-700"
                          )}
                        >
                          {isNA ? FIELD_NA : val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 flex-shrink-0">
          <div className="flex items-start gap-2 max-w-2xl">
            <ShieldCheck className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-500 leading-relaxed">
              For learning and discussion with a qualified practitioner. This comparison is not personalised treatment advice.
            </p>
          </div>
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full sm:w-auto"
              id="close-compare-modal-btn"
            >
              Close comparison
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
