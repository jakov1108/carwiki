import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import type { CarVariantWithDetails } from "@shared/schema";
import { ArrowLeft, Gauge, Zap, Fuel, Settings, Calendar, Play, ChevronRight } from "lucide-react";

export default function VariantDetail() {
  // Get params from URL
  const params = useParams<{ brandSlug?: string; modelSlug?: string; generationSlug?: string; variantSlug?: string; id?: string }>();

  const brandSlug = params.brandSlug;
  const modelSlug = params.modelSlug;
  const generationSlug = params.generationSlug;
  const variantSlug = params.variantSlug;
  const variantId = params.id;
  const isSlugRoute = !!(brandSlug && modelSlug && generationSlug && variantSlug);

  const { data: variant, isLoading } = useQuery<CarVariantWithDetails>({
    queryKey: isSlugRoute 
      ? ["/api/car", brandSlug, modelSlug, generationSlug, variantSlug] 
      : ["/api/variants", variantId],
    queryFn: async () => {
      const url = isSlugRoute 
        ? `/api/car/${brandSlug}/${modelSlug}/${generationSlug}/${variantSlug}`
        : `/api/variants/${variantId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch variant");
      return res.json();
    },
    enabled: isSlugRoute ? !!(brandSlug && modelSlug && generationSlug && variantSlug) : !!variantId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Učitavam...</div>
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-400">Varijanta nije pronađena</div>
      </div>
    );
  }

  const fullName = `${variant.model?.brand} ${variant.model?.model} ${variant.generation?.name} ${variant.engineName}`;

  // Build breadcrumb URLs
  const brandUrl = variant.model?.brandSlug 
    ? `/automobili/${variant.model.brandSlug}` 
    : "/automobili";
  const modelUrl = variant.model?.brandSlug && variant.model?.modelSlug
    ? `/automobili/${variant.model.brandSlug}/${variant.model.modelSlug}`
    : variant.model?.id ? `/model/${variant.model.id}` : "/automobili";
  const generationUrl = variant.model?.brandSlug && variant.model?.modelSlug && variant.generation?.slug
    ? `/automobili/${variant.model.brandSlug}/${variant.model.modelSlug}/${variant.generation.slug}`
    : variant.generation?.id ? `/generacija/${variant.generation.id}` : modelUrl;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
          <Link href="/automobili" className="text-slate-400 hover:text-blue-400 transition">
            Sve marke
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <Link href={brandUrl} className="text-slate-400 hover:text-blue-400 transition">
            {variant.model?.brand}
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <Link href={modelUrl} className="text-slate-400 hover:text-blue-400 transition">
            {variant.model?.model}
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <Link href={generationUrl} className="text-slate-400 hover:text-blue-400 transition">
            {variant.generation?.name}
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-blue-400 font-medium">{variant.engineName}</span>
        </div>

        <Link
          href={generationUrl}
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>
            Povratak na {variant.model?.brand} {variant.model?.model} {variant.generation?.name}
          </span>
        </Link>

        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
          {/* Header with generation image */}
          <div className="relative">
            <img
              src={variant.generation?.image}
              alt={fullName}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  {variant.generation?.name}
                </span>
                <span className="bg-green-600 px-3 py-1 rounded-full text-sm font-medium">
                  {variant.engineName}
                </span>
                <span className="bg-slate-700 px-3 py-1 rounded-full text-sm text-slate-200">
                  {variant.fuelType}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {variant.model?.brand} {variant.model?.model}
              </h1>
              <p className="text-slate-300 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {variant.generation?.yearStart}
                {variant.generation?.yearEnd
                  ? ` - ${variant.generation?.yearEnd}`
                  : " - danas"}
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Engine Specs */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Gauge className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold">Motor i Performanse</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Motor:</span>
                    <span className="text-white font-medium">{variant.engineName}</span>
                  </div>
                  {variant.engineCode && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Oznaka motora:</span>
                      <span className="text-white font-medium">{variant.engineCode}</span>
                    </div>
                  )}
                  {variant.displacement && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Zapremnina:</span>
                      <span className="text-white font-medium">{variant.displacement}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Snaga:</span>
                    <span className="text-white font-medium">{variant.power}</span>
                  </div>
                  {variant.torque && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Moment:</span>
                      <span className="text-white font-medium">{variant.torque}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ubrzanje 0-100:</span>
                    <span className="text-white font-medium">{variant.acceleration}</span>
                  </div>
                  {variant.topSpeed && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Max brzina:</span>
                      <span className="text-white font-medium">{variant.topSpeed}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold">Dodatne Specifikacije</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gorivo:</span>
                    <span className="text-white font-medium">{variant.fuelType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mjenjač:</span>
                    <span className="text-white font-medium">{variant.transmission}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pogon:</span>
                    <span className="text-white font-medium">{variant.driveType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Potrošnja:</span>
                    <span className="text-white font-medium">{variant.consumption}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pouzdanost:</span>
                    <span className="text-white font-medium">
                      {variant.reliability}/5 ⭐
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Video */}
            {variant.videoUrl && (
              <div className="mt-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Play className="w-6 h-6 text-red-500" />
                  Video Recenzija
                </h3>
                <div className="aspect-video">
                  <iframe
                    src={variant.videoUrl}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
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
