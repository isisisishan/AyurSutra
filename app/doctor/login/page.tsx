"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";
import { Stethoscope, Eye, EyeOff, LogIn, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

const DEMO_DOCTORS = [
  { id: "doc-001", name: "Dr. Meena Sharma", email: "dr.meena@ayursutra.in", department: "General OPD" },
  { id: "doc-002", name: "Dr. Raghav Pillai", email: "dr.raghav@ayursutra.in", department: "Panchakarma" },
  { id: "doc-003", name: "Dr. Lakshmi Nair", email: "dr.lakshmi@ayursutra.in", department: "Stri Roga" },
  { id: "doc-004", name: "Dr. Arvind Gupta", email: "dr.arvind@ayursutra.in", department: "Shalya Tantra" },
];

export default function DoctorLoginPage() {
  const router = useRouter();
  const { login } = useAppStore();
  const [email, setEmail] = useState("dr.meena@ayursutra.in");
  const [password, setPassword] = useState("demo123");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    setError("");
    setLoading(true);
    setTimeout(() => {
      const doctor = DEMO_DOCTORS.find((d) => d.email === email.trim());
      if (!doctor || password !== "demo123") {
        setError("Invalid credentials. Use any demo email above with password: demo123");
        setLoading(false);
        return;
      }
      login({ id: doctor.id, name: doctor.name, email: doctor.email, role: "doctor", department: doctor.department });
      router.push("/doctor/dashboard");
    }, 800);
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-neutral-900">Doctor Login</h1>
          <p className="text-sm text-neutral-500 mt-1">AyurSutra Clinical Dashboard</p>
        </div>

        <Card>
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@ayursutra.in"
              id="doctor-email"
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="doctor-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                {error}
              </p>
            )}

            <Button
              fullWidth
              size="lg"
              loading={loading}
              onClick={handleLogin}
              leftIcon={<LogIn className="w-4 h-4" />}
              id="doctor-login-btn"
            >
              Sign In
            </Button>
          </div>

          <div className="mt-6 pt-5 border-t border-neutral-100">
            <p className="text-xs text-neutral-400 mb-3 uppercase tracking-wide font-semibold">Demo Accounts</p>
            <div className="space-y-2">
              {DEMO_DOCTORS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setEmail(d.email)}
                  className="w-full text-left flex items-center justify-between p-2.5 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{d.name}</p>
                    <p className="text-xs text-neutral-500">{d.email} · {d.department}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300" />
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-400 mt-3">Password for all: <code className="bg-neutral-100 px-1 rounded">demo123</code></p>
          </div>
        </Card>

        <p className="text-center text-xs text-neutral-400 mt-6">
          <Link href="/" className="hover:text-neutral-600 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
