// ─── BKK Knowledge Engine ──────────────────────────────────────────
// Source: Bhaishajya Kalpana Kosha, CC BY 4.0
// github.com/sciencewithsaucee-sudo/Bhaishajya-Kalpana-Kosha
// Normalization and search are fully deterministic — no AI inference.
// Missing fields are never invented; shown as "Not available in source record."

import rawData from "@/lib/bkk-data/bkk-raw.json";
import synonymTable from "@/lib/bkk-data/synonym-table.json";

// ─── Types ────────────────────────────────────────────────────────
export interface BKKRecord {
  id: string;
  name: string;
  type: string;
  category: string;
  main_ingredients: string[];
  ingredients: string;
  reference: string;
  indications: string;
  dosage: string;
  anupana: string;
  // Derived
  indicationTags: IndicationTag[];
  contentStatus: "published"; // All source records are published as-is
}

export interface IndicationTag {
  tag: string;
  displayText: string;
  reviewStatus: "unreviewed"; // All parsed tags start unreviewed
  source: "parsed_from_original_text";
}

export interface SynonymEntry {
  canonical: string;
  synonyms: string[];
  entityType: string;
  language: string;
}

export interface SearchFilters {
  type?: string;
  category?: string;
  ingredientContains?: string;
}

export interface BKKSearchResult {
  record: BKKRecord;
  score: number;
  matchReasons: string[];
  matchedTags: string[];
}

export interface ComparisonResult {
  formulations: BKKRecord[];
  fields: ComparisonField[];
}

export interface ComparisonField {
  label: string;
  key: string;
  values: string[];
}

// ─── Scoring weights (configurable) ────────────────────────────────
export const SCORE_WEIGHTS = {
  exactNameMatch: 10,
  exactTagMatch: 4,
  synonymTagMatch: 3,
  symptomTagMatch: 2,
  typePreferenceMatch: 1,
  categoryPreferenceMatch: 1,
  ingredientMatch: 2,
  partialTextMatch: 1,
};

// ─── Data Initialization ──────────────────────────────────────────
const SYNONYM_MAP = new Map<string, string[]>();
const REVERSE_SYNONYM_MAP = new Map<string, string>(); // any term → canonical

(synonymTable as SynonymEntry[]).forEach((entry) => {
  SYNONYM_MAP.set(entry.canonical.toLowerCase(), entry.synonyms.map((s) => s.toLowerCase()));
  REVERSE_SYNONYM_MAP.set(entry.canonical.toLowerCase(), entry.canonical.toLowerCase());
  entry.synonyms.forEach((syn) => {
    REVERSE_SYNONYM_MAP.set(syn.toLowerCase(), entry.canonical.toLowerCase());
  });
});

// ─── Indication Normalizer ─────────────────────────────────────────
function normalizeIndicationText(text: string): IndicationTag[] {
  const tags: IndicationTag[] = [];
  const seen = new Set<string>();

  // Pattern: "English term (Sanskrit term)" or "Sanskrit term (English term)"
  // Split on commas and periods first
  const segments = text.split(/[,\.]+/).map((s) => s.trim()).filter(Boolean);

  segments.forEach((segment) => {
    // Extract both the outer and parenthetical terms
    const parenMatch = segment.match(/^(.+?)\s*\(([^)]+)\)/);
    const termsToProcess: string[] = [];

    if (parenMatch) {
      termsToProcess.push(parenMatch[1].trim());
      // parenthetical may have multiple comma-separated terms
      parenMatch[2].split(/[,\s]+/).forEach((t) => {
        const cleaned = t.trim();
        if (cleaned.length > 2) termsToProcess.push(cleaned);
      });
    } else {
      termsToProcess.push(segment.replace(/\(.+?\)/g, "").trim());
    }

    termsToProcess.forEach((term) => {
      const lower = term.toLowerCase().replace(/[^a-z\s]/g, "").trim();
      if (!lower || lower.length < 3 || seen.has(lower)) return;
      seen.add(lower);
      tags.push({
        tag: lower,
        displayText: term,
        reviewStatus: "unreviewed",
        source: "parsed_from_original_text",
      });
    });
  });

  return tags;
}

// ─── Build processed records ───────────────────────────────────────
let _processedRecords: BKKRecord[] | null = null;

function getProcessedRecords(): BKKRecord[] {
  if (_processedRecords) return _processedRecords;
  _processedRecords = (rawData as any[]).map((item, index) => ({
    id: `bkk-${String(index + 1).padStart(3, "0")}`,
    name: item.name ?? "Unknown",
    type: item.type ?? "Unknown",
    category: item.category ?? "Unknown",
    main_ingredients: Array.isArray(item.main_ingredients) ? item.main_ingredients : [],
    ingredients: item.ingredients ?? "Not available in source record.",
    reference: item.reference ?? "Not available in source record.",
    indications: item.indications ?? "Not available in source record.",
    dosage: item.dosage ?? "Not available in source record.",
    anupana: item.anupana ?? "Not available in source record.",
    indicationTags: normalizeIndicationText(item.indications ?? ""),
    contentStatus: "published" as const,
  }));
  return _processedRecords;
}

// ─── Synonym Expansion ─────────────────────────────────────────────
export function expandQueryToTerms(query: string): string[] {
  const q = query.toLowerCase().trim();
  const terms = new Set<string>([q]);

  // Add canonical if we find a synonym match
  const canonical = REVERSE_SYNONYM_MAP.get(q);
  if (canonical) {
    terms.add(canonical);
    // Also add all other synonyms of that canonical
    const allSynonyms = SYNONYM_MAP.get(canonical);
    if (allSynonyms) allSynonyms.forEach((s) => terms.add(s));
  }

  // Also check if the query contains a known term
  REVERSE_SYNONYM_MAP.forEach((can, term) => {
    if (q.includes(term) || term.includes(q)) {
      terms.add(can);
      const syns = SYNONYM_MAP.get(can);
      if (syns) syns.forEach((s) => terms.add(s));
    }
  });

  return Array.from(terms);
}

// ─── Core Search ──────────────────────────────────────────────────
export function searchBKK(
  query: string,
  filters: SearchFilters = {}
): BKKSearchResult[] {
  const records = getProcessedRecords();
  if (!query.trim() && !filters.type && !filters.category && !filters.ingredientContains) {
    return records.map((r) => ({ record: r, score: 0, matchReasons: [], matchedTags: [] }));
  }

  const expandedTerms = query.trim() ? expandQueryToTerms(query) : [];
  const results: BKKSearchResult[] = [];

  records.forEach((record) => {
    // Apply hard filters first
    if (filters.type && record.type.toLowerCase() !== filters.type.toLowerCase()) return;
    if (filters.category && record.category.toLowerCase() !== filters.category.toLowerCase()) return;
    if (
      filters.ingredientContains &&
      !record.ingredients.toLowerCase().includes(filters.ingredientContains.toLowerCase()) &&
      !record.main_ingredients.some((i) =>
        i.toLowerCase().includes(filters.ingredientContains!.toLowerCase())
      )
    )
      return;

    let score = 0;
    const matchReasons: string[] = [];
    const matchedTags: string[] = [];

    if (query.trim()) {
      const qLower = query.toLowerCase();

      // Exact name match
      if (record.name.toLowerCase().includes(qLower)) {
        score += SCORE_WEIGHTS.exactNameMatch;
        matchReasons.push(`Name contains "${query}"`);
      }

      // Ingredient match
      if (
        record.ingredients.toLowerCase().includes(qLower) ||
        record.main_ingredients.some((i) => i.toLowerCase().includes(qLower))
      ) {
        score += SCORE_WEIGHTS.ingredientMatch;
        matchReasons.push(`Contains ingredient: ${query}`);
      }

      // Tag matching with synonym expansion
      record.indicationTags.forEach((tag) => {
        expandedTerms.forEach((term) => {
          if (tag.tag.includes(term) || term.includes(tag.tag)) {
            const isExact = REVERSE_SYNONYM_MAP.has(term) && REVERSE_SYNONYM_MAP.get(term) === REVERSE_SYNONYM_MAP.get(tag.tag);
            const pts = isExact ? SCORE_WEIGHTS.exactTagMatch : SCORE_WEIGHTS.synonymTagMatch;
            score += pts;
            const reason = `Indication tag "${tag.displayText}" matches "${query}"${isExact ? " (exact)" : " (via synonym)"}`;
            if (!matchReasons.includes(reason)) matchReasons.push(reason);
            if (!matchedTags.includes(tag.displayText)) matchedTags.push(tag.displayText);
          }
        });
      });

      // Raw indication text match
      if (record.indications.toLowerCase().includes(qLower)) {
        score += SCORE_WEIGHTS.partialTextMatch;
        if (!matchReasons.find((r) => r.includes("indication"))) {
          matchReasons.push(`Mentioned in original indication text`);
        }
      }

      // Category/type text match
      if (record.category.toLowerCase().includes(qLower) || record.type.toLowerCase().includes(qLower)) {
        score += SCORE_WEIGHTS.partialTextMatch;
        matchReasons.push(`Matches type/category: ${record.category}`);
      }
    } else {
      // No query, filter-only mode: show all matching filter results
      score = 1;
      matchReasons.push("Matches selected filter");
    }

    if (score > 0) {
      results.push({ record, score, matchReasons, matchedTags });
    }
  });

  return results.sort((a, b) => b.score - a.score);
}

// ─── Doctor-mode search with clinical context ──────────────────────
export interface ClinicalContext {
  confirmedDiagnosis: string;
  associatedSymptoms: string[];
  typePreference?: string;
  typeExclusion?: string;
  categoryPreference?: string;
}

export function searchBKKClinical(
  context: ClinicalContext,
  filters: SearchFilters = {}
): BKKSearchResult[] {
  const records = getProcessedRecords();
  const allTerms = [
    ...expandQueryToTerms(context.confirmedDiagnosis),
    ...context.associatedSymptoms.flatMap((s) => expandQueryToTerms(s)),
  ];
  const diagTerms = expandQueryToTerms(context.confirmedDiagnosis);

  const results: BKKSearchResult[] = [];

  records.forEach((record) => {
    if (filters.type && record.type.toLowerCase() !== filters.type.toLowerCase()) return;
    if (filters.category && record.category.toLowerCase() !== filters.category.toLowerCase()) return;
    if (context.typeExclusion && record.type.toLowerCase().includes(context.typeExclusion.toLowerCase())) return;

    let score = 0;
    const matchReasons: string[] = [];
    const matchedTags: string[] = [];

    record.indicationTags.forEach((tag) => {
      // Diagnosis match
      diagTerms.forEach((dt) => {
        if (tag.tag.includes(dt) || dt.includes(tag.tag)) {
          score += SCORE_WEIGHTS.exactTagMatch;
          const r = `Diagnosis "${context.confirmedDiagnosis}" matches indication "${tag.displayText}"`;
          if (!matchReasons.includes(r)) matchReasons.push(r);
          if (!matchedTags.includes(tag.displayText)) matchedTags.push(tag.displayText);
        }
      });

      // Symptom match
      context.associatedSymptoms.forEach((sym) => {
        const symTerms = expandQueryToTerms(sym);
        symTerms.forEach((st) => {
          if (tag.tag.includes(st) || st.includes(tag.tag)) {
            score += SCORE_WEIGHTS.symptomTagMatch;
            const r = `Symptom "${sym}" matches indication "${tag.displayText}"`;
            if (!matchReasons.includes(r)) matchReasons.push(r);
            if (!matchedTags.includes(tag.displayText)) matchedTags.push(tag.displayText);
          }
        });
      });
    });

    // Raw text matching as fallback
    allTerms.forEach((term) => {
      if (record.indications.toLowerCase().includes(term)) {
        score += SCORE_WEIGHTS.partialTextMatch;
        if (!matchReasons.find((r) => r.includes(term))) {
          matchReasons.push(`Found in indication text: "${term}"`);
        }
      }
    });

    // Type/category preference bonus
    if (context.typePreference && record.type.toLowerCase().includes(context.typePreference.toLowerCase())) {
      score += SCORE_WEIGHTS.typePreferenceMatch;
      matchReasons.push(`Matches preferred formulation type: ${context.typePreference}`);
    }
    if (context.categoryPreference && record.category.toLowerCase().includes(context.categoryPreference.toLowerCase())) {
      score += SCORE_WEIGHTS.categoryPreferenceMatch;
    }

    if (score > 0) {
      results.push({ record, score, matchReasons, matchedTags });
    }
  });

  return results.sort((a, b) => b.score - a.score);
}

// ─── Formulation lookup ────────────────────────────────────────────
export function getBKKById(id: string): BKKRecord | null {
  return getProcessedRecords().find((r) => r.id === id) ?? null;
}

export function getAllBKKRecords(): BKKRecord[] {
  return getProcessedRecords();
}

// ─── Related formulations ──────────────────────────────────────────
export function getRelatedFormulations(id: string, limit = 4): BKKRecord[] {
  const source = getBKKById(id);
  if (!source) return [];

  const sourceTags = new Set(source.indicationTags.map((t) => t.tag));
  const sourceIngredients = new Set(
    source.main_ingredients.map((i) => i.toLowerCase())
  );

  const scored = getProcessedRecords()
    .filter((r) => r.id !== id)
    .map((r) => {
      let score = 0;
      r.indicationTags.forEach((t) => { if (sourceTags.has(t.tag)) score += 2; });
      r.main_ingredients.forEach((i) => { if (sourceIngredients.has(i.toLowerCase())) score += 1; });
      if (r.category === source.category) score += 1;
      return { record: r, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((x) => x.record);
}

// ─── Comparison ────────────────────────────────────────────────────
export function compareFormulations(ids: string[]): ComparisonResult {
  const formulations = ids.map((id) => getBKKById(id)).filter(Boolean) as BKKRecord[];
  const fields: ComparisonField[] = [
    { label: "Type", key: "type", values: formulations.map((f) => f.type) },
    { label: "Category", key: "category", values: formulations.map((f) => f.category) },
    { label: "Main Ingredients", key: "main_ingredients", values: formulations.map((f) => f.main_ingredients.join(", ")) },
    { label: "Full Ingredients", key: "ingredients", values: formulations.map((f) => f.ingredients) },
    { label: "Indications", key: "indications", values: formulations.map((f) => f.indications) },
    { label: "Anupana (Vehicle)", key: "anupana", values: formulations.map((f) => f.anupana) },
    { label: "Classical Reference", key: "reference", values: formulations.map((f) => f.reference) },
    { label: "Source Dosage", key: "dosage", values: formulations.map((f) => f.dosage ? `${f.dosage} (reference only — clinician verification required)` : "Not available in source record.") },
  ];
  return { formulations, fields };
}

// ─── Unique types and categories ──────────────────────────────────
export function getBKKTypes(): string[] {
  return Array.from(new Set(getProcessedRecords().map((r) => r.type))).sort();
}

export function getBKKCategories(): string[] {
  return Array.from(new Set(getProcessedRecords().map((r) => r.category))).sort();
}
