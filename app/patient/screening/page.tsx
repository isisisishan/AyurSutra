"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";
import { screenForRedFlags } from "@/lib/services/red-flag-screener";
import { AlertTriangle, Mic, MicOff, ChevronRight, Activity, ShieldCheck, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const QUICK_SYMPTOMS = [
  "Chest pain",
  "Severe breathing difficulty",
  "Fainting or unconsciousness",
  "Severe bleeding",
  "Confusion or disorientation",
  "Very high fever",
  "Severe allergic reaction",
  "Seizure or convulsion",
  "Vomiting blood",
  "Severe headache (sudden)",
];

export default function ScreeningPage() {
  const router = useRouter();
  const { updatePatientSession } = useAppStore();
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<ReturnType<typeof screenForRedFlags> | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  function toggleSymptom(symptom: string) {
    setSelected((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
    setResult(null);
  }

  function startVoice() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input not supported in this browser. Please type your symptoms.");
      return;
    }
    const SR = ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }

  function stopVoice() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  function runScreening() {
    const combined = [...selected, input].join(". ");
    const screenResult = screenForRedFlags(combined);
    setResult(screenResult);

    if (screenResult.hasRedFlag) {
      updatePatientSession({
        redFlagDetected: true,
        redFlagKeywords: screenResult.triggeredKeywords,
      });
    } else {
      updatePatientSession({
        redFlagDetected: false,
        emergencyScreeningPassed: true,
        registrationStep: "registration",
      });
    }
  }

  function proceedNormal() {
    router.push("/patient/register");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-white border-b border-neutral-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-7 h-7 bg-black rounded-[0.4rem] flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">AyurSutra · Safety Screening</p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8 animate-fade-in">
        {/* Step bar */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className={cn("h-1 rounded-full flex-1", s <= 2 ? "bg-black" : "bg-neutral-200")} />
          ))}
        </div>

        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Step 2 · Emergency Screening
          </p>
        </div>

        <h1 className="font-serif text-3xl font-semibold text-neutral-900 mb-2">
          Safety Check
        </h1>
        <p className="text-neutral-500 text-sm mb-8">
          Before we begin, please tell us if you are experiencing any of the following right now. This helps us ensure you get the right care immediately.
        </p>

        {/* Red Flag Alert — shown if triggered */}
        {result?.hasRedFlag && (
          <div className="mb-6 rounded-xl border-2 border-red-500 bg-red-600 p-5 text-white animate-fade-in">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-lg">Urgent Attention Required</p>
                <p className="text-red-100 text-sm mt-1">
                  {result.guidanceMessage}
                </p>
              </div>
            </div>
            <div className="bg-red-700 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-red-100 uppercase tracking-wide">What to do now:</p>
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <p className="text-sm">Go directly to the Emergency / Triage desk</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <p className="text-sm">Sit down and alert a nearby hospital staff member</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <p className="text-sm">Do NOT leave the hospital premises</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 bg-red-700 rounded-lg p-3">
              <Phone className="w-4 h-4" />
              <p className="text-sm">Emergency: <strong>1800-XXX-XXXX</strong> (toll-free)</p>
            </div>
            <p className="mt-4 text-xs text-red-200">
              ✓ Triage staff have been alerted. Priority: <strong className="text-white uppercase">{result.urgencyLevel}</strong>
            </p>
            <p className="text-xs text-red-200 mt-1">
              ⚕️ This system does not diagnose conditions. A licensed clinician will assess you.
            </p>
          </div>
        )}

        {/* Cleared */}
        {result && !result.hasRedFlag && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="w-6 h-6 text-green-600" />
              <p className="font-semibold text-green-800">No emergency symptoms detected</p>
            </div>
            <p className="text-sm text-green-700">
              You can proceed with regular appointment booking. If your condition changes, please inform hospital staff immediately.
            </p>
            <Button
              fullWidth
              className="mt-4"
              onClick={proceedNormal}
              rightIcon={<ChevronRight className="w-4 h-4" />}
              id="screening-proceed-btn"
            >
              Continue to Registration
            </Button>
          </div>
        )}

        {/* Quick symptom checkboxes */}
        {!result && (
          <>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
                Are you experiencing any of these right now?
              </p>
              <div className="grid grid-cols-1 gap-2">
                {QUICK_SYMPTOMS.map((symptom) => (
                  <label
                    key={symptom}
                    htmlFor={`symptom-${symptom}`}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      selected.includes(symptom)
                        ? "border-red-400 bg-red-50"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    )}
                  >
                    <input
                      type="checkbox"
                      id={`symptom-${symptom}`}
                      checked={selected.includes(symptom)}
                      onChange={() => toggleSymptom(symptom)}
                      className="w-4 h-4 accent-red-600 flex-shrink-0"
                    />
                    <span
                      className={cn(
                        "text-sm",
                        selected.includes(symptom)
                          ? "text-red-800 font-medium"
                          : "text-neutral-700"
                      )}
                    >
                      {symptom}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Voice/text input for additional symptoms */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                Or describe your symptoms
              </p>
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe how you are feeling right now..."
                  className="w-full border border-neutral-200 rounded-lg p-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black resize-none min-h-[80px] bg-neutral-50"
                  id="screening-text-input"
                />
                <button
                  onClick={isListening ? stopVoice : startVoice}
                  className={cn(
                    "absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  )}
                  title={isListening ? "Stop recording" : "Voice input"}
                  id="screening-voice-btn"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                fullWidth
                onClick={runScreening}
                id="screening-check-btn"
              >
                Run Safety Check
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  updatePatientSession({ emergencyScreeningPassed: true, registrationStep: "registration" });
                  router.push("/patient/register");
                }}
                id="screening-skip-btn"
              >
                None of the above
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
