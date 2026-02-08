import { useState } from "react";
import { useAuth } from "../lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { X, Check, AlertCircle, ChevronRight } from "lucide-react";
import { ObjectUploader } from "../components/ObjectUploader";
import type { CarModel, CarGenerationWithModel } from "@shared/schema";

type Step = "model" | "generation" | "variant";

export default function SubmitCar() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("model");
  
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [selectedGenerationId, setSelectedGenerationId] = useState<string>("");
  
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
  });

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

  const selectedModel = models?.find(m => m.id === selectedModelId);
  const selectedGeneration = generations?.find(g => g.id === selectedGenerationId);

  const submitVariant = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/variants/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId: selectedGenerationId,
          ...variantData,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Greška: ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      setSuccess(true);
      resetForm();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const resetForm = () => {
    setSelectedModelId("");
    setSelectedGenerationId("");
    setVariantData({
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
    });
    setCurrentStep("model");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-400">Učitavanje...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-4">Potrebna prijava</h2>
            <p className="text-slate-400 mb-6">
              Morate biti prijavljeni da biste mogli predložiti varijantu automobila.
            </p>
            <button
              onClick={() => setLocation("/prijava")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold keep-white"
            >
              Prijavi se
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-slate-800 rounded-lg p-8 text-center border border-green-500/50">
            <Check className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-4">Varijanta uspješno poslana!</h2>
            <p className="text-slate-400 mb-6">
              Vaš prijedlog je poslan na pregled. Administrator će ga pregledati i odobriti u najkraćem roku.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setSuccess(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold keep-white"
              >
                Dodaj još jednu
              </button>
              <button
                onClick={() => setLocation("/automobili")}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold keep-white"
              >
                Pregledaj automobile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Predloži Varijantu Motora
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Odaberite model i generaciju, zatim unesite specifikacije motora.
        </p>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${currentStep === "model" ? "text-blue-400" : "text-green-500"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStep === "model" ? "border-blue-400 bg-blue-400/20" : "border-green-500 bg-green-500/20"
            }`}>
              {selectedModelId ? <Check className="w-4 h-4" /> : "1"}
            </div>
            <span className="ml-2 font-medium">Model</span>
          </div>
          <ChevronRight className="w-5 h-5 mx-4 text-slate-600" />
          <div className={`flex items-center ${
            currentStep === "generation" 
              ? "text-blue-400" 
              : selectedGenerationId 
                ? "text-green-500" 
                : "text-slate-500"
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStep === "generation" 
                ? "border-blue-400 bg-blue-400/20" 
                : selectedGenerationId 
                  ? "border-green-500 bg-green-500/20" 
                  : "border-slate-600"
            }`}>
              {selectedGenerationId ? <Check className="w-4 h-4" /> : "2"}
            </div>
            <span className="ml-2 font-medium">Generacija</span>
          </div>
          <ChevronRight className="w-5 h-5 mx-4 text-slate-600" />
          <div className={`flex items-center ${currentStep === "variant" ? "text-blue-400" : "text-slate-500"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStep === "variant" ? "border-blue-400 bg-blue-400/20" : "border-slate-600"
            }`}>
              3
            </div>
            <span className="ml-2 font-medium">Motor</span>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Select Model */}
          {currentStep === "model" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Odaberite model automobila</h2>
              {!models || models.length === 0 ? (
                <p className="text-slate-400">Nema dostupnih modela. Kontaktirajte administratora.</p>
              ) : (
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModelId(model.id);
                        setSelectedGenerationId("");
                        setCurrentStep("generation");
                      }}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition text-left ${
                        selectedModelId === model.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-700 hover:border-slate-500 bg-slate-900"
                      }`}
                    >
                      <img
                        src={model.image}
                        alt={`${model.brand} ${model.model}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <div className="font-bold text-white">
                          {model.brand} {model.model}
                        </div>
                        <div className="text-sm text-slate-400">{model.category}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Generation */}
          {currentStep === "generation" && (
            <div>
              <button
                onClick={() => setCurrentStep("model")}
                className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-1"
              >
                ← Promijeni model
              </button>
              <h2 className="text-xl font-bold mb-2">
                {selectedModel?.brand} {selectedModel?.model}
              </h2>
              <p className="text-slate-400 mb-4">Odaberite generaciju</p>
              
              {!generations || generations.length === 0 ? (
                <p className="text-slate-400">
                  Nema dostupnih generacija za ovaj model. Kontaktirajte administratora da ih doda.
                </p>
              ) : (
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {generations.map((gen) => (
                    <button
                      key={gen.id}
                      onClick={() => {
                        setSelectedGenerationId(gen.id);
                        setCurrentStep("variant");
                      }}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition text-left ${
                        selectedGenerationId === gen.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-700 hover:border-slate-500 bg-slate-900"
                      }`}
                    >
                      <img
                        src={gen.image}
                        alt={gen.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <div className="font-bold text-white">{gen.name}</div>
                        <div className="text-sm text-slate-400">
                          {gen.yearStart} - {gen.yearEnd || "danas"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Variant Form */}
          {currentStep === "variant" && (
            <div>
              <button
                onClick={() => setCurrentStep("generation")}
                className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-1"
              >
                ← Promijeni generaciju
              </button>
              <h2 className="text-xl font-bold mb-2">
                {selectedModel?.brand} {selectedModel?.model} {selectedGeneration?.name}
              </h2>
              <p className="text-slate-400 mb-6">Unesite specifikacije motora</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setError(null);
                  submitVariant.mutate();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Oznaka motora *</label>
                    <input
                      type="text"
                      value={variantData.engineName}
                      onChange={(e) => setVariantData({ ...variantData, engineName: e.target.value })}
                      required
                      placeholder="npr. 2.0 TDI, 1.4 TSI"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Kod motora</label>
                    <input
                      type="text"
                      value={variantData.engineCode}
                      onChange={(e) => setVariantData({ ...variantData, engineCode: e.target.value })}
                      placeholder="npr. CRLB, CZEA"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
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
                      className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Vrsta goriva *</label>
                    <select
                      value={variantData.fuelType}
                      onChange={(e) => setVariantData({ ...variantData, fuelType: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Benzin">Benzin</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hibrid</option>
                      <option value="Electric">Električni</option>
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
                      className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Moment</label>
                    <input
                      type="text"
                      value={variantData.torque}
                      onChange={(e) => setVariantData({ ...variantData, torque: e.target.value })}
                      placeholder="npr. 340 Nm"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Ubrzanje (0-100) *</label>
                    <input
                      type="text"
                      value={variantData.acceleration}
                      onChange={(e) => setVariantData({ ...variantData, acceleration: e.target.value })}
                      required
                      placeholder="npr. 8.6s"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max brzina</label>
                    <input
                      type="text"
                      value={variantData.topSpeed}
                      onChange={(e) => setVariantData({ ...variantData, topSpeed: e.target.value })}
                      placeholder="npr. 216 km/h"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
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
                      placeholder="npr. 4.5L/100km"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
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
                      className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Pogon *</label>
                    <select
                      value={variantData.driveType}
                      onChange={(e) => setVariantData({ ...variantData, driveType: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                    >
                      <option>FWD</option>
                      <option>RWD</option>
                      <option>AWD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Pouzdanost (1-5)</label>
                    <select
                      value={variantData.reliability}
                      onChange={(e) => setVariantData({ ...variantData, reliability: parseInt(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                    >
                      <option value={1}>1 - Loše</option>
                      <option value={2}>2 - Ispod prosjeka</option>
                      <option value={3}>3 - Prosječno</option>
                      <option value={4}>4 - Dobro</option>
                      <option value={5}>5 - Odlično</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Video URL (opciono)</label>
                  <input
                    type="url"
                    value={variantData.videoUrl}
                    onChange={(e) => setVariantData({ ...variantData, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitVariant.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition keep-white"
                >
                  {submitVariant.isPending ? "Slanje..." : "Pošalji na pregled"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
