import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import type { CarModel } from "@shared/schema";
import { Search, ChevronRight, ArrowLeft, Info, X } from "lucide-react";
import { useState, useEffect } from "react";
import ResponsiveImage from "../components/ResponsiveImage";
import { CardGridSkeleton, BreadcrumbSkeleton } from "../components/Skeleton";
import { usePageMeta } from "../lib/seo";

export default function Models() {
  const params = useParams<{ brandSlug?: string }>();
  // Pre-fill search from ?q= URL param (e.g. from navbar search)
  const [searchTerm, setSearchTerm] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("q") || "";
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showHierarchyHelp, setShowHierarchyHelp] = useState(() => {
    return !localStorage.getItem("hideHierarchyHelp");
  });

  // Keep search in sync if user navigates here again with a different ?q=
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get("q");
    if (q !== null) setSearchTerm(q);
  }, []);

  const { data: models, isLoading, isError } = useQuery<CarModel[]>({
    queryKey: ["/api/models"],
  });

  const categories = ["all", "Compact", "Sedan", "SUV", "Sports", "Electric"];

  // Get unique brands with type definition
  type BrandInfo = { brand: string; brandSlug: string };
  
  const brands: BrandInfo[] = models 
    ? Array.from(
        models.reduce((map, m) => {
          const brandSlug = m.brandSlug || m.brand.toLowerCase().replace(/\s+/g, '-');
          if (!map.has(brandSlug)) {
            map.set(brandSlug, { brand: m.brand, brandSlug });
          }
          return map;
        }, new Map<string, BrandInfo>()).values()
      ).sort((a, b) => a.brand.localeCompare(b.brand))
    : [];

  // Find selected brand info
  const selectedBrandInfo = params.brandSlug 
    ? brands.find((b: BrandInfo) => b.brandSlug === params.brandSlug) 
    : null;

  usePageMeta({
    title: selectedBrandInfo
      ? `${selectedBrandInfo.brand} modeli - Auto Wiki`
      : "Baza automobila - Auto Wiki",
    description: selectedBrandInfo
      ? `Pregledajte modele marke ${selectedBrandInfo.brand}, njihove generacije i motorne varijante.`
      : "Pregledajte bazu automobila po markama, modelima, generacijama i motornim varijantama.",
  });

  // Get models for selected brand
  const brandModels = params.brandSlug
    ? models?.filter(m => (m.brandSlug || m.brand.toLowerCase().replace(/\s+/g, '-')) === params.brandSlug)
        .filter(m => {
          const matchesSearch = m.model.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesCategory = selectedCategory === "all" || m.category === selectedCategory;
          return matchesSearch && matchesCategory;
        })
        .sort((a, b) => a.model.localeCompare(b.model)) || []
    : [];

  // Filter brands by search term when no brand selected
  const filteredBrands: BrandInfo[] = !params.brandSlug
    ? brands.filter((b: BrandInfo) => {
        const term = searchTerm.toLowerCase();
        if (b.brand.toLowerCase().includes(term)) return true;
        return models?.some(m => {
          const mBrandSlug = m.brandSlug || m.brand.toLowerCase().replace(/\s+/g, '-');
          if (mBrandSlug !== b.brandSlug) return false;
          const combo = `${m.brand} ${m.model}`.toLowerCase();
          return combo.includes(term) || m.model.toLowerCase().includes(term);
        }) ?? false;
      })
    : brands;

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg font-semibold mb-2">Greška pri učitavanju podataka</p>
          <p className="text-slate-400 text-sm">Provjerite internetsku vezu i pokušajte ponovo.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white keep-white rounded-lg text-sm transition"
          >
            Pokušaj ponovo
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Baza Automobila
          </h1>
          <BreadcrumbSkeleton />
          <div className="mb-8">
            <div className="relative max-w-xl mx-auto">
              <div className="w-full bg-slate-800 border border-slate-700 rounded-lg h-12 animate-pulse" />
            </div>
          </div>
          <CardGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Baza Automobila
        </h1>

        {/* Hierarchy explainer for first-time visitors */}
        {showHierarchyHelp && !params.brandSlug && (
          <div className="relative mx-auto mb-6 max-w-4xl rounded-2xl border border-blue-500/20 bg-blue-50/80 p-5 shadow-sm shadow-slate-900/5 dark:bg-blue-500/5 md:p-6">
            <button
              onClick={() => { setShowHierarchyHelp(false); localStorage.setItem("hideHierarchyHelp", "1"); }}
              className="absolute right-4 top-4 text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white"
              aria-label="Zatvori"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="mb-3 text-base font-medium text-blue-700 dark:text-blue-300">Kako je organizirana baza?</p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="rounded-md bg-white px-2.5 py-1.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">Marka</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="rounded-md bg-white px-2.5 py-1.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">Model</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="rounded-md bg-white px-2.5 py-1.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">Generacija</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="rounded-md bg-white px-2.5 py-1.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">Varijanta</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-500">
                  Npr. <span className="text-slate-700 dark:text-slate-400">Volkswagen</span> → <span className="text-slate-700 dark:text-slate-400">Golf</span> → <span className="text-slate-700 dark:text-slate-400">MK7 (2012–2019)</span> → <span className="text-slate-700 dark:text-slate-400">2.0 TDI 150 KS</span>. 
                  Odaberite marku za početak pregledavanja.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm justify-center">
          <Link 
            href="/automobili"
            className={`hover:text-blue-400 transition ${!params.brandSlug ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            Sve marke
          </Link>
          {selectedBrandInfo && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <span className="text-blue-400 font-bold">{selectedBrandInfo.brand}</span>
            </>
          )}
        </div>

        {/* Search */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={params.brandSlug ? "Pretraži modele..." : "Pretraži marke..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category filter - only show when viewing models */}
          {params.brandSlug && (
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white keep-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {category === "all" ? "Sve kategorije" : category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Brand List - when no brand selected */}
        {!params.brandSlug && (
          <>
            {filteredBrands.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                Nema marki koje odgovaraju vašoj pretrazi.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredBrands.map((brandInfo) => {
                  const brandModelCount = models?.filter(m => 
                    (m.brandSlug || m.brand.toLowerCase().replace(/\s+/g, '-')) === brandInfo.brandSlug
                  ).length || 0;
                  
                  return (
                    <Link
                      key={brandInfo.brandSlug}
                      href={`/automobili/${brandInfo.brandSlug}`}
                      className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition group text-center"
                    >
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">
                        {brandInfo.brand}
                      </h3>
                      <p className="text-slate-400 text-sm mt-2">
                        {brandModelCount} {brandModelCount === 1 ? 'model' : 'modela'}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Models List - when brand is selected */}
        {params.brandSlug && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <Link href="/automobili" className="p-2 hover:bg-slate-800 rounded transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h2 className="text-2xl font-bold text-slate-200">
                {selectedBrandInfo?.brand || params.brandSlug} - Modeli
              </h2>
            </div>

            {brandModels.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                Nema modela koji odgovaraju vašim kriterijima pretrage.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {brandModels.map((model) => (
                  <Link
                    key={model.id}
                    href={model.brandSlug && model.modelSlug 
                      ? `/automobili/${model.brandSlug}/${model.modelSlug}`
                      : `/model/${model.id}`
                    }
                    className="block bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition group"
                  >
                    <div className="relative overflow-hidden">
                      <ResponsiveImage
                        src={model.image}
                        alt={`${model.brand} ${model.model}`}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        targetWidth={720}
                        responsiveWidths={[400, 640, 720, 960]}
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        quality={78}
                        resize="cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                      <span className="absolute top-3 right-3 bg-blue-600 px-2 py-1 rounded text-xs font-medium text-white keep-white">
                        {model.category}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white">
                        {model.model}
                      </h3>
                      <p className="text-slate-400 text-sm line-clamp-2 mt-1">
                        {model.description}
                      </p>
                      <div className="mt-3 text-blue-400 text-sm font-medium group-hover:text-blue-300 flex items-center gap-1">
                        Pregledaj generacije <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
