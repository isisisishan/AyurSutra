"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";
import { ShieldCheck, Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAppStore();
  const [email, setEmail] = useState("admin@ayursutra.in");
  const [password, setPassword] = useState("demo123");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    setError(""); setLoading(true);
    setTimeout(() => {
      if (email.trim() === "admin@ayursutra.in" && password === "demo123") {
        login({ id: "admin-001", name: "System Admin", email, role: "admin" });
        router.push("/admin/dashboard");
      } else {
        setError("Use admin@ayursutra.in / demo123");
        setLoading(false);
      }
    }, 800);
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-neutral-900">Admin Login</h1>
          <p className="text-sm text-neutral-500 mt-1">System Administration Panel</p>
        </div>
        <Card>
          <div className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} id="admin-email" />
            <div className="relative">
              <Input label="Password" type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} id="admin-password" />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-8 text-neutral-400">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>}
            <Button fullWidth size="lg" loading={loading} onClick={handleLogin} leftIcon={<LogIn className="w-4 h-4" />} id="admin-login-btn">Sign In as Admin</Button>
          </div>
          <p className="text-xs text-neutral-400 mt-4 text-center">Email: admin@ayursutra.in · Password: demo123</p>
        </Card>
        <p className="text-center text-xs text-neutral-400 mt-6"><Link href="/" className="hover:text-neutral-600">← Back to home</Link></p>
      </div>
    </div>
  );
}
