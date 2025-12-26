import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Car, BookOpen, Shield, Search, ChevronRight } from "lucide-react";
import type { Car as CarType } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchBrand, setSearchBrand] = useState("");
  const [searchModel, setSearchModel] = useState("");
  const [searchYear, setSearchYear] = useState("");

  const { data: cars } = useQuery<CarType[]>({
    queryKey: ["/api/cars"],
  });

  // Get unique brands
  const brands = [...new Set(cars?.map(car => car.brand) || [])].sort();
  
  // Get models for selected brand
  const models = searchBrand 
    ? [...new Set(cars?.filter(car => car.brand === searchBrand).map(car => car.model) || [])].sort()
    : [];

  // Get years for selected brand and model
  const years = (searchBrand && searchModel)
    ? [...new Set(cars?.filter(car => car.brand === searchBrand && car.model === searchModel).map(car => car.year) || [])].sort((a, b) => b - a)
    : [];

  // Find matching car
  const matchedCar = (searchBrand && searchModel && searchYear)
    ? cars?.find(car => car.brand === searchBrand && car.model === searchModel && car.year.toString() === searchYear)
    : null;

  // Find cars matching brand and model (all years)
  const matchedCars = (searchBrand && searchModel)
    ? cars?.filter(car => car.brand === searchBrand && car.model === searchModel) || []
    : [];

  const clearSearch = () => {
    setSearchBrand("");
    setSearchModel("");
    setSearchYear("");
  };

  return (
    <div className="min-h-screen">
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Dobrodošli u Auto Wiki
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Vaša kompleta enciklopedija automobila s detaljnim specifikacijama, recenzijama i najnovijim vijestima iz automobilskog svijeta.
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
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${searchModel ? 'bg-blue-500 shadow-lg shadow-blue-500/50' : 'bg-slate-600'}`}></div>
                  <div className={`w-8 h-0.5 transition-all duration-300 ${searchModel ? 'bg-blue-500' : 'bg-slate-600'}`}></div>
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${searchYear ? 'bg-cyan-500 shadow-lg shadow-cyan-500/50' : 'bg-slate-600'}`}></div>
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
                          setSearchModel("");
                          setSearchYear("");
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
                        value={searchModel}
                        onChange={(e) => {
                          setSearchModel(e.target.value);
                          setSearchYear("");
                        }}
                        className="w-full bg-slate-900/80 border-2 border-slate-600/50 rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white transition-all duration-200 cursor-pointer hover:border-slate-500 appearance-none"
                      >
                        <option value="">-- Odaberi model --</option>
                        {models.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  {/* Year Select - only show when model is selected */}
                  <div className={`transition-all duration-300 ease-out ${searchBrand && searchModel ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 h-0 overflow-hidden'}`}>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2 text-left">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold">3</span>
                      Odaberi godinu
                    </label>
                    <div className="relative">
                      <select
                        value={searchYear}
                        onChange={(e) => setSearchYear(e.target.value)}
                        className="w-full bg-slate-900/80 border-2 border-slate-600/50 rounded-xl px-4 py-3.5 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-white transition-all duration-200 cursor-pointer hover:border-slate-500 appearance-none"
                      >
                        <option value="">-- Odaberi godinu --</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  {/* Result - show matched car */}
                  {matchedCar && (
                    <Link
                      href={`/automobili/${matchedCar.id}`}
                      className="block bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-4 rounded-xl hover:from-blue-600/30 hover:to-cyan-600/30 transition-all duration-300 border border-blue-500/30 hover:border-blue-400/50 group/result"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-40"></div>
                          <img 
                            src={matchedCar.image} 
                            alt={`${matchedCar.brand} ${matchedCar.model}`}
                            className="relative w-20 h-14 object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-white">{matchedCar.brand} {matchedCar.model}</p>
                          <p className="text-sm text-slate-400">{matchedCar.year} • {matchedCar.power}</p>
                        </div>
                        <div className="p-2 bg-blue-500/20 rounded-lg group-hover/result:bg-blue-500/30 transition">
                          <ChevronRight className="w-5 h-5 text-blue-400 group-hover/result:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Show all years if model selected but no year */}
                  {searchBrand && searchModel && !searchYear && matchedCars.length > 0 && (
                    <div className="space-y-2 mt-2">
                      <p className="text-sm text-slate-400 text-left flex items-center gap-2">
                        <span className="w-4 h-px bg-slate-600"></span>
                        Ili odaberi direktno
                        <span className="flex-1 h-px bg-slate-600"></span>
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {matchedCars.map(car => (
                          <Link
                            key={car.id}
                            href={`/automobili/${car.id}`}
                            className="block bg-slate-900/60 p-3 rounded-xl hover:bg-slate-700/60 transition-all duration-200 text-left border border-transparent hover:border-slate-600/50 group/item"
                          >
                            <div className="flex items-center gap-3">
                              <img 
                                src={car.image} 
                                alt={`${car.brand} ${car.model}`}
                                className="w-14 h-10 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-white">{car.brand} {car.model} ({car.year})</p>
                                <p className="text-xs text-slate-400">{car.power}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-500 group-hover/item:text-blue-400 group-hover/item:translate-x-0.5 transition-all" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
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
