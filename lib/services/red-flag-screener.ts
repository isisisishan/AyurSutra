// ─── Emergency Red-Flag Screening Engine ──────────────────────────
// Deterministic rule-based — NO diagnosis, NO labels
// Only checks for symptom keywords that warrant immediate triage

export interface RedFlagResult {
  hasRedFlag: boolean;
  triggeredKeywords: string[];
  urgencyLevel: "emergency" | "urgent" | "normal";
  guidanceMessage: string;
  triageAlertText: string;
}

// Configurable red-flag symptom keyword list (matches PRD requirement for admin-configurable list)
export const RED_FLAG_KEYWORDS: Array<{
  term: string;
  termHi: string;
  category: string;
  urgency: "emergency" | "urgent";
}> = [
  // Cardiac
  { term: "chest pain", termHi: "सीने में दर्द", category: "Cardiac", urgency: "emergency" },
  { term: "chest tightness", termHi: "सीने में कसाव", category: "Cardiac", urgency: "emergency" },
  { term: "heart pain", termHi: "दिल में दर्द", category: "Cardiac", urgency: "emergency" },
  
  // Respiratory
  { term: "severe breathing", termHi: "सांस लेने में तकलीफ", category: "Respiratory", urgency: "emergency" },
  { term: "can't breathe", termHi: "सांस नहीं आ रही", category: "Respiratory", urgency: "emergency" },
  { term: "shortness of breath", termHi: "सांस की कमी", category: "Respiratory", urgency: "emergency" },
  { term: "difficulty breathing", termHi: "सांस में दिक्कत", category: "Respiratory", urgency: "emergency" },
  
  // Neurological
  { term: "fainting", termHi: "बेहोशी", category: "Neurological", urgency: "emergency" },
  { term: "fainted", termHi: "बेहोश हो गया", category: "Neurological", urgency: "emergency" },
  { term: "unconscious", termHi: "बेहोश", category: "Neurological", urgency: "emergency" },
  { term: "confusion", termHi: "भ्रम", category: "Neurological", urgency: "emergency" },
  { term: "sudden weakness", termHi: "अचानक कमजोरी", category: "Neurological", urgency: "urgent" },
  { term: "severe headache suddenly", termHi: "अचानक तेज सिरदर्द", category: "Neurological", urgency: "urgent" },
  
  // Bleeding
  { term: "severe bleeding", termHi: "अत्यधिक रक्तस्राव", category: "Bleeding", urgency: "emergency" },
  { term: "heavy bleeding", termHi: "भारी रक्तस्राव", category: "Bleeding", urgency: "emergency" },
  { term: "bleeding won't stop", termHi: "खून नहीं रुक रहा", category: "Bleeding", urgency: "emergency" },
  { term: "vomiting blood", termHi: "खून की उल्टी", category: "Bleeding", urgency: "emergency" },
  { term: "blood in stool", termHi: "मल में खून", category: "Bleeding", urgency: "urgent" },
  
  // Allergic reaction
  { term: "severe allergic", termHi: "गंभीर एलर्जी", category: "Allergic Reaction", urgency: "emergency" },
  { term: "anaphylaxis", termHi: "एनाफिलेक्सिस", category: "Allergic Reaction", urgency: "emergency" },
  { term: "throat swelling", termHi: "गले में सूजन", category: "Allergic Reaction", urgency: "emergency" },
  { term: "swollen throat", termHi: "गला सूज गया", category: "Allergic Reaction", urgency: "emergency" },
  
  // Fever
  { term: "very high fever", termHi: "बहुत तेज बुखार", category: "Fever", urgency: "urgent" },
  { term: "fever above 104", termHi: "104 से अधिक बुखार", category: "Fever", urgency: "urgent" },
  { term: "seizure", termHi: "दौरा", category: "Neurological", urgency: "emergency" },
  { term: "convulsion", termHi: "ऐंठन", category: "Neurological", urgency: "emergency" },
];

export function screenForRedFlags(symptomText: string): RedFlagResult {
  const normalised = symptomText.toLowerCase().trim();
  const triggeredFlags = RED_FLAG_KEYWORDS.filter(
    (flag) =>
      normalised.includes(flag.term.toLowerCase()) ||
      normalised.includes(flag.termHi)
  );

  if (triggeredFlags.length === 0) {
    return {
      hasRedFlag: false,
      triggeredKeywords: [],
      urgencyLevel: "normal",
      guidanceMessage: "",
      triageAlertText: "",
    };
  }

  const hasEmergency = triggeredFlags.some((f) => f.urgency === "emergency");
  const urgencyLevel = hasEmergency ? "emergency" : "urgent";
  const triggeredKeywords = triggeredFlags.map((f) => f.term);
  const categories = Array.from(new Set(triggeredFlags.map((f) => f.category)));

  const guidanceMessage =
    urgencyLevel === "emergency"
      ? "⚠️ You have reported a symptom that requires immediate medical attention. Please do NOT wait in the regular OPD queue. Approach the Emergency / Triage desk immediately or ask a hospital staff member for help. Hospital emergency staff have been alerted."
      : "⚠️ You have reported a symptom that requires urgent medical attention. A triage alert has been sent to our nursing staff. Please wait near the triage desk. Do not leave the hospital premises.";

  const triageAlertText = `RED FLAG ALERT — ${urgencyLevel.toUpperCase()} | Symptom categories: ${categories.join(", ")} | Keywords: ${triggeredKeywords.join(", ")}`;

  return {
    hasRedFlag: true,
    triggeredKeywords,
    urgencyLevel,
    guidanceMessage,
    triageAlertText,
  };
}
