"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import {
  Stethoscope,
  Users,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Leaf,
  Activity,
  Calendar,
  ChevronRight,
  LogIn,
  Clock,
  Search,
  Share2,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const ROLES = [
  {
    id: "patient",
    label: "Patient Portal",
    description: "Appointments, queue updates, and doctor-approved care plans.",
    href: "/patient/language",
    icon: <Users className="w-5 h-5" />,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "doctor",
    label: "Doctor Dashboard",
    description: "Consultations, formulation support, and prescriptions.",
    href: "/doctor/login",
    icon: <Stethoscope className="w-5 h-5" />,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    id: "staff",
    label: "Reception / Staff",
    description: "OPD flow, triage alerts, and doctor availability coordination.",
    href: "/staff/login",
    icon: <Calendar className="w-5 h-5" />,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    id: "admin",
    label: "Admin Panel",
    description: "User access, knowledge records, audit history, and system settings.",
    href: "/admin/login",
    icon: <ShieldCheck className="w-5 h-5" />,
    color: "text-neutral-700",
    bg: "bg-neutral-100",
  },
];

const CAPABILITIES = [
  {
    icon: <Activity className="w-5 h-5" />,
    title: "Guided Patient Intake",
    description:
      "Multilingual symptom capture, consent, and emergency red-flag screening before booking.",
    accent: "bg-amber-50 text-amber-700 border-amber-100",
    iconBg: "bg-amber-100 text-amber-700",
  },
  {
    icon: <Leaf className="w-5 h-5" />,
    title: "Transparent Prakriti Profile",
    description:
      "An optional constitutional assessment that helps patients understand their profile while keeping clinical decisions with the doctor.",
    accent: "bg-emerald-50 text-emerald-700 border-emerald-100",
    iconBg: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    title: "Smarter Appointments",
    description:
      "Appointment allocation based on doctor availability, urgency, and OPD flow.",
    accent: "bg-blue-50 text-blue-700 border-blue-100",
    iconBg: "bg-blue-100 text-blue-700",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Live Queue Updates",
    description:
      "Clear queue position, estimated consultation window, and delay notifications for a smoother hospital visit.",
    accent: "bg-violet-50 text-violet-700 border-violet-100",
    iconBg: "bg-violet-100 text-violet-700",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Doctor-Guided Formulation Support",
    description:
      "Source-linked Ayurvedic formulation discovery with ingredients, references, and patient-context safety checks for clinicians.",
    accent: "bg-neutral-50 text-neutral-700 border-neutral-100",
    iconBg: "bg-neutral-200 text-neutral-700",
  },
];

const JOURNEY_STEPS = [
  {
    icon: <Share2 className="w-5 h-5" />,
    title: "Share",
    desc: "Symptoms, history, consent, and an optional Prakriti profile.",
    color: "bg-amber-500",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    title: "Coordinate",
    desc: "Smart appointment allocation and live queue updates.",
    color: "bg-blue-500",
  },
  {
    icon: <Stethoscope className="w-5 h-5" />,
    title: "Consult",
    desc: "The doctor reviews the patient's structured health context.",
    color: "bg-emerald-500",
  },
  {
    icon: <UserCheck className="w-5 h-5" />,
    title: "Guide",
    desc: "Doctor-approved care plans supported by classical Ayurvedic knowledge.",
    color: "bg-violet-500",
  },
];

// Sample formulation for the knowledge section preview card
const SAMPLE_FORMULATION = {
  name: "Triphala Churna",
  type: "Churna (Powder)",
  uses: ["Digestive health", "Detoxification", "Eye care"],
  ingredients: ["Amalaki", "Bibhitaki", "Haritaki"],
  reference: "Charaka Samhita · Chikitsa Sthana",
};

export default function HomePage() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* ─── Navigation ─────────────────────────────────────────── */}
      <nav className="bg-white border-b border-neutral-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-900 rounded-[0.5rem] flex items-center justify-center flex-shrink-0">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-bold text-neutral-900 text-xl tracking-tight">
              AyurSutra
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/explore-ayurveda")}
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-3 py-2 rounded-lg hover:bg-neutral-50"
              id="nav-explore-btn"
            >
              <BookOpen className="w-4 h-4" />
              Explore Ayurveda
            </button>
            <LanguageSwitcher />
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowLogin(true)}
              leftIcon={<LogIn className="w-3.5 h-3.5" />}
              id="login-btn"
            >
              Log in
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── Login / Role Selection Modal ───────────────────────── */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogin(false)}
          />
          <div className="relative bg-white rounded-xl border border-neutral-100 shadow-2xl w-full max-w-lg animate-fade-in">
            <div className="p-6 border-b border-neutral-100">
              <h2 className="font-serif font-semibold text-xl">
                Choose Your Workspace
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Choose a workspace to continue.
              </p>
            </div>
            <div className="p-4 space-y-2">
              {ROLES.map((role) => (
                <Link
                  key={role.id}
                  href={role.href}
                  onClick={() => setLoadingRole(role.id)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border transition-all duration-150 group",
                    loadingRole === role.id 
                      ? "border-neutral-300 bg-neutral-50 pointer-events-none"
                      : "border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50"
                  )}
                  id={`role-${role.id}`}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      role.bg,
                      role.color
                    )}
                  >
                    {role.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 text-sm">
                      {role.label}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5 leading-snug">
                      {role.description}
                    </p>
                  </div>
                  {loadingRole === role.id ? (
                    <div className="w-4 h-4 rounded-full border-2 border-neutral-300 border-t-neutral-600 animate-spin flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors flex-shrink-0" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section className="relative bg-white border-b border-neutral-100 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.97_0.01_120),transparent)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 text-center">
          <h1 className="font-serif text-5xl sm:text-6xl font-semibold text-neutral-900 text-balance leading-tight mb-6">
            Holistic AI-Powered{" "}
            <span className="text-neutral-500">Ayurvedic Healthcare</span>
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto text-pretty mb-10">
            Personalized Ayurvedic care, smarter hospital coordination, and
            source-cited clinical support—connected in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Button
              size="lg"
              onClick={() => setShowLogin(true)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              id="hero-login-btn"
            >
              Log in
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/explore-ayurveda")}
              id="hero-explore-btn"
            >
              Explore Ayurveda
            </Button>
          </div>
          <p className="text-xs text-neutral-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
            Clinician-supervised decision support. Not an autonomous diagnosis or prescription tool.
          </p>
        </div>
      </section>

      {/* ─── Clinical Safety Banner ─────────────────────────────── */}
      <div className="bg-amber-50 border-b border-amber-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            <strong>Clinical Safety:</strong> This platform assists doctors and hospital staff. It
            does not independently diagnose patients or prescribe medicine. Every AI
            output is clearly labelled and requires clinician review.
          </p>
        </div>
      </div>

      {/* ─── Ayurveda Knowledge Feature Section ─────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-4">
              AYURVEDA KNOWLEDGE LIBRARY
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-neutral-900 text-balance leading-snug mb-5">
              Understand Ayurveda, one formulation at a time.
            </h2>
            <p className="text-base text-neutral-500 leading-relaxed mb-8">
              Explore classical Ayurvedic formulations, ingredients, traditional
              uses, and source references through an easy-to-understand digital
              library for learners, students, and curious families.
            </p>
            <Button
              size="md"
              onClick={() => router.push("/explore-ayurveda")}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              id="knowledge-explore-btn"
            >
              Explore Ayurveda
            </Button>
            <p className="text-xs text-neutral-400 mt-4 max-w-sm">
              For education and reference only—not personalised treatment or a substitute for a qualified practitioner.
            </p>
          </div>

          {/* Right: Sample Formulation Preview Card */}
          <div className="flex items-center justify-center">
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 w-full max-w-sm">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                    Sample · Classical Formulation
                  </span>
                  <h3 className="font-serif text-xl font-semibold text-neutral-900 mt-1">
                    {SAMPLE_FORMULATION.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {SAMPLE_FORMULATION.type}
                  </p>
                </div>
                <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-4 h-4 text-emerald-700" />
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Key Ingredients
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_FORMULATION.ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Traditional Uses
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_FORMULATION.uses.map((use) => (
                    <span
                      key={use}
                      className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600"
                    >
                      {use}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                <p className="text-xs text-neutral-400">
                  {SAMPLE_FORMULATION.reference}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Platform Capabilities ──────────────────────────────── */}
      <section className="bg-white border-t border-b border-neutral-100 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
              ONE CONNECTED CARE EXPERIENCE
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-neutral-900 mb-4">
              Care that feels simpler at every step
            </h2>
            <p className="text-base text-neutral-500 max-w-2xl mx-auto text-pretty">
              AyurSutra connects patients, clinicians, and hospital teams through
              one thoughtful workflow—from first symptoms to doctor-guided care.
            </p>
          </div>

          {/* 3 + 2 layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
            {CAPABILITIES.slice(0, 3).map((cap) => (
              <div
                key={cap.title}
                className={cn(
                  "rounded-xl border p-5 transition-all duration-200 hover:shadow-sm",
                  cap.accent
                )}
              >
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-4", cap.iconBg)}>
                  {cap.icon}
                </div>
                <h3 className="font-semibold text-neutral-900 text-sm mb-2">
                  {cap.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {cap.description}
                </p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {CAPABILITIES.slice(3).map((cap) => (
              <div
                key={cap.title}
                className={cn(
                  "rounded-xl border p-5 transition-all duration-200 hover:shadow-sm",
                  cap.accent
                )}
              >
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-4", cap.iconBg)}>
                  {cap.icon}
                </div>
                <h3 className="font-semibold text-neutral-900 text-sm mb-2">
                  {cap.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {cap.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4-Step Journey ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
            HOW AYURSUTRA CONNECTS CARE
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-neutral-900">
            A clearer journey for patients and care teams
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {JOURNEY_STEPS.map((step, idx) => (
            <div key={step.title} className="relative flex flex-col">
              {/* Connector line (desktop) */}
              {idx < JOURNEY_STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-[calc(50%+1.5rem)] w-[calc(100%-1.25rem)] h-px bg-neutral-200 z-0" />
              )}
              <div className="bg-white rounded-xl border border-neutral-100 p-5 hover:shadow-sm transition-all duration-200 relative z-10">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4",
                    step.color
                  )}
                >
                  {step.icon}
                </div>
                <h3 className="font-semibold text-neutral-900 text-sm mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-neutral-100 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-serif text-3xl font-semibold text-neutral-900 mb-4">
            Start exploring AyurSutra
          </h2>
          <p className="text-neutral-500 mb-8 text-balance">
            Access the Ayurveda knowledge library or log in to your workspace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => setShowLogin(true)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              id="cta-login-btn"
            >
              Log in
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/explore-ayurveda")}
              id="cta-explore-btn"
            >
              Explore Ayurveda
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-neutral-100 bg-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-neutral-900 rounded-[0.4rem] flex items-center justify-center flex-shrink-0">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-sm text-neutral-900 block">AyurSutra</span>
              <span className="text-xs text-neutral-400">
                Clinician-supervised Ayurvedic care coordination and knowledge support.
              </span>
            </div>
          </div>
          <p className="text-xs text-neutral-400 max-w-xs text-right">
            This platform supports clinical workflows and education; it does not independently diagnose or prescribe.
          </p>
        </div>
      </footer>
    </div>
  );
}
