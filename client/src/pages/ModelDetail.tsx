import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import type { CarModel, CarGenerationWithModel } from "@shared/schema";
import { ArrowLeft, Calendar } from "lucide-react";

export default function ModelDetail() {
  const [, params] = useRoute("/automobili/:id");
  const modelId = params?.id;

  const { data: model, isLoading: modelLoading } = useQuery<CarModel>({
    queryKey: ["/api/models", modelId],
    queryFn: async () => {
      const res = await fetch(`/api/models/${modelId}`);
      if (!res.ok) throw new Error("Failed to fetch model");
      return res.json();
    },
  });

  const { data: generations, isLoading: generationsLoading } = useQuery<CarGenerationWithModel[]>({
    queryKey: ["/api/models", modelId, "generations"],
    queryFn: async () => {
      const res = await fetch(`/api/models/${modelId}/generations`);
      if (!res.ok) throw new Error("Failed to fetch generations");
      return res.json();
    },
    enabled: !!modelId,
  });

  if (modelLoading || generationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Učitavam...</div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-400">Model nije pronađen</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link
          href="/automobili"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Povratak na listu</span>
        </Link>

        {/* Model Header */}
        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 mb-8">
          <div className="relative">
            <img
              src={model.image}
              alt={`${model.brand} ${model.model}`}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-medium mb-2 inline-block">
                {model.category}
              </span>
              <h1 className="text-4xl font-bold text-white">
                {model.brand} {model.model}
              </h1>
            </div>
          </div>
          <div className="p-6">
            <p className="text-slate-300 leading-relaxed">{model.description}</p>
          </div>
        </div>

        {/* Generations */}
        <h2 className="text-2xl font-bold mb-6 text-white">Generacije</h2>

        {generations?.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
            <p className="text-slate-400">
              Još nema dodanih generacija za ovaj model.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generations?.map((generation) => (
              <Link
                key={generation.id}
                href={`/generacija/${generation.id}`}
                className="block bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={generation.image}
                    alt={`${model.brand} ${model.model} ${generation.name}`}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full">
                    <div className="flex items-center gap-1 text-sm text-slate-200">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {generation.yearStart}
                        {generation.yearEnd ? ` - ${generation.yearEnd}` : " - danas"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {generation.name}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2">
                    {generation.description}
                  </p>
                  <div className="mt-3 text-blue-400 text-sm font-medium group-hover:text-blue-300">
                    Pregledaj motore →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
