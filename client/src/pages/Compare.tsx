import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Check, ChevronRight, Fuel, Gauge, Zap, Settings, Car, Scale, Package, RotateCcw, Info } from "lucide-react";
import type { CarModel, CarGeneration, CarVariant } from "@shared/schema";
import ResponsiveImage from "../components/ResponsiveImage";
import { useToast } from "../components/Toast";
import { formatSpecWithUnit, formatVariantSpec, isSpecUnitField } from "../lib/specUnits";

interface VariantWithDetails extends CarVariant {
  generation?: CarGeneration;
  model?: CarModel;
}

export default function Compare() {
  const [selectedVariants, setSelectedVariants] = useState<VariantWithDetails[]>([]);
  const preloadedRef = useRef(false);
  const { toast } = useToast();

  // Auto-load variant from URL query param (e.g. /usporedi?variantId=abc)
  useEffect(() => {
    if (preloadedRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const variantId = params.get("variantId");
    if (!variantId) return;
    preloadedRef.current = true;

    (async () => {
      try {
        // Fetch variant details
        const vRes = await fetch(`/api/variants/${variantId}`);
        if (!vRes.ok) return;
        const variant = await vRes.json();

        // Fetch generation and model for context
        let generation: CarGeneration | undefined;
        let model: CarModel | undefined;
        try {
          const gRes = await fetch(`/api/generations/${variant.generationId}`);
          if (gRes.ok) {
            const gen = await gRes.json();
            generation = gen;
            const mRes = await fetch(`/api/models/${gen.modelId}`);
            if (mRes.ok) model = await mRes.json();
          }
        } catch {}

        setSelectedVariants([{ ...variant, generation, model }]);
      } catch {}
    })();
  }, []);
  const [searchBrand, setSearchBrand] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");
  const [selectedGenerationId, setSelectedGenerationId] = useState("");
  const [showSelector, setShowSelector] = useState(false);

  // Fetch all models
  const { data: models = [] } = useQuery<CarModel[]>({
    queryKey: ["/api/models"],
  });

  // Fetch generations for selected model
  const { data: generations = [] } = useQuery<CarGeneration[]>({
    queryKey: ["/api/models", selectedModelId, "generations"],
    queryFn: async () => {
      const res = await fetch(`/api/models/${selectedModelId}/generations`);
      if (!res.ok) throw new Error("Failed to fetch generations");
      return res.json();
    },
    enabled: !!selectedModelId,
  });

  // Fetch variants for selected generation
  const { data: variants = [] } = useQuery<CarVariant[]>({
    queryKey: ["/api/generations", selectedGenerationId, "variants"],
    queryFn: async () => {
      const res = await fetch(`/api/generations/${selectedGenerationId}/variants`);
      if (!res.ok) throw new Error("Failed to fetch variants");
      return res.json();
    },
    enabled: !!selectedGenerationId,
  });

  // Get unique brands
  const brands = [...new Set(models.map(m => m.brand))].sort();
  
  // Get models for selected brand
  const brandModels = searchBrand 
    ? models.filter(m => m.brand === searchBrand).sort((a, b) => a.model.localeCompare(b.model))
    : [];

  const selectedModel = models.find(m => m.id === selectedModelId);
  const selectedGeneration = generations.find(g => g.id === selectedGenerationId);

  const addVariant = (variant: CarVariant) => {
    if (selectedVariants.length >= 3) {
      toast("Maksimalno 3 vozila mogu biti odabrana za usporedbu.", "warning");
      return;
    }
    if (selectedVariants.find(v => v.id === variant.id)) return;
    
    const variantWithDetails: VariantWithDetails = {
      ...variant,
      generation: selectedGeneration,
      model: selectedModel,
    };
    
    setSelectedVariants([...selectedVariants, variantWithDetails]);
    // Reset selection
    setSelectedGenerationId("");
    setShowSelector(false);
  };

  const removeVariant = (variantId: string) => {
    setSelectedVariants(selectedVariants.filter(v => v.id !== variantId));
  };

  const resetSelection = () => {
    setSearchBrand("");
    setSelectedModelId("");
    setSelectedGenerationId("");
  };

  const specs = [
    { label: "Gorivo", key: "fuelType", icon: Fuel },
    { label: "Snaga", key: "power", icon: Zap },
    { label: "Okretni moment", key: "torque", icon: Settings },
    { label: "Ubrzanje 0-100", key: "acceleration", icon: Gauge },
    { label: "Max brzina", key: "topSpeed", icon: Gauge },
    { label: "Potrošnja", key: "consumption", icon: Fuel },
    { label: "Mjenjač", key: "transmission", icon: Settings },
    { label: "Pogon", key: "driveType", icon: Car },
    { label: "Obujam", key: "displacement", icon: Settings },
    { label: "Masa", key: "weight", icon: Scale },
    { label: "Prtljažnik", key: "trunkCapacity", icon: Package },
  ];

  // Helper to get best value for comparison
  const getBestValue = (key: string): string | null => {
    if (selectedVariants.length < 2) return null;
    
    const values = selectedVariants.map(v => {
      const val = v[key as keyof CarVariant];
      if (!val) return null;
      // Extract number from string like "150 KS" -> 150
      const match = String(val).match(/[\d.]+/);
      return match ? parseFloat(match[0]) : null;
    });

    if (values.some(v => v === null)) return null;

    // If all values are the same, no winner
    const allEqual = (values as number[]).every(v => v === values[0]);
    if (allEqual) return null;

    // For these keys, higher is better
    const higherIsBetter = ["power", "torque", "topSpeed"];
    // For these keys, lower is better
    const lowerIsBetter = ["acceleration", "consumption"];

    if (higherIsBetter.includes(key)) {
      const maxVal = Math.max(...(values as number[]));
      const idx = values.indexOf(maxVal);
      return selectedVariants[idx]?.id || null;
    }
    
    if (lowerIsBetter.includes(key)) {
      const minVal = Math.min(...(values as number[]));
      const idx = values.indexOf(minVal);
      return selectedVariants[idx]?.id || null;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 text-white text-center">
          Usporedba automobila
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Odaberite do 3 varijante za usporedbu ({selectedVariants.length}/3 odabrano)
        </p>

        {/* Clear All + Legend bar */}
        {selectedVariants.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedVariants([])}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Obriši sve
              </button>
              <span className="text-sm text-slate-500">
                {selectedVariants.length === 1 && "Dodajte još barem 1 vozilo za usporedbu"}
                {selectedVariants.length === 2 && "Možete dodati još 1 vozilo"}
                {selectedVariants.length === 3 && "Maksimalan broj vozila odabran"}
              </span>
            </div>
            {selectedVariants.length >= 2 && (
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-slate-500" />
                <span className="text-slate-500">Legenda:</span>
                <span className="flex items-center gap-1 text-green-400">
                  <Check className="w-3.5 h-3.5" /> Najbolja vrijednost
                </span>
              </div>
            )}
          </div>
        )}

        {/* Selected variants comparison */}
        {selectedVariants.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <Gauge className="w-6 h-6 text-blue-400" />
              Usporedba specifikacija
            </h2>
            
            {/* Mobile: Stack vertically */}
            <div className="md:hidden space-y-6">
              {selectedVariants.map((variant) => (
                <div 
                  key={variant.id} 
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-700"
                >
                  <div className="p-4 relative">
                    <button
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors z-10"
                      onClick={() => removeVariant(variant.id)}
                      aria-label="Ukloni"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    {(variant.generation?.image || variant.model?.image) && (
                      <ResponsiveImage
                        src={variant.generation?.image || variant.model?.image || ""}
                        alt={`${variant.model?.brand} ${variant.model?.model}`}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                        targetWidth={800}
                        responsiveWidths={[480, 640, 800, 960]}
                        sizes="100vw"
                        quality={78}
                        resize="cover"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    
                    <h3 className="text-lg font-bold text-white mb-1">
                      {variant.model?.brand} {variant.model?.model}
                    </h3>
                    <p className="text-sm text-slate-400 mb-2">
                      {variant.generation?.name}
                    </p>
                    <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full">
                      {variant.engineName}
                    </span>
                  </div>
                  
                  {/* Specs for this variant */}
                  <div className="border-t border-slate-700">
                    {specs.map((spec, idx) => {
                      const Icon = spec.icon;
                      const value = variant[spec.key as keyof CarVariant];
                      const displayValue = isSpecUnitField(spec.key)
                        ? formatSpecWithUnit(value, spec.key, { fuelType: variant.fuelType })
                        : value;
                      const bestId = getBestValue(spec.key);
                      const isBest = bestId === variant.id;
                      
                      return (
                        <div 
                          key={spec.key}
                          className={`flex items-center justify-between px-4 py-3 ${idx !== specs.length - 1 ? 'border-b border-slate-700/50' : ''} ${isBest ? 'bg-green-500/10' : ''}`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-400">{spec.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isBest ? 'text-green-400' : 'text-white'}`}>
                              {displayValue || '-'}
                            </span>
                            {isBest && <Check className="w-4 h-4 text-green-400" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Side by side table */}
            <div className="hidden md:block overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                {/* Header cards */}
                <div 
                  className="grid gap-4 mb-6" 
                  style={{ gridTemplateColumns: `180px repeat(${selectedVariants.length}, minmax(0, 1fr))` }}
                >
                  <div></div>
                  {selectedVariants.map((variant) => (
                    <div 
                      key={variant.id} 
                      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-700"
                    >
                      <div className="p-4 relative">
                        <button
                          className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors z-10"
                          onClick={() => removeVariant(variant.id)}
                          aria-label="Ukloni"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        {(variant.generation?.image || variant.model?.image) && (
                          <ResponsiveImage
                            src={variant.generation?.image || variant.model?.image || ""}
                            alt={`${variant.model?.brand} ${variant.model?.model}`}
                            className="w-full h-28 object-cover rounded-lg mb-3"
                            targetWidth={640}
                            responsiveWidths={[400, 640, 800]}
                            sizes="(max-width: 1280px) 33vw, 25vw"
                            quality={78}
                            resize="cover"
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                        
                        <h3 className="text-base font-bold text-white mb-1">
                          {variant.model?.brand} {variant.model?.model}
                        </h3>
                        <p className="text-sm text-slate-400 mb-2">
                          {variant.generation?.name}
                        </p>
                        <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full">
                          {variant.engineName}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Specs comparison table */}
                <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700">
                  {specs.map((spec, idx) => {
                    const bestId = getBestValue(spec.key);
                    const Icon = spec.icon;
                    
                    return (
                      <div 
                        key={spec.key}
                        className={`grid gap-4 ${idx !== specs.length - 1 ? 'border-b border-slate-700' : ''}`}
                        style={{ gridTemplateColumns: `180px repeat(${selectedVariants.length}, minmax(0, 1fr))` }}
                      >
                        <div className="p-4 flex items-center gap-2 bg-slate-900/50">
                          <Icon className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-300">{spec.label}</span>
                        </div>
                        {selectedVariants.map((variant) => {
                          const value = variant[spec.key as keyof CarVariant];
                          const displayValue = isSpecUnitField(spec.key)
                            ? formatSpecWithUnit(value, spec.key, { fuelType: variant.fuelType })
                            : value;
                          const isBest = bestId === variant.id;
                          
                          return (
                            <div 
                              key={variant.id} 
                              className={`p-4 flex items-center justify-center ${isBest ? 'bg-green-500/10' : ''}`}
                            >
                              <span className={`text-sm font-medium ${isBest ? 'text-green-400' : 'text-white'}`}>
                                {displayValue || '-'}
                              </span>
                              {isBest && (
                                <Check className="w-4 h-4 text-green-400 ml-2" />
                              )}
                            </div>
                          );
                        })}
                        {/* Empty cells to maintain grid */}
                        {selectedVariants.length < 3 && Array.from({ length: 0 }).map((_, i) => (
                          <div key={`empty-cell-${i}`} className="p-4"></div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add variant button */}
        {selectedVariants.length < 3 && (
          <div className="mb-8">
            {!showSelector ? (
              <button
                onClick={() => {
                  resetSelection();
                  setShowSelector(true);
                }}
                className="w-full p-6 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-blue-500 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-2xl">+</span>
                <span>Dodaj automobil za usporedbu</span>
              </button>
            ) : (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Odaberi automobil</h3>
                  <button
                    onClick={() => {
                      setShowSelector(false);
                      resetSelection();
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Step indicators */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${searchBrand ? 'bg-green-600 text-white keep-white' : 'bg-slate-700 text-slate-300'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${searchBrand ? 'bg-white/20' : 'bg-slate-600'}`}>1</span>
                    <span>Marka</span>
                    {searchBrand && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 hidden sm:block" />
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${selectedModelId ? 'bg-green-600 text-white keep-white' : searchBrand ? 'bg-blue-600 text-white keep-white' : 'bg-slate-700 text-slate-300'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${selectedModelId || searchBrand ? 'bg-white/20' : 'bg-slate-600'}`}>2</span>
                    <span>Model</span>
                    {selectedModelId && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 hidden sm:block" />
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${selectedGenerationId ? 'bg-green-600 text-white keep-white' : selectedModelId ? 'bg-blue-600 text-white keep-white' : 'bg-slate-700 text-slate-300'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${selectedGenerationId || selectedModelId ? 'bg-white/20' : 'bg-slate-600'}`}>3</span>
                    <span>Generacija</span>
                    {selectedGenerationId && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 hidden sm:block" />
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${selectedGenerationId ? 'bg-blue-600 text-white keep-white' : 'bg-slate-700 text-slate-300'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${selectedGenerationId ? 'bg-white/20' : 'bg-slate-600'}`}>4</span>
                    <span>Motor</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Brand selection */}
                  <div>
                    <label htmlFor="compare-brand" className="block text-sm font-medium text-slate-400 mb-1">Marka</label>
                    <p className="text-xs text-slate-500 mb-2">Odaberite marku automobila</p>
                    <select
                      id="compare-brand"
                      value={searchBrand}
                      onChange={(e) => {
                        setSearchBrand(e.target.value);
                        setSelectedModelId("");
                        setSelectedGenerationId("");
                      }}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 input-text focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Odaberi marku</option>
                      {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>

                  {/* Model selection */}
                  <div>
                    <label htmlFor="compare-model" className="block text-sm font-medium text-slate-400 mb-1">Model</label>
                    <p className="text-xs text-slate-500 mb-2">{searchBrand ? `Odaberite model marke ${searchBrand}` : 'Prvo odaberite marku'}</p>
                    <select
                      id="compare-model"
                      value={selectedModelId}
                      onChange={(e) => {
                        setSelectedModelId(e.target.value);
                        setSelectedGenerationId("");
                      }}
                      disabled={!searchBrand}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 input-text focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      <option value="">Odaberi model</option>
                      {brandModels.map(model => (
                        <option key={model.id} value={model.id}>{model.model}</option>
                      ))}
                    </select>
                  </div>

                  {/* Generation selection */}
                  <div>
                    <label htmlFor="compare-generation" className="block text-sm font-medium text-slate-400 mb-1">Generacija</label>
                    <p className="text-xs text-slate-500 mb-2">{selectedModelId ? 'Odaberite generaciju (godište)' : 'Prvo odaberite model'}</p>
                    <select
                      id="compare-generation"
                      value={selectedGenerationId}
                      onChange={(e) => setSelectedGenerationId(e.target.value)}
                      disabled={!selectedModelId}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 input-text focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      <option value="">Odaberi generaciju</option>
                      {generations.map(gen => (
                        <option key={gen.id} value={gen.id}>
                          {gen.name} ({gen.yearStart}-{gen.yearEnd || 'danas'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reset button */}
                  <div className="flex items-end">
                    <button
                      onClick={resetSelection}
                      className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white keep-white rounded-lg transition-colors"
                    >
                      Resetiraj
                    </button>
                  </div>
                </div>

                {/* Variant selection */}
                {selectedGenerationId && variants.length > 0 && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Odaberi motornu varijantu
                    </label>
                    <p className="text-xs text-slate-500 mb-3">Kliknite na motor koji želite dodati u usporedbu</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {variants.map(variant => {
                        const isAlreadySelected = selectedVariants.find(v => v.id === variant.id);
                        
                        return (
                          <button
                            key={variant.id}
                            onClick={() => !isAlreadySelected && addVariant(variant)}
                            disabled={!!isAlreadySelected}
                            className={`p-4 rounded-lg border text-left transition-all ${
                              isAlreadySelected
                                ? 'border-green-500 bg-green-500/10 cursor-not-allowed'
                                : 'border-slate-600 bg-slate-900 hover:border-blue-500 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-white">{variant.engineName}</span>
                              {isAlreadySelected && <Check className="w-4 h-4 text-green-400" />}
                            </div>
                            <div className="space-y-1 text-xs text-slate-400">
                              <p>{formatVariantSpec(variant, "power")}</p>
                              <p>{variant.fuelType}</p>
                              <p>{variant.transmission}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedGenerationId && variants.length === 0 && (
                  <div className="mt-6 text-center py-8 text-slate-400">
                    Nema dostupnih varijanti za ovu generaciju
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick comparison suggestions */}
        {selectedVariants.length === 0 && (
          <div className="text-center py-12">
            <Car className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Započnite usporedbu</h3>
            <p className="text-slate-400 mb-4">
              Usporedite do 3 varijante automobila kako biste vidjeli razlike u specifikacijama.
            </p>
            <div className="max-w-md mx-auto text-left mb-6 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <p className="text-sm text-slate-300 font-medium mb-2">Kako usporediti:</p>
              <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                <li>Kliknite gumb <span className="text-white">"+ Dodaj automobil za usporedbu"</span> iznad</li>
                <li>Odaberite marku, model, generaciju i motor</li>
                <li>Ponovite za još 1–2 vozila</li>
                <li>Najbolje vrijednosti bit će automatski označene zelenom bojom</li>
              </ol>
            </div>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-slate-500">
              <span className="px-3 py-1 bg-slate-800 rounded-full">VW Golf GTI vs BMW 335i</span>
              <span className="px-3 py-1 bg-slate-800 rounded-full">Audi A4 vs Mercedes C-Class</span>
              <span className="px-3 py-1 bg-slate-800 rounded-full">Dizel vs Benzin</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
