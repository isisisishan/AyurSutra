"use client";
import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store/app-store";
import doctorsData from "@/lib/mock-data/doctors.json";
import queueData from "@/lib/mock-data/queue.json";
import { DoctorStatusBadge } from "@/components/shared/DoctorStatusBadge";
import { estimateConsultationWindow } from "@/lib/services/queue-estimator";
import { Clock, Hash, Users, Bell, RefreshCw, AlertTriangle, CheckCircle, Building2 } from "lucide-react";
import { PatientNav } from "@/components/shared/PatientNav";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getDoctorStatusConfig } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function QueueTrackerPage() {
  const router = useRouter();
  const { patientSession } = useAppStore();
  const { appointmentToken, selectedDepartment, selectedDoctorId } = patientSession;

  const doctor = doctorsData.find((d) => d.id === selectedDoctorId) ?? doctorsData[0];
  const dept = queueData.departments.find((d) => d.doctorId === doctor.id) ?? queueData.departments[0];

  // Simulate live queue position
  const [queuePosition, setQueuePosition] = useState(3);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [doctorStatus, setDoctorStatus] = useState(doctor.currentStatus);

  const window = estimateConsultationWindow(
    appointmentToken ?? 19,
    { currentStatus: doctorStatus as any, avgConsultationDurationMinutes: doctor.avgConsultationDurationMinutes, currentToken: dept.currentToken },
    dept.queue as any
  );

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshed(new Date());
      setIsRefreshing(false);
    }, 800);
  }, []);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Demo: simulate queue moving
  function simulateAdvance() {
    setQueuePosition((p) => Math.max(0, p - 1));
    if (queuePosition === 2) {
      setNotifications((n) => ["You are 2 patients away — please make your way to the OPD area.", ...n]);
    }
    if (queuePosition === 1) {
      setNotifications((n) => ["You are NEXT! Please proceed to the OPD.", ...n]);
    }
  }

  function simulateDelay() {
    setDoctorStatus("delayed");
    setNotifications((n) => [`Dr. ${doctor.name.split(" ")[1]} is running late. Your estimated window is now ${window.startTime} – ${window.endTime}.`, ...n]);
  }

  const statusCfg = getDoctorStatusConfig(doctorStatus);

  return (
    <div className="min-h-screen bg-neutral-50">
      <PatientNav 
        backLabel="← Back to appointments" 
        onBack={() => router.push("/patient/appointment")} 
      />

      <div className="max-w-lg mx-auto px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-500">Live Queue</p>
          <p className="text-xs text-neutral-400 mt-0.5">
            Updated {lastRefreshed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <button
          onClick={refresh}
          className={cn("flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 transition-colors", isRefreshing && "opacity-50")}
          id="queue-refresh-btn"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-2 animate-fade-in">
            {notifications.map((n, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Bell className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">{n}</p>
              </div>
            ))}
          </div>
        )}

        {/* Token */}
        <div className="bg-black text-white rounded-2xl p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">Your Token</p>
          <p className="font-mono text-6xl font-bold text-white tracking-tighter">
            {appointmentToken ?? "--"}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className={cn("w-2 h-2 rounded-full", queuePosition > 0 ? "bg-amber-400 animate-pulse" : "bg-green-400")} />
            <span className="text-sm text-neutral-300">
              {queuePosition === 0 ? "Your turn now!" : `${queuePosition} patient${queuePosition > 1 ? "s" : ""} ahead`}
            </span>
          </div>
        </div>

        {/* Estimated window */}
        <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Estimated Consultation Window</p>
          </div>
          <div className="px-5 py-5">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-neutral-400" />
              <p className="text-2xl font-semibold text-neutral-900">
                {window.startTime} &ndash; {window.endTime}
              </p>
            </div>
            {window.isDelayed && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <p className="text-sm text-amber-700">Doctor is running approximately {window.delayMinutes} min late. Times updated.</p>
              </div>
            )}
            <p className="text-xs text-neutral-400">
              Estimates are approximate ± 15 minutes. You’ll be notified when you’re 2 patients away.
            </p>
          </div>
        </div>

        {/* Doctor status */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">Doctor Status</p>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-serif text-neutral-500">Dr</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-neutral-900">{doctor.name}</p>
              <p className="text-sm text-neutral-500">{doctor.specialization}</p>
              <div className="flex items-center gap-2 mt-2">
                <DoctorStatusBadge status={doctorStatus} />
                <span className="text-xs text-neutral-400">
                  Updated {new Date(doctor.statusUpdatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Queue overview */}
        <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">OPD Queue</p>
            <Badge variant="muted" size="sm">
              <Users className="w-3 h-3 mr-1" />
              {dept.queue.length} waiting
            </Badge>
          </div>
          <div className="divide-y divide-neutral-100">
            {dept.queue.map((q, idx) => (
              <div
                key={q.token}
                className={cn(
                  "px-5 py-3.5 flex items-center gap-3",
                  q.token === appointmentToken && "bg-neutral-50"
                )}
              >
                <span className={cn(
                  "font-mono text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  q.token === appointmentToken ? "bg-black text-white" : "bg-neutral-100 text-neutral-600"
                )}>
                  {q.token}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">
                    {q.token === appointmentToken ? `${q.patientName} (You)` : q.patientName}
                  </p>
                  <p className="text-xs text-neutral-400">{q.estimatedStart} – {q.estimatedEnd}</p>
                </div>
                <Badge
                  variant={q.urgency === "urgent" ? "warning" : "muted"}
                  size="sm"
                  dot
                >
                  {q.urgency}
                </Badge>
                {q.checkedIn ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <span className="w-4 h-4 rounded-full border-2 border-neutral-300 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Demo controls */}
        <div className="bg-neutral-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Demo Controls (SIH Judging)</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" fullWidth onClick={simulateAdvance} id="demo-advance-queue">
              Advance Queue
            </Button>
            <Button variant="secondary" size="sm" fullWidth onClick={simulateDelay} id="demo-doctor-delay">
              Simulate Delay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
