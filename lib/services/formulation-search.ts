// ─── Formulation Search Service ────────────────────────────────────
// Keyword + TF-IDF inspired local search over classical formulation database
// No external API required — fully offline capable

import formulationsData from "@/lib/mock-data/formulations.json";

export interface FormulationSearchResult {
  formulation: typeof formulationsData[0];
  relevanceScore: number;
  matchedTerms: string[];
}

// Condition synonyms and keyword mapping
const CONDITION_SYNONYMS: Record<string, string[]> = {
  arsha: ["haemorrhoids", "piles", "hemorrhoids", "arsha"],
  grahani: ["ibs", "irritable bowel", "malabsorption", "grahani", "digestive disorder"],
  prameha: ["diabetes", "urinary disorder", "prameha", "madhumeha", "blood sugar"],
  amlapitta: ["hyperacidity", "gerd", "acid reflux", "heartburn", "amlapitta", "acidity"],
  vatarakta: ["gout", "uric acid", "vatarakta", "joint pain"],
  kasa: ["cough", "kasa", "respiratory", "bronchitis"],
  jwara: ["fever", "jwara", "pyrexia", "temperature"],
  shirorog: ["headache", "migraine", "shirorog", "head pain", "ardhavabhedaka"],
  sandhivata: ["osteoarthritis", "joint stiffness", "sandhivata", "arthritis"],
  raktapitta: ["bleeding disorders", "raktapitta", "haemorrhage"],
  menstrual_disorders: ["menstrual", "periods", "dysmenorrhea", "amenorrhea", "pradara"],
  constipation: ["constipation", "vibandha", "hard stools"],
};

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[\s,.()/\-]+/).filter(Boolean);
}

function calculateTFIDF(
  queryTerms: string[],
  docTerms: string[],
  allDocs: string[][]
): number {
  let score = 0;
  const docTermSet = new Set(docTerms);

  for (const term of queryTerms) {
    if (docTermSet.has(term)) {
      const tf = docTerms.filter((t) => t === term).length / docTerms.length;
      const docsWithTerm = allDocs.filter((doc) => doc.includes(term)).length;
      const idf = Math.log(allDocs.length / (1 + docsWithTerm));
      score += tf * (idf + 1); // +1 to avoid negative IDF
    }
  }

  return score;
}

function expandQuery(query: string): string[] {
  const tokens = tokenize(query);
  const expanded = new Set<string>(tokens);

  // Add synonyms
  for (const [condition, synonyms] of Object.entries(CONDITION_SYNONYMS)) {
    if (synonyms.some((syn) => tokens.some((t) => t.includes(syn) || syn.includes(t)))) {
      expanded.add(condition);
      synonyms.forEach((s) => s.split(" ").forEach((w) => expanded.add(w)));
    }
  }

  return Array.from(expanded);
}

function buildDocumentTerms(formulation: typeof formulationsData[0]): string[] {
  const fields = [
    formulation.name,
    formulation.classicalIndication,
    ...formulation.conditions,
    ...(formulation.synonyms || []),
    formulation.doshaRelevance.join(" "),
    formulation.dosageForm,
    ...formulation.ingredients.map((i) => i.name),
    ...Object.entries(CONDITION_SYNONYMS)
      .filter(([k]) => formulation.conditions.includes(k))
      .flatMap(([, synonyms]) => synonyms),
  ];

  return tokenize(fields.join(" "));
}

export function searchFormulations(
  query: string,
  filters?: {
    dosha?: string;
    dosageForm?: string;
    conditions?: string[];
    excludeContraindicated?: boolean;
  },
  limit: number = 10
): FormulationSearchResult[] {
  if (!query.trim() && !filters?.conditions?.length) {
    return formulationsData.slice(0, limit).map((f) => ({
      formulation: f,
      relevanceScore: 0.5,
      matchedTerms: [],
    }));
  }

  const queryTerms = expandQuery(query);
  const allDocTerms = formulationsData.map(buildDocumentTerms);

  const results: FormulationSearchResult[] = formulationsData.map(
    (formulation, idx) => {
      const docTerms = allDocTerms[idx];
      let score = calculateTFIDF(queryTerms, docTerms, allDocTerms);

      // Boost for exact condition match
      if (filters?.conditions) {
        for (const condition of filters.conditions) {
          if (formulation.conditions.includes(condition.toLowerCase())) {
            score += 2;
          }
        }
      }

      // Boost for dosha relevance
      if (filters?.dosha) {
        if (
          formulation.doshaRelevance
            .map((d) => d.toLowerCase())
            .includes(filters.dosha.toLowerCase())
        ) {
          score += 0.5;
        }
      }

      // Filter by dosage form
      if (
        filters?.dosageForm &&
        !formulation.dosageForm
          .toLowerCase()
          .includes(filters.dosageForm.toLowerCase())
      ) {
        score = 0;
      }

      // Find matched terms for display
      const matchedTerms = queryTerms.filter((t) => docTerms.includes(t));

      return {
        formulation,
        relevanceScore: score,
        matchedTerms: Array.from(new Set(matchedTerms)).slice(0, 5),
      };
    }
  );

  return results
    .filter((r) => r.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
}

export function getFormulationById(id: string) {
  return formulationsData.find((f) => f.id === id) ?? null;
}

export function getFormulationsByCondition(condition: string) {
  return formulationsData.filter((f) =>
    f.conditions.includes(condition.toLowerCase())
  );
}
