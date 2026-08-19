"use client";
import { useAppStore } from "@/lib/store/app-store";
import doctorsData from "@/lib/mock-data/doctors.json";
import Link from "next/link";
import { CheckCircle, Clock, Hash, Building2, User, ChevronRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DoctorStatusBadge } from "@/components/shared/DoctorStatusBadge";
import { PatientNav } from "@/components/shared/PatientNav";
import { useRouter } from "next/navigation";

export default function ConfirmationPage() {
  const router = useRouter();
  const { patientSession } = useAppStore();
  const {
    appointmentToken,
    appointmentId,
    selectedDepartment,
    selectedDoctorId,
    selectedSlot,
    name,
  } = patientSession;

  const doctor = doctorsData.find((d) => d.id === selectedDoctorId);

  const DEPT_LABELS: Record<string, string> = {
    general: "General OPD",
    panchakarma: "Panchakarma",
    stri_roga: "Stri Roga & Prasuti",
    shalya: "Shalya Tantra",
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <PatientNav 
        backLabel="← Back to appointments" 
        onBack={() => router.push("/patient/appointment")}
      />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
        {/* Success */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-neutral-900">Appointment Confirmed!</h1>
          <p className="text-neutral-500 text-sm mt-1">Your token has been generated.</p>
        </div>

        {/* Token card */}
        <div className="bg-black text-white rounded-2xl p-8 text-center mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Your Token Number</p>
          <p className="font-mono text-7xl font-bold text-white tracking-tighter mb-3">
            {appointmentToken ?? "--"}
          </p>
          <p className="text-xs text-neutral-400">{appointmentId}</p>
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Appointment Details</p>
            <Badge variant="success" dot>Confirmed</Badge>
          </div>
          <div className="divide-y divide-neutral-100">
            <div className="px-5 py-3.5 flex items-center gap-3">
              <User className="w-4 h-4 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-400">Patient</p>
                <p className="text-sm font-medium text-neutral-900">{name || "Guest Patient"}</p>
              </div>
            </div>
            <div className="px-5 py-3.5 flex items-center gap-3">
              <Building2 className="w-4 h-4 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-400">Department</p>
                <p className="text-sm font-medium text-neutral-900">{DEPT_LABELS[selectedDepartment] ?? selectedDepartment}</p>
              </div>
            </div>
            {doctor && (
              <div className="px-5 py-3.5 flex items-center gap-3">
                <User className="w-4 h-4 text-neutral-400" />
                <div className="flex-1">
                  <p className="text-xs text-neutral-400">Doctor</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-neutral-900">{doctor.name}</p>
                    <DoctorStatusBadge status={doctor.currentStatus} />
                  </div>
                </div>
              </div>
            )}
            <div className="px-5 py-3.5 flex items-center gap-3">
              <Clock className="w-4 h-4 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-400">Estimated Slot</p>
                <p className="text-sm font-medium text-neutral-900">{selectedSlot ?? "Allocated by system"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Check-in Instructions</p>
          <ul className="space-y-1.5">
            {[
              "Show this token number at the OPD reception desk",
              "You may wait in the waiting area or elsewhere — you'll receive a notification when you are next",
              "Please arrive at the OPD 10 minutes before your estimated slot",
              "If your condition worsens, immediately inform hospital staff",
            ].map((i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-amber-800">
                <span className="text-amber-500 mt-0.5">•</span> {i}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <Link href="/patient/queue">
            <Button
              fullWidth
              size="lg"
              rightIcon={<ChevronRight className="w-4 h-4" />}
              id="go-to-queue-btn"
            >
              Track My Queue Position
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" fullWidth id="go-home-btn">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
