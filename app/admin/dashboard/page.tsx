"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";
import bkkRaw from "@/lib/bkk-data/bkk-raw.json";
import type { BKKRecord } from "@/lib/services/bkk-engine";
import inventoryData from "@/lib/mock-data/inventory.json";
import doctorsData from "@/lib/mock-data/doctors.json";
import {
  ShieldCheck, LogOut, BookOpen, Activity, Users, Settings,
  Search, Plus, ChevronRight, CheckCircle, AlertTriangle,
  Database, Package, Eye, EyeOff, Pencil
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { getInventoryConfig, cn } from "@/lib/utils";

type TabKey = "overview" | "formulations" | "inventory" | "safety" | "config";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const bkkData = bkkRaw as BKKRecord[];
  const [formulationStatuses, setFormulationStatuses] = useState<Record<string, string>>(
    Object.fromEntries(bkkData.map((f) => [f.id, (f as any).status || "published"]))
  );

  useEffect(() => {
    if (!isAuthenticated) router.push("/admin/login");
  }, [isAuthenticated, router]);

  function toggleFormulationStatus(id: string) {
    setFormulationStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === "published" ? "draft" : "published",
    }));
  }

  const filteredFormulations = bkkData.filter((f) =>
    searchQuery ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <Activity className="w-4 h-4" /> },
    { key: "formulations", label: "Formulation KB", icon: <BookOpen className="w-4 h-4" /> },
    { key: "inventory", label: "Inventory", icon: <Package className="w-4 h-4" /> },
    { key: "safety", label: "Safety Rules", icon: <ShieldCheck className="w-4 h-4" /> },
    { key: "config", label: "Config", icon: <Settings className="w-4 h-4" /> },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-black rounded-[0.4rem] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-semibold text-neutral-900">Admin Panel</span>
            <Badge variant="muted" size="sm">AyurSutra</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500">{currentUser?.name}</span>
            <button onClick={() => { logout(); router.push("/"); }} className="text-neutral-400 hover:text-neutral-600" id="admin-logout-btn">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all",
                  activeTab === tab.key ? "border-black text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-700"
                )}
                id={`admin-tab-${tab.key}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "BKK Formulations", value: bkkData.length, icon: <BookOpen className="w-4 h-4" /> },
                { label: "Published to Clinic", value: Object.values(formulationStatuses).filter((s) => s === "published").length, icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
                { label: "Inventory Items", value: inventoryData.length, icon: <Package className="w-4 h-4" /> },
                { label: "Active Doctors", value: doctorsData.filter((d) => d.currentStatus !== "unavailable").length, icon: <Users className="w-4 h-4" /> },
              ].map((s) => (
                <Card key={s.label} padding="sm">
                  <div className="flex items-center gap-2 text-neutral-400 mb-1">{s.icon}<span className="text-xs">{s.label}</span></div>
                  <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
                </Card>
              ))}
            </div>

            {/* Low stock alerts */}
            <Card>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">Inventory Alerts</p>
              <div className="space-y-3">
                {inventoryData
                  .filter((i) => i.status !== "in_stock")
                  .map((item) => {
                    const cfg = getInventoryConfig(item.status);
                    return (
                      <div key={item.formulationId} className={cn("flex items-center justify-between p-3 rounded-lg border", item.status === "out_of_stock" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200")}>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                          <p className="text-xs text-neutral-500">{item.formulationId} · Qty: {item.quantity} {item.unit}</p>
                        </div>
                        <Badge variant={item.status === "out_of_stock" ? "danger" : "warning"} dot>
                          {item.status === "out_of_stock" ? "Out of Stock" : "Low Stock"}
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            </Card>
          </div>
        )}

        {/* Formulation KB */}
        {activeTab === "formulations" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search formulations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                  id="admin-form-search"
                />
              </div>
              <Button leftIcon={<Plus className="w-4 h-4" />} id="add-formulation-btn">Add Formulation</Button>
            </div>

            <Card padding="none">
              <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                <p className="font-semibold text-neutral-900">Formulation Knowledge Base</p>
                <p className="text-xs text-neutral-500">{filteredFormulations.length} entries</p>
              </div>
              <div className="divide-y divide-neutral-100">
                {filteredFormulations.map((f) => (
                  <div key={f.id} className="px-5 py-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-neutral-900">{f.name}</p>
                        <Badge
                          variant={formulationStatuses[f.id] === "published" ? "success" : "muted"}
                          size="sm"
                          dot
                        >
                          {formulationStatuses[f.id]}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">{f.reference}</p>
                      <p className="text-xs text-neutral-400 mt-1">{f.type}</p>
                      {f.ingredients && (
                        <p className="text-xs text-neutral-400 mt-1">Ingredients: {f.ingredients}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="ghost" size="sm" leftIcon={<Pencil className="w-3.5 h-3.5" />}>Edit</Button>
                      <Button
                        variant={formulationStatuses[f.id] === "published" ? "outline" : "secondary"}
                        size="sm"
                        onClick={() => toggleFormulationStatus(f.id)}
                        id={`toggle-status-${f.id}`}
                      >
                        {formulationStatuses[f.id] === "published" ? "Unpublish" : "Publish"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Inventory */}
        {activeTab === "inventory" && (
          <Card padding="none">
            <div className="px-5 py-4 border-b border-neutral-100">
              <p className="font-semibold text-neutral-900">Pharmacy Inventory</p>
            </div>
            <div className="divide-y divide-neutral-100">
              {inventoryData.map((item) => (
                <div key={item.formulationId} className="px-5 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                    <p className="text-xs text-neutral-500">
                      Batch: {item.batchNumber} · Expiry: {item.expiryDate}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold text-neutral-900">{item.quantity} {item.unit}</p>
                    <p className="text-xs text-neutral-400">Reorder at 20 {item.unit}</p>
                  </div>
                  <Badge
                    variant={item.status === "in_stock" ? "success" : item.status === "low_stock" ? "warning" : "danger"}
                    size="sm"
                    dot
                  >
                    {item.status === "in_stock" ? "In Stock" : item.status === "low_stock" ? "Low Stock" : "Out"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Safety Rules */}
        {activeTab === "safety" && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-800">
                Safety rules are deterministic and encoded in the contraindication engine. Red-flag keywords are configurable below.
              </p>
            </div>
            {[
              { category: "Diabetes Safety", rules: ["Jaggery (Guda) → contraindicated", "Cane sugar (Sharkara) → caution"], status: "active" },
              { category: "Pregnancy Safety", rules: ["Fermented preparations → contraindicated", "Emmenagogues (Ushna herbs) → caution"], status: "active" },
              { category: "Kidney Disease", rules: ["High-oxalate herbs → caution", "Excessive Lavana → caution"], status: "active" },
              { category: "Liver Disease", rules: ["Fermented/alcohol preparations → contraindicated", "Herbo-mineral without specialist → caution"], status: "active" },
              { category: "Lactation", rules: ["Kampillaka, Langali → contraindicated"], status: "active" },
              { category: "Pediatric", rules: ["Shodhita Visha without specialist → contraindicated"], status: "active" },
              { category: "Allergy", rules: ["Patient-reported allergy matched in ingredient list → contraindicated"], status: "active" },
              { category: "Geriatric", rules: ["High-potency Ruksha formulations → caution"], status: "active" },
            ].map((rule) => (
              <Card key={rule.category}>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-neutral-900">{rule.category}</p>
                  <Badge variant="success" size="sm" dot>Active</Badge>
                </div>
                <ul className="space-y-1.5">
                  {rule.rules.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-xs text-neutral-600">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" /> {r}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}

        {/* Config */}
        {activeTab === "config" && (
          <div className="max-w-xl space-y-4">
            <Card>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">Hospital Configuration</p>
              <div className="space-y-4">
                <Input label="Hospital Name" defaultValue="Sri Dhanvantari Ayurvedic Hospital" id="hospital-name" />
                <Input label="OPD Start Time" type="time" defaultValue="09:00" id="opd-start" />
                <Input label="OPD End Time" type="time" defaultValue="17:00" id="opd-end" />
                <Input label="Max Tokens Per OPD" type="number" defaultValue="50" id="max-tokens" />
                <Button fullWidth id="save-config-btn">Save Configuration</Button>
              </div>
            </Card>
            <Card>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">Gemini API (Optional)</p>
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    API key is optional. The system operates fully without it using rule-based logic and guided forms.
                    API is used only for conversational symptom extraction phrasing, never for clinical decisions.
                  </p>
                </div>
                <Input label="Gemini API Key" type="password" placeholder="Not configured" id="gemini-api-key" />
                <p className="text-xs text-neutral-400">API output is never used directly for diagnosis or prescription. All clinical decisions require clinician confirmation.</p>
                <Button variant="outline" fullWidth id="save-api-key-btn">Save API Key</Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
