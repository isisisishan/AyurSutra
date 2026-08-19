"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";
import doctorsData from "@/lib/mock-data/doctors.json";
import { Calendar, ChevronRight, Clock, User, CheckCircle } from "lucide-react";
import { PatientNav } from "@/components/shared/PatientNav";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DoctorStatusBadge } from "@/components/shared/DoctorStatusBadge";
import { getDoctorStatusConfig, generateToken } from "@/lib/utils";
import { cn } from "@/lib/utils";

const DEPARTMENTS = [
  { id: "general", label: "General OPD", icon: "🏥", desc: "General Ayurvedic consultation" },
  { id: "panchakarma", label: "Panchakarma", icon: "🌿", desc: "Detox and rejuvenation therapy" },
  { id: "stri_roga", label: "Stri Roga & Prasuti", icon: "👶", desc: "Women's health and obstetrics" },
  { id: "shalya", label: "Shalya Tantra", icon: "⚕️", desc: "Ayurvedic surgery and Ksharasutra" },
];

const TODAY_SLOTS = [
  "10:00 AM – 10:15 AM",
  "10:15 AM – 10:30 AM",
  "10:30 AM – 10:45 AM",
  "10:45 AM – 11:00 AM",
  "11:00 AM – 11:15 AM",
  "11:15 AM – 11:30 AM",
  "11:30 AM – 11:45 AM",
  "02:00 PM – 02:15 PM",
  "02:15 PM – 02:30 PM",
  "02:30 PM – 02:45 PM",
];

const DEPT_DOCTOR_MAP: Record<string, string[]> = {
  general: ["doc-001"],
  panchakarma: ["doc-002"],
  stri_roga: ["doc-003"],
  shalya: ["doc-004"],
};

export default function AppointmentPage() {
  const router = useRouter();
  const { updatePatientSession, patientSession } = useAppStore();
  const [dept, setDept] = useState("general");
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const departmentDoctors = doctorsData.filter((d) =>
    (DEPT_DOCTOR_MAP[dept] || []).includes(d.id)
  );

  function bookAppointment() {
    if (!selectedSlot) return;
    const token = generateToken();
    const doctorId = selectedDoctor || departmentDoctors[0]?.id || null;
    updatePatientSession({
      selectedDepartment: dept,
      selectedDoctorId: doctorId,
      selectedSlot,
      appointmentToken: token,
      appointmentId: `APT-${Date.now()}`,
      registrationStep: "queue",
    });
    router.push("/patient/confirmation");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PatientNav onBack={() => router.push("/patient/prakriti")} />

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className={cn("h-1 rounded-full flex-1", s <= 6 ? "bg-black" : "bg-neutral-200")} />
          ))}
        </div>

        <div className="flex items-center gap-2 mb-5">
          <Calendar className="w-5 h-5 text-neutral-400" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Step 6 · Appointment</p>
        </div>

        <h1 className="font-serif text-3xl font-semibold text-neutral-900 mb-2">Book Appointment</h1>
        <p className="text-neutral-500 text-sm mb-8">Select your department, doctor, and preferred slot. Allocation is based on live doctor availability.</p>

        {/* Department */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Department</p>
          <div className="grid grid-cols-2 gap-3">
            {DEPARTMENTS.map((d) => (
              <button
                key={d.id}
                onClick={() => { setDept(d.id); setSelectedDoctor(null); }}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  dept === d.id ? "border-black bg-neutral-50" : "border-neutral-200 bg-white hover:border-neutral-300"
                )}
                id={`dept-${d.id}`}
              >
                <span className="text-2xl block mb-1">{d.icon}</span>
                <p className={cn("font-semibold text-sm", dept === d.id ? "text-neutral-900" : "text-neutral-700")}>{d.label}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Doctors */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Available Doctors</p>
          <div className="space-y-3">
            {departmentDoctors.map((doc) => {
              const statusCfg = getDoctorStatusConfig(doc.currentStatus);
              const isUnavailable = doc.currentStatus === "unavailable" || doc.currentStatus === "emergency_duty";
              return (
                <button
                  key={doc.id}
                  onClick={() => !isUnavailable && setSelectedDoctor(doc.id)}
                  disabled={isUnavailable}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-all",
                    selectedDoctor === doc.id ? "border-black bg-neutral-50" :
                    isUnavailable ? "border-neutral-100 bg-neutral-50 opacity-60 cursor-not-allowed" :
                    "border-neutral-200 bg-white hover:border-neutral-300"
                  )}
                  id={`doctor-${doc.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-neutral-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 text-sm">{doc.name}</p>
                        <p className="text-xs text-neutral-500">{doc.qualifications}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <DoctorStatusBadge status={doc.currentStatus} />
                          <span className="text-xs text-neutral-400">
                            <Clock className="w-3 h-3 inline mr-0.5" />
                            ~{doc.avgConsultationDurationMinutes} min/patient
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-neutral-500">
                      <p>{doc.todayQueue} in queue</p>
                      <p className="text-neutral-400">OPD {doc.opd}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Preferred Time Slot (Today)</p>
          <div className="grid grid-cols-2 gap-2">
            {TODAY_SLOTS.map((slot, idx) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={cn(
                  "p-3 rounded-lg border text-sm transition-all text-left",
                  selectedSlot === slot
                    ? "border-black bg-black text-white"
                    : idx < 3 ? "border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-400" :
                    "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                )}
              >
                <Clock className={cn("w-3.5 h-3.5 inline mr-1.5", selectedSlot === slot ? "text-white" : idx < 3 ? "text-amber-500" : "text-neutral-400")} />
                {slot}
                {idx < 3 && selectedSlot !== slot && <span className="block text-xs text-amber-600 mt-0.5">High demand</span>}
              </button>
            ))}
          </div>
        </div>

        <Button
          fullWidth
          size="lg"
          disabled={!selectedSlot}
          onClick={bookAppointment}
          rightIcon={<ChevronRight className="w-4 h-4" />}
          id="book-appointment-btn"
        >
          Confirm Booking
        </Button>
      </div>
    </div>
  );
}
