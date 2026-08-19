// ─── Contraindication Rule Engine ─────────────────────────────────
// Deterministic, rule-based — covers all 8 categories from PRD Appendix B
// NEVER probabilistic. Every flag is binary and traceable.

export interface PatientProfile {
  comorbidities: string[];
  allergies: string[];
  isPregnant: boolean;
  isLactating: boolean;
  isPediatric: boolean;
  isGeriatric: boolean;
  hasKidneyDisease: boolean;
  hasLiverDisease: boolean;
}

export interface Formulation {
  id: string;
  name: string;
  ingredients: Array<{ name: string }>;
  containsJaggery: boolean;
  containsAlcohol: boolean;
  containsSugar: boolean;
  isHerboMineral: boolean;
  cautionDiabetes: boolean;
  cautionPregnancy: boolean;
  cautionLactation: boolean;
  cautionPediatric: boolean;
  cautionGeriatric: boolean;
  cautionKidney: boolean;
  cautionLiver: boolean;
  cautionIngredients: string[];
}

export interface ContraindicationFlag {
  severity: "contraindicated" | "caution";
  category: string;
  reason: string;
  ingredients: string[];
  requiresAcknowledgement: boolean;
}

export interface FormulationSafetyResult {
  formulationId: string;
  formulationName: string;
  isSafe: boolean;
  flags: ContraindicationFlag[];
}

// ─── Rule Definitions ─────────────────────────────────────────────
const DIABETIC_COMORBIDITIES = ["type2_diabetes", "type1_diabetes", "diabetes"];
const KIDNEY_COMORBIDITIES = ["kidney_disease", "chronic_kidney_disease", "ckd"];
const LIVER_COMORBIDITIES = ["liver_disease", "hepatitis", "cirrhosis"];

// Ingredients requiring high-oxalate caution in kidney disease
const HIGH_OXALATE_HERBS = ["Haritaki", "Vibhitaki", "Amalaki", "Sorrel"];

// Ingredients with Kampillaka / Langali (lactation caution)
const LACTATION_RISK_INGREDIENTS = ["Kampillaka", "Langali", "Kutaja bark extract"];

// Purified mercury/arsenic formulations (pediatric caution without specialist)
const SHODHITA_VISHA_MARKERS = ["Shodhita Parada", "Shodhita Gandhaka", "Makaradhwaja", "Swarna Bhasma"];

export function checkContraindications(
  formulation: Formulation,
  patient: PatientProfile
): FormulationSafetyResult {
  const flags: ContraindicationFlag[] = [];

  const hasDiabetes = DIABETIC_COMORBIDITIES.some((c) =>
    patient.comorbidities.includes(c)
  );
  const hasKidney =
    patient.hasKidneyDisease ||
    KIDNEY_COMORBIDITIES.some((c) => patient.comorbidities.includes(c));
  const hasLiver =
    patient.hasLiverDisease ||
    LIVER_COMORBIDITIES.some((c) => patient.comorbidities.includes(c));

  // Rule 1: Diabetes + jaggery/sugar-containing preparations
  if (hasDiabetes && formulation.containsJaggery) {
    flags.push({
      severity: "contraindicated",
      category: "Diabetes Safety",
      reason:
        "This formulation contains Jaggery (Guda) which can significantly raise blood glucose levels. Contraindicated in diabetes mellitus without specialist supervision.",
      ingredients: ["Guda (Jaggery)"],
      requiresAcknowledgement: true,
    });
  }

  if (hasDiabetes && formulation.containsSugar) {
    flags.push({
      severity: "caution",
      category: "Diabetes Safety",
      reason:
        "This formulation contains added sugar/cane sugar (Sharkara) which may affect blood glucose control. Use with caution in diabetes mellitus; monitor blood glucose.",
      ingredients: formulation.cautionIngredients.filter(
        (i) => i.toLowerCase().includes("sugar") || i.toLowerCase().includes("sharkara")
      ),
      requiresAcknowledgement: true,
    });
  }

  // Rule 2: Pregnancy + fermented/alcohol preparations + emmenagogues
  if (patient.isPregnant && formulation.containsAlcohol) {
    flags.push({
      severity: "contraindicated",
      category: "Pregnancy Safety",
      reason:
        "This is a fermented Arishta/Asava preparation containing self-generated alcohol. Alcohol-containing preparations are contraindicated during pregnancy.",
      ingredients: ["Fermented preparation (self-generated alcohol)"],
      requiresAcknowledgement: true,
    });
  }

  if (patient.isPregnant && formulation.cautionPregnancy && !formulation.containsAlcohol) {
    flags.push({
      severity: "caution",
      category: "Pregnancy Safety",
      reason:
        "This formulation requires caution during pregnancy. Please review ingredient list for emmenagogues or strong Ushna (hot-potency) herbs before prescribing.",
      ingredients: formulation.cautionIngredients,
      requiresAcknowledgement: true,
    });
  }

  // Rule 3: Lactation + Kampillaka / Langali
  if (patient.isLactating) {
    const ingredientNames = formulation.ingredients.map((i) => i.name.toLowerCase());
    const riskIngredients = LACTATION_RISK_INGREDIENTS.filter((ri) =>
      ingredientNames.some((name) => name.toLowerCase().includes(ri.toLowerCase()))
    );
    if (riskIngredients.length > 0 || formulation.cautionLactation) {
      flags.push({
        severity: "contraindicated",
        category: "Lactation Safety",
        reason:
          "This formulation may contain ingredients (e.g., Kampillaka, Langali) that are unsafe during lactation.",
        ingredients: riskIngredients.length > 0 ? riskIngredients : formulation.cautionIngredients,
        requiresAcknowledgement: true,
      });
    }
  }

  // Rule 4: Allergy — match patient-reported allergies against ingredient list
  if (patient.allergies && patient.allergies.length > 0) {
    const ingredientNames = formulation.ingredients.map((i) => i.name.toLowerCase());
    for (const allergy of patient.allergies) {
      const matched = ingredientNames.filter((name) =>
        name.includes(allergy.toLowerCase())
      );
      if (matched.length > 0) {
        flags.push({
          severity: "contraindicated",
          category: "Known Allergy",
          reason: `Patient has a reported allergy to "${allergy}" which may be present in this formulation's ingredients.`,
          ingredients: matched,
          requiresAcknowledgement: true,
        });
      }
    }
  }

  // Rule 5: Pediatric + Shodhita Visha (purified mercury/arsenic without specialist)
  if (patient.isPediatric) {
    const ingredientNames = formulation.ingredients.map((i) => i.name);
    const vishaIngredients = SHODHITA_VISHA_MARKERS.filter((marker) =>
      ingredientNames.some((name) => name.includes(marker))
    );
    if (vishaIngredients.length > 0 || formulation.cautionPediatric) {
      flags.push({
        severity: "contraindicated",
        category: "Pediatric Safety",
        reason:
          "Formulations containing Shodhita Visha (purified heavy metals) require specialist sign-off before use in patients under 12 years.",
        ingredients: vishaIngredients.length > 0 ? vishaIngredients : [],
        requiresAcknowledgement: true,
      });
    }
  }

  // Rule 6: Kidney disease + high-oxalate herbs / excessive Lavana
  if (hasKidney) {
    const ingredientNames = formulation.ingredients.map((i) => i.name);
    const oxalateIngredients = HIGH_OXALATE_HERBS.filter((herb) =>
      ingredientNames.some((name) => name.toLowerCase().includes(herb.toLowerCase()))
    );
    if (oxalateIngredients.length > 0 || formulation.cautionKidney) {
      flags.push({
        severity: "caution",
        category: "Kidney Disease Safety",
        reason:
          "This formulation may contain high-oxalate herbs or elevated Lavana content, which can be problematic in patients with kidney disease.",
        ingredients: oxalateIngredients.length > 0 ? oxalateIngredients : formulation.cautionIngredients,
        requiresAcknowledgement: true,
      });
    }
  }

  // Rule 7: Liver disease + alcohol preparations + heavy Shodhita metals
  if (hasLiver && formulation.containsAlcohol) {
    flags.push({
      severity: "contraindicated",
      category: "Liver Disease Safety",
      reason:
        "Fermented/alcohol-containing preparations (Arishta/Asava) are contraindicated in patients with liver disease.",
      ingredients: ["Fermented preparation (self-generated alcohol)"],
      requiresAcknowledgement: true,
    });
  }

  if (hasLiver && formulation.isHerboMineral && !formulation.containsAlcohol) {
    flags.push({
      severity: "caution",
      category: "Liver Disease Safety",
      reason:
        "Herbo-mineral formulations with heavy Shodhita metals require specialist sign-off in patients with liver disease.",
      ingredients: formulation.cautionIngredients,
      requiresAcknowledgement: true,
    });
  }

  // Rule 8: Geriatric + high-potency Ruksha formulations
  if (patient.isGeriatric && formulation.cautionGeriatric) {
    flags.push({
      severity: "caution",
      category: "Geriatric Safety",
      reason:
        "High-potency Ruksha (drying) formulations should be used with caution in patients over 70 years. Consider lower doses and monitor for dryness and depletion.",
      ingredients: [],
      requiresAcknowledgement: true,
    });
  }

  return {
    formulationId: formulation.id,
    formulationName: formulation.name,
    isSafe: flags.filter((f) => f.severity === "contraindicated").length === 0,
    flags,
  };
}

export function checkAllFormulations(
  formulations: Formulation[],
  patient: PatientProfile
): FormulationSafetyResult[] {
  return formulations.map((f) => checkContraindications(f, patient));
}
