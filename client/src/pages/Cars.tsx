import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import type { Car } from "@shared/schema";
import { Search, Scale, Check } from "lucide-react";
import { useState } from "react";

export default function Cars() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCars, setSelectedCars] = useState<string[]>([]);

  const { data: cars, isLoading } = useQuery<Car[]>({
    queryKey: ["/api/cars"],
  });

  const categories = ["all", "Compact", "Sedan", "SUV", "Sports", "Electric"];

  const filteredCars = cars?.filter((car) => {
    const matchesSearch = car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || car.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleCarSelection = (carId: string) => {
    setSelectedCars(prev => {
      if (prev.includes(carId)) {
        return prev.filter(id => id !== carId);
      } else if (prev.length < 3) {
        return [...prev, carId];
      }
      return prev;
    });
  };

  const goToCompare = () => {
    const params = selectedCars.map(id => `id=${id}`).join('&');
    setLocation(`/usporedi?${params}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Učitavam...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 pb-32">
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
              data-testid="input-search"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition ${selectedCategory === category
                    ? "bg-blue-600 text-white keep-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
                data-testid={`button-category-${category}`}
              >
                {category === "all" ? "Sve kategorije" : category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars?.map((car) => (
            <div 
              key={car.id} 
              className="relative bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition"
              data-testid={`card-car-${car.id}`}
            >
              <button
                onClick={() => toggleCarSelection(car.id)}
                className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition ${
                  selectedCars.includes(car.id)
                    ? "bg-blue-500 border-blue-500"
                    : "bg-slate-900/50 border-slate-500 hover:border-blue-400"
                }`}
                data-testid={`button-select-${car.id}`}
                aria-label="Odaberi za usporedbu"
              >
                {selectedCars.includes(car.id) && <Check className="w-5 h-5 text-white" />}
              </button>

              <Link href={`/automobili/${car.id}`} className="block">
                <img
                  src={car.image}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-48 object-cover"
                  data-testid={`img-car-${car.id}`}
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold" data-testid={`text-car-name-${car.id}`}>
                      {car.brand} {car.model}
                    </h3>
                    <span className="text-sm bg-blue-600 px-2 py-1 rounded">{car.year}</span>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">{car.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500">Motor:</span>
                      <span className="ml-2 text-slate-300">{car.engine}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Snaga:</span>
                      <span className="ml-2 text-slate-300">{car.power}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {filteredCars?.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            Nema automobila koji odgovaraju vašim kriterijima pretrage.
          </div>
        )}
      </div>

      {selectedCars.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 p-4 shadow-2xl z-40">
          <div className="container mx-auto flex items-center justify-between">
            <div className="text-white">
              <span className="font-semibold">{selectedCars.length}</span>
              <span className="text-slate-400 ml-2">
                {selectedCars.length === 1 ? 'automobil odabran' : 'automobila odabrano'}
              </span>
              {selectedCars.length < 3 && (
                <span className="text-slate-500 ml-2 text-sm">
                  (možete odabrati još {3 - selectedCars.length})
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedCars([])}
                className="px-4 py-2 text-slate-400 hover:text-white transition"
                data-testid="button-clear-selection"
              >
                Očisti
              </button>
              <button
                onClick={goToCompare}
                disabled={selectedCars.length < 2}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition"
                data-testid="button-go-compare"
              >
                <Scale className="w-5 h-5" />
                <span>Usporedi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
