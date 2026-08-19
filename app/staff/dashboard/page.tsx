"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";
import doctorsData from "@/lib/mock-data/doctors.json";
import patientsData from "@/lib/mock-data/patients.json";
import queueData from "@/lib/mock-data/queue.json";
import {
  Calendar, LogOut, Users, AlertTriangle, CheckCircle,
  Clock, Activity, User, ChevronRight, Bell, RefreshCw, Search
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { DoctorStatusBadge } from "@/components/shared/DoctorStatusBadge";
import { cn } from "@/lib/utils";

const DOCTOR_STATUSES = [
  { value: "available", label: "Available" },
  { value: "consulting", label: "Consulting" },
  { value: "delayed", label: "Delayed" },
  { value: "on_rounds", label: "On Rounds" },
  { value: "emergency_duty", label: "Emergency" },
  { value: "unavailable", label: "Unavailable" },
];

type TabKey = "queue" | "triage" | "doctors" | "checkin";

export default function StaffDashboardPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>("queue");
  const [doctorStatuses, setDoctorStatuses] = useState<Record<string, string>>(
    Object.fromEntries(doctorsData.map((d) => [d.id, d.currentStatus]))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [checkedIn, setCheckedIn] = useState<number[]>([]);
  const [redFlags] = useState([
    {
      id: 1,
      patientName: "Unknown Patient",
      keywords: ["chest pain", "shortness of breath"],
      urgency: "emergency",
      time: "10:42 AM",
      acknowledged: false,
    },
  ]);

  useEffect(() => {
    if (!isAuthenticated) router.push("/staff/login");
  }, [isAuthenticated, router]);

  function refresh() {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  }

  function updateDoctorStatus(doctorId: string, status: string) {
    setDoctorStatuses((prev) => ({ ...prev, [doctorId]: status }));
  }

  function checkInToken() {
    const token = parseInt(tokenInput);
    if (!isNaN(token)) {
      setCheckedIn((prev) => [...prev, token]);
      setTokenInput("");
    }
  }

  const allQueued = queueData.departments.flatMap((d) =>
    d.queue.map((q) => ({ ...q, department: d.name, doctorId: d.doctorId }))
  );

  const filteredQueue = allQueued.filter((q) =>
    searchQuery ? q.patientName.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "queue", label: "OPD Queue", icon: <Users className="w-4 h-4" />, count: allQueued.length },
    { key: "triage", label: "Triage Alerts", icon: <AlertTriangle className="w-4 h-4" />, count: redFlags.length },
    { key: "doctors", label: "Doctor Status", icon: <Activity className="w-4 h-4" /> },
    { key: "checkin", label: "Check-in", icon: <CheckCircle className="w-4 h-4" /> },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-black rounded-[0.4rem] flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-serif font-semibold text-neutral-900">{currentUser?.name}</span>
              <span className="text-neutral-400 text-sm ml-2">· {currentUser?.department}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={refresh} className="text-neutral-400 hover:text-neutral-600 transition-colors">
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </button>
            <button onClick={() => { logout(); router.push("/"); }} className="text-neutral-400 hover:text-neutral-600" id="staff-logout-btn">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all",
                  activeTab === tab.key ? "border-black text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-700"
                )}
                id={`staff-tab-${tab.key}`}
              >
                {tab.icon} {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-xs font-bold",
                    tab.key === "triage" ? "bg-red-500 text-white" : "bg-neutral-200 text-neutral-700"
                  )}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {/* Queue Tab */}
        {activeTab === "queue" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                  id="queue-search"
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Waiting", value: allQueued.length },
                { label: "Urgent", value: allQueued.filter((q) => q.urgency === "urgent").length },
                { label: "Emergency", value: allQueued.filter((q) => q.urgency === "emergency").length },
                { label: "Checked In", value: checkedIn.length },
              ].map((s) => (
                <Card key={s.label} padding="sm">
                  <p className="text-xs text-neutral-400 mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
                </Card>
              ))}
            </div>

            {/* Queue by department */}
            {queueData.departments.map((dept) => (
              <Card key={dept.id} padding="none">
                <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-neutral-900">{dept.name}</p>
                    <p className="text-xs text-neutral-500">
                      Current: Token {dept.currentToken} · Doctor: {doctorsData.find((d) => d.id === dept.doctorId)?.name}
                    </p>
                  </div>
                  <DoctorStatusBadge status={doctorStatuses[dept.doctorId]} />
                </div>
                <div className="divide-y divide-neutral-100">
                  {dept.queue
                    .filter((q) =>
                      searchQuery ? q.patientName.toLowerCase().includes(searchQuery.toLowerCase()) : true
                    )
                    .map((q) => (
                      <div key={q.token} className="px-5 py-3.5 flex items-center gap-3">
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
                            <Badge variant={q.urgency === "emergency" ? "danger" : "warning"} size="sm" dot>
                              {q.urgency}
                            </Badge>
                          )}
                          {checkedIn.includes(q.token) ? (
                            <Badge variant="success" size="sm" dot>Checked In</Badge>
                          ) : (
                            <button
                              onClick={() => setCheckedIn((prev) => [...prev, q.token])}
                              className="text-xs text-neutral-500 hover:text-neutral-800 border border-neutral-200 px-2 py-1 rounded-lg hover:bg-neutral-50 transition-all"
                            >
                              Check In
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Triage Tab */}
        {activeTab === "triage" && (
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-400 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-sm font-semibold text-red-800">{redFlags.length} active triage alert(s) require acknowledgement</p>
            </div>
            {redFlags.map((flag) => (
              <Card key={flag.id} className="border-red-300">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-red-900">{flag.patientName}</p>
                      <Badge variant="danger" dot>{flag.urgency.toUpperCase()}</Badge>
                    </div>
                    <p className="text-xs text-neutral-500 mb-2">{flag.time}</p>
                    <p className="text-sm text-neutral-700 mb-3">Red-flag keywords: <strong>{flag.keywords.join(", ")}</strong></p>
                    <div className="flex gap-2">
                      <Button variant="danger" size="sm" id={`acknowledge-alert-${flag.id}`}>
                        Acknowledge &amp; Dispatch Triage
                      </Button>
                      <Button variant="outline" size="sm">Escalate to Senior</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Doctor Status Tab */}
        {activeTab === "doctors" && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">Manage doctor availability and OPD flow. Changes are reflected in real-time patient queue tracker.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctorsData.map((doc) => (
                <Card key={doc.id}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-neutral-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-900">{doc.name}</p>
                      <p className="text-xs text-neutral-500">{doc.specialization} · {doc.opd}</p>
                      <div className="mt-1">
                        <DoctorStatusBadge status={doctorStatuses[doc.id]} />
                      </div>
                    </div>
                    <div className="text-right text-xs text-neutral-500">
                      <p>{doc.todayQueue} queued</p>
                      <p>{doc.todayConsultationsCompleted} done</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {DOCTOR_STATUSES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => updateDoctorStatus(doc.id, s.value)}
                        className={cn(
                          "py-2 px-3 rounded-lg text-xs font-medium border transition-all",
                          doctorStatuses[doc.id] === s.value
                            ? "bg-black text-white border-black"
                            : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Check-in Tab */}
        {activeTab === "checkin" && (
          <div className="max-w-md space-y-6">
            <div>
              <h2 className="font-serif text-xl font-semibold text-neutral-900 mb-2">Token Check-in</h2>
              <p className="text-sm text-neutral-500">Enter the patient’s token number to mark them as checked in.</p>
            </div>
            <Card>
              <div className="flex gap-3">
                <Input
                  placeholder="Token number"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && checkInToken()}
                  type="number"
                  id="token-input"
                />
                <Button onClick={checkInToken} id="checkin-btn">Check In</Button>
              </div>
              {checkedIn.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Checked In Today</p>
                  <div className="flex flex-wrap gap-2">
                    {checkedIn.map((t) => (
                      <span key={t} className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-sm font-mono">
                        <CheckCircle className="w-3.5 h-3.5" /> {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
