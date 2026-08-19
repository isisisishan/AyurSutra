// ─── Utility helpers ──────────────────────────────────────────────
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatTimeRange(start: string, end: string): string {
  return `${start} – ${end}`;
}

export function generateToken(): number {
  return Math.floor(Math.random() * 40) + 5;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Language helpers
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export function getLanguageLabel(code: string): string {
  return (
    SUPPORTED_LANGUAGES.find((l) => l.code === code)?.nativeLabel ?? "English"
  );
}

// Status helpers
export function getDoctorStatusConfig(status: string): {
  label: string;
  color: string;
  bgColor: string;
  dotColor: string;
} {
  const configs: Record<
    string,
    { label: string; color: string; bgColor: string; dotColor: string }
  > = {
    available: {
      label: "Available",
      color: "text-green-700",
      bgColor: "bg-green-50",
      dotColor: "bg-green-500",
    },
    consulting: {
      label: "In Consultation",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      dotColor: "bg-blue-500",
    },
    delayed: {
      label: "Delayed",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      dotColor: "bg-amber-500",
    },
    on_rounds: {
      label: "On Rounds",
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      dotColor: "bg-purple-500",
    },
    emergency_duty: {
      label: "Emergency Duty",
      color: "text-red-700",
      bgColor: "bg-red-50",
      dotColor: "bg-red-500",
    },
    unavailable: {
      label: "Unavailable",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      dotColor: "bg-gray-400",
    },
    break: {
      label: "On Break",
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      dotColor: "bg-orange-400",
    },
  };
  return (
    configs[status] ?? {
      label: status,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      dotColor: "bg-gray-400",
    }
  );
}

export function getUrgencyConfig(urgency: string): {
  label: string;
  color: string;
} {
  const configs: Record<string, { label: string; color: string }> = {
    normal: { label: "Normal", color: "text-gray-600" },
    urgent: { label: "Urgent", color: "text-amber-600" },
    emergency: { label: "Emergency", color: "text-red-600" },
  };
  return configs[urgency] ?? { label: urgency, color: "text-gray-600" };
}

export function getInventoryConfig(status: string): {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
} {
  const configs: Record<
    string,
    { label: string; color: string; bgColor: string; icon: string }
  > = {
    in_stock: {
      label: "In Stock",
      color: "text-green-700",
      bgColor: "bg-green-50",
      icon: "✓",
    },
    low_stock: {
      label: "Low Stock",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      icon: "!",
    },
    out_of_stock: {
      label: "Out of Stock",
      color: "text-red-700",
      bgColor: "bg-red-50",
      icon: "✗",
    },
  };
  return (
    configs[status] ?? {
      label: status,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      icon: "?",
    }
  );
}

// Dosha display helpers
export function getDoshaConfig(dosha: string): {
  label: string;
  color: string;
  bgColor: string;
  description: string;
} {
  const configs: Record<
    string,
    { label: string; color: string; bgColor: string; description: string }
  > = {
    vata: {
      label: "Vata",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      description: "Air & Space — Movement, creativity, communication",
    },
    pitta: {
      label: "Pitta",
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      description: "Fire & Water — Transformation, intelligence, metabolism",
    },
    kapha: {
      label: "Kapha",
      color: "text-green-700",
      bgColor: "bg-green-50",
      description: "Earth & Water — Structure, stability, lubrication",
    },
  };
  return (
    configs[dosha.toLowerCase()] ?? {
      label: dosha,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      description: "",
    }
  );
}
