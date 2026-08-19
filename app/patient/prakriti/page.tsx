"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";
import { scorePrakriti } from "@/lib/services/prakriti-scorer";
import questions from "@/lib/mock-data/prakriti-questions.json";
import { Leaf, ChevronRight, SkipForward, ChevronLeft, Info } from "lucide-react";
import { PatientNav } from "@/components/shared/PatientNav";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { getDoshaConfig } from "@/lib/utils";
import { cn } from "@/lib/utils";

const DOSHA_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  vata: { border: "border-blue-400", bg: "bg-blue-600", text: "text-blue-700" },
  pitta: { border: "border-orange-400", bg: "bg-orange-500", text: "text-orange-700" },
  kapha: { border: "border-green-500", bg: "bg-green-600", text: "text-green-700" },
};

export default function PrakritiPage() {
  const router = useRouter();
  const { updatePatientSession, language } = useAppStore();
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Array<{ questionId: number; selectedDosha: "vata" | "pitta" | "kapha"; weight: number }>>([]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof scorePrakriti> | null>(null);

  function selectAnswer(dosha: "vata" | "pitta" | "kapha", weight: number) {
    const existing = answers.findIndex((a) => a.questionId === questions[currentQ].id);
    const newAnswer = { questionId: questions[currentQ].id, selectedDosha: dosha, weight };
    if (existing >= 0) {
      const updated = [...answers];
      updated[existing] = newAnswer;
      setAnswers(updated);
    } else {
      setAnswers([...answers, newAnswer]);
    }
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        finishAssessment([...answers.filter((a) => a.questionId !== newAnswer.questionId), newAnswer]);
      }
    }, 300);
  }

  function finishAssessment(finalAnswers: typeof answers) {
    const scored = scorePrakriti(finalAnswers);
    setResult(scored);
    setShowResult(true);
    updatePatientSession({ prakritiAnswers: finalAnswers, prakritiResult: scored, prakritiSkipped: false });
  }

  function skipPrakriti() {
    updatePatientSession({ prakritiSkipped: true, prakritiAnswers: [], prakritiResult: null, registrationStep: "appointment" });
    router.push("/patient/appointment");
  }

  function proceedToAppointment() {
    updatePatientSession({ registrationStep: "appointment" });
    router.push("/patient/appointment");
  }

  const progress = questions.length > 0 ? ((currentQ) / questions.length) * 100 : 0;
  const currentQuestion = questions[currentQ];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id);

  // Result view
  if (showResult && result) {
    const doshaData = [
      { key: "vata", pct: result.vata },
      { key: "pitta", pct: result.pitta },
      { key: "kapha", pct: result.kapha },
    ];
    return (
      <div className="min-h-screen flex flex-col">
        <PatientNav onBack={() => setShowResult(false)} />
        <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-5">
            <Leaf className="w-5 h-5 text-neutral-400" />
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Prakriti Assessment Result</p>
          </div>
          <h1 className="font-serif text-3xl font-semibold text-neutral-900 mb-2">Your Constitution Profile</h1>

          {/* AI disclaimer */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-6">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              <strong>AI-assisted assessment — clinician verification required.</strong> This is a preliminary profile based on your answers. Your doctor will review and may modify it during consultation.
            </p>
          </div>

          {/* VPK chart */}
          <div className="bg-white rounded-xl border border-neutral-100 p-6 mb-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-semibold text-neutral-900 text-lg">
                  Prakriti: <span className="capitalize">{result.primaryDosha}</span>-<span className="capitalize">{result.secondaryDosha}</span>
                </p>
                <p className="text-sm text-neutral-500">Based on {answers.length} questions</p>
              </div>
              <Badge
                variant={result.confidence === "high" ? "success" : result.confidence === "moderate" ? "warning" : "muted"}
                dot
              >
                {result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1)} Confidence
              </Badge>
            </div>

            <div className="space-y-4">
              {doshaData.map((d) => {
                const config = getDoshaConfig(d.key);
                return (
                  <div key={d.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2.5 h-2.5 rounded-full", DOSHA_COLORS[d.key].bg)} />
                        <span className="text-sm font-medium text-neutral-800">{config.label}</span>
                        <span className="text-xs text-neutral-400">{config.description}</span>
                      </div>
                      <span className="text-sm font-bold text-neutral-900">{d.pct}%</span>
                    </div>
                    <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", DOSHA_COLORS[d.key].bg)}
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interpretation */}
          <div className="p-5 bg-neutral-50 border border-neutral-100 rounded-xl mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">Interpretation</p>
            <p className="text-sm text-neutral-700 leading-relaxed">{result.interpretation}</p>
          </div>

          <p className="text-xs text-neutral-400 mb-6">{result.disclaimer}</p>

          <Button
            fullWidth
            size="lg"
            onClick={proceedToAppointment}
            rightIcon={<ChevronRight className="w-4 h-4" />}
            id="prakriti-proceed-btn"
          >
            Book Appointment
          </Button>
        </div>
      </div>
    );
  }

  // Intro view
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col">
        <PatientNav onBack={() => router.push("/patient/intake")} />

        <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div key={s} className={cn("h-1 rounded-full flex-1", s <= 5 ? "bg-black" : "bg-neutral-200")} />
            ))}
          </div>
          <div className="flex items-center gap-2 mb-5">
            <Leaf className="w-5 h-5 text-neutral-400" />
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Step 5 · Optional</p>
          </div>
          <h1 className="font-serif text-3xl font-semibold text-neutral-900 mb-3">Prakriti Assessment</h1>
          <p className="text-neutral-600 text-sm leading-relaxed mb-6">
            Prakriti is your Ayurvedic body-constitution — a combination of Vata (air &amp; space), Pitta (fire &amp; water), and Kapha (earth &amp; water) that influences how you respond to disease and treatment.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {["Vata", "Pitta", "Kapha"].map((d) => {
              const cfg = getDoshaConfig(d.toLowerCase());
              return (
                <div key={d} className={cn("p-4 rounded-xl border text-center", cfg.bgColor, "border-neutral-200")}>
                  <p className={cn("font-semibold text-sm", cfg.color)}>{d}</p>
                  <p className="text-xs text-neutral-500 mt-1">{cfg.description.split(" — ")[0]}</p>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-xl mb-8">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-neutral-700">About 10 minutes · {questions.length} questions</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Covers physical traits, digestion, sleep, temperament, and lifestyle. All results are shown as relative percentages, not a single fixed label.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={skipPrakriti} leftIcon={<SkipForward className="w-4 h-4" />} id="prakriti-skip-btn">
              Skip for now
            </Button>
            <Button fullWidth onClick={() => setStarted(true)} rightIcon={<ChevronRight className="w-4 h-4" />} id="prakriti-start-btn">
              Begin Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Question view
  return (
    <div className="min-h-screen flex flex-col">
      <PatientNav onBack={() => currentQ > 0 ? setCurrentQ(currentQ - 1) : setStarted(false)} />
      <div className="bg-white border-b border-neutral-100 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-neutral-500">Question {currentQ + 1} of {questions.length}</p>
            <button onClick={skipPrakriti} className="text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-1">
              <SkipForward className="w-3 h-3" /> Skip assessment
            </button>
          </div>
          <ProgressBar value={progress} size="sm" animated />
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8 animate-fade-in">
        <div className="mb-2">
          <Badge variant="muted" size="sm" className="capitalize">{currentQuestion.category}</Badge>
        </div>
        <h2 className="font-serif text-2xl font-semibold text-neutral-900 mb-2">
          {language !== "en" && currentQuestion.questionHi ? currentQuestion.questionHi : currentQuestion.question}
        </h2>
        {language !== "en" && currentQuestion.questionHi && (
          <p className="text-sm text-neutral-400 mb-6">{currentQuestion.question}</p>
        )}
        {!currentQuestion.questionHi && <div className="mb-6" />}

        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((opt) => {
            const isSelected = currentAnswer?.selectedDosha === opt.dosha;
            const colors = DOSHA_COLORS[opt.dosha];
            return (
              <button
                key={opt.dosha}
                onClick={() => selectAnswer(opt.dosha as "vata" | "pitta" | "kapha", opt.weight)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
                  isSelected
                    ? cn(colors.border, "bg-neutral-50 scale-[1.01]")
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all",
                    isSelected ? cn(colors.border, colors.bg) : "border-neutral-300"
                  )}>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {language !== "en" && opt.labelHi ? opt.labelHi : opt.label}
                    </p>
                    {language !== "en" && opt.labelHi && (
                      <p className="text-xs text-neutral-400 mt-0.5">{opt.label}</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => currentQ > 0 && setCurrentQ(currentQ - 1)}
            disabled={currentQ === 0}
            className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <p className="text-xs text-neutral-400">{answers.length} answered</p>
          {currentQ < questions.length - 1 && (
            <button
              onClick={() => setCurrentQ(currentQ + 1)}
              disabled={!currentAnswer}
              className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Skip <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {currentQ === questions.length - 1 && answers.length >= Math.floor(questions.length * 0.7) && (
            <Button size="sm" onClick={() => finishAssessment(answers)} id="prakriti-finish-btn">
              Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
