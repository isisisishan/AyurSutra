"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";
import { MessageSquare, Mic, MicOff, ChevronRight, Plus, X, CheckCircle, AlertCircle } from "lucide-react";
import { PatientNav } from "@/components/shared/PatientNav";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const SEVERITY_OPTIONS = [
  { value: "mild", label: "Mild", desc: "Noticeable but not limiting daily activities" },
  { value: "moderate", label: "Moderate", desc: "Affecting daily activities" },
  { value: "severe", label: "Severe", desc: "Severely limiting activities" },
];

const DURATION_OPTIONS = [
  "Less than 1 day",
  "1–3 days",
  "4–7 days",
  "1–2 weeks",
  "2–4 weeks",
  "1–3 months",
  "More than 3 months",
];

const COMMON_CONDITIONS = [
  "Type 2 Diabetes",
  "Type 1 Diabetes",
  "Hypertension",
  "Heart Disease",
  "Kidney Disease",
  "Liver Disease",
  "Asthma",
  "Thyroid disorder",
  "Arthritis",
  "Anemia",
];

export default function IntakePage() {
  const router = useRouter();
  const { updatePatientSession, patientSession } = useAppStore();
  const [step, setStep] = useState(0); // 0=symptoms, 1=duration+severity, 2=history, 3=medicines, 4=confirm
  const [symptoms, setSymptoms] = useState(patientSession.symptoms || "");
  const [duration, setDuration] = useState(patientSession.duration || "");
  const [severity, setSeverity] = useState(patientSession.severity || "");
  const [conditions, setConditions] = useState<string[]>(patientSession.comorbidities || []);
  const [customCondition, setCustomCondition] = useState("");
  const [medicines, setMedicines] = useState<string[]>(patientSession.currentMedicines || []);
  const [medicineName, setMedicineName] = useState("");
  const [allergies, setAllergies] = useState<string[]>(patientSession.allergies || []);
  const [allergyName, setAllergyName] = useState("");
  const [isPregnant, setIsPregnant] = useState(patientSession.isPregnant);
  const [isLactating, setIsLactating] = useState(patientSession.isLactating);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  function startVoice() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input not supported. Please type.");
      return;
    }
    const SR = ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setSymptoms((prev) => (prev ? prev + " " + t : t));
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }

  function addChip(arr: string[], setArr: (v: string[]) => void, value: string, setValue: (v: string) => void) {
    if (value.trim() && !arr.includes(value.trim())) {
      setArr([...arr, value.trim()]);
    }
    setValue("");
  }

  function removeChip(arr: string[], setArr: (v: string[]) => void, item: string) {
    setArr(arr.filter((x) => x !== item));
  }

  function toggleCondition(c: string) {
    setConditions((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }

  function saveAndProceed() {
    updatePatientSession({
      symptoms,
      duration,
      severity: severity as "mild" | "moderate" | "severe" | "",
      comorbidities: conditions,
      currentMedicines: medicines,
      allergies,
      isPregnant,
      isLactating,
      registrationStep: "prakriti",
    });
    router.push("/patient/prakriti");
  }

  const STEPS = ["Symptoms", "Severity", "Medical History", "Medicines", "Confirm"];

  return (
    <div className="min-h-screen flex flex-col">
      <PatientNav onBack={() => step > 0 ? setStep(step - 1) : router.push("/patient/register")} />

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        {/* Outer step bar */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className={cn("h-1 rounded-full flex-1", s <= 4 ? "bg-black" : "bg-neutral-200")} />
          ))}
        </div>

        {/* Inner sub-steps */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => i < step ? setStep(i) : undefined}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0",
                i === step ? "bg-black text-white" :
                i < step ? "bg-neutral-100 text-neutral-600 hover:bg-neutral-200" :
                "bg-neutral-50 text-neutral-400 cursor-default"
              )}
            >
              {i < step && <CheckCircle className="w-3 h-3" />}
              {s}
            </button>
          ))}
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-5">
          Step 4 · {STEPS[step]}
        </p>

        {/* STEP 0: Symptoms */}
        {step === 0 && (
          <div className="animate-fade-in">
            <h1 className="font-serif text-3xl font-semibold text-neutral-900 mb-2">
              Please describe your current health concern
            </h1>
            <p className="text-neutral-500 text-sm mb-6">
              Please describe the symptoms or health concerns you would like to discuss. You may type or use voice input.
            </p>
            <div className="relative mb-6">
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="E.g. I have been having digestive problems, bloating, and irregular appetite for the past two weeks..."
                className="min-h-[140px] pr-12"
                id="intake-symptoms"
              />
              <button
                onClick={isListening ? () => { recognitionRef.current?.stop(); setIsListening(false); } : startVoice}
                className={cn(
                  "absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all",
                  isListening ? "bg-red-500 text-white animate-pulse" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                )}
                title="Voice input"
                id="intake-voice"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
            {isListening && (
              <div className="flex items-center gap-2 text-sm text-red-600 mb-4">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Listening... speak clearly
              </div>
            )}
            <Button
              fullWidth
              size="lg"
              disabled={!symptoms.trim()}
              onClick={() => setStep(1)}
              rightIcon={<ChevronRight className="w-4 h-4" />}
              id="intake-step0-next"
            >
              Continue
            </Button>
          </div>
        )}

        {/* STEP 1: Duration + Severity */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 className="font-serif text-3xl font-semibold text-neutral-900 mb-2">
              Duration &amp; Severity
            </h1>
            <p className="text-neutral-500 text-sm mb-6">How long and how severe?</p>

            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Duration</p>
              <div className="grid grid-cols-2 gap-2">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={cn(
                      "p-3 rounded-lg border text-sm text-left transition-all",
                      duration === d ? "border-black bg-black text-white" : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Severity</p>
              <div className="space-y-2">
                {SEVERITY_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSeverity(s.value)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-all",
                      severity === s.value ? "border-black bg-black text-white" : "border-neutral-200 bg-white hover:border-neutral-300"
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded-full border-2 flex-shrink-0", severity === s.value ? "border-white bg-white" : "border-neutral-300")} />
                    <div>
                      <p className="font-medium text-sm">{s.label}</p>
                      <p className={cn("text-xs", severity === s.value ? "text-white/70" : "text-neutral-500")}>{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setStep(0)}>Back</Button>
              <Button fullWidth disabled={!duration || !severity} onClick={() => setStep(2)} rightIcon={<ChevronRight className="w-4 h-4" />} id="intake-step1-next">Continue</Button>
            </div>
          </div>
        )}

        {/* STEP 2: Medical History */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h1 className="font-serif text-3xl font-semibold text-neutral-900 mb-2">Medical History</h1>
            <p className="text-neutral-500 text-sm mb-6">Select any existing conditions. This helps us identify relevant formulations and safety flags.</p>

            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Existing Conditions</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_CONDITIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleCondition(c)}
                    className={cn(
                      "px-3 py-1.5 rounded-full border text-sm transition-all",
                      conditions.includes(c)
                        ? "bg-black text-white border-black"
                        : "border-neutral-200 text-neutral-600 hover:border-neutral-400 bg-white"
                    )}
                  >
                    {conditions.includes(c) && <span className="mr-1">✓</span>}
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={customCondition}
                  onChange={(e) => setCustomCondition(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addChip(conditions, setConditions, customCondition, setCustomCondition)}
                  placeholder="Other condition..."
                  className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-black"
                />
                <Button variant="outline" size="sm" onClick={() => addChip(conditions, setConditions, customCondition, setCustomCondition)} leftIcon={<Plus className="w-3 h-3" />}>Add</Button>
              </div>
            </div>

            {patientSession.gender === "female" && (
              <div className="mb-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">Pregnancy / Lactation</p>
                <label className={cn("flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all", isPregnant ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 bg-white")}>
                  <input type="checkbox" checked={isPregnant} onChange={() => setIsPregnant(!isPregnant)} className="accent-black" />
                  <span className="text-sm text-neutral-700">Currently pregnant</span>
                </label>
                <label className={cn("flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all", isLactating ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 bg-white")}>
                  <input type="checkbox" checked={isLactating} onChange={() => setIsLactating(!isLactating)} className="accent-black" />
                  <span className="text-sm text-neutral-700">Currently breastfeeding / lactating</span>
                </label>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setStep(1)}>Back</Button>
              <Button fullWidth onClick={() => setStep(3)} rightIcon={<ChevronRight className="w-4 h-4" />} id="intake-step2-next">Continue</Button>
            </div>
          </div>
        )}

        {/* STEP 3: Medicines & Allergies */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h1 className="font-serif text-3xl font-semibold text-neutral-900 mb-2">Medicines &amp; Allergies</h1>
            <p className="text-neutral-500 text-sm mb-6">Tell us what you currently take and any known allergies. This is critical for safety checks.</p>

            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Current Medicines</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {medicines.map((m) => (
                  <span key={m} className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {m}
                    <button onClick={() => removeChip(medicines, setMedicines, m)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addChip(medicines, setMedicines, medicineName, setMedicineName)}
                  placeholder="e.g. Metformin 500mg"
                  className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-black"
                  id="medicine-input"
                />
                <Button variant="outline" size="sm" onClick={() => addChip(medicines, setMedicines, medicineName, setMedicineName)} leftIcon={<Plus className="w-3 h-3" />}>Add</Button>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Known Allergies</p>
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg mb-3">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">Allergy information is used to flag formulation ingredients that may cause a reaction.</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {allergies.map((a) => (
                  <span key={a} className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 px-3 py-1 rounded-full text-sm">
                    {a}
                    <button onClick={() => removeChip(allergies, setAllergies, a)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={allergyName}
                  onChange={(e) => setAllergyName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addChip(allergies, setAllergies, allergyName, setAllergyName)}
                  placeholder="e.g. Penicillin, Sesame"
                  className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-black"
                  id="allergy-input"
                />
                <Button variant="outline" size="sm" onClick={() => addChip(allergies, setAllergies, allergyName, setAllergyName)} leftIcon={<Plus className="w-3 h-3" />}>Add</Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setStep(2)}>Back</Button>
              <Button fullWidth onClick={() => {
                if (medicineName.trim()) {
                  if (!medicines.includes(medicineName.trim())) setMedicines(prev => [...prev, medicineName.trim()]);
                  setMedicineName("");
                }
                if (allergyName.trim()) {
                  if (!allergies.includes(allergyName.trim())) setAllergies(prev => [...prev, allergyName.trim()]);
                  setAllergyName("");
                }
                setStep(4);
              }} rightIcon={<ChevronRight className="w-4 h-4" />} id="intake-step3-next">Review &amp; Confirm</Button>
            </div>
          </div>
        )}

        {/* STEP 4: Confirm */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h1 className="font-serif text-3xl font-semibold text-neutral-900 mb-2">Review &amp; Confirm</h1>
            <p className="text-neutral-500 text-sm mb-6">Please review your reported information before submitting. You can go back to correct anything.</p>

            <div className="space-y-4 mb-8">
              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Symptoms</p>
                <p className="text-sm text-neutral-800">{symptoms}</p>
                <div className="flex gap-2 mt-2">
                  {duration && <Badge variant="muted" size="sm">{duration}</Badge>}
                  {severity && <Badge variant={severity === "severe" ? "danger" : severity === "moderate" ? "warning" : "success"} size="sm">{severity}</Badge>}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Existing Conditions</p>
                {conditions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {conditions.map((c) => <Badge key={c} variant="info" size="sm">{c}</Badge>)}
                  </div>
                ) : <p className="text-sm text-neutral-500">None reported</p>}
                {isPregnant && <Badge variant="warning" size="sm" className="mt-2">Pregnant</Badge>}
                {isLactating && <Badge variant="warning" size="sm" className="mt-2 ml-1">Lactating</Badge>}
              </div>

              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Current Medicines</p>
                {medicines.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {medicines.map((m) => <Badge key={m} variant="muted" size="sm">{m}</Badge>)}
                  </div>
                ) : <p className="text-sm text-neutral-500">None reported</p>}
              </div>

              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Known Allergies</p>
                {allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {allergies.map((a) => <Badge key={a} variant="danger" size="sm">{a}</Badge>)}
                  </div>
                ) : <p className="text-sm text-neutral-500">None reported</p>}
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-6">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> All information above is patient-reported and will be clearly labelled as such for your doctor. The doctor will verify it during consultation.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setStep(3)}>Go Back</Button>
              <Button fullWidth onClick={saveAndProceed} rightIcon={<ChevronRight className="w-4 h-4" />} id="intake-submit-btn">Submit &amp; Continue</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
