"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";
import doctorsData from "@/lib/mock-data/doctors.json";
import patientsData from "@/lib/mock-data/patients.json";
import queueData from "@/lib/mock-data/queue.json";
import inventoryData from "@/lib/mock-data/inventory.json";
import { checkContraindications } from "@/lib/services/contraindication-engine";
import {
  searchBKKClinical,
  searchBKK,
  getBKKById,
  getRelatedFormulations,
  type BKKRecord,
  type BKKSearchResult,
  type ClinicalContext,
} from "@/lib/services/bkk-engine";
import { evaluateSafetyRules, isExcluded, type PatientClinicalContext } from "@/lib/services/bkk-safety-rules";
import { logAuditEvent } from "@/lib/services/bkk-audit-log";
import { FormulationCard } from "@/components/bkk/FormulationCard";
import { FormulationDetail } from "@/components/bkk/FormulationDetail";
import { ComparePanel } from "@/components/bkk/ComparePanel";
import { CompareTray } from "@/components/bkk/CompareTray";
import { SafetyAlertBadge } from "@/components/bkk/SafetyAlertBadge";
import {
  Stethoscope, LogOut, Users, Search, AlertTriangle, ChevronRight,
  CheckCircle, Clock, BookOpen, ShieldCheck, Package, FileText,
  Activity, User, Pill, X, Plus, Info, AlertCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import { DoctorStatusBadge } from "@/components/shared/DoctorStatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getDoshaConfig, getDoctorStatusConfig, getInventoryConfig, cn } from "@/lib/utils";

const DOCTOR_STATUSES = [
  { value: "available", label: "Available" },
  { value: "consulting", label: "In Consultation" },
  { value: "delayed", label: "Delayed" },
  { value: "on_rounds", label: "On Rounds" },
  { value: "emergency_duty", label: "Emergency Duty" },
  { value: "unavailable", label: "Unavailable" },
];

type TabKey = "queue" | "consultation" | "formulations" | "prescription";

interface PrescriptionLine {
  formulationId: string;
  formulationName: string;
  dose: string;
  anupana: string;
  duration: string;
  instructions: string;
}

const formatDoctorName = (name: string) => {
  if (!name) return "";
  return "Dr. " + name.replace(/^(Dr\.|Dr\s+)\s*/i, "").trim();
};

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>("queue");
  const [doctorStatus, setDoctorStatus] = useState("available");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [diagnosisConfirmed, setDiagnosisConfirmed] = useState(false);
  const [diagnosisText, setDiagnosisText] = useState("");
  const [prescriptionLines, setPrescriptionLines] = useState<PrescriptionLine[]>([]);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [pathyaApathya, setPathyaApathya] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [finalized, setFinalized] = useState(false);
  const [safetyAcknowledged, setSafetyAcknowledged] = useState<Record<string, boolean>>({});
  // BKK Clinical Explorer state
  const [bkkQuery, setBkkQuery] = useState("");
  const [bkkResults, setBkkResults] = useState<BKKSearchResult[]>([]);
  const [bkkSearched, setBkkSearched] = useState(false);
  const [bkkSelectedDetail, setBkkSelectedDetail] = useState<BKKRecord | null>(null);
  const [bkkCompareIds, setBkkCompareIds] = useState<string[]>([]);
  const [bkkShowCompare, setBkkShowCompare] = useState(false);
  const [bkkRejected, setBkkRejected] = useState<string[]>([]);
  const [bkkSelectedForReview, setBkkSelectedForReview] = useState<string[]>([]);
  const [bkkOverrideTarget, setBkkOverrideTarget] = useState<string | null>(null);
  const [bkkOverrideReason, setBkkOverrideReason] = useState("");

  const doctor = doctorsData.find((d) => d.id === currentUser?.id) ?? doctorsData[0];
  const dept = queueData.departments.find((d) => d.doctorId === doctor.id) ?? queueData.departments[0];
  const selectedPatient = patientsData.find((p) => p.id === selectedPatientId);

  // Build patient clinical context for safety rules
  const patientClinicalContext: PatientClinicalContext | undefined = useMemo(() => {
    if (!selectedPatient) return undefined;
    return {
      allergies: (selectedPatient as any).allergies ?? [],
      isPregnant: (selectedPatient as any).isPregnant ?? false,
      isLactating: (selectedPatient as any).isLactating ?? false,
      isPediatric: (selectedPatient as any).isPediatric ?? false,
      isGeriatric: (selectedPatient as any).isGeriatric ?? false,
      hasLiverDisease: (selectedPatient as any).hasLiverDisease ?? false,
      hasDiabetes: (selectedPatient as any).comorbidities?.includes("type2_diabetes") ?? false,
      hasKidneyDisease: (selectedPatient as any).hasKidneyDisease ?? false,
      comorbidities: (selectedPatient as any).comorbidities ?? [],
      currentMedicines: (selectedPatient as any).currentMedicines ?? [],
    };
  }, [selectedPatient]);

  useEffect(() => {
    if (!isAuthenticated) router.push("/doctor/login");
  }, [isAuthenticated, router]);

  function selectPatient(patientId: string) {
    setSelectedPatientId(patientId);
    setDiagnosisConfirmed(false);
    setDiagnosisText("");
    setPrescriptionLines([]);
    setFinalized(false);
    setBkkResults([]);
    setBkkSearched(false);
    setBkkSelectedDetail(null);
    setBkkCompareIds([]);
    setBkkRejected([]);
    setBkkSelectedForReview([]);
    setActiveTab("consultation");
  }

  function runBkkSearch() {
    if (!diagnosisConfirmed || !diagnosisText.trim()) return;
    
    const p = selectedPatient as any;
    let autoSymptoms: string[] = [];
    if (p?.symptoms) autoSymptoms.push(p.symptoms);
    if (p?.comorbidities?.length) autoSymptoms.push(...p.comorbidities);
    if (p?.currentMedicines?.length) autoSymptoms.push(...p.currentMedicines);

    const context: ClinicalContext = {
      confirmedDiagnosis: bkkQuery.trim() || diagnosisText.trim(),
      associatedSymptoms: autoSymptoms,
    };
    const results = searchBKKClinical(context);
    setBkkResults(results);
    setBkkSearched(true);
    logAuditEvent({
      eventType: "search_performed",
      actor: currentUser?.id ?? "unknown",
      details: `Clinical search: diagnosis="${context.confirmedDiagnosis}", context=[${autoSymptoms.join(", ")}]`,
    });
  }

  function handleBkkSelectForReview(record: BKKRecord) {
    if (!bkkSelectedForReview.includes(record.id)) {
      setBkkSelectedForReview((prev) => [...prev, record.id]);
      // Add to prescription lines
      if (!prescriptionLines.find((l) => l.formulationId === record.id)) {
        setPrescriptionLines((lines) => [
          ...lines,
          {
            formulationId: record.id,
            formulationName: record.name,
            dose: record.dosage,
            anupana: record.anupana,
            duration: "1 week",
            instructions: "",
          },
        ]);
      }
      logAuditEvent({
        eventType: "formulation_selected",
        actor: currentUser?.id ?? "unknown",
        formulationId: record.id,
        formulationName: record.name,
        details: `Selected for prescription`,
      });
    }
  }

  function handleBkkRemoveFromReview(record: BKKRecord) {
    if (bkkSelectedForReview.includes(record.id)) {
      setBkkSelectedForReview((prev) => prev.filter((id) => id !== record.id));
      setPrescriptionLines((lines) => lines.filter((l) => l.formulationId !== record.id));
      logAuditEvent({
        eventType: "formulation_removed",
        actor: currentUser?.id ?? "unknown",
        formulationId: record.id,
        formulationName: record.name,
        details: `Removed from prescription`,
      });
    }
  }

  function handleBkkReject(record: BKKRecord) {
    setBkkRejected((prev) => [...prev, record.id]);
    logAuditEvent({
      eventType: "formulation_rejected",
      actor: currentUser?.id ?? "unknown",
      formulationId: record.id,
      formulationName: record.name,
      details: "Rejected by doctor",
    });
  }

  function handleBkkOverride(record: BKKRecord) {
    if (!bkkOverrideReason.trim()) return;
    setBkkRejected((prev) => prev.filter((id) => id !== record.id));
    logAuditEvent({
      eventType: "doctor_override",
      actor: currentUser?.id ?? "unknown",
      formulationId: record.id,
      formulationName: record.name,
      details: "Doctor override of safety exclusion",
      overrideReason: bkkOverrideReason,
    });
    setBkkOverrideTarget(null);
    setBkkOverrideReason("");
  }

  function updateLine(id: string, field: keyof PrescriptionLine, value: string) {
    setPrescriptionLines((lines) =>
      lines.map((l) => (l.formulationId === id ? { ...l, [field]: value } : l))
    );
  }

  function finalizePrescription() {
    const hasUnacknowledgedFlags = prescriptionLines.some((line) => {
      const f = getBKKById(line.formulationId);
      if (!f || !patientClinicalContext) return false;
      const alerts = evaluateSafetyRules(f, patientClinicalContext);
      return alerts.length > 0 && !safetyAcknowledged[line.formulationId];
    });
    if (hasUnacknowledgedFlags) {
      alert("Please acknowledge all safety flags before finalizing.");
      return;
    }
    setFinalized(true);
  }

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "queue", label: "OPD Queue", icon: <Users className="w-4 h-4" /> },
    { key: "consultation", label: "Consultation", icon: <Stethoscope className="w-4 h-4" /> },
    { key: "formulations", label: "Formulations", icon: <BookOpen className="w-4 h-4" /> },
    { key: "prescription", label: "Prescription", icon: <FileText className="w-4 h-4" /> },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-black rounded-[0.4rem] flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-serif font-semibold text-neutral-900">{formatDoctorName(doctor.name)}</span>
              <span className="text-neutral-400 text-sm ml-2">· {doctor.department}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Status selector */}
            <select
              value={doctorStatus}
              onChange={(e) => setDoctorStatus(e.target.value)}
              className="text-sm border border-neutral-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-black"
              id="doctor-status-select"
            >
              {DOCTOR_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <DoctorStatusBadge status={doctorStatus} />
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
              id="doctor-logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all",
                  activeTab === tab.key
                    ? "border-black text-neutral-900"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                )}
                id={`tab-${tab.key}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {/* ─── QUEUE TAB ─────────────────────────────────────────── */}
        {activeTab === "queue" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats */}
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "In Queue", value: dept.queue.length, icon: <Users className="w-4 h-4" /> },
                { label: "Completed Today", value: doctor.todayConsultationsCompleted, icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
                { label: "Avg Duration", value: `${doctor.avgConsultationDurationMinutes}m`, icon: <Clock className="w-4 h-4" /> },
                { label: "Current OPD", value: doctor.opd, icon: <Activity className="w-4 h-4" /> },
              ].map((stat) => (
                <Card key={stat.label} padding="sm">
                  <div className="flex items-center gap-2 mb-1 text-neutral-400">{stat.icon} <span className="text-xs">{stat.label}</span></div>
                  <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                </Card>
              ))}
            </div>

            {/* Queue list */}
            <div className="lg:col-span-2">
              <Card padding="none">
                <div className="px-5 py-4 border-b border-neutral-100">
                  <p className="font-semibold text-neutral-900">OPD Queue — {dept.name}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Current token: {dept.currentToken}</p>
                </div>
                <div className="divide-y divide-neutral-100">
                  {dept.queue.map((q) => (
                    <button
                      key={q.token}
                      onClick={() => selectPatient(q.patientId ?? patientsData[0].id)}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors text-left"
                    >
                      <span className={cn(
                        "font-mono text-sm font-bold w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                        q.token === dept.currentToken ? "bg-black text-white" : "bg-neutral-100 text-neutral-600"
                      )}>{q.token}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">{q.patientName}</p>
                        <p className="text-xs text-neutral-400">{q.estimatedStart} – {q.estimatedEnd}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {q.urgency !== "normal" && (
                          <Badge variant={q.urgency === "urgent" ? "warning" : "danger"} size="sm" dot>
                            {q.urgency}
                          </Badge>
                        )}
                        {q.checkedIn && <CheckCircle className="w-4 h-4 text-green-500" />}
                        <ChevronRight className="w-4 h-4 text-neutral-300" />
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Doctor panel */}
            <div className="space-y-4">
              <Card>
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">My Status</p>
                <div className="space-y-2">
                  {DOCTOR_STATUSES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setDoctorStatus(s.value)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                        doctorStatus === s.value ? "bg-black text-white" : "hover:bg-neutral-50 text-neutral-700"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </Card>
              <Card>
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Today’s Summary</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Consultations</span>
                    <span className="font-semibold">{doctor.todayConsultationsCompleted}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Queue remaining</span>
                    <span className="font-semibold">{dept.queue.length}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ─── CONSULTATION TAB ──────────────────────────────────── */}
        {activeTab === "consultation" && (
          <div className="max-w-2xl">
            {!selectedPatient ? (
              <div className="text-center py-16">
                <Users className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">Select a patient from the OPD Queue to begin consultation.</p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab("queue")}>
                  Go to Queue
                </Button>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in">
                {/* Patient header */}
                <Card>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-neutral-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-neutral-900 text-lg">{selectedPatient.name}</h2>
                        {selectedPatient.isPregnant && <Badge variant="warning">Pregnant</Badge>}
                        {selectedPatient.isLactating && <Badge variant="warning">Lactating</Badge>}
                        {selectedPatient.isGeriatric && <Badge variant="info">Geriatric</Badge>}
                        {selectedPatient.isPediatric && <Badge variant="info">Pediatric</Badge>}
                      </div>
                      <p className="text-sm text-neutral-500">
                        {selectedPatient.age}y · {selectedPatient.gender} ·
                        {selectedPatient.previousVisits > 0
                          ? ` ${selectedPatient.previousVisits} previous visit(s)`
                          : " First visit"}
                      </p>
                    </div>
                    <Badge variant={selectedPatient.previousVisits > 0 ? "info" : "muted"} size="sm">
                      {selectedPatient.previousVisits > 0 ? "Returning" : "New"}
                    </Badge>
                  </div>
                </Card>

                {/* Safety flags */}
                {(selectedPatient.comorbidities.length > 0 || selectedPatient.allergies.length > 0 || selectedPatient.currentMedicines.length > 0) && (
                  <Card className="border-amber-200 bg-amber-50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-2 flex-1">
                        {selectedPatient.comorbidities.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Comorbidities</p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {selectedPatient.comorbidities.map((c) => <Badge key={c} variant="warning" size="sm">{c.replace(/_/g, " ")}</Badge>)}
                            </div>
                          </div>
                        )}
                        {selectedPatient.allergies.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Known Allergies</p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {selectedPatient.allergies.map((a) => <Badge key={a} variant="danger" size="sm">{a}</Badge>)}
                            </div>
                          </div>
                        )}
                        {selectedPatient.currentMedicines.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Current Medicines</p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {selectedPatient.currentMedicines.map((m) => <Badge key={m} variant="info" size="sm">{m}</Badge>)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Diagnosis confirmation gate */}
                <Card>
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Diagnosis Confirmation Gate</p>
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      You must confirm the diagnosis before proceeding to formulation selection. AI suggestions are advisory only.
                    </p>
                  </div>
                  <Textarea
                    label="Clinical Diagnosis (Ayurvedic + Contemporary)"
                    value={diagnosisText}
                    onChange={(e) => setDiagnosisText(e.target.value)}
                    placeholder="e.g., Amlapitta (Pitta imbalance with hyperacidity), GERD"
                    className="mb-4"
                    id="diagnosis-input"
                  />
                  <label className={cn(
                    "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                    diagnosisConfirmed ? "border-green-500 bg-green-50" : "border-neutral-200 bg-white hover:border-neutral-300"
                  )}>
                    <input
                      type="checkbox"
                      checked={diagnosisConfirmed}
                      onChange={() => {
                        if (!diagnosisText.trim()) {
                          alert("Please enter a clinical diagnosis in the text area above before confirming.");
                          return;
                        }
                        if (!diagnosisConfirmed && !bkkQuery) setBkkQuery(diagnosisText);
                        setDiagnosisConfirmed(!diagnosisConfirmed);
                      }}
                      className="mt-0.5 accent-green-600"
                      id="diagnosis-confirm-checkbox"
                    />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">I, {formatDoctorName(doctor.name)}, confirm this diagnosis</p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        This constitutes a clinical record. AI outputs are clearly labelled and were used as reference only.
                      </p>
                    </div>
                  </label>
                  {diagnosisConfirmed && (
                    <div className="flex gap-3 mt-4">
                      <Button
                        fullWidth
                        onClick={() => setActiveTab("formulations")}
                        rightIcon={<ChevronRight className="w-4 h-4" />}
                        id="go-formulations-btn"
                      >
                        Search Formulations
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ─── FORMULATIONS TAB (BKK Clinical Explorer) ─────────── */}
        {activeTab === "formulations" && (
          <div className="space-y-4">
            {/* Gate: must confirm diagnosis first */}
            {!diagnosisConfirmed && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                <BookOpen className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="font-semibold text-amber-800 mb-1">Diagnosis not yet confirmed</p>
                <p className="text-sm text-amber-700 mb-3">Please confirm a diagnosis in the Consultation tab before searching formulations.</p>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("consultation")} id="go-consult-btn">
                  Go to Consultation
                </Button>
              </div>
            )}

            {diagnosisConfirmed && (
              <>
                {/* Header + disclaimer */}
                <div className="bg-white rounded-xl border border-neutral-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-neutral-900">Clinical Formulation Explorer</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">Source-cited classical formulations. Clinician review required.</p>
                    </div>
                    <Badge variant="info" size="sm">BKK Dataset · CC BY 4.0</Badge>
                  </div>

                  {/* Patient context summary */}
                  {selectedPatient && (
                    <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100 mb-3">
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Patient-reported context (read-only)</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-neutral-600">{(selectedPatient as any).name} · {(selectedPatient as any).age}y · {(selectedPatient as any).gender}</span>
                        {(selectedPatient as any).isPregnant && <Badge variant="warning" size="sm">Pregnant</Badge>}
                        {(selectedPatient as any).isLactating && <Badge variant="warning" size="sm">Lactating</Badge>}
                        {(selectedPatient as any).isPediatric && <Badge variant="info" size="sm">Pediatric</Badge>}
                        {(selectedPatient as any).isGeriatric && <Badge variant="info" size="sm">Geriatric</Badge>}
                        {(selectedPatient as any).hasKidneyDisease && <Badge variant="warning" size="sm">Kidney Disease</Badge>}
                        {(selectedPatient as any).hasLiverDisease && <Badge variant="warning" size="sm">Liver Disease</Badge>}
                        {(selectedPatient as any).allergies?.length > 0 && (
                          <Badge variant="danger" size="sm">{(selectedPatient as any).allergies.length} Allergy/ies</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Doctor-confirmed diagnosis display */}
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 mb-3">
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">Doctor-confirmed diagnosis</p>
                    <p className="text-sm font-medium text-neutral-900">{diagnosisText}</p>
                  </div>

                  {/* Search inputs */}
                  <div>
                    <label htmlFor="bkk-clinical-query" className="block text-xs font-medium text-neutral-700 mb-1.5">
                      Search formulations
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                      <input
                        type="text"
                        value={bkkQuery}
                        onChange={(e) => setBkkQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && runBkkSearch()}
                        placeholder="Search by diagnosis, symptom, or ingredient"
                        className="flex-1 text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        id="bkk-clinical-query"
                      />
                      <Button onClick={runBkkSearch} size="sm" id="bkk-clinical-search-btn">
                        <Search className="w-4 h-4 mr-1" /> Search
                      </Button>
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-400">System-generated research results. Clinician independently determines final prescription.</p>
                </div>

                {/* Results + detail panel side by side */}
                <div className="flex gap-4">
                  <div className="space-y-3 min-w-0 flex-1">
                    {!bkkSearched && (
                      <div className="bg-white border border-neutral-100 rounded-xl p-8 text-center">
                        <BookOpen className="w-8 h-8 text-neutral-200 mx-auto mb-2" />
                        <p className="text-sm text-neutral-400">Click Search to find classically referenced formulations for this diagnosis.</p>
                      </div>
                    )}

                    {bkkSearched && bkkResults.length === 0 && (
                      <div className="bg-white border border-neutral-100 rounded-xl p-8 text-center">
                        <p className="text-sm text-neutral-400 font-medium">No matching formulations found.</p>
                        <p className="text-xs text-neutral-400 mt-1">Try broader terms or Sanskrit equivalents.</p>
                      </div>
                    )}

                    {bkkSearched && bkkResults.length > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-neutral-500">
                            {bkkResults.length} candidates · sorted by clinical relevance score
                          </p>
                          <p className="text-[10px] text-neutral-400">Classically referenced formulation options. Clinician review required.</p>
                        </div>
                        {bkkResults.map(({ record, score, matchReasons, matchedTags }) => {
                          const safetyAlerts = patientClinicalContext ? evaluateSafetyRules(record, patientClinicalContext) : [];
                          const excluded = (patientClinicalContext ? isExcluded(record, patientClinicalContext) : false) && !bkkOverrideTarget;
                          const isRejected = bkkRejected.includes(record.id);
                          const isReviewed = bkkSelectedForReview.includes(record.id);

                          if (isRejected) return null;

                          return (
                            <div key={record.id} className={cn(isReviewed && "ring-2 ring-emerald-400 ring-offset-1 rounded-xl")}>
                              {isReviewed && <p className="text-[10px] font-semibold text-emerald-600 px-2 pb-1">✓ Selected for prescription</p>}
                              <FormulationCard
                                record={record}
                                mode="doctor"
                                score={score}
                                matchReasons={matchReasons}
                                matchedTags={matchedTags}
                                safetyAlerts={safetyAlerts}
                                isExcluded={excluded}
                                isSelected={isReviewed}
                                isInCompare={bkkCompareIds.includes(record.id)}
                                onViewDetail={() => {
                                  setBkkSelectedDetail(record);
                                  logAuditEvent({ eventType: "formulation_viewed", actor: currentUser?.id ?? "unknown", formulationId: record.id, formulationName: record.name, details: "Viewed in doctor mode" });
                                }}
                                onToggleCompare={() => {
                                  setBkkCompareIds((prev) => prev.includes(record.id) ? prev.filter((x) => x !== record.id) : prev.length < 3 ? [...prev, record.id] : prev);
                                }}
                                onSelectForReview={() => handleBkkSelectForReview(record)}
                                onRemoveFromPrescription={() => handleBkkRemoveFromReview(record)}
                                onReject={() => handleBkkReject(record)}
                              />
                            </div>
                          );
                        })}
                      </>
                    )}



                  </div>

                  {/* Right Sidebar */}
                  <div className="w-[35%] xl:w-[30%] flex-shrink-0 sticky top-20 flex flex-col gap-4 max-h-[calc(100vh-6rem)]">
                    {/* Selected Panel */}
                    <div className="bg-white rounded-xl border border-neutral-100 p-4 shadow-sm flex-shrink-0">
                      <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                        SELECTED ({bkkSelectedForReview.length})
                      </p>
                      {bkkSelectedForReview.length === 0 ? (
                        <p className="text-sm text-neutral-400">No formulations selected yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {bkkSelectedForReview.map((id) => {
                            const r = getBKKById(id);
                            if (!r) return null;
                            return (
                              <div key={id} className="flex flex-col text-sm border-b border-neutral-100 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-neutral-800">{r.name}</span>
                              </div>
                            );
                          })}
                          <div className="pt-2">
                            <Button size="sm" fullWidth onClick={() => setActiveTab("prescription")} id="go-rx-btn">
                              Confirm Prescription
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {bkkSelectedDetail && (
                      <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm flex-1 overflow-y-auto">
                        <FormulationDetail
                          record={bkkSelectedDetail}
                          mode="doctor"
                          safetyAlerts={patientClinicalContext ? evaluateSafetyRules(bkkSelectedDetail, patientClinicalContext) : []}
                          relatedRecords={getRelatedFormulations(bkkSelectedDetail.id)}
                          onClose={() => setBkkSelectedDetail(null)}
                          onViewRelated={(id) => { const r = getBKKById(id); if (r) setBkkSelectedDetail(r); }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Compare tray */}
                <CompareTray
                  selectedCount={bkkCompareIds.length}
                  selectedNames={bkkCompareIds.map((id) => getBKKById(id)?.name ?? "")}
                  onClear={(i) => setBkkCompareIds((prev) => prev.filter((_, idx) => idx !== i))}
                  onClearAll={() => setBkkCompareIds([])}
                  onCompare={() => setBkkShowCompare(true)}
                />

                {/* Compare Modal */}
                {bkkShowCompare && bkkCompareIds.length >= 2 && (
                  <ComparePanel
                    ids={bkkCompareIds}
                    mode="doctor"
                    patientContext={patientClinicalContext}
                    onClose={() => setBkkShowCompare(false)}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* ─── PRESCRIPTION TAB ──────────────────────────────────── */}
        {activeTab === "prescription" && (
          <div className="max-w-2xl space-y-5">
            {finalized ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="font-serif text-2xl font-semibold text-neutral-900 mb-2">Prescription Finalized</h2>
                <p className="text-neutral-500 mb-6">
                  The prescription has been locked and sent to the patient record. Pathya-Apathya is now visible to the patient.
                </p>
                <Button onClick={() => { setSelectedPatientId(null); setFinalized(false); setActiveTab("queue"); }} id="next-patient-btn">
                  Next Patient
                </Button>
              </div>
            ) : (
              <>
                {prescriptionLines.length === 0 ? (
                  <div className="text-center py-12">
                    <Pill className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500">No formulations added yet.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab("formulations")}>Search Formulations</Button>
                  </div>
                ) : (
                  <>
                    <Card>
                      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">Prescription Editor</p>
                      <div className="space-y-5">
                        {prescriptionLines.map((line) => {
                          const f = getBKKById(line.formulationId);
                          if (!f) return null;
                          const safetyAlerts = patientClinicalContext ? evaluateSafetyRules(f, patientClinicalContext) : [];

                          return (
                            <div key={line.formulationId} className="p-4 border border-neutral-200 rounded-xl">
                              <div className="flex items-center justify-between mb-3">
                                <p className="font-semibold text-neutral-900">{line.formulationName}</p>
                                <button onClick={() => {
                                  setPrescriptionLines((lines) => lines.filter((l) => l.formulationId !== line.formulationId));
                                  setBkkSelectedForReview((prev) => prev.filter((id) => id !== line.formulationId));
                                }}>
                                  <X className="w-4 h-4 text-neutral-400 hover:text-neutral-600" />
                                </button>
                              </div>

                              {/* Safety flag acknowledgement */}
                              {safetyAlerts.length > 0 && (
                                <div className="mb-3 space-y-2">
                                  {safetyAlerts.map((flag, fi) => (
                                    <div key={fi} className={cn(
                                      "p-3 rounded-lg border text-xs",
                                      flag.severity === "exclude" ? "bg-red-50 border-red-300" : "bg-amber-50 border-amber-300"
                                    )}>
                                      <div className="flex items-start gap-2 mb-2">
                                        <AlertTriangle className={cn("w-3.5 h-3.5 flex-shrink-0", flag.severity === "exclude" ? "text-red-500" : "text-amber-500")} />
                                        <p className={cn("font-semibold", flag.severity === "exclude" ? "text-red-700" : "text-amber-700")}>{flag.message}</p>
                                      </div>
                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={!!safetyAcknowledged[line.formulationId]}
                                          onChange={(e) => setSafetyAcknowledged((prev) => ({ ...prev, [line.formulationId]: e.target.checked }))}
                                          className="accent-red-600"
                                        />
                                        <span className="text-red-700 font-medium">I acknowledge this {flag.severity} risk and override as clinically indicated</span>
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-3">
                                <Input
                                  label="Dose"
                                  value={line.dose}
                                  onChange={(e) => updateLine(line.formulationId, "dose", e.target.value)}
                                  id={`dose-${line.formulationId}`}
                                />
                                <Input
                                  label="Duration"
                                  value={line.duration}
                                  onChange={(e) => updateLine(line.formulationId, "duration", e.target.value)}
                                  placeholder="e.g. 2 weeks"
                                  id={`duration-${line.formulationId}`}
                                />
                                <Input
                                  label="Anupana (Vehicle)"
                                  value={line.anupana}
                                  onChange={(e) => updateLine(line.formulationId, "anupana", e.target.value)}
                                  id={`anupana-${line.formulationId}`}
                                />
                                <Input
                                  label="Additional Instructions"
                                  value={line.instructions}
                                  onChange={(e) => updateLine(line.formulationId, "instructions", e.target.value)}
                                  placeholder="e.g. Take before meals"
                                  id={`instructions-${line.formulationId}`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>

                    {/* Pathya-Apathya */}
                    <Card>
                      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Pathya-Apathya (Diet &amp; Lifestyle)</p>
                      <Textarea
                        value={pathyaApathya}
                        onChange={(e) => setPathyaApathya(e.target.value)}
                        placeholder="Recommended diet, lifestyle modifications, foods to avoid..."
                        className="mb-3"
                        id="pathya-apathya-input"
                      />
                      <p className="text-xs text-neutral-400">
                        This will be visible to the patient only after you finalize the prescription.
                      </p>
                    </Card>

                    {/* Notes & Follow-up */}
                    <Card>
                      <div className="space-y-4">
                        <Textarea
                          label="Doctor's Notes"
                          value={prescriptionNotes}
                          onChange={(e) => setPrescriptionNotes(e.target.value)}
                          placeholder="Internal clinical notes (not visible to patient)"
                          id="prescription-notes"
                        />
                        <Input
                          label="Follow-up Date"
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          id="follow-up-date"
                        />
                      </div>
                    </Card>

                    {/* Finalize */}
                    <Card className="border-2 border-black">
                      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
                        Finalize Consultation
                      </p>
                      <div className="flex items-start gap-2 p-3 bg-neutral-100 rounded-lg mb-4">
                        <ShieldCheck className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-neutral-600">
                          Finalizing this prescription locks the record, marks the token as completed, and makes Pathya-Apathya visible to the patient. This action cannot be undone.
                        </p>
                      </div>
                      <Button
                        fullWidth
                        size="lg"
                        onClick={finalizePrescription}
                        id="finalize-prescription-btn"
                      >
                        Finalize &amp; Close Consultation
                      </Button>
                    </Card>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
