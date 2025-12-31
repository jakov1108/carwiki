import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import type { CarGenerationWithModel, CarVariantWithDetails } from "@shared/schema";
import { ArrowLeft, Calendar, Fuel, Gauge, Zap, Settings } from "lucide-react";

export default function GenerationDetail() {
  const [, params] = useRoute("/generacija/:id");
  const generationId = params?.id;

  const { data: generation, isLoading: generationLoading } = useQuery<CarGenerationWithModel>({
    queryKey: ["/api/generations", generationId],
    queryFn: async () => {
      const res = await fetch(`/api/generations/${generationId}`);
      if (!res.ok) throw new Error("Failed to fetch generation");
      return res.json();
    },
  });

  const { data: variants, isLoading: variantsLoading } = useQuery<CarVariantWithDetails[]>({
    queryKey: ["/api/generations", generationId, "variants"],
    queryFn: async () => {
      const res = await fetch(`/api/generations/${generationId}/variants`);
      if (!res.ok) throw new Error("Failed to fetch variants");
      return res.json();
    },
    enabled: !!generationId,
  });

  if (generationLoading || variantsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Učitavam...</div>
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-400">Generacija nije pronađena</div>
      </div>
    );
  }

  // Group variants by fuel type
  const variantsByFuel = variants?.reduce((acc, variant) => {
    const fuel = variant.fuelType;
    if (!acc[fuel]) {
      acc[fuel] = [];
    }
    acc[fuel].push(variant);
    return acc;
  }, {} as Record<string, CarVariantWithDetails[]>);

  const fuelTypeOrder = ["Benzin", "Dizel", "Hibrid", "Električni"];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link
          href={`/automobili/${generation.model?.id}`}
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Povratak na {generation.model?.brand} {generation.model?.model}</span>
        </Link>

        {/* Generation Header */}
        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 mb-8">
          <div className="relative">
            <img
              src={generation.image}
              alt={`${generation.model?.brand} ${generation.model?.model} ${generation.name}`}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  {generation.name}
                </span>
                <span className="bg-slate-700 px-3 py-1 rounded-full text-sm text-slate-200 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {generation.yearStart}
                  {generation.yearEnd ? ` - ${generation.yearEnd}` : " - danas"}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white">
                {generation.model?.brand} {generation.model?.model}
              </h1>
            </div>
          </div>
          <div className="p-6">
            <p className="text-slate-300 leading-relaxed">{generation.description}</p>
          </div>
        </div>

        {/* Variants by Fuel Type */}
        <h2 className="text-2xl font-bold mb-6 text-white">Dostupni motori</h2>

        {!variants || variants.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
            <p className="text-slate-400">
              Još nema dodanih varijanti motora za ovu generaciju.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {fuelTypeOrder
              .filter((fuel) => variantsByFuel?.[fuel])
              .map((fuelType) => (
                <div key={fuelType}>
                  <h3 className="text-lg font-semibold mb-4 text-slate-300 flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-blue-400" />
                    {fuelType}
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {variantsByFuel?.[fuelType]?.map((variant) => (
                      <Link
                        key={variant.id}
                        href={`/varijanta/${variant.id}`}
                        className="block bg-slate-800 rounded-lg p-5 border border-slate-700 hover:border-blue-500 transition group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition">
                            {variant.engineName}
                          </h4>
                          <span className="bg-slate-700 px-2 py-1 rounded text-sm text-slate-300">
                            {variant.transmission}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span>{variant.power}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Gauge className="w-4 h-4 text-green-500" />
                            <span>{variant.acceleration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Fuel className="w-4 h-4 text-blue-500" />
                            <span>{variant.consumption}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Settings className="w-4 h-4 text-purple-500" />
                            <span>{variant.driveType}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex justify-between items-center">
                          <div className="text-sm text-slate-500">
                            Pouzdanost: {variant.reliability}/5 ⭐
                          </div>
                          <div className="text-blue-400 text-sm font-medium group-hover:text-blue-300">
                            Detalji →
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
