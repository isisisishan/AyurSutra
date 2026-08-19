// ─── Prakriti Scorer ──────────────────────────────────────────────
// Deterministic rule-based weighted scoring algorithm
// Produces Vata / Pitta / Kapha percentage distribution + confidence level
// NO external API calls — fully offline capable

export interface PrakritiAnswer {
  questionId: number;
  selectedDosha: "vata" | "pitta" | "kapha";
  weight: number;
}

export interface PrakritiResult {
  vata: number;
  pitta: number;
  kapha: number;
  primaryDosha: "vata" | "pitta" | "kapha";
  secondaryDosha: "vata" | "pitta" | "kapha";
  confidence: "low" | "moderate" | "high";
  confidenceScore: number;
  interpretation: string;
  disclaimer: string;
}

export function scorePrakriti(answers: PrakritiAnswer[]): PrakritiResult {
  if (answers.length === 0) {
    return {
      vata: 33,
      pitta: 34,
      kapha: 33,
      primaryDosha: "pitta",
      secondaryDosha: "vata",
      confidence: "low",
      confidenceScore: 0,
      interpretation: "Insufficient answers to generate a reliable profile.",
      disclaimer:
        "AI-assisted assessment — clinician verification required. This result is based on limited data.",
    };
  }

  // Weighted tally
  let vataScore = 0;
  let pittaScore = 0;
  let kaphaScore = 0;

  for (const answer of answers) {
    const w = answer.weight ?? 1;
    if (answer.selectedDosha === "vata") vataScore += w;
    else if (answer.selectedDosha === "pitta") pittaScore += w;
    else if (answer.selectedDosha === "kapha") kaphaScore += w;
  }

  const total = vataScore + pittaScore + kaphaScore;

  const vataPct = Math.round((vataScore / total) * 100);
  const pittaPct = Math.round((pittaScore / total) * 100);
  // Ensure they sum to 100
  const kaphaPct = 100 - vataPct - pittaPct;

  // Determine primary and secondary
  const scores: [string, number][] = [
    ["vata", vataPct],
    ["pitta", pittaPct],
    ["kapha", kaphaPct],
  ];
  scores.sort((a, b) => b[1] - a[1]);
  const primaryDosha = scores[0][0] as "vata" | "pitta" | "kapha";
  const secondaryDosha = scores[1][0] as "vata" | "pitta" | "kapha";

  // Confidence: based on answer count and dominance spread
  const dominanceSpread = scores[0][1] - scores[1][1];
  let confidence: "low" | "moderate" | "high";
  let confidenceScore: number;

  if (answers.length < 5) {
    confidence = "low";
    confidenceScore = 25;
  } else if (answers.length < 10) {
    confidence = dominanceSpread > 15 ? "moderate" : "low";
    confidenceScore = dominanceSpread > 15 ? 55 : 35;
  } else {
    if (dominanceSpread > 20) {
      confidence = "high";
      confidenceScore = 85;
    } else if (dominanceSpread > 10) {
      confidence = "moderate";
      confidenceScore = 65;
    } else {
      confidence = "moderate";
      confidenceScore = 50;
    }
  }

  const interpretation = buildInterpretation(
    primaryDosha,
    secondaryDosha,
    vataPct,
    pittaPct,
    kaphaPct
  );

  return {
    vata: vataPct,
    pitta: pittaPct,
    kapha: kaphaPct,
    primaryDosha,
    secondaryDosha,
    confidence,
    confidenceScore,
    interpretation,
    disclaimer:
      "AI-assisted Prakriti assessment — clinician verification required. Constitutional profiles are advisory and must be confirmed by a licensed Ayurvedic practitioner.",
  };
}

function buildInterpretation(
  primary: string,
  secondary: string,
  vata: number,
  pitta: number,
  kapha: number
): string {
  const profiles: Record<string, string> = {
    vata: "Your profile suggests a predominantly Vata constitution — characterised by lightness, creativity, quick learning, and variable energy. Vata types may be prone to dryness, irregular digestion, anxiety, and sleep disturbances when out of balance.",
    pitta:
      "Your profile suggests a predominantly Pitta constitution — characterised by sharp intellect, strong metabolism, and goal-oriented energy. Pitta types may be prone to inflammation, acidity, irritability, and sensitivity to heat when out of balance.",
    kapha:
      "Your profile suggests a predominantly Kapha constitution — characterised by stability, strength, and endurance. Kapha types may be prone to lethargy, weight gain, sluggish digestion, and respiratory conditions when out of balance.",
  };
  return (
    profiles[primary] +
    ` Your secondary Dosha appears to be ${secondary.charAt(0).toUpperCase() + secondary.slice(1)} (Vata ${vata}% · Pitta ${pitta}% · Kapha ${kapha}%).`
  );
}
