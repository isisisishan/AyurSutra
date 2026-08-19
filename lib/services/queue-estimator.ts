// ─── Queue Estimator Service ───────────────────────────────────────
// Calculates estimated consultation windows based on queue state and doctor status
// Returns time ranges (never a single exact time, per PRD requirement)

export interface QueueSlot {
  token: number;
  patientId: string | null;
  patientName: string;
  checkedIn: boolean;
  urgency: "normal" | "urgent" | "emergency";
  status: "waiting" | "in_consultation" | "done" | "skipped" | "no_show";
}

export interface DoctorStatus {
  currentStatus: "available" | "consulting" | "delayed" | "on_rounds" | "emergency_duty" | "unavailable";
  avgConsultationDurationMinutes: number;
  currentToken: number;
}

export interface EstimatedWindow {
  startTime: string; // "HH:MM AM/PM"
  endTime: string;
  minutesFromNow: number;
  patientsAhead: number;
  delayMinutes: number;
  isDelayed: boolean;
}

function addMinutesToNow(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function estimateConsultationWindow(
  targetToken: number,
  doctorStatus: DoctorStatus,
  queue: QueueSlot[]
): EstimatedWindow {
  const avgDuration = doctorStatus.avgConsultationDurationMinutes;

  // Calculate how many patients are ahead
  const waitingQueue = queue
    .filter((q) => q.status === "waiting" || q.status === "in_consultation")
    .sort((a, b) => a.token - b.token);

  const patientsAhead = waitingQueue.filter((q) => q.token < targetToken).length;
  const isConsulting = doctorStatus.currentStatus === "consulting";

  // Base wait time
  let baseWaitMinutes = patientsAhead * avgDuration;

  // If doctor is currently consulting, add remaining time (avg = half consultation)
  if (isConsulting) {
    baseWaitMinutes += Math.round(avgDuration / 2);
  }

  // Delay buffer based on doctor status
  let delayMinutes = 0;
  if (doctorStatus.currentStatus === "delayed") {
    delayMinutes = 20; // Default delay buffer
  } else if (doctorStatus.currentStatus === "on_rounds") {
    delayMinutes = 15;
  } else if (
    doctorStatus.currentStatus === "emergency_duty" ||
    doctorStatus.currentStatus === "unavailable"
  ) {
    delayMinutes = 60;
  }

  const totalWaitMinutes = baseWaitMinutes + delayMinutes;

  // Buffer window: ±10 minutes
  const windowBufferMinutes = Math.max(10, Math.round(avgDuration * 0.5));

  const startDate = addMinutesToNow(totalWaitMinutes);
  const endDate = addMinutesToNow(totalWaitMinutes + windowBufferMinutes);

  return {
    startTime: formatTime(startDate),
    endTime: formatTime(endDate),
    minutesFromNow: totalWaitMinutes,
    patientsAhead,
    delayMinutes,
    isDelayed: delayMinutes > 0 || doctorStatus.currentStatus === "delayed",
  };
}

export function getStatusLabel(
  status: DoctorStatus["currentStatus"]
): { label: string; color: string; description: string } {
  const map: Record<
    DoctorStatus["currentStatus"],
    { label: string; color: string; description: string }
  > = {
    available: {
      label: "Available",
      color: "green",
      description: "Doctor is ready to see patients",
    },
    consulting: {
      label: "In Consultation",
      color: "blue",
      description: "Doctor is currently with a patient",
    },
    delayed: {
      label: "Delayed",
      color: "amber",
      description: "Doctor is running late — queue times adjusted",
    },
    on_rounds: {
      label: "On Rounds",
      color: "purple",
      description: "Doctor is on ward rounds",
    },
    emergency_duty: {
      label: "Emergency Duty",
      color: "red",
      description: "Doctor is attending an emergency",
    },
    unavailable: {
      label: "Unavailable",
      color: "gray",
      description: "Doctor is not available",
    },
  };

  return map[status];
}
