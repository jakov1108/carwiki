import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Check, ChevronDown, Fuel, Gauge, Zap, Settings, Car } from "lucide-react";
import type { CarModel, CarGeneration, CarVariant } from "@shared/schema";

interface VariantWithDetails extends CarVariant {
  generation?: CarGeneration;
  model?: CarModel;
}

export default function Compare() {
  const [selectedVariants, setSelectedVariants] = useState<VariantWithDetails[]>([]);
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
    if (selectedVariants.length >= 3) return;
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

        {/* Selected variants comparison */}
        {selectedVariants.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <Gauge className="w-6 h-6 text-blue-400" />
              Usporedba specifikacija
            </h2>
            
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                {/* Header cards */}
                <div 
                  className="grid gap-4 mb-6" 
                  style={{ gridTemplateColumns: `200px repeat(${selectedVariants.length}, minmax(200px, 1fr))` }}
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
                        
                        {variant.model && (
                          <img
                            src={variant.model.image}
                            alt={`${variant.model.brand} ${variant.model.model}`}
                            className="w-full h-28 object-cover rounded-lg mb-3"
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
                        style={{ gridTemplateColumns: `200px repeat(${selectedVariants.length}, minmax(200px, 1fr))` }}
                      >
                        <div className="p-4 flex items-center gap-2 bg-slate-900/50">
                          <Icon className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-300">{spec.label}</span>
                        </div>
                        {selectedVariants.map((variant) => {
                          const value = variant[spec.key as keyof CarVariant];
                          const isBest = bestId === variant.id;
                          
                          return (
                            <div 
                              key={variant.id} 
                              className={`p-4 flex items-center justify-center ${isBest ? 'bg-green-500/10' : ''}`}
                            >
                              <span className={`text-sm font-medium ${isBest ? 'text-green-400' : 'text-white'}`}>
                                {value || '-'}
                              </span>
                              {isBest && (
                                <Check className="w-4 h-4 text-green-400 ml-2" />
                              )}
                            </div>
                          );
                        })}
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
                onClick={() => setShowSelector(true)}
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
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${searchBrand ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>
                    Marka
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-600 rotate-[-90deg]" />
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${selectedModelId ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">2</span>
                    Model
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-600 rotate-[-90deg]" />
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${selectedGenerationId ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">3</span>
                    Generacija
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-600 rotate-[-90deg]" />
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-slate-700 text-slate-400`}>
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">4</span>
                    Motor
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  {/* Brand selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Marka</label>
                    <select
                      value={searchBrand}
                      onChange={(e) => {
                        setSearchBrand(e.target.value);
                        setSelectedModelId("");
                        setSelectedGenerationId("");
                      }}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Odaberi marku</option>
                      {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>

                  {/* Model selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Model</label>
                    <select
                      value={selectedModelId}
                      onChange={(e) => {
                        setSelectedModelId(e.target.value);
                        setSelectedGenerationId("");
                      }}
                      disabled={!searchBrand}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      <option value="">Odaberi model</option>
                      {brandModels.map(model => (
                        <option key={model.id} value={model.id}>{model.model}</option>
                      ))}
                    </select>
                  </div>

                  {/* Generation selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Generacija</label>
                    <select
                      value={selectedGenerationId}
                      onChange={(e) => setSelectedGenerationId(e.target.value)}
                      disabled={!selectedModelId}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
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
                      className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      Resetiraj
                    </button>
                  </div>
                </div>

                {/* Variant selection */}
                {selectedGenerationId && variants.length > 0 && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-400 mb-3">
                      Odaberi motornu varijantu
                    </label>
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
                              <p>{variant.power}</p>
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
            <p className="text-slate-400 mb-6">
              Kliknite na gumb iznad da dodate automobile koje želite usporediti
            </p>
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
