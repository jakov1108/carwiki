import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import type { ModelPagePayload } from "@shared/schema";
import { ArrowLeft, Calendar, ChevronRight } from "lucide-react";
import ImageCarousel from "../components/ImageCarousel";
import { DetailHeaderSkeleton, BreadcrumbSkeleton, CardGridSkeleton } from "../components/Skeleton";
import { getOptimizedGalleryImages, getOptimizedImageUrl } from "../lib/images";
import { usePageMeta } from "../lib/seo";

export default function ModelDetail() {
  // Get params from URL
  const params = useParams<{ brandSlug?: string; modelSlug?: string; id?: string }>();

  const brandSlug = params.brandSlug;
  const modelSlug = params.modelSlug;
  const modelId = params.id;
  const isSlugRoute = !!(brandSlug && modelSlug);

  const { data: pageData, isLoading } = useQuery<ModelPagePayload>({
    queryKey: isSlugRoute 
      ? ["/api/page/car", brandSlug, modelSlug] 
      : ["/api/page/model", modelId],
    queryFn: async () => {
      const url = isSlugRoute 
        ? `/api/page/car/${brandSlug}/${modelSlug}`
        : `/api/page/model/${modelId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch model page data");
      return res.json();
    },
    enabled: isSlugRoute ? !!(brandSlug && modelSlug) : !!modelId,
  });

  const model = pageData?.model;
  const generations = pageData?.generations;
  const allImages = getOptimizedGalleryImages(pageData?.galleryImages ?? [], {
    width: 1600,
    quality: 80,
    resize: "cover",
  });

  usePageMeta({
    title: model ? `${model.brand} ${model.model} - Auto Wiki` : "Model automobila - Auto Wiki",
    description: model?.description || "Pregledajte model automobila, generacije i dostupne motorne varijante.",
    image: model?.image,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <BreadcrumbSkeleton />
          <DetailHeaderSkeleton />
          <div className="mb-6"><div className="h-7 w-32 bg-slate-700/50 rounded animate-pulse" /></div>
          <CardGridSkeleton count={3} />
        </div>
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
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
          <Link href="/automobili" className="text-slate-400 hover:text-blue-400 transition">
            Sve marke
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <Link 
            href={model.brandSlug ? `/automobili/${model.brandSlug}` : "/automobili"} 
            className="text-slate-400 hover:text-blue-400 transition"
          >
            {model.brand}
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-blue-400 font-medium">{model.model}</span>
        </div>

        <Link
          href={model.brandSlug ? `/automobili/${model.brandSlug}` : "/automobili"}
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Povratak na {model.brand}</span>
        </Link>

        {/* Model Header */}
        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 mb-8">
          <div className="relative">
            <ImageCarousel
              images={allImages}
              autoPlay={allImages.length > 1}
              autoPlayInterval={5000}
              className="h-64 md:h-80"
              aspectRatio="none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
              <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-medium mb-2 inline-block keep-white">
                {model.category}
              </span>
              <h1 className="text-4xl font-bold text-white keep-white">
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
            {generations?.map((generation) => {
              const generationUrl = model.brandSlug && model.modelSlug && generation.slug
                ? `/automobili/${model.brandSlug}/${model.modelSlug}/${generation.slug}`
                : `/generacija/${generation.id}`;
              
              return (
                <Link
                  key={generation.id}
                  href={generationUrl}
                  className="block bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition group"
                >
                  <div className="relative overflow-hidden">
                      <img
                      src={getOptimizedImageUrl(generation.image, { width: 720, quality: 78, resize: "cover" })}
                      alt={`${model.brand} ${model.model} ${generation.name}`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
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
                    <div className="mt-3 text-blue-400 text-sm font-medium group-hover:text-blue-300 flex items-center gap-1">
                      Pregledaj motore <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
