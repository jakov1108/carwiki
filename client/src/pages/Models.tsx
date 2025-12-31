import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { CarModel } from "@shared/schema";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Models() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: models, isLoading } = useQuery<CarModel[]>({
    queryKey: ["/api/models"],
  });

  const categories = ["all", "Compact", "Sedan", "SUV", "Sports", "Electric"];

  // Group models by brand
  const groupedModels = models?.reduce((acc, model) => {
    if (!acc[model.brand]) {
      acc[model.brand] = [];
    }
    acc[model.brand].push(model);
    return acc;
  }, {} as Record<string, CarModel[]>);

  const filteredGroupedModels = groupedModels
    ? Object.entries(groupedModels).reduce((acc, [brand, brandModels]) => {
        const filtered = brandModels.filter((model) => {
          const matchesSearch =
            model.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            model.model.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesCategory =
            selectedCategory === "all" || model.category === selectedCategory;
          return matchesSearch && matchesCategory;
        });
        if (filtered.length > 0) {
          acc[brand] = filtered;
        }
        return acc;
      }, {} as Record<string, CarModel[]>)
    : {};

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Učitavam...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Baza Automobila
        </h1>

        <div className="mb-8 space-y-4">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Pretraži po marki ili modelu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {category === "all" ? "Sve kategorije" : category}
              </button>
            ))}
          </div>
        </div>

        {Object.keys(filteredGroupedModels).length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            Nema automobila koji odgovaraju vašim kriterijima pretrage.
          </div>
        ) : (
          Object.entries(filteredGroupedModels)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([brand, brandModels]) => (
              <div key={brand} className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-slate-200 border-b border-slate-700 pb-2">
                  {brand}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {brandModels.map((model) => (
                    <Link
                      key={model.id}
                      href={`/automobili/${model.id}`}
                      className="block bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition group"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={model.image}
                          alt={`${model.brand} ${model.model}`}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-3 right-3 bg-blue-600 px-2 py-1 rounded text-xs font-medium">
                          {model.category}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-white">
                          {model.model}
                        </h3>
                        <p className="text-slate-400 text-sm line-clamp-2 mt-1">
                          {model.description}
                        </p>
                        <div className="mt-3 text-blue-400 text-sm font-medium group-hover:text-blue-300">
                          Pregledaj generacije →
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
