"use client";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";
import { SUPPORTED_LANGUAGES } from "@/lib/utils";
import { Leaf, Globe, ChevronRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const CONSENTS = [
  {
    id: "healthDataUse",
    label: "Health Data Use",
    description: "I consent to my health information being used for my care at this facility.",
    required: true,
  },
  {
    id: "voiceInput",
    label: "Voice Input",
    description: "I consent to voice recordings being transcribed for symptom intake. Audio is not stored.",
    required: false,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "I consent to receive SMS/app notifications about my appointment and queue status.",
    required: false,
  },
  {
    id: "researchParticipation",
    label: "Research Participation",
    description: "I consent to de-identified data being used for Ayurvedic research (optional).",
    required: false,
  },
];

export default function LanguageConsentPage() {
  const router = useRouter();
  const { language, setLanguage, patientSession, updatePatientSession } = useAppStore();

  const consents = patientSession.consentFlags;
  const healthDataConsented = consents.healthDataUse;

  function toggleConsent(id: string) {
    updatePatientSession({
      consentFlags: {
        ...consents,
        [id]: !consents[id as keyof typeof consents],
      },
    });
  }

  function proceed() {
    if (!healthDataConsented) return;
    updatePatientSession({
      consentGiven: true,
      preferredLanguage: language,
      registrationStep: "screening",
    });
    router.push("/patient/screening");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 px-4 py-4 flex items-center gap-2">
        <div className="w-7 h-7 bg-black rounded-[0.4rem] flex items-center justify-center">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <span className="font-serif font-semibold text-neutral-900">AyurSutra</span>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-10 animate-fade-in">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1 rounded-full flex-1 transition-all",
                s === 1 ? "bg-black" : "bg-neutral-200"
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Globe className="w-5 h-5 text-neutral-400" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Step 1 of 6
          </p>
        </div>

        <h1 className="font-serif text-3xl font-semibold text-neutral-900 mb-2">
          Language &amp; Consent
        </h1>
        <p className="text-neutral-500 text-sm mb-8">
          Select your preferred language for this session, then review and accept the consent terms.
        </p>

        {/* Language Selection */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
            Preferred Language
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                id={`lang-${lang.code}`}
                onClick={() => setLanguage(lang.code)}
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-lg border text-sm transition-all duration-150",
                  language === lang.code
                    ? "border-black bg-black text-white"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                )}
              >
                <span className="font-medium">{lang.nativeLabel}</span>
                <span className={cn("text-xs", language === lang.code ? "text-white/70" : "text-neutral-400")}>
                  {lang.label}
                </span>
              </button>
            ))}
          </div>
          {language !== "en" && (
            <p className="text-xs text-amber-600 mt-2 bg-amber-50 border border-amber-100 rounded p-2">
              ℹ️ Full translation in progress — this session will continue in English with key terms translated.
            </p>
          )}
        </div>

        {/* Consent */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
            Consent &amp; Privacy
          </p>
          <div className="space-y-3">
            {CONSENTS.map((consent) => (
              <label
                key={consent.id}
                htmlFor={`consent-${consent.id}`}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-150",
                  consents[consent.id as keyof typeof consents]
                    ? "border-neutral-900 bg-neutral-50"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                )}
              >
                <input
                  type="checkbox"
                  id={`consent-${consent.id}`}
                  checked={!!consents[consent.id as keyof typeof consents]}
                  onChange={() => toggleConsent(consent.id)}
                  className="mt-0.5 w-4 h-4 rounded border-neutral-300 accent-black flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900">
                      {consent.label}
                    </span>
                    {consent.required && (
                      <span className="text-xs text-red-500">Required</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                    {consent.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Privacy note */}
        <div className="flex items-start gap-2 p-3 bg-neutral-100 rounded-lg mb-8">
          <ShieldCheck className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-600">
            Your data is encrypted and shared only with your treating doctor. You may withdraw consent at any time at the reception desk.
          </p>
        </div>

        <Button
          fullWidth
          size="lg"
          disabled={!healthDataConsented}
          onClick={proceed}
          rightIcon={<ChevronRight className="w-4 h-4" />}
          id="language-proceed-btn"
        >
          {healthDataConsented ? "Proceed to Safety Check" : "Please accept Health Data consent"}
        </Button>
      </div>
    </div>
  );
}
