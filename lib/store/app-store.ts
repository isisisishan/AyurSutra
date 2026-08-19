// ─── Global App Store (Zustand) ───────────────────────────────────
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────
export type UserRole = "patient" | "doctor" | "staff" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

export interface PatientSession {
  patientId: string | null;
  name: string;
  age: number | null;
  gender: string;
  contact: string;
  preferredLanguage: string;
  abhaId: string | null;
  consentGiven: boolean;
  consentFlags: {
    healthDataUse: boolean;
    voiceInput: boolean;
    notifications: boolean;
    researchParticipation: boolean;
  };
  // Registration state
  registrationStep:
    | "language"
    | "screening"
    | "registration"
    | "intake"
    | "prakriti"
    | "appointment"
    | "queue";
  emergencyScreeningPassed: boolean;
  redFlagDetected: boolean;
  redFlagKeywords: string[];
  // Intake
  symptoms: string;
  symptomEntities: string[];
  duration: string;
  severity: "mild" | "moderate" | "severe" | "";
  comorbidities: string[];
  currentMedicines: string[];
  allergies: string[];
  isPregnant: boolean;
  isLactating: boolean;
  // Prakriti
  prakritiAnswers: Array<{
    questionId: number;
    selectedDosha: "vata" | "pitta" | "kapha";
    weight: number;
  }>;
  prakritiResult: {
    vata: number;
    pitta: number;
    kapha: number;
    primaryDosha: string;
    secondaryDosha: string;
    confidence: string;
    confidenceScore: number;
    interpretation: string;
    disclaimer: string;
  } | null;
  prakritiSkipped: boolean;
  // Appointment
  selectedDepartment: string;
  selectedDoctorId: string | null;
  selectedSlot: string | null;
  appointmentToken: number | null;
  appointmentId: string | null;
}

interface AppStore {
  // Auth
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;

  // Language
  language: string;
  setLanguage: (lang: string) => void;

  // Patient session
  patientSession: PatientSession;
  updatePatientSession: (updates: Partial<PatientSession>) => void;
  resetPatientSession: () => void;

  // Queue (live state)
  queueLastRefreshed: string | null;
  setQueueLastRefreshed: (time: string) => void;

  // Demo mode flags
  isDemoMode: boolean;
  demoRole: UserRole | null;
  setDemoRole: (role: UserRole) => void;
}

const defaultPatientSession: PatientSession = {
  patientId: null,
  name: "",
  age: null,
  gender: "",
  contact: "",
  preferredLanguage: "en",
  abhaId: null,
  consentGiven: false,
  consentFlags: {
    healthDataUse: false,
    voiceInput: false,
    notifications: false,
    researchParticipation: false,
  },
  registrationStep: "language",
  emergencyScreeningPassed: false,
  redFlagDetected: false,
  redFlagKeywords: [],
  symptoms: "",
  symptomEntities: [],
  duration: "",
  severity: "",
  comorbidities: [],
  currentMedicines: [],
  allergies: [],
  isPregnant: false,
  isLactating: false,
  prakritiAnswers: [],
  prakritiResult: null,
  prakritiSkipped: false,
  selectedDepartment: "",
  selectedDoctorId: null,
  selectedSlot: null,
  appointmentToken: null,
  appointmentId: null,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Auth
      currentUser: null,
      isAuthenticated: false,
      login: (user) => set({ currentUser: user, isAuthenticated: true }),
      logout: () =>
        set({
          currentUser: null,
          isAuthenticated: false,
          patientSession: defaultPatientSession,
        }),

      // Language
      language: "en",
      setLanguage: (lang) => set({ language: lang }),

      // Patient session
      patientSession: defaultPatientSession,
      updatePatientSession: (updates) =>
        set((state) => ({
          patientSession: { ...state.patientSession, ...updates },
        })),
      resetPatientSession: () =>
        set({ patientSession: defaultPatientSession }),

      // Queue
      queueLastRefreshed: null,
      setQueueLastRefreshed: (time) => set({ queueLastRefreshed: time }),

      // Demo
      isDemoMode: true,
      demoRole: null,
      setDemoRole: (role) => set({ demoRole: role }),
    }),
    {
      name: "ayursutra-store",
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        language: state.language,
        patientSession: state.patientSession,
        demoRole: state.demoRole,
      }),
    }
  )
);
