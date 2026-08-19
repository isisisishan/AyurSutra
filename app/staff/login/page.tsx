"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";
import { Calendar, Eye, EyeOff, LogIn, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

const DEMO_STAFF = [
  { id: "staff-001", name: "Priya Desai", email: "priya@ayursutra.in", role: "Reception", department: "General OPD" },
  { id: "staff-002", name: "Nurse Kavita", email: "kavita@ayursutra.in", role: "Triage Nurse", department: "Emergency" },
  { id: "staff-003", name: "Rajesh Kumar", email: "rajesh@ayursutra.in", role: "OPD Coordinator", department: "All Departments" },
];

export default function StaffLoginPage() {
  const router = useRouter();
  const { login } = useAppStore();
  const [email, setEmail] = useState("priya@ayursutra.in");
  const [password, setPassword] = useState("demo123");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    setError("");
    setLoading(true);
    setTimeout(() => {
      const staff = DEMO_STAFF.find((s) => s.email === email.trim());
      if (!staff || password !== "demo123") {
        setError("Invalid credentials. Use any demo email with password: demo123");
        setLoading(false);
        return;
      }
      login({ id: staff.id, name: staff.name, email: staff.email, role: "staff", department: staff.department });
      router.push("/staff/dashboard");
    }, 800);
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-neutral-900">Staff Login</h1>
          <p className="text-sm text-neutral-500 mt-1">Reception · Nursing · OPD Coordinator</p>
        </div>

        <Card>
          <div className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} id="staff-email" />
            <div className="relative">
              <Input label="Password" type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} id="staff-password" />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-8 text-neutral-400">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>}
            <Button fullWidth size="lg" loading={loading} onClick={handleLogin} leftIcon={<LogIn className="w-4 h-4" />} id="staff-login-btn">Sign In</Button>
          </div>
          <div className="mt-6 pt-5 border-t border-neutral-100">
            <p className="text-xs text-neutral-400 mb-3 uppercase tracking-wide font-semibold">Demo Accounts</p>
            <div className="space-y-2">
              {DEMO_STAFF.map((s) => (
                <button key={s.id} onClick={() => setEmail(s.email)} className="w-full text-left flex items-center justify-between p-2.5 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{s.name}</p>
                    <p className="text-xs text-neutral-500">{s.email} · {s.role}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300" />
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-400 mt-3">Password for all: <code className="bg-neutral-100 px-1 rounded">demo123</code></p>
          </div>
        </Card>
        <p className="text-center text-xs text-neutral-400 mt-6"><Link href="/" className="hover:text-neutral-600">← Back to home</Link></p>
      </div>
    </div>
  );
}
