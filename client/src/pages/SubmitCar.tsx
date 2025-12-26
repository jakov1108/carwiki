import { useState } from "react";
import { useAuth } from "../lib/auth";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { X, Check, AlertCircle } from "lucide-react";
import { ObjectUploader } from "../components/ObjectUploader";

export default function SubmitCar() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    description: "",
    image: "",
    engine: "",
    power: "",
    acceleration: "",
    consumption: "",
    driveType: "",
    category: "Compact",
    videoUrl: "",
    reliability: 3,
  });
  const [error, setError] = useState<string | null>(null);

  const submitCar = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/cars/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      setFormData({
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        description: "",
        image: "",
        engine: "",
        power: "",
        acceleration: "",
        consumption: "",
        driveType: "",
        category: "Compact",
        videoUrl: "",
        reliability: 3,
      });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

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
              Morate biti prijavljeni da biste mogli predložiti automobil.
            </p>
            <button
              onClick={() => setLocation("/prijava")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
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
            <h2 className="text-2xl font-bold mb-4">Automobil uspješno poslan!</h2>
            <p className="text-slate-400 mb-6">
              Vaš prijedlog je poslan na pregled. Administrator će ga pregledati i odobriti u najkraćem roku.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setSuccess(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Dodaj još jedan
              </button>
              <button
                onClick={() => setLocation("/automobili")}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold"
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
          Predloži Automobil
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Dodajte automobil u našu bazu. Administrator će pregledati vaš prijedlog prije objave.
        </p>

        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              submitCar.mutate(formData);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Marka *</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                  placeholder="npr. BMW, Audi..."
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Model *</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                  placeholder="npr. M3, A4..."
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Godina *</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kategorija *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option>Compact</option>
                  <option>Sedan</option>
                  <option>SUV</option>
                  <option>Sports</option>
                  <option>Electric</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Opis *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                placeholder="Opišite automobil, njegovu povijest, karakteristike..."
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Slika *</label>
              <ObjectUploader
                currentImage={formData.image}
                onUploadComplete={(imagePath) => setFormData({ ...formData, image: imagePath })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Motor *</label>
                <input
                  type="text"
                  value={formData.engine}
                  onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                  required
                  placeholder="npr. 3.0L Twin-Turbo I6"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Snaga *</label>
                <input
                  type="text"
                  value={formData.power}
                  onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                  required
                  placeholder="npr. 480 KS"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ubrzanje (0-100) *</label>
                <input
                  type="text"
                  value={formData.acceleration}
                  onChange={(e) => setFormData({ ...formData, acceleration: e.target.value })}
                  required
                  placeholder="npr. 4.1s"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Potrošnja *</label>
                <input
                  type="text"
                  value={formData.consumption}
                  onChange={(e) => setFormData({ ...formData, consumption: e.target.value })}
                  required
                  placeholder="npr. 9.5L/100km"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pogon *</label>
                <input
                  type="text"
                  value={formData.driveType}
                  onChange={(e) => setFormData({ ...formData, driveType: e.target.value })}
                  required
                  placeholder="npr. AWD, RWD, FWD"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Pouzdanost (1-5)</label>
                <select
                  value={formData.reliability}
                  onChange={(e) => setFormData({ ...formData, reliability: parseInt(e.target.value) })}
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
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitCar.isPending || !formData.image}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition"
            >
              {submitCar.isPending ? "Slanje..." : "Pošalji na pregled"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
