import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Car, BookOpen, Shield, Search, ChevronRight } from "lucide-react";
import type { CarModel, CarGenerationWithModel } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchBrand, setSearchBrand] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");

  const { data: models } = useQuery<CarModel[]>({
    queryKey: ["/api/models"],
  });

  const { data: generations } = useQuery<CarGenerationWithModel[]>({
    queryKey: ["/api/models", selectedModelId, "generations"],
    queryFn: async () => {
      const res = await fetch(`/api/models/${selectedModelId}/generations`);
      if (!res.ok) throw new Error("Failed to fetch generations");
      return res.json();
    },
    enabled: !!selectedModelId,
  });

  // Get unique brands
  const brands = [...new Set(models?.map(m => m.brand) || [])].sort();
  
  // Get models for selected brand
  const brandModels = searchBrand 
    ? models?.filter(m => m.brand === searchBrand).sort((a, b) => a.model.localeCompare(b.model)) || []
    : [];

  const selectedModel = models?.find(m => m.id === selectedModelId);

  const clearSearch = () => {
    setSearchBrand("");
    setSelectedModelId("");
  };

  return (
    <div className="min-h-screen">
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Dobrodošli u Auto Wiki
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Vaša kompletna enciklopedija automobila s detaljnim specifikacijama, recenzijama i najnovijim vijestima iz automobilskog svijeta.
          </p>

          {/* Search Section */}
          <div className="max-w-lg mx-auto mb-8">
            <div className="relative group">
              {/* Animated gradient border */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500 animate-pulse"></div>
              
              <div className="relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 backdrop-blur-xl p-8 rounded-2xl border border-slate-600/50 shadow-2xl">
                {/* Header with icon */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/25">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Pronađi automobil
                  </h2>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${searchBrand ? 'bg-blue-500 shadow-lg shadow-blue-500/50' : 'bg-slate-600'}`}></div>
                  <div className={`w-8 h-0.5 transition-all duration-300 ${searchBrand ? 'bg-blue-500' : 'bg-slate-600'}`}></div>
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${selectedModelId ? 'bg-blue-500 shadow-lg shadow-blue-500/50' : 'bg-slate-600'}`}></div>
                  <div className={`w-8 h-0.5 transition-all duration-300 ${selectedModelId ? 'bg-blue-500' : 'bg-slate-600'}`}></div>
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${generations && generations.length > 0 ? 'bg-cyan-500 shadow-lg shadow-cyan-500/50' : 'bg-slate-600'}`}></div>
                </div>
              
                <div className="space-y-5">
                  {/* Brand Select */}
                  <div className="group/select">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2 text-left">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">1</span>
                      Odaberi marku
                    </label>
                    <div className="relative">
                      <select
                        value={searchBrand}
                        onChange={(e) => {
                          setSearchBrand(e.target.value);
                          setSelectedModelId("");
                        }}
                        className="w-full bg-slate-900/80 border-2 border-slate-600/50 rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white transition-all duration-200 cursor-pointer hover:border-slate-500 appearance-none"
                      >
                        <option value="">-- Odaberi marku --</option>
                        {brands.map(brand => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  {/* Model Select - only show when brand is selected */}
                  <div className={`transition-all duration-300 ease-out ${searchBrand ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 h-0 overflow-hidden'}`}>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2 text-left">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">2</span>
                      Odaberi model
                    </label>
                    <div className="relative">
                      <select
                        value={selectedModelId}
                        onChange={(e) => setSelectedModelId(e.target.value)}
                        className="w-full bg-slate-900/80 border-2 border-slate-600/50 rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white transition-all duration-200 cursor-pointer hover:border-slate-500 appearance-none"
                      >
                        <option value="">-- Odaberi model --</option>
                        {brandModels.map(model => (
                          <option key={model.id} value={model.id}>{model.model}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  {/* Generation List - show when model is selected */}
                  {selectedModelId && generations && generations.length > 0 && (
                    <div className="transition-all duration-300 ease-out">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2 text-left">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold">3</span>
                        Odaberi generaciju
                      </label>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {generations.map(gen => (
                          <Link
                            key={gen.id}
                            href={`/generacija/${gen.id}`}
                            className="block bg-slate-900/60 p-3 rounded-xl hover:bg-slate-700/60 transition-all duration-200 text-left border border-transparent hover:border-slate-600/50 group/item"
                          >
                            <div className="flex items-center gap-3">
                              <img 
                                src={gen.image} 
                                alt={gen.name}
                                className="w-14 h-10 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-white">{gen.name}</p>
                                <p className="text-xs text-slate-400">{gen.yearStart} - {gen.yearEnd || "danas"}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-500 group-hover/item:text-blue-400 group-hover/item:translate-x-0.5 transition-all" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show link to model page if selected */}
                  {selectedModel && (
                    <Link
                      href={`/automobili/${selectedModel.id}`}
                      className="block bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-4 rounded-xl hover:from-blue-600/30 hover:to-cyan-600/30 transition-all duration-300 border border-blue-500/30 hover:border-blue-400/50 group/result"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-40"></div>
                          <img 
                            src={selectedModel.image} 
                            alt={`${selectedModel.brand} ${selectedModel.model}`}
                            className="relative w-20 h-14 object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-white">{selectedModel.brand} {selectedModel.model}</p>
                          <p className="text-sm text-slate-400">Pregledaj sve generacije</p>
                        </div>
                        <div className="p-2 bg-blue-500/20 rounded-lg group-hover/result:bg-blue-500/30 transition">
                          <ChevronRight className="w-5 h-5 text-blue-400 group-hover/result:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Clear button */}
                  {searchBrand && (
                    <button
                      onClick={clearSearch}
                      className="w-full text-sm text-slate-400 hover:text-white transition-all duration-200 py-2.5 rounded-lg hover:bg-slate-700/50 flex items-center justify-center gap-2 group/clear"
                    >
                      <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center group-hover/clear:border-red-400 group-hover/clear:text-red-400 transition-colors">
                        <span className="text-xs">×</span>
                      </span>
                      Očisti odabir
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/automobili" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition" data-testid="button-browse-cars">
              Pregledaj Automobile
            </Link>
            <Link href="/blog" className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition" data-testid="button-read-blog">
              Pročitaj Blog
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Link 
              href="/automobili" 
              className="block bg-slate-800 p-6 rounded-lg border border-slate-700 hover-elevate active-elevate-2 cursor-pointer transition-all"
              data-testid="link-feature-cars"
            >
              <Car className="w-12 h-12 text-blue-400 mb-4" data-testid="icon-cars" />
              <h3 className="text-xl font-bold mb-2" data-testid="text-cars-title">Baza Automobila</h3>
              <p className="text-slate-400" data-testid="text-cars-description">
                Pregledajte našu opsežnu bazu automobila s detaljnim tehničkim specifikacijama i fotografijama.
              </p>
            </Link>
            <Link 
              href="/blog" 
              className="block bg-slate-800 p-6 rounded-lg border border-slate-700 hover-elevate active-elevate-2 cursor-pointer transition-all"
              data-testid="link-feature-blog"
            >
              <BookOpen className="w-12 h-12 text-blue-400 mb-4" data-testid="icon-blog" />
              <h3 className="text-xl font-bold mb-2" data-testid="text-blog-title">Blog & Vijesti</h3>
              <p className="text-slate-400" data-testid="text-blog-description">
                Pročitajte stručne članak o povijesti, tehnologiji i najnovijim trendovima u automobilskoj industriji.
              </p>
            </Link>
            <Link 
              href="/o-nama" 
              className="block bg-slate-800 p-6 rounded-lg border border-slate-700 hover-elevate active-elevate-2 cursor-pointer transition-all"
              data-testid="link-feature-about"
            >
              <Shield className="w-12 h-12 text-blue-400 mb-4" data-testid="icon-about" />
              <h3 className="text-xl font-bold mb-2" data-testid="text-about-title">Pouzdani Podaci</h3>
              <p className="text-slate-400" data-testid="text-about-description">
                Sve informacije su pažljivo provjerene i redovito ažurirane kako bismo osigurali točnost podataka.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
