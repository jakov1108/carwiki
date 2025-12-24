import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { X, Check, Search } from "lucide-react";
import type { Car } from "@shared/schema";

export default function Compare() {
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const initialCarIds = searchParams.getAll('id');

  const [selectedIds, setSelectedIds] = useState<string[]>(initialCarIds);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: cars = [], isLoading } = useQuery<Car[]>({
    queryKey: ["/api/cars"],
  });

  useEffect(() => {
    if (initialCarIds.length > 0 && selectedIds.length === 0) {
      setSelectedIds(initialCarIds);
    }
  }, [initialCarIds]);

  const selectedCars = cars.filter(car => selectedIds.includes(car.id));

  const toggleCar = (carId: string) => {
    if (selectedIds.includes(carId)) {
      setSelectedIds(selectedIds.filter(id => id !== carId));
    } else if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, carId]);
    }
  };

  const removeCar = (carId: string) => {
    setSelectedIds(selectedIds.filter(id => id !== carId));
  };

  const categories = ["all", ...Array.from(new Set(cars.map(car => car.category)))];

  const filteredCars = cars.filter(car => {
    const matchesSearch = 
      car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || car.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const specs = [
    { label: "Motor", key: "engine" as keyof Car },
    { label: "Snaga", key: "power" as keyof Car },
    { label: "Ubrzanje 0-100", key: "acceleration" as keyof Car },
    { label: "Potrošnja", key: "consumption" as keyof Car },
    { label: "Pogon", key: "driveType" as keyof Car },
    { label: "Godina", key: "year" as keyof Car },
    { label: "Kategorija", key: "category" as keyof Car },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-lg text-slate-400">Učitavanje...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 text-white text-center" data-testid="text-page-title">
          Usporedba automobila
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Odaberite do 3 automobila za usporedbu ({selectedIds.length}/3 odabrano)
        </p>

        {selectedCars.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white" data-testid="text-comparison-title">
              Usporedba
            </h2>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${selectedCars.length}, minmax(280px, 1fr))` }}>
                  {selectedCars.map((car) => (
                    <div 
                      key={car.id} 
                      className="bg-slate-800 rounded-xl overflow-hidden shadow-xl"
                      data-testid={`card-compare-${car.id}`}
                    >
                      <div className="p-4 relative">
                        <button
                          className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          onClick={() => removeCar(car.id)}
                          data-testid={`button-remove-${car.id}`}
                          aria-label="Ukloni automobil"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        <img
                          src={car.image}
                          alt={`${car.brand} ${car.model}`}
                          className="w-full h-36 object-cover rounded-lg mb-3"
                          data-testid={`img-car-${car.id}`}
                        />
                        
                        <h3 className="text-lg font-bold text-white mb-1" data-testid={`text-car-name-${car.id}`}>
                          {car.brand} {car.model}
                        </h3>
                        
                        <span 
                          className="inline-block px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full"
                          data-testid={`badge-category-${car.id}`}
                        >
                          {car.category}
                        </span>
                      </div>
                      
                      <div className="p-4 space-y-3 border-t border-slate-700">
                        {specs.map((spec) => (
                          <div key={String(spec.key)} className="flex flex-col">
                            <span className="text-xs text-slate-400 mb-0.5">{spec.label}</span>
                            <span 
                              className="font-medium text-white text-sm" 
                              data-testid={`text-${String(spec.key)}-${car.id}`}
                            >
                              {spec.key === 'year' ? car[spec.key] : car[spec.key] || '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-slate-800 pt-8">
          <h2 className="text-2xl font-bold mb-6 text-white" data-testid="text-select-title">
            Odaberite automobile
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Pretraži automobile..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="w-full pl-10 py-2 pr-4 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="input-search-compare"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    categoryFilter === cat
                      ? "bg-blue-500 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                  data-testid={`button-filter-${cat}`}
                >
                  {cat === "all" ? "Sve kategorije" : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredCars.map((car) => {
              const isSelected = selectedIds.includes(car.id);
              const isDisabled = !isSelected && selectedIds.length >= 3;
              
              return (
                <button
                  key={car.id}
                  onClick={() => !isDisabled && toggleCar(car.id)}
                  disabled={isDisabled}
                  className={`relative text-left rounded-lg overflow-hidden transition-all ${
                    isSelected 
                      ? "ring-2 ring-blue-500 bg-slate-800" 
                      : isDisabled
                        ? "opacity-50 cursor-not-allowed bg-slate-800/50"
                        : "bg-slate-800 hover-elevate active-elevate-2 cursor-pointer"
                  }`}
                  data-testid={`button-select-car-${car.id}`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 z-10 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <img
                    src={car.image}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-20 object-cover"
                  />
                  <div className="p-2">
                    <p className="font-medium text-white text-xs truncate">
                      {car.brand} {car.model}
                    </p>
                    <p className="text-slate-400 text-xs">{car.year}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredCars.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400">Nema automobila koji odgovaraju pretrazi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
