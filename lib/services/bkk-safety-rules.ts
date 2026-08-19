// ─── BKK Safety Rule Engine ─────────────────────────────────────────
// Rules are deterministic and explainable. No ML or AI inference.
// Only verified allergy matches auto-exclude. All others are warnings.
// Safety rules run only on explicitly structured patient data.

import type { BKKRecord } from "./bkk-engine";

export type AlertSeverity = "exclude" | "caution" | "review";

export interface SafetyAlert {
  severity: AlertSeverity;
  ruleId: string;
  title: string;
  message: string;
  triggerData: string; // What patient/formulation data triggered this
  recommendation: string;
}

export interface PatientClinicalContext {
  allergies?: string[];
  isPregnant?: boolean;
  isLactating?: boolean;
  isPediatric?: boolean;  // age < 14
  isGeriatric?: boolean;  // age > 70
  hasLiverDisease?: boolean;
  hasDiabetes?: boolean;
  hasKidneyDisease?: boolean;
  comorbidities?: string[];
  currentMedicines?: string[];
}

// Keywords in ingredient text that indicate sugar/jaggery content
const SUGAR_INDICATORS = ["sharkara", "guda", "jaggery", "sugar", "khand", "mishri"];
// Keywords that indicate fermented/alcohol content
const FERMENTED_TYPES = ["asava", "arishta"];
// Keywords that indicate mineral/herbo-mineral content
const MINERAL_INDICATORS = ["bhasma", "pishti", "loha", "tamra", "swarna", "raupya", "vanga", "abhraka", "parada", "gandhaka", "hingula", "haratala", "manashila"];

/**
 * Evaluate safety rules for a given formulation and patient context.
 * Returns an array of alerts. Excludes are shown first.
 * Returns empty array if no patient context is provided.
 */
export function evaluateSafetyRules(
  record: BKKRecord,
  patient: PatientClinicalContext
): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];
  const ingredientText = (record.ingredients + " " + record.main_ingredients.join(" ")).toLowerCase();
  const formType = record.type.toLowerCase();

  // Rule 1: Allergy match (EXCLUDE)
  if (patient.allergies && patient.allergies.length > 0) {
    patient.allergies.forEach((allergy) => {
      const allergyLower = allergy.toLowerCase().trim();
      if (allergyLower.length < 2) return;
      if (ingredientText.includes(allergyLower)) {
        alerts.push({
          severity: "exclude",
          ruleId: "ALLERGY_MATCH",
          title: "Allergy — Formulation Excluded",
          message: `Patient has declared allergy to "${allergy}". This ingredient appears in the formulation record.`,
          triggerData: `Patient allergy: ${allergy} | Formulation: ${record.name}`,
          recommendation: "This formulation has been excluded from results. Do not prescribe without thorough allergy evaluation.",
        });
      }
    });
  }

  // Rule 2: Diabetes + Sugar/Jaggery (CAUTION)
  if (patient.hasDiabetes) {
    const hasSugar = SUGAR_INDICATORS.some((s) => ingredientText.includes(s));
    if (hasSugar) {
      alerts.push({
        severity: "caution",
        ruleId: "DIABETES_SUGAR",
        title: "Diabetes Caution — Sugar/Jaggery in formulation",
        message: "Patient has diabetes. This formulation's ingredient text mentions sugar or jaggery-based components.",
        triggerData: `Patient comorbidity: Diabetes | Formulation ingredient text contains sugar indicator`,
        recommendation: "Clinician review required. Verify sugar content and assess suitability for this patient.",
      });
    }
  }

  // Rule 3: Fermented preparations (REVIEW)
  if (FERMENTED_TYPES.some((t) => formType.includes(t))) {
    alerts.push({
      severity: "review",
      ruleId: "FERMENTED_PREP",
      title: "Fermented Preparation",
      message: `This is an Asava/Arishta — a fermented preparation that contains self-generated alcohol.`,
      triggerData: `Formulation type: ${record.type}`,
      recommendation: "Clinician review required. Exercise caution in patients with liver disease, pregnancy, or alcohol sensitivity.",
    });
  }

  // Rule 4: Pregnancy (REVIEW for fermented/mineral; general caution otherwise)
  if (patient.isPregnant) {
    const isFermented = FERMENTED_TYPES.some((t) => formType.includes(t));
    const isMineral = MINERAL_INDICATORS.some((m) => ingredientText.includes(m)) || formType.includes("bhasma") || formType.includes("pishti");
    if (isFermented || isMineral) {
      alerts.push({
        severity: "caution",
        ruleId: "PREGNANCY_HIGH_RISK",
        title: "Pregnancy — Specialist Review Required",
        message: "Patient is pregnant. Fermented or herbo-mineral preparations require specialist Ayurvedic review during pregnancy.",
        triggerData: "Patient status: Pregnant | Formulation is fermented or contains mineral components",
        recommendation: "Consult a senior Ayurvedic specialist before prescribing. Do not auto-prescribe.",
      });
    } else {
      alerts.push({
        severity: "review",
        ruleId: "PREGNANCY_REVIEW",
        title: "Pregnancy — Clinical Review Required",
        message: "Patient is pregnant. All formulation selections during pregnancy require specialist clinical review.",
        triggerData: "Patient status: Pregnant",
        recommendation: "Clinician must verify safety during pregnancy before prescribing.",
      });
    }
  }

  // Rule 5: Lactation (REVIEW)
  if (patient.isLactating) {
    alerts.push({
      severity: "review",
      ruleId: "LACTATION_REVIEW",
      title: "Lactation — Clinical Review Required",
      message: "Patient is lactating. All formulations during lactation require specialist clinical review.",
      triggerData: "Patient status: Lactating",
      recommendation: "Clinician must verify safety during lactation before prescribing.",
    });
  }

  // Rule 6: Herbo-mineral (Bhasma/Pishti) (REVIEW)
  if (formType.includes("bhasma") || formType.includes("pishti")) {
    alerts.push({
      severity: "review",
      ruleId: "HERBO_MINERAL",
      title: "Herbo-Mineral Formulation",
      message: "This is a Bhasma or Pishti — a mineral/herbo-mineral preparation requiring specialist knowledge and precise dosing.",
      triggerData: `Formulation type: ${record.type}`,
      recommendation: "Specialist Ayurvedic physician review required before prescribing. Dose accuracy is critical.",
    });
  }

  // Rule 7: Mineral ingredients in any type (REVIEW)
  if (MINERAL_INDICATORS.some((m) => ingredientText.includes(m)) && !formType.includes("bhasma") && !formType.includes("pishti")) {
    alerts.push({
      severity: "review",
      ruleId: "MINERAL_INGREDIENT",
      title: "Contains Mineral/Metal Ingredient",
      message: "This formulation's ingredient text mentions mineral or metallic components (Bhasma/Pishti ingredients).",
      triggerData: `Formulation ingredients contain mineral indicators`,
      recommendation: "Specialist review required. Verify source and purification (Shodhana) status.",
    });
  }

  // Rule 8: Pediatric (REVIEW)
  if (patient.isPediatric) {
    alerts.push({
      severity: "review",
      ruleId: "PEDIATRIC_REVIEW",
      title: "Pediatric Patient",
      message: "Patient is a child. Standard adult formulation doses must not be applied without age-appropriate adjustment.",
      triggerData: "Patient age group: Pediatric",
      recommendation: "Age-related clinical review and dose adjustment required. Consult a specialist.",
    });
  }

  // Rule 9: Geriatric (REVIEW)
  if (patient.isGeriatric) {
    alerts.push({
      severity: "review",
      ruleId: "GERIATRIC_REVIEW",
      title: "Geriatric Patient",
      message: "Patient is elderly (>70 years). Formulation suitability and dosage may need adjustment.",
      triggerData: "Patient age group: Geriatric",
      recommendation: "Age-related clinical review required. Consider reduced dosage and monitor for tolerance.",
    });
  }

  // Rule 10: Kidney disease (REVIEW for mineral/heavy prep)
  if (patient.hasKidneyDisease) {
    const isMineral = MINERAL_INDICATORS.some((m) => ingredientText.includes(m)) || formType.includes("bhasma") || formType.includes("pishti");
    if (isMineral) {
      alerts.push({
        severity: "caution",
        ruleId: "KIDNEY_MINERAL",
        title: "Kidney Disease — Mineral Preparation Caution",
        message: "Patient has kidney disease. Herbo-mineral or heavy metal-containing preparations require specialist review.",
        triggerData: "Patient status: Kidney disease | Formulation contains mineral components",
        recommendation: "Specialist review mandatory. Assess renal clearance before prescribing.",
      });
    }
  }

  // Sort: exclude first, then caution, then review
  const order: Record<AlertSeverity, number> = { exclude: 0, caution: 1, review: 2 };
  return alerts.sort((a, b) => order[a.severity] - order[b.severity]);
}

/**
 * Check if a formulation should be completely excluded for this patient.
 * Only allergy matches cause automatic exclusion.
 */
export function isExcluded(record: BKKRecord, patient: PatientClinicalContext): boolean {
  return evaluateSafetyRules(record, patient).some((a) => a.severity === "exclude");
}

export function getSafetyDataAvailability(record: BKKRecord): string {
  if (!record.ingredients || record.ingredients === "Not available in source record.") {
    return "Safety data unavailable — clinician must verify manually.";
  }
  return "Safety rules applied based on available source record data only.";
}
