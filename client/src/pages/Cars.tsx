import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { CarVariantWithDetails, CarModel } from "@shared/schema";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, Fuel, Gauge, Calendar, Cog } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

interface SearchFilters {
  search: string;
  brand: string;
  category: string;
  fuelType: string;
  driveType: string;
  transmission: string;
  powerMin: string;
  powerMax: string;
  yearMin: string;
  yearMax: string;
}

const defaultFilters: SearchFilters = {
  search: "",
  brand: "",
  category: "",
  fuelType: "",
  driveType: "",
  transmission: "",
  powerMin: "",
  powerMax: "",
  yearMin: "",
  yearMax: "",
};

function buildQueryString(filters: SearchFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  return params.toString();
}

export default function Cars() {
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      search: params.get("search") || params.get("q") || "",
      brand: params.get("brand") || "",
      category: params.get("category") || "",
      fuelType: params.get("fuelType") || "",
      driveType: params.get("driveType") || "",
      transmission: params.get("transmission") || "",
      powerMin: params.get("powerMin") || "",
      powerMax: params.get("powerMax") || "",
      yearMin: params.get("yearMin") || "",
      yearMax: params.get("yearMax") || "",
    };
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "power-asc" | "power-desc" | "year-desc" | "year-asc">("name");

  const queryString = useMemo(() => buildQueryString(filters), [filters]);

  const { data: results, isLoading, isError } = useQuery<CarVariantWithDetails[]>({
    queryKey: ["/api/variants/search", queryString],
    queryFn: async () => {
      const res = await fetch(`/api/variants/search?${queryString}`);
      if (!res.ok) throw new Error("Failed to search");
      return res.json();
    },
  });

  // Fetch models for brand dropdown
  const { data: models } = useQuery<CarModel[]>({
    queryKey: ["/api/models"],
  });

  const brands = useMemo(() => {
    if (!models) return [];
    const map = new Map<string, string>();
    models.forEach(m => {
      if (!map.has(m.brandSlug)) map.set(m.brandSlug, m.brand);
    });
    return Array.from(map.entries())
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [models]);

  // Available fuel types from results
  const fuelTypes = ["Benzin", "Dizel", "Hibrid", "Električni"];
  const driveTypes = ["FWD", "RWD", "AWD"];
  const categories = [
    { value: "Compact", label: "Kompaktni" },
    { value: "Sedan", label: "Limuzina" },
    { value: "SUV", label: "SUV / Crossover" },
    { value: "Sports", label: "Sportski" },
    { value: "Electric", label: "Električni" },
    { value: "Hatchback", label: "Hatchback" },
    { value: "Coupe", label: "Coupe" },
    { value: "Wagon", label: "Karavan" },
    { value: "Van", label: "Kombi" },
    { value: "Pickup", label: "Pickup" },
  ];

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, val]) => key !== "search" && val !== "");
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, val]) => key !== "search" && val !== "").length;
  }, [filters]);

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ ...defaultFilters, search: filters.search });
  };

  const clearAll = () => {
    setFilters(defaultFilters);
  };

  // Update URL when filters change
  useEffect(() => {
    const qs = buildQueryString(filters);
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [filters]);

  // Sort results
  const sorted = useMemo(() => {
    if (!results) return [];
    const arr = [...results];
    switch (sortBy) {
      case "power-asc":
        return arr.sort((a, b) => {
          const pa = parseInt(a.power.replace(/[^0-9]/g, ""), 10) || 0;
          const pb = parseInt(b.power.replace(/[^0-9]/g, ""), 10) || 0;
          return pa - pb;
        });
      case "power-desc":
        return arr.sort((a, b) => {
          const pa = parseInt(a.power.replace(/[^0-9]/g, ""), 10) || 0;
          const pb = parseInt(b.power.replace(/[^0-9]/g, ""), 10) || 0;
          return pb - pa;
        });
      case "year-desc":
        return arr.sort((a, b) => (b.generation.yearStart ?? 0) - (a.generation.yearStart ?? 0));
      case "year-asc":
        return arr.sort((a, b) => (a.generation.yearStart ?? 0) - (b.generation.yearStart ?? 0));
      default:
        return arr.sort((a, b) =>
          `${a.model.brand} ${a.model.model}`.localeCompare(`${b.model.brand} ${b.model.model}`)
        );
    }
  }, [results, sortBy]);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Napredna Pretraga
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Filtrirajte automobile po snazi, gorivu, godini, pogonu i više
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Pretraži po marki, modelu ili motoru..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500 text-white placeholder-slate-400"
            />
            {filters.search && (
              <button
                onClick={() => updateFilter("search", "")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Toggle + Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 max-w-2xl mx-auto">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              hasActiveFilters
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filteri</span>
            {activeFilterCount > 0 && (
              <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
            )}
            {filtersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Sortiraj:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="name">Ime (A-Z)</option>
              <option value="power-desc">Snaga (najviša)</option>
              <option value="power-asc">Snaga (najniža)</option>
              <option value="year-desc">Godina (najnovije)</option>
              <option value="year-asc">Godina (najstarije)</option>
            </select>
          </div>
        </div>

        {/* Filter Panel */}
        {filtersOpen && (
          <div className="max-w-2xl mx-auto mb-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Filteri pretrage</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm text-blue-400 hover:text-blue-300">
                  Očisti filtere
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Brand */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Marka</label>
                <select
                  value={filters.brand}
                  onChange={(e) => updateFilter("brand", e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Sve marke</option>
                  {brands.map(b => (
                    <option key={b.slug} value={b.slug}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Kategorija</label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter("category", e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Sve kategorije</option>
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Fuel Type */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Gorivo</label>
                <select
                  value={filters.fuelType}
                  onChange={(e) => updateFilter("fuelType", e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Sva goriva</option>
                  {fuelTypes.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Drive Type */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Pogon</label>
                <select
                  value={filters.driveType}
                  onChange={(e) => updateFilter("driveType", e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Svi pogoni</option>
                  {driveTypes.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Transmission */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Mjenjač</label>
                <select
                  value={filters.transmission}
                  onChange={(e) => updateFilter("transmission", e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Svi mjenjači</option>
                  <option value="manual">Ručni</option>
                  <option value="automatic">Automatski</option>
                </select>
              </div>
            </div>

            {/* Power Range */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                <Gauge className="w-4 h-4 inline mr-1" />
                Snaga (KS)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Od"
                  value={filters.powerMin}
                  onChange={(e) => updateFilter("powerMin", e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500"
                  min={0}
                />
                <span className="text-slate-500">—</span>
                <input
                  type="number"
                  placeholder="Do"
                  value={filters.powerMax}
                  onChange={(e) => updateFilter("powerMax", e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500"
                  min={0}
                />
              </div>
            </div>

            {/* Year Range */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Godina proizvodnje
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Od"
                  value={filters.yearMin}
                  onChange={(e) => updateFilter("yearMin", e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500"
                  min={1950}
                  max={2030}
                />
                <span className="text-slate-500">—</span>
                <input
                  type="number"
                  placeholder="Do"
                  value={filters.yearMax}
                  onChange={(e) => updateFilter("yearMax", e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500"
                  min={1950}
                  max={2030}
                />
              </div>
            </div>
          </div>
        )}

        {/* Active filter tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6 max-w-2xl mx-auto">
            {filters.brand && (
              <FilterTag label={`Marka: ${brands.find(b => b.slug === filters.brand)?.name || filters.brand}`} onClear={() => updateFilter("brand", "")} />
            )}
            {filters.category && (
              <FilterTag label={`Kategorija: ${categories.find(c => c.value === filters.category)?.label || filters.category}`} onClear={() => updateFilter("category", "")} />
            )}
            {filters.fuelType && (
              <FilterTag label={`Gorivo: ${filters.fuelType}`} onClear={() => updateFilter("fuelType", "")} />
            )}
            {filters.driveType && (
              <FilterTag label={`Pogon: ${filters.driveType}`} onClear={() => updateFilter("driveType", "")} />
            )}
            {filters.transmission && (
              <FilterTag label={`Mjenjač: ${filters.transmission === "manual" ? "Ručni" : "Automatski"}`} onClear={() => updateFilter("transmission", "")} />
            )}
            {(filters.powerMin || filters.powerMax) && (
              <FilterTag
                label={`Snaga: ${filters.powerMin || "0"} – ${filters.powerMax || "∞"} KS`}
                onClear={() => { updateFilter("powerMin", ""); updateFilter("powerMax", ""); }}
              />
            )}
            {(filters.yearMin || filters.yearMax) && (
              <FilterTag
                label={`Godina: ${filters.yearMin || "–"} – ${filters.yearMax || "–"}`}
                onClear={() => { updateFilter("yearMin", ""); updateFilter("yearMax", ""); }}
              />
            )}
            <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 px-2 py-1">
              Očisti sve
            </button>
          </div>
        )}

        {/* Results count */}
        {!isLoading && results && (
          <p className="text-slate-400 text-sm mb-4 max-w-2xl mx-auto">
            {results.length === 0
              ? "Nema rezultata za zadane filtere."
              : `Pronađeno ${results.length} ${results.length === 1 ? "varijanta" : "varijanti"}`}
          </p>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden animate-pulse">
                <div className="h-40 bg-slate-700" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-700 rounded w-3/4" />
                  <div className="h-4 bg-slate-700 rounded w-1/2" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-4 bg-slate-700 rounded" />
                    <div className="h-4 bg-slate-700 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-12 text-red-400">
            Greška pri pretraživanju. Pokušajte ponovo.
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && !isError && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((variant) => {
              const yearRange = variant.generation.yearEnd
                ? `${variant.generation.yearStart}–${variant.generation.yearEnd}`
                : `${variant.generation.yearStart}–danas`;
              const link = variant.model.brandSlug && variant.model.modelSlug && variant.generation.slug && variant.slug
                ? `/automobili/${variant.model.brandSlug}/${variant.model.modelSlug}/${variant.generation.slug}/${variant.slug}`
                : `/varijanta/${variant.id}`;

              return (
                <Link
                  key={variant.id}
                  href={link}
                  className="block bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition group"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition">
                        {variant.model.brand} {variant.model.model}
                      </h3>
                      <span className="text-xs bg-blue-600/80 px-2 py-0.5 rounded text-white shrink-0 ml-2">
                        {yearRange}
                      </span>
                    </div>
                    <p className="text-blue-400 text-sm font-medium mb-3">
                      {variant.generation.name} · {variant.engineName}
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-400">Snaga:</span>
                        <span className="text-slate-200 font-medium">{variant.power}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-400">Gorivo:</span>
                        <span className="text-slate-200">{variant.fuelType}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Cog className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-400">Pogon:</span>
                        <span className="text-slate-200">{variant.driveType}</span>
                      </div>
                      {variant.torque && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 text-xs">⟳</span>
                          <span className="text-slate-400">Moment:</span>
                          <span className="text-slate-200">{variant.torque}</span>
                        </div>
                      )}
                    </div>
                    {variant.acceleration && (
                      <div className="mt-2 text-xs text-slate-500">
                        0-100: {variant.acceleration} · Potrošnja: {variant.consumption}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && results?.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">Nema rezultata</p>
            <p className="text-slate-500 text-sm mb-4">
              Pokušajte promijeniti filtere ili pretraživati drugim pojmom.
            </p>
            <button onClick={clearAll} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
              Očisti sve filtere
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterTag({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-blue-600/20 text-blue-300 text-xs px-2.5 py-1 rounded-full border border-blue-500/30">
      {label}
      <button onClick={onClear} className="hover:text-white">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
