import { cn } from "@/lib/utils";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { compareFormulations, type BKKRecord } from "@/lib/services/bkk-engine";
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
    return (
      <div className="bg-white border border-neutral-100 rounded-2xl p-8 text-center">
        <p className="text-neutral-400 text-sm">Select at least 2 formulations to compare.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50">
        <div>
          <h2 className="font-serif font-semibold text-neutral-900 text-lg">Formulation Comparison</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Comparing {formulations.length} formulations · For learning and wellness awareness only
          </p>
        </div>
        {onClose && (
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            id="compare-back-btn"
          >
            Back to results
          </Button>
        )}
      </div>

      {/* Table — horizontally scrollable on mobile */}
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: `${formulations.length * 220 + 160}px` }}>
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 w-36 bg-neutral-50">
                Field
              </th>
              {formulations.map((f) => (
                <th key={f.id} className="text-left px-6 py-3 bg-white">
                  <p className="font-serif font-semibold text-sm text-neutral-900">{f.name}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{f.type} · {f.category}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Doctor-mode safety flags row */}
            {mode === "doctor" && patientContext && (
              <tr className="border-b border-neutral-100 bg-amber-50/50">
                <td className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 align-top bg-neutral-50">
                  Safety Flags
                </td>
                {formulations.map((f) => {
                  const alerts = evaluateSafetyRules(f, patientContext);
                  return (
                    <td key={f.id} className="px-6 py-3 align-top">
                      {alerts.length > 0 ? (
                        <SafetyAlertSummary alerts={alerts} />
                      ) : (
                        <span className="text-xs text-green-600">No flags for this patient context</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            )}

            {fields.map((field, rowIdx) => {
              // In public mode, skip dosage
              if (mode === "public" && field.key === "dosage") return null;
              const allSame = field.values.every((v) => v === field.values[0]);
              return (
                <tr
                  key={field.key}
                  className={cn(
                    "border-b border-neutral-50",
                    rowIdx % 2 === 0 ? "bg-white" : "bg-neutral-50/40"
                  )}
                >
                  <td className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 align-top whitespace-nowrap bg-neutral-50">
                    {field.label}
                  </td>
                  {field.values.map((val, i) => {
                    const isNA = !val || val === "Not available in source record.";
                    const isDiff = !allSame && !isNA;
                    return (
                      <td
                        key={i}
                        className={cn(
                          "px-6 py-3 text-sm align-top",
                          isNA
                            ? "text-neutral-300 italic text-xs"
                            : isDiff
                            ? "text-neutral-900 font-medium"
                            : "text-neutral-600"
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

      {/* Safety note */}
      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-start gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-neutral-500 leading-relaxed">
          This comparison is for learning and discussion with a qualified practitioner. It does not replace a clinical consultation or personalised treatment advice.
          {mode === "doctor" && " Source dosage shown as reference only. Doctor verification and patient-specific adjustment required."}
        </p>
      </div>
    </div>
  );
}
