import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import type { Car } from "@shared/schema";
import { ArrowLeft, Gauge, Zap, Fuel, Settings } from "lucide-react";

export default function CarDetail() {
  const [, params] = useRoute("/automobili/:id");
  const carId = params?.id;

  const { data: car, isLoading, isError } = useQuery<Car>({
    queryKey: ["/api/cars", carId],
    queryFn: async () => {
      const res = await fetch(`/api/cars/${carId}`);
      if (!res.ok) throw new Error("Failed to fetch car");
      return res.json();
    },
  });

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg font-semibold mb-2">Greška pri učitavanju automobila</p>
          <p className="text-slate-400 text-sm">Provjerite internetsku vezu i pokušajte ponovo.</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white keep-white rounded-lg text-sm transition">Pokušaj ponovo</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Učitavam...</div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-400">Automobil nije pronađen</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/automobili" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8" data-testid="link-back-to-cars">
          <ArrowLeft className="w-5 h-5" />
          <span>Povratak na listu</span>
        </Link>

        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
          <img
            src={car.image}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-96 object-cover"
            decoding="async"
            fetchPriority="high"
          />

          <div className="p-8">
            <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {car.brand} {car.model}
                </h1>
                <p className="text-slate-400 text-lg">{car.year}. godina</p>
              </div>
              <span className="bg-blue-600 px-4 py-2 rounded-lg font-semibold keep-white">
                {car.category}
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed mb-8">{car.description}</p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Gauge className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold">Motor i Performanse</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Motor:</span>
                    <span className="text-white font-medium">{car.engine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Snaga:</span>
                    <span className="text-white font-medium">{car.power}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ubrzanje 0-100:</span>
                    <span className="text-white font-medium">{car.acceleration}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold">Dodatne Specifikacije</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pogon:</span>
                    <span className="text-white font-medium">{car.driveType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Potrošnja:</span>
                    <span className="text-white font-medium">{car.consumption}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pouzdanost:</span>
                    <span className="text-white font-medium">
                      {car.reliability}/5 ⭐
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {car.videoUrl && (
              <div className="mt-8">
                <h3 className="text-2xl font-bold mb-4">Video Recenzija</h3>
                <div className="aspect-video">
                  <iframe
                    src={car.videoUrl}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
