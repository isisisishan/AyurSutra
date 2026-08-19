"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Filter, X, BookOpen, Loader2, Leaf, ChevronRight, Scale } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { DisclaimerBanner } from "@/components/bkk/DisclaimerBanner";
import { FormulationCard } from "@/components/bkk/FormulationCard";
import { FormulationDetail } from "@/components/bkk/FormulationDetail";
import { CompareTray } from "@/components/bkk/CompareTray";
import { ComparePanel } from "@/components/bkk/ComparePanel";
import {
  searchBKK,
  getBKKById,
  getRelatedFormulations,
  getBKKTypes,
  getBKKCategories,
  getAllBKKRecords,
  type BKKRecord,
  type BKKSearchResult,
} from "@/lib/services/bkk-engine";
import { cn } from "@/lib/utils";

const ALL_TYPES = getBKKTypes();
const ALL_CATEGORIES = getBKKCategories();
const MAX_COMPARE = 3;

const POPULAR_SEARCHES = [
  "Fever", "Jwara", "Cough", "Triphala", "Digestive", "Arthritis",
  "Skin diseases", "Anxiety", "Kidney stones", "Diabetes",
];

export default function ExploreAyurvedaPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterIngredient, setFilterIngredient] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<BKKSearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<BKKRecord | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [maxToast, setMaxToast] = useState(false);

  const handleSearch = (q?: string) => {
    const searchQ = q ?? query;
    setActiveQuery(searchQ);
    setIsSearching(true);
    setShowCompare(false); // collapse compare panel when re-searching
    setTimeout(() => {
      const res = searchBKK(searchQ, {
        type: filterType || undefined,
        category: filterCategory || undefined,
        ingredientContains: filterIngredient || undefined,
      });
      setResults(res);
      setIsSearching(false);
    }, 200);
  };

  const handleClear = () => {
    setQuery("");
    setActiveQuery("");
    setFilterType("");
    setFilterCategory("");
    setFilterIngredient("");
    setResults(null);
    setShowCompare(false);
  };

  const handleToggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) {
        // Show toast and return unchanged
        setMaxToast(true);
        setTimeout(() => setMaxToast(false), 3000);
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleClearAll = () => {
    setCompareIds([]);
    setShowCompare(false);
  };

  const relatedRecords = useMemo(
    () => (selectedDetail ? getRelatedFormulations(selectedDetail.id) : []),
    [selectedDetail]
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Top nav */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
          >
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span className="font-serif font-semibold">AyurSutra</span>
          </button>
          <div className="flex items-center gap-3">
            <Badge variant="info" size="sm">Ayurveda Explorer</Badge>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-neutral-900 mb-3">
            Discover Ayurveda, Simply.
          </h1>
          <p className="text-neutral-500 text-base max-w-xl mx-auto leading-relaxed">
            Explore traditional Ayurvedic formulations, ingredients, and wellness uses in one easy place.
          </p>
        </div>

        {/* Disclaimer */}
        <DisclaimerBanner className="mb-6 max-w-4xl mx-auto" />

        {/* Search */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by health concern, symptom, formulation, or ingredient..."
                className="w-full pl-10 pr-10 py-3 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all placeholder:text-neutral-400"
                id="bkk-search-input"
                aria-label="Search formulations"
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button onClick={() => handleSearch()} disabled={isSearching} id="bkk-search-btn">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="w-4 h-4" />}
              id="bkk-filter-btn"
            >
              Filter
              {(filterType || filterCategory || filterIngredient) && (
                <span className="ml-1 w-4 h-4 rounded-full bg-neutral-900 text-white text-[9px] flex items-center justify-center">
                  {[filterType, filterCategory, filterIngredient].filter(Boolean).length}
                </span>
              )}
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-3 p-4 bg-white border border-neutral-100 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Formulation Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  id="filter-type"
                >
                  <option value="">All types</option>
                  {ALL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  id="filter-category"
                >
                  <option value="">All categories</option>
                  {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Ingredient contains</label>
                <input
                  type="text"
                  value={filterIngredient}
                  onChange={(e) => setFilterIngredient(e.target.value)}
                  placeholder="e.g. Triphala, Guggulu"
                  className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  id="filter-ingredient"
                />
              </div>
              <div className="sm:col-span-3 flex gap-2">
                <Button size="sm" onClick={() => handleSearch()} id="apply-filters-btn">Apply filters</Button>
                <Button size="sm" variant="ghost" onClick={() => { setFilterType(""); setFilterCategory(""); setFilterIngredient(""); }} id="clear-filters-btn">
                  Clear filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Popular searches */}
        {!results && (
          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-xs text-neutral-400 text-center mb-3">Popular searches</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {POPULAR_SEARCHES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); handleSearch(s); }}
                  className="px-3 py-1.5 text-xs bg-white border border-neutral-200 text-neutral-600 rounded-full hover:bg-neutral-50 hover:border-neutral-300 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Main layout ──────────────────────────────────────────── */}
        <div className={cn("flex gap-6", selectedDetail ? "items-start" : "")}>
            {/* Results */}
            <div className={cn("flex-1 min-w-0", selectedDetail && "max-w-[60%]")}>
              {/* Loading */}
              {isSearching && (
                <div className="flex items-center justify-center py-16 gap-3 text-neutral-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Searching…</span>
                </div>
              )}

              {/* Results header */}
              {results !== null && !isSearching && (
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      {results.length} {results.length === 1 ? "formulation" : "formulations"} found
                      {activeQuery && <span className="text-neutral-500"> for "{activeQuery}"</span>}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      For educational and wellness awareness only.
                    </p>
                  </div>
                  <button onClick={handleClear} className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
                    Clear
                  </button>
                </div>
              )}

              {/* No results */}
              {results !== null && !isSearching && results.length === 0 && (
                <div className="text-center py-16">
                  <BookOpen className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
                  <p className="text-neutral-500 font-medium">No formulations found</p>
                  <p className="text-sm text-neutral-400 mt-1">
                    Try searching by English or Sanskrit term, ingredient, or formulation type.
                  </p>
                </div>
              )}

              {/* Result cards */}
              {results !== null && !isSearching && results.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.map(({ record, score, matchReasons, matchedTags }) => (
                    <FormulationCard
                      key={record.id}
                      record={record}
                      mode="public"
                      score={score}
                      matchReasons={matchReasons}
                      matchedTags={matchedTags}
                      isInCompare={compareIds.includes(record.id)}
                      onViewDetail={() => setSelectedDetail(record)}
                      onToggleCompare={() => handleToggleCompare(record.id)}
                    />
                  ))}
                </div>
              )}

              {/* No search yet — show stats */}
              {!results && !isSearching && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                  {[
                    { label: "Formulations", value: getAllBKKRecords().length },
                    { label: "Classical Types", value: ALL_TYPES.length },
                    { label: "Body Systems", value: ALL_CATEGORIES.length },
                    { label: "Traditional Categories", value: "9+" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white border border-neutral-100 rounded-xl p-4 text-center">
                      <p className="font-serif text-2xl font-semibold text-neutral-900">{stat.value}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detail panel */}
            {selectedDetail && (
              <div className="w-[40%] sticky top-20 bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm max-h-[calc(100vh-6rem)]">
                <FormulationDetail
                  record={selectedDetail}
                  mode="public"
                  relatedRecords={relatedRecords}
                  onClose={() => setSelectedDetail(null)}
                  onViewRelated={(id) => {
                    const r = getBKKById(id);
                    if (r) setSelectedDetail(r);
                  }}
                />
              </div>
            )}
          </div>
      </div>

      {/* Compare Modal */}
      {showCompare && compareIds.length >= 2 && (
        <ComparePanel
          ids={compareIds}
          mode="public"
          onClose={() => setShowCompare(false)}
        />
      )}

      {/* Max-3 toast */}
      {maxToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-neutral-800 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg animate-fade-in">
          You can compare up to 3 formulations at a time.
        </div>
      )}

      {/* Sticky Compare Tray */}
      <CompareTray
        selectedCount={compareIds.length}
        selectedNames={compareIds.map((id) => getBKKById(id)?.name ?? "")}
        onClear={(i) => setCompareIds((prev) => prev.filter((_, idx) => idx !== i))}
        onClearAll={handleClearAll}
        onCompare={() => setShowCompare(true)}
      />
    </div>
  );
}
