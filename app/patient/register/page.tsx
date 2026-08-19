"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";
import { User, Phone, CreditCard, ChevronRight, CheckCircle } from "lucide-react";
import { PatientNav } from "@/components/shared/PatientNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { generateId } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const { updatePatientSession, patientSession } = useAppStore();
  const [mode, setMode] = useState<"manual" | "abha">("manual");
  const [abhaScanning, setAbhaScanning] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: patientSession.name || "",
    age: patientSession.age?.toString() || "",
    gender: patientSession.gender || "",
    contact: patientSession.contact || "",
    abhaId: patientSession.abhaId || "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 1 || Number(form.age) > 120)
      errs.age = "Please enter a valid age";
    if (!form.gender) errs.gender = "Please select a gender";
    if (!form.contact || !/^[6-9]\d{9}$/.test(form.contact))
      errs.contact = "Enter a valid 10-digit mobile number";
    return errs;
  }

  function mockAbhaScan() {
    setAbhaScanning(true);
    setTimeout(() => {
      setForm({
        name: "Ravi Kumar (ABHA)",
        age: "52",
        gender: "male",
        contact: "9012345678",
        abhaId: "ABHA-5678-1234",
      });
      setAbhaScanning(false);
    }, 2000);
  }

  function proceed() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const age = Number(form.age);
    updatePatientSession({
      patientId: generateId("pat"),
      name: form.name,
      age,
      gender: form.gender,
      contact: form.contact,
      abhaId: form.abhaId || null,

      registrationStep: "intake",
    });
    router.push("/patient/intake");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PatientNav onBack={() => router.push("/patient/screening")} />

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8 animate-fade-in">
        {/* Step bar */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className={cn("h-1 rounded-full flex-1", s <= 3 ? "bg-black" : "bg-neutral-200")} />
          ))}
        </div>

        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-neutral-400" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Step 3 · Registration
          </p>
        </div>

        <h1 className="font-serif text-3xl font-semibold text-neutral-900 mb-2">
          Register
        </h1>
        <p className="text-neutral-500 text-sm mb-8">
          Register using your ABHA number or fill in your details manually.
        </p>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-neutral-100 rounded-lg">
          <button
            onClick={() => setMode("abha")}
            className={cn(
              "flex-1 py-2 rounded-md text-sm font-medium transition-all",
              mode === "abha" ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
            )}
            id="mode-abha"
          >
            ABHA / Scan &amp; Share
          </button>
          <button
            onClick={() => setMode("manual")}
            className={cn(
              "flex-1 py-2 rounded-md text-sm font-medium transition-all",
              mode === "manual" ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
            )}
            id="mode-manual"
          >
            Manual Entry
          </button>
        </div>

        {/* ABHA mode */}
        {mode === "abha" && (
          <div className="mb-6 animate-fade-in">
            <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center bg-white">
              <CreditCard className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="font-medium text-neutral-700 mb-1">ABHA Scan &amp; Share</p>
              <p className="text-sm text-neutral-500 mb-4">
                Scan your ABHA QR code or enter your ABHA number to auto-fill registration details.
              </p>
              <div className="space-y-3">
                <Input
                  placeholder="Enter ABHA Number (e.g. ABHA-1234-5678)"
                  value={form.abhaId}
                  onChange={(e) => update("abhaId", e.target.value)}
                  leftIcon={<CreditCard className="w-4 h-4" />}
                  id="abha-number-input"
                />
                <Button
                  variant="outline"
                  fullWidth
                  loading={abhaScanning}
                  onClick={mockAbhaScan}
                  id="abha-scan-btn"
                >
                  {abhaScanning ? "Fetching ABHA data..." : "Mock Scan QR Code"}
                </Button>
                {form.name && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <p className="text-sm text-green-700">Profile loaded: <strong>{form.name}</strong></p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Registration form */}
        <div className="space-y-4 mb-8">
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            error={errors.name}
            leftIcon={<User className="w-4 h-4" />}
            id="reg-name"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Age"
              type="number"
              placeholder="e.g. 45"
              value={form.age}
              onChange={(e) => update("age", e.target.value)}
              error={errors.age}
              id="reg-age"
            />
            <Select
              label="Gender"
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
              error={errors.gender}
              id="reg-gender"
              options={[
                { value: "", label: "Select gender", disabled: true },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
                { value: "prefer_not", label: "Prefer not to say" },
              ]}
            />
          </div>
          <Input
            label="Mobile Number"
            type="tel"
            placeholder="10-digit mobile number"
            value={form.contact}
            onChange={(e) => update("contact", e.target.value)}
            error={errors.contact}
            leftIcon={<Phone className="w-4 h-4" />}
            id="reg-contact"
          />
        </div>

        <div className="p-3 bg-neutral-100 rounded-lg mb-6 text-xs text-neutral-500">
          <strong className="text-neutral-700">Returning patient?</strong> Your details will be pre-filled on future visits when you register with the same mobile number.
        </div>

        <Button
          fullWidth
          size="lg"
          onClick={proceed}
          rightIcon={<ChevronRight className="w-4 h-4" />}
          id="register-proceed-btn"
        >
          Continue to Symptom Intake
        </Button>
      </div>
    </div>
  );
}
