import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth";
import { toYouTubeEmbedUrl } from "../lib/youtube";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { CarModel, CarGenerationWithModel } from "@shared/schema";
import { Plus, X, ChevronRight, ArrowLeft, Check, Car, Layers, Settings, Upload, Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import MultiImageUploader from "../components/MultiImageUploader";

interface CarSubmissionUser {
  id: string;
  status: string;
  mode: string;
  modelData: string | null;
  generationData: string | null;
  variantData: string;
  adminNotes: string | null;
  createdAt: string;
}

interface ImageItem {
  id?: string;
  url: string;
  isNew?: boolean;
}

type Step = "brand" | "model" | "generation" | "variant" | "success";

export default function SubmitCar() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Current step in the wizard
  const [currentStep, setCurrentStep] = useState<Step>("brand");
  
  // Selection state - what user has chosen
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [isNewBrand, setIsNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [isNewModel, setIsNewModel] = useState(false);
  const [newModelData, setNewModelData] = useState({
    model: "",
    category: "Compact",
    description: "",
  });
  const [modelImages, setModelImages] = useState<ImageItem[]>([]);
  
  const [selectedGenerationId, setSelectedGenerationId] = useState<string | null>(null);
  const [isNewGeneration, setIsNewGeneration] = useState(false);
  const [newGenerationData, setNewGenerationData] = useState({
    name: "",
    yearStart: new Date().getFullYear(),
    yearEnd: null as number | null,
    description: "",
  });
  const [generationImages, setGenerationImages] = useState<ImageItem[]>([]);
  
  // Variant data (always new)
  const [variantData, setVariantData] = useState({
    engineName: "",
    engineCode: "",
    displacement: "",
    fuelType: "Benzin",
    power: "",
    torque: "",
    acceleration: "",
    topSpeed: "",
    consumption: "",
    transmission: "",
    driveType: "FWD",
    videoUrl: "",
    reliability: 3,
    weight: "",
    length: "",
    width: "",
    height: "",
    wheelbase: "",
    trunkCapacity: "",
    fuelTankCapacity: "",
    detailedDescription: "",
    pros: "",
    cons: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data queries
  const { data: models, isLoading: modelsLoading } = useQuery<CarModel[]>({ 
    queryKey: ["/api/models"] 
  });
  const { data: generations, isLoading: generationsLoading } = useQuery<CarGenerationWithModel[]>({ 
    queryKey: ["/api/generations"] 
  });
  const { data: mySubmissions } = useQuery<CarSubmissionUser[]>({
    queryKey: ["/api/my-submissions"],
    enabled: !!user,
  });

  // Derived data
  const brands = models ? [...new Set(models.map(m => m.brand))].sort() : [];
  const brandModels = selectedBrand 
    ? models?.filter(m => m.brand === selectedBrand).sort((a, b) => a.model.localeCompare(b.model)) || []
    : [];
  const modelGenerations = selectedModelId
    ? generations?.filter(g => g.modelId === selectedModelId).sort((a, b) => b.yearStart - a.yearStart) || []
    : [];

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/prijava");
    }
  }, [user, authLoading, setLocation]);

  // Submit mutation
  const submitCar = useMutation({
    mutationFn: async () => {
      // Determine the mode
      const mode = isNewBrand || isNewModel ? "new" : "existing";
      
      // Build model data if new
      const modelDataPayload = isNewModel ? {
        brand: isNewBrand ? newBrandName : selectedBrand,
        model: newModelData.model,
        category: newModelData.category,
        description: newModelData.description,
        image: modelImages[0]?.url || "",
      } : null;

      // Build generation data if new
      const generationDataPayload = isNewGeneration ? {
        name: newGenerationData.name,
        yearStart: newGenerationData.yearStart,
        yearEnd: newGenerationData.yearEnd,
        description: newGenerationData.description,
        image: generationImages[0]?.url || "",
      } : null;

      const payload = {
        mode,
        modelId: !isNewModel ? selectedModelId : null,
        generationId: !isNewGeneration ? selectedGenerationId : null,
        model: modelDataPayload,
        generation: generationDataPayload,
        variant: variantData,
      };

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Greška pri slanju");
      }

      return res.json();
    },
    onSuccess: () => {
      setCurrentStep("success");
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  if (authLoading || modelsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-400">Učitavanje...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get current selection info for breadcrumb
  const selectedModel = selectedModelId ? models?.find(m => m.id === selectedModelId) : null;
  const selectedGeneration = selectedGenerationId ? generations?.find(g => g.id === selectedGenerationId) : null;

  // Determine effective brand name
  const effectiveBrand = isNewBrand ? newBrandName : selectedBrand;
  const effectiveModelName = isNewModel ? newModelData.model : selectedModel?.model;
  const effectiveGenerationName = isNewGeneration ? newGenerationData.name : selectedGeneration?.name;

  // Handle final submission
  const handleSubmit = () => {
    setError(null);
    setIsSubmitting(true);
    submitCar.mutate();
  };

  // Validate current step
  const canProceedFromBrand = isNewBrand ? newBrandName.trim().length > 0 : selectedBrand !== null;
  const canProceedFromModel = isNewModel 
    ? (newModelData.model.trim().length > 0 && newModelData.description.trim().length > 0 && modelImages.length > 0)
    : selectedModelId !== null;
  const canProceedFromGeneration = isNewGeneration
    ? (newGenerationData.name.trim().length > 0 && newGenerationData.description.trim().length > 0 && generationImages.length > 0)
    : selectedGenerationId !== null;
  const canSubmitVariant = variantData.engineName.trim().length > 0 && 
    variantData.power.trim().length > 0 && 
    variantData.acceleration.trim().length > 0 &&
    variantData.consumption.trim().length > 0 &&
    variantData.transmission.trim().length > 0;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Predloži automobil
        </h1>
        <p className="text-center text-slate-400 mb-8">
          Dodajte novi automobil u našu bazu podataka. Vaš prijedlog će pregledati administrator.
        </p>

        {/* Success State */}
        {currentStep === "success" && (
          <div className="bg-slate-800 rounded-lg p-12 text-center border border-green-500/50">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-green-400 mb-4">Prijedlog poslan!</h2>
            <p className="text-slate-300 mb-8 max-w-md mx-auto">
              Vaš prijedlog za {effectiveBrand} {effectiveModelName} {effectiveGenerationName} je uspješno poslan. 
              Administrator će ga pregledati i odobriti.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  // Reset everything
                  setCurrentStep("brand");
                  setSelectedBrand(null);
                  setIsNewBrand(false);
                  setNewBrandName("");
                  setSelectedModelId(null);
                  setIsNewModel(false);
                  setNewModelData({ model: "", category: "Compact", description: "" });
                  setModelImages([]);
                  setSelectedGenerationId(null);
                  setIsNewGeneration(false);
                  setNewGenerationData({ name: "", yearStart: new Date().getFullYear(), yearEnd: null, description: "" });
                  setGenerationImages([]);
                  setVariantData({
                    engineName: "", engineCode: "", displacement: "", fuelType: "Benzin",
                    power: "", torque: "", acceleration: "", topSpeed: "", consumption: "",
                    transmission: "", driveType: "FWD", videoUrl: "", reliability: 3,
                    weight: "", length: "", width: "", height: "", wheelbase: "",
                    trunkCapacity: "", fuelTankCapacity: "", detailedDescription: "", pros: "", cons: "",
                  });
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
              >
                Dodaj još jedan
              </button>
              <button
                onClick={() => setLocation("/automobili")}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold"
              >
                Pregledaj automobile
              </button>
            </div>
          </div>
        )}

        {currentStep !== "success" && (
          <>
            {/* Breadcrumb / Progress */}
            <div className="flex items-center gap-2 mb-8 text-sm flex-wrap bg-slate-800/50 p-4 rounded-lg">
              <button 
                onClick={() => setCurrentStep("brand")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded ${currentStep === "brand" ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Car className="w-4 h-4" />
                Marka
              </button>
              
              {effectiveBrand && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                  <button 
                    onClick={() => setCurrentStep("model")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded ${currentStep === "model" ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Layers className="w-4 h-4" />
                    {effectiveBrand} {effectiveModelName && `- ${effectiveModelName}`}
                  </button>
                </>
              )}
              
              {effectiveModelName && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                  <button 
                    onClick={() => setCurrentStep("generation")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded ${currentStep === "generation" ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Settings className="w-4 h-4" />
                    Generacija {effectiveGenerationName && `- ${effectiveGenerationName}`}
                  </button>
                </>
              )}
              
              {effectiveGenerationName && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                  <span className={`flex items-center gap-2 px-3 py-1.5 rounded ${currentStep === "variant" ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                    Motor/Varijanta
                  </span>
                </>
              )}
            </div>

            {/* Step 1: Brand Selection */}
            {currentStep === "brand" && (
              <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
                <h2 className="text-2xl font-bold mb-6">Odaberi marku automobila</h2>
                
                {/* Toggle: Existing or New */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => { setIsNewBrand(false); setNewBrandName(""); }}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${!isNewBrand ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                  >
                    Postojeća marka
                  </button>
                  <button
                    onClick={() => { setIsNewBrand(true); setSelectedBrand(null); }}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${isNewBrand ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                  >
                    + Nova marka
                  </button>
                </div>

                {!isNewBrand ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {brands.map(brand => (
                      <button
                        key={brand}
                        onClick={() => {
                          setSelectedBrand(brand);
                          setIsNewModel(false);
                          setSelectedModelId(null);
                          setCurrentStep("model");
                        }}
                        className={`p-6 rounded-lg border text-left transition ${
                          selectedBrand === brand 
                            ? 'bg-blue-600/20 border-blue-500' 
                            : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <h3 className="text-xl font-bold">{brand}</h3>
                        <p className="text-slate-400 text-sm mt-1">
                          {models?.filter(m => m.brand === brand).length} modela
                        </p>
                      </button>
                    ))}
                    {brands.length === 0 && (
                      <div className="col-span-full text-center py-8 text-slate-400">
                        Nema postojećih marki. Dodajte novu marku.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="max-w-md">
                    <label className="block text-sm font-medium mb-2">Naziv nove marke *</label>
                    <input
                      type="text"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      placeholder="npr. Volkswagen, BMW, Toyota..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-3 text-lg"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      Unesite točan naziv proizvođača automobila.
                    </p>
                    
                    <button
                      onClick={() => {
                        setIsNewModel(true); // When adding new brand, must add new model too
                        setCurrentStep("model");
                      }}
                      disabled={!canProceedFromBrand}
                      className="mt-6 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-semibold"
                    >
                      Nastavi →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Model Selection */}
            {currentStep === "model" && (
              <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
                <button 
                  onClick={() => setCurrentStep("brand")}
                  className="flex items-center gap-2 text-slate-400 hover:text-white mb-4"
                >
                  <ArrowLeft className="w-4 h-4" /> Natrag na marke
                </button>
                
                <h2 className="text-2xl font-bold mb-6">
                  {isNewBrand ? `Nova marka: ${newBrandName}` : selectedBrand} - Odaberi model
                </h2>

                {/* Toggle: Existing or New - only if not new brand */}
                {!isNewBrand && brandModels.length > 0 && (
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => { setIsNewModel(false); }}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${!isNewModel ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      Postojeći model
                    </button>
                    <button
                      onClick={() => { setIsNewModel(true); setSelectedModelId(null); }}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${isNewModel ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      + Novi model
                    </button>
                  </div>
                )}

                {!isNewModel && !isNewBrand ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {brandModels.map(model => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModelId(model.id);
                          setIsNewGeneration(false);
                          setSelectedGenerationId(null);
                          setCurrentStep("generation");
                        }}
                        className={`p-6 rounded-lg border text-left transition ${
                          selectedModelId === model.id 
                            ? 'bg-blue-600/20 border-blue-500' 
                            : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <h3 className="text-xl font-bold">{model.model}</h3>
                        <p className="text-slate-400 text-sm mt-1">{model.category}</p>
                        <p className="text-slate-500 text-xs mt-2">
                          {generations?.filter(g => g.modelId === model.id).length} generacija
                        </p>
                      </button>
                    ))}
                    {brandModels.length === 0 && (
                      <div className="col-span-full text-center py-8 text-slate-400">
                        Nema postojećih modela za ovu marku. Dodajte novi model.
                      </div>
                    )}
                  </div>
                ) : (
                  // New Model Form
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Naziv modela *</label>
                        <input
                          type="text"
                          value={newModelData.model}
                          onChange={(e) => setNewModelData({ ...newModelData, model: e.target.value })}
                          placeholder="npr. Golf, 3 Series, Corolla..."
                          className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Kategorija *</label>
                        <select
                          value={newModelData.category}
                          onChange={(e) => setNewModelData({ ...newModelData, category: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                        >
                          <option>Compact</option>
                          <option>Sedan</option>
                          <option>SUV</option>
                          <option>Sports</option>
                          <option>Electric</option>
                          <option>Hatchback</option>
                          <option>Coupe</option>
                          <option>Wagon</option>
                          <option>Van</option>
                          <option>Pickup</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Opis modela *</label>
                      <textarea
                        value={newModelData.description}
                        onChange={(e) => setNewModelData({ ...newModelData, description: e.target.value })}
                        rows={3}
                        placeholder="Kratki opis ovog modela..."
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Slike modela *</label>
                      <MultiImageUploader
                        images={modelImages}
                        onChange={setModelImages}
                        maxImages={5}
                      />
                    </div>

                    <button
                      onClick={() => {
                        setIsNewGeneration(true); // New model requires new generation
                        setCurrentStep("generation");
                      }}
                      disabled={!canProceedFromModel}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-semibold"
                    >
                      Nastavi na generaciju →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Generation Selection */}
            {currentStep === "generation" && (
              <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
                <button 
                  onClick={() => setCurrentStep("model")}
                  className="flex items-center gap-2 text-slate-400 hover:text-white mb-4"
                >
                  <ArrowLeft className="w-4 h-4" /> Natrag na modele
                </button>
                
                <h2 className="text-2xl font-bold mb-6">
                  {effectiveBrand} {effectiveModelName} - Odaberi generaciju
                </h2>

                {/* Toggle: Existing or New - only if existing model with generations */}
                {!isNewModel && modelGenerations.length > 0 && (
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => { setIsNewGeneration(false); }}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${!isNewGeneration ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      Postojeća generacija
                    </button>
                    <button
                      onClick={() => { setIsNewGeneration(true); setSelectedGenerationId(null); }}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${isNewGeneration ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      + Nova generacija
                    </button>
                  </div>
                )}

                {!isNewGeneration && !isNewModel ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {modelGenerations.map(gen => (
                      <button
                        key={gen.id}
                        onClick={() => {
                          setSelectedGenerationId(gen.id);
                          setCurrentStep("variant");
                        }}
                        className={`p-6 rounded-lg border text-left transition ${
                          selectedGenerationId === gen.id 
                            ? 'bg-blue-600/20 border-blue-500' 
                            : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <h3 className="text-xl font-bold">{gen.name}</h3>
                        <p className="text-slate-400 text-sm mt-1">
                          {gen.yearStart} - {gen.yearEnd || "danas"}
                        </p>
                      </button>
                    ))}
                    {modelGenerations.length === 0 && (
                      <div className="col-span-full text-center py-8 text-slate-400">
                        Nema postojećih generacija za ovaj model. Dodajte novu generaciju.
                      </div>
                    )}
                  </div>
                ) : (
                  // New Generation Form
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Naziv generacije *</label>
                      <input
                        type="text"
                        value={newGenerationData.name}
                        onChange={(e) => setNewGenerationData({ ...newGenerationData, name: e.target.value })}
                        placeholder="npr. MK7, E90, B8..."
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Godina početka proizvodnje *</label>
                        <input
                          type="number"
                          value={newGenerationData.yearStart}
                          onChange={(e) => setNewGenerationData({ ...newGenerationData, yearStart: parseInt(e.target.value) })}
                          min="1900"
                          max={new Date().getFullYear() + 2}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Godina kraja (prazno ako se još proizvodi)</label>
                        <input
                          type="number"
                          value={newGenerationData.yearEnd || ""}
                          onChange={(e) => setNewGenerationData({ ...newGenerationData, yearEnd: e.target.value ? parseInt(e.target.value) : null })}
                          min="1900"
                          max={new Date().getFullYear() + 2}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Opis generacije *</label>
                      <textarea
                        value={newGenerationData.description}
                        onChange={(e) => setNewGenerationData({ ...newGenerationData, description: e.target.value })}
                        rows={3}
                        placeholder="Kratki opis ove generacije..."
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Slike generacije *</label>
                      <MultiImageUploader
                        images={generationImages}
                        onChange={setGenerationImages}
                        maxImages={10}
                      />
                    </div>

                    <button
                      onClick={() => setCurrentStep("variant")}
                      disabled={!canProceedFromGeneration}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-semibold"
                    >
                      Nastavi na varijantu →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Variant Form */}
            {currentStep === "variant" && (
              <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
                <button 
                  onClick={() => setCurrentStep("generation")}
                  className="flex items-center gap-2 text-slate-400 hover:text-white mb-4"
                >
                  <ArrowLeft className="w-4 h-4" /> Natrag na generacije
                </button>
                
                <h2 className="text-2xl font-bold mb-2">
                  {effectiveBrand} {effectiveModelName} {effectiveGenerationName}
                </h2>
                <p className="text-slate-400 mb-6">Unesite podatke o motoru/varijanti</p>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
                  {/* Engine Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Oznaka motora *</label>
                      <input
                        type="text"
                        value={variantData.engineName}
                        onChange={(e) => setVariantData({ ...variantData, engineName: e.target.value })}
                        required
                        placeholder="npr. 2.0 TDI, 1.4 TSI"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Kod motora</label>
                      <input
                        type="text"
                        value={variantData.engineCode}
                        onChange={(e) => setVariantData({ ...variantData, engineCode: e.target.value })}
                        placeholder="npr. CRLB, CZEA"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Zapremnina</label>
                      <input
                        type="text"
                        value={variantData.displacement}
                        onChange={(e) => setVariantData({ ...variantData, displacement: e.target.value })}
                        placeholder="npr. 1968 ccm"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Vrsta goriva *</label>
                      <select
                        value={variantData.fuelType}
                        onChange={(e) => setVariantData({ ...variantData, fuelType: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                      >
                        <option value="Benzin">Benzin</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Hybrid">Hibrid</option>
                        <option value="Electric">Električni</option>
                        <option value="LPG">LPG</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Snaga *</label>
                      <input
                        type="text"
                        value={variantData.power}
                        onChange={(e) => setVariantData({ ...variantData, power: e.target.value })}
                        required
                        placeholder="npr. 150 KS"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Okretni moment</label>
                      <input
                        type="text"
                        value={variantData.torque}
                        onChange={(e) => setVariantData({ ...variantData, torque: e.target.value })}
                        placeholder="npr. 340 Nm"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ubrzanje 0-100 km/h *</label>
                      <input
                        type="text"
                        value={variantData.acceleration}
                        onChange={(e) => setVariantData({ ...variantData, acceleration: e.target.value })}
                        required
                        placeholder="npr. 8.6s"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Maksimalna brzina</label>
                      <input
                        type="text"
                        value={variantData.topSpeed}
                        onChange={(e) => setVariantData({ ...variantData, topSpeed: e.target.value })}
                        placeholder="npr. 216 km/h"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Potrošnja *</label>
                      <input
                        type="text"
                        value={variantData.consumption}
                        onChange={(e) => setVariantData({ ...variantData, consumption: e.target.value })}
                        required
                        placeholder="npr. 4.5 L/100km"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Mjenjač *</label>
                      <input
                        type="text"
                        value={variantData.transmission}
                        onChange={(e) => setVariantData({ ...variantData, transmission: e.target.value })}
                        required
                        placeholder="npr. 6-brzinski ručni, 7-DSG"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Pogon *</label>
                      <select
                        value={variantData.driveType}
                        onChange={(e) => setVariantData({ ...variantData, driveType: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                      >
                        <option value="FWD">FWD (Prednji pogon)</option>
                        <option value="RWD">RWD (Stražnji pogon)</option>
                        <option value="AWD">AWD (Sva četiri kotača)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Pouzdanost (1-5)</label>
                      <select
                        value={variantData.reliability}
                        onChange={(e) => setVariantData({ ...variantData, reliability: parseInt(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                      >
                        <option value={1}>1 - Loše</option>
                        <option value={2}>2 - Ispod prosjeka</option>
                        <option value={3}>3 - Prosječno</option>
                        <option value={4}>4 - Dobro</option>
                        <option value={5}>5 - Odlično</option>
                      </select>
                    </div>
                  </div>

                  {/* Dimensions Section */}
                  <div className="border-t border-slate-700 pt-6">
                    <h4 className="text-lg font-semibold mb-4 text-blue-400">Težina i dimenzije (opcionalno)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Masa</label>
                        <input
                          type="text"
                          value={variantData.weight}
                          onChange={(e) => setVariantData({ ...variantData, weight: e.target.value })}
                          placeholder="1350 kg"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Dužina</label>
                        <input
                          type="text"
                          value={variantData.length}
                          onChange={(e) => setVariantData({ ...variantData, length: e.target.value })}
                          placeholder="4258 mm"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Širina</label>
                        <input
                          type="text"
                          value={variantData.width}
                          onChange={(e) => setVariantData({ ...variantData, width: e.target.value })}
                          placeholder="1799 mm"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Visina</label>
                        <input
                          type="text"
                          value={variantData.height}
                          onChange={(e) => setVariantData({ ...variantData, height: e.target.value })}
                          placeholder="1442 mm"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Međuosovinski razmak</label>
                        <input
                          type="text"
                          value={variantData.wheelbase}
                          onChange={(e) => setVariantData({ ...variantData, wheelbase: e.target.value })}
                          placeholder="2631 mm"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Prtljažnik</label>
                        <input
                          type="text"
                          value={variantData.trunkCapacity}
                          onChange={(e) => setVariantData({ ...variantData, trunkCapacity: e.target.value })}
                          placeholder="380 L"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Spremnik goriva</label>
                        <input
                          type="text"
                          value={variantData.fuelTankCapacity}
                          onChange={(e) => setVariantData({ ...variantData, fuelTankCapacity: e.target.value })}
                          placeholder="50 L"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description and Pros/Cons */}
                  <div className="border-t border-slate-700 pt-6">
                    <h4 className="text-lg font-semibold mb-4 text-blue-400">Dodatne informacije (opcionalno)</h4>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Video URL (YouTube)</label>
                      <input
                        type="url"
                        value={variantData.videoUrl}
                        onChange={(e) => setVariantData({ ...variantData, videoUrl: e.target.value })}
                        onBlur={(e) => setVariantData({ ...variantData, videoUrl: toYouTubeEmbedUrl(e.target.value) })}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Detaljan opis</label>
                      <textarea
                        value={variantData.detailedDescription}
                        onChange={(e) => setVariantData({ ...variantData, detailedDescription: e.target.value })}
                        rows={4}
                        placeholder="Detaljniji opis ove varijante, iskustva s vozilom, savjeti za kupnju..."
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-green-400">Prednosti (+)</label>
                        <textarea
                          value={variantData.pros}
                          onChange={(e) => setVariantData({ ...variantData, pros: e.target.value })}
                          rows={3}
                          placeholder="Svaku prednost u novi red..."
                          className="w-full bg-slate-900 border border-green-700/50 rounded px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-red-400">Nedostaci (-)</label>
                        <textarea
                          value={variantData.cons}
                          onChange={(e) => setVariantData({ ...variantData, cons: e.target.value })}
                          rows={3}
                          placeholder="Svaki nedostatak u novi red..."
                          className="w-full bg-slate-900 border border-red-700/50 rounded px-4 py-2"
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  {/* Inline validation hints */}
                  {!canSubmitVariant && (
                    <div className="bg-yellow-900/30 border border-yellow-700/50 text-yellow-300 px-4 py-3 rounded text-sm">
                      <p className="font-medium mb-1">Popunite obavezna polja za slanje:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-yellow-400/80">
                        {!variantData.engineName.trim() && <li>Oznaka motora</li>}
                        {!variantData.power.trim() && <li>Snaga</li>}
                        {!variantData.acceleration.trim() && <li>Ubrzanje 0-100 km/h</li>}
                        {!variantData.consumption.trim() && <li>Potrošnja</li>}
                        {!variantData.transmission.trim() && <li>Mjenjač</li>}
                      </ul>
                    </div>
                  )}

                  {/* Summary before submit */}
                  <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <h4 className="font-semibold mb-2">Sažetak prijedloga:</h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• <span className="text-slate-400">Marka:</span> {effectiveBrand} {isNewBrand && <span className="text-green-400">(NOVA)</span>}</li>
                      <li>• <span className="text-slate-400">Model:</span> {effectiveModelName} {isNewModel && <span className="text-green-400">(NOVI)</span>}</li>
                      <li>• <span className="text-slate-400">Generacija:</span> {effectiveGenerationName} {isNewGeneration && <span className="text-green-400">(NOVA)</span>}</li>
                      <li>• <span className="text-slate-400">Motor:</span> {variantData.engineName || "-"}</li>
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={!canSubmitVariant || submitCar.isPending}
                      className="flex-1 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-semibold text-lg flex items-center justify-center gap-2"
                    >
                      {submitCar.isPending ? (
                        "Šaljem..."
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Pošalji prijedlog
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}

        {/* My Submissions History */}
        {mySubmissions && mySubmissions.length > 0 && currentStep !== "success" && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-400" />
              Moji prijedlozi
            </h2>
            <div className="space-y-3">
              {mySubmissions.map((sub) => {
                const vData = JSON.parse(sub.variantData);
                const mData = sub.modelData ? JSON.parse(sub.modelData) : null;
                const gData = sub.generationData ? JSON.parse(sub.generationData) : null;

                const statusConfig = {
                  pending: { icon: Clock, label: "Na čekanju", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
                  approved: { icon: CheckCircle, label: "Odobreno", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
                  rejected: { icon: XCircle, label: "Odbijeno", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
                }[sub.status] || { icon: Clock, label: sub.status, color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/30" };

                const StatusIcon = statusConfig.icon;

                return (
                  <div key={sub.id} className={`p-4 rounded-lg border ${statusConfig.bg}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                          <span className={`text-sm font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(sub.createdAt).toLocaleDateString('hr-HR')}
                          </span>
                        </div>
                        <p className="font-medium text-white">
                          {mData ? `${mData.brand} ${mData.model}` : ""} {gData?.name || ""} — {vData.engineName}
                        </p>
                        <p className="text-sm text-slate-400">
                          {vData.power} • {vData.fuelType} • {vData.transmission}
                        </p>
                      </div>
                      {sub.status === "rejected" && sub.adminNotes && (
                        <div className="w-full mt-2 p-3 bg-red-900/20 rounded-lg border border-red-700/30">
                          <p className="text-xs font-medium text-red-400 mb-1">Razlog odbijanja:</p>
                          <p className="text-sm text-red-300">{sub.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
