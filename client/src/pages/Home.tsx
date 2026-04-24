import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Car, BookOpen, Shield, Search, ChevronRight, ChevronLeft } from "lucide-react";
import type { CarModel, CarGenerationWithModel, CarVariantWithDetails, BlogPost } from "@shared/schema";
import { useToast } from "../components/Toast";
import { getImageSrcSet, getOptimizedImageUrl } from "../lib/images";
import { usePageMeta } from "../lib/seo";

export default function Home() {
  usePageMeta({
    title: "Auto Wiki - Enciklopedija automobila",
    description: "Pretražite automobile po marki, modelu, generaciji i motoru te čitajte specifikacije i automobilske članke.",
  });

  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const { success } = useToast();
  const [searchBrand, setSearchBrand] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");
  const [selectedGenerationId, setSelectedGenerationId] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);

  // Show success toast if coming from email verification
  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "success") {
      success("✅ Email uspješno verificiran! Dobrodošli na CarWiki.");
      // Clean up URL
      window.history.replaceState({}, "", "/");
    }
  }, []);

  // Track screen size for carousel
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

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

  const { data: variants } = useQuery<CarVariantWithDetails[]>({
    queryKey: ["/api/generations", selectedGenerationId, "variants"],
    queryFn: async () => {
      const res = await fetch(`/api/generations/${selectedGenerationId}/variants`);
      if (!res.ok) throw new Error("Failed to fetch variants");
      return res.json();
    },
    enabled: !!selectedGenerationId,
  });

  // Blog posts query
  const { data: blogPosts } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  // Blog carousel state
  const [currentBlogIndex, setCurrentBlogIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const visibleBlogPosts = blogPosts?.slice(0, 10) || []; // Limit to 10 posts

  const maxIndex = isDesktop 
    ? Math.max(0, visibleBlogPosts.length - 2) 
    : Math.max(0, visibleBlogPosts.length - 1);

  const nextBlogSlide = useCallback(() => {
    if (visibleBlogPosts.length === 0) return;
    setCurrentBlogIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [visibleBlogPosts.length, maxIndex]);

  const prevBlogSlide = useCallback(() => {
    if (visibleBlogPosts.length === 0) return;
    setCurrentBlogIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [visibleBlogPosts.length, maxIndex]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;
    
    if (Math.abs(diff) > swipeThreshold) {
      handleCarouselInteraction();
      if (diff > 0) {
        nextBlogSlide(); // Swipe left -> next
      } else {
        prevBlogSlide(); // Swipe right -> prev
      }
    }
  };

  // Auto-play effect
  useEffect(() => {
    if (isAutoPlaying && visibleBlogPosts.length > 1) {
      autoPlayRef.current = setInterval(() => {
        nextBlogSlide();
      }, 6000); // Change slide every 6 seconds
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, nextBlogSlide, visibleBlogPosts.length]);

  const handleCarouselInteraction = () => {
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Get unique brands
  const brands = [...new Set(models?.map(m => m.brand) || [])].sort();
  
  // Get models for selected brand
  const brandModels = searchBrand 
    ? models?.filter(m => m.brand === searchBrand).sort((a, b) => a.model.localeCompare(b.model)) || []
    : [];

  const selectedModel = models?.find(m => m.id === selectedModelId);
  const selectedGeneration = generations?.find(g => g.id === selectedGenerationId);

  const clearSearch = () => {
    setSearchBrand("");
    setSelectedModelId("");
    setSelectedGenerationId("");
  };

  return (
    <div className="min-h-screen">
      <section className="relative pt-16 pb-28 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl text-slate-300 mb-20 max-w-2xl mx-auto">
            Vaša kompletna enciklopedija automobila s detaljnim specifikacijama, recenzijama i najnovijim vijestima iz automobilskog svijeta.
          </p>

          {/* Search Section */}
          <div className="max-w-lg mx-auto mb-20">
            <div className="relative group">
              {/* Animated gradient border */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-2000 animate-pulse"></div>
              
              <div className="car-selector-box relative backdrop-blur-xl p-8 rounded-2xl border border-slate-600/50 shadow-2xl">
                {/* Header with icon */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/25">
                    <Search className="w-5 h-5 text-white keep-white" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Pronađi automobil
                  </h2>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${searchBrand ? 'bg-blue-500 shadow-lg shadow-blue-500/50' : 'bg-slate-600'}`}></div>
                  <div className={`w-6 h-0.5 transition-all duration-300 ${searchBrand ? 'bg-blue-500' : 'bg-slate-600'}`}></div>
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${selectedModelId ? 'bg-blue-500 shadow-lg shadow-blue-500/50' : 'bg-slate-600'}`}></div>
                  <div className={`w-6 h-0.5 transition-all duration-300 ${selectedModelId ? 'bg-blue-500' : 'bg-slate-600'}`}></div>
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${selectedGenerationId ? 'bg-blue-500 shadow-lg shadow-blue-500/50' : 'bg-slate-600'}`}></div>
                  <div className={`w-6 h-0.5 transition-all duration-300 ${selectedGenerationId ? 'bg-cyan-500' : 'bg-slate-600'}`}></div>
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${variants && variants.length > 0 ? 'bg-cyan-500 shadow-lg shadow-cyan-500/50' : 'bg-slate-600'}`}></div>
                </div>
              
                <div className="space-y-5">
                  {/* Brand Select */}
                  <div className="group/select">
                    <label htmlFor="select-brand" className="flex items-center gap-2 text-base font-semibold selector-text mb-1 text-left">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">1</span>
                      Odaberi marku
                    </label>
                    <p className="text-sm text-slate-400 mb-2 text-center">Odaberite marku automobila iz padajućeg izbornika</p>
                    <div className="relative">
                      <select
                        id="select-brand"
                        value={searchBrand}
                        onChange={(e) => {
                          setSearchBrand(e.target.value);
                          setSelectedModelId("");
                        }}
                        className="w-full bg-slate-900/80 border-2 border-slate-600/50 rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 selector-text transition-all duration-200 cursor-pointer hover:border-slate-500 appearance-none"
                      >
                        <option value="">-- Odaberi marku --</option>
                        {brands.map(brand => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  {/* Model Select - only show when brand is selected */}
                  <div className={`transition-all duration-300 ease-out ${searchBrand ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 h-0 overflow-hidden'}`}>
                    <label htmlFor="select-model" className="flex items-center gap-2 text-base font-semibold selector-text mb-1 text-left">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">2</span>
                      Odaberi model
                    </label>
                    <p className="text-sm text-slate-400 mb-2 text-center">Odaberite model automobila za odabranu marku</p>
                    <div className="relative">
                      <select
                        id="select-model"
                        value={selectedModelId}
                        onChange={(e) => {
                          setSelectedModelId(e.target.value);
                          setSelectedGenerationId("");
                        }}
                        className="w-full bg-slate-900/80 border-2 border-slate-600/50 rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 selector-text transition-all duration-200 cursor-pointer hover:border-slate-500 appearance-none"
                      >
                        <option value="">-- Odaberi model --</option>
                        {brandModels.map(model => (
                          <option key={model.id} value={model.id}>{model.model}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  {/* Generation Select - show when model is selected */}
                  {selectedModelId && generations && generations.length > 0 && (
                    <div className="transition-all duration-300 ease-out">
                      <label htmlFor="select-generation" className="flex items-center gap-2 text-base font-semibold selector-text mb-1 text-left">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">3</span>
                        Odaberi generaciju
                      </label>
                      <p className="text-sm text-slate-400 mb-2 text-center">Odaberite generaciju (godište) odabranog modela</p>
                      <div className="relative">
                        <select
                          id="select-generation"
                          value={selectedGenerationId}
                          onChange={(e) => setSelectedGenerationId(e.target.value)}
                          className="w-full bg-slate-900/80 border-2 border-slate-600/50 rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 selector-text transition-all duration-200 cursor-pointer hover:border-slate-500 appearance-none"
                        >
                          <option value="">-- Odaberi generaciju --</option>
                          {generations.map(gen => (
                            <option key={gen.id} value={gen.id}>{gen.name} ({gen.yearStart}-{gen.yearEnd || "danas"})</option>
                          ))}
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {/* Variants List - show when generation is selected */}
                  {selectedGenerationId && variants && variants.length > 0 && (
                    <div className="transition-all duration-300 ease-out">
                      <label className="flex items-center gap-2 text-base font-semibold selector-text mb-1 text-left">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-bold">4</span>
                        Odaberi motor
                      </label>
                      <p className="text-sm text-slate-400 mb-2 text-center">Kliknite na motornu varijantu za prikaz detalja</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {variants.map(variant => (
                          <Link
                            key={variant.id}
                            href={selectedModel?.brandSlug && selectedModel?.modelSlug && selectedGeneration?.slug && variant.slug
                              ? `/automobili/${selectedModel.brandSlug}/${selectedModel.modelSlug}/${selectedGeneration.slug}/${variant.slug}`
                              : `/varijanta/${variant.id}`
                            }
                            className="block bg-slate-900/60 p-3 rounded-xl hover:bg-slate-700/60 transition-all duration-200 text-left border border-transparent hover:border-slate-600/50 group/item"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <p className="font-semibold selector-text">{variant.engineName}</p>
                                <p className="text-xs text-slate-400">{variant.power} • {variant.fuelType} • {variant.transmission}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-500 group-hover/item:text-cyan-400 group-hover/item:translate-x-0.5 transition-all" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show link to generation page if selected but no variants */}
                  {selectedGenerationId && selectedGeneration && (!variants || variants.length === 0) && (
                    <div className="bg-slate-900/60 p-4 rounded-xl text-center">
                      <p className="text-slate-400 text-sm mb-3">Nema dostupnih motora za ovu generaciju.</p>
                      <Link
                        href={selectedModel?.brandSlug && selectedModel?.modelSlug && selectedGeneration?.slug
                          ? `/automobili/${selectedModel.brandSlug}/${selectedModel.modelSlug}/${selectedGeneration.slug}`
                          : `/generacija/${selectedGenerationId}`
                        }
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        Pogledaj generaciju →
                      </Link>
                    </div>
                  )}

                  {/* Show link to model page if selected */}
                  {selectedModel && !selectedGenerationId && (
                    <Link
                      href={selectedModel.brandSlug && selectedModel.modelSlug
                        ? `/automobili/${selectedModel.brandSlug}/${selectedModel.modelSlug}`
                        : `/model/${selectedModel.id}`
                      }
                      className="block bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-4 rounded-xl hover:from-blue-600/30 hover:to-cyan-600/30 transition-all duration-300 border border-blue-500/30 hover:border-blue-400/50 group/result"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-40"></div>
                          <img 
                            src={getOptimizedImageUrl(selectedModel.image, { width: 320, quality: 75, resize: "cover" })} 
                            alt={`${selectedModel.brand} ${selectedModel.model}`}
                            className="relative w-20 h-14 object-cover rounded-lg"
                            decoding="async"
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-bold selector-text">{selectedModel.brand} {selectedModel.model}</p>
                          <p className="text-sm text-slate-400">Pregledaj sve generacije</p>
                        </div>
                        <div className="p-2 bg-blue-500/20 rounded-lg group-hover/result:bg-blue-500/30 transition">
                          <ChevronRight className="w-5 h-5 text-blue-400 group-hover/result:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Clear button */}
                  {searchBrand && (
                    <div className="flex justify-end">
                      <button
                        onClick={clearSearch}
                        className="bg-slate-600 hover:bg-slate-500 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white hover:!text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                      >
                        <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                          <span className="text-xs">×</span>
                        </span>
                        Kreni ispočetka
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/automobili" className="bg-blue-600 hover:bg-blue-700 text-white keep-white px-8 py-3 rounded-lg font-semibold transition" data-testid="button-browse-cars">
              Pregledaj Automobile
            </Link>
            <Link href="/usporedi" className="bg-slate-500 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-white keep-white px-8 py-3 rounded-lg font-semibold transition border border-slate-400 dark:border-slate-500" data-testid="button-read-blog">
              Usporedi automobile
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Carousel Section */}
      {visibleBlogPosts.length > 0 && (
        <section className="py-12 bg-slate-950">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Najnoviji članci
              </h2>
              <Link href="/blog" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition">
                Svi članci
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Carousel Container */}
            <div className="relative">
              {/* Left Arrow - visible on all screens */}
              <button
                onClick={() => {
                  handleCarouselInteraction();
                  prevBlogSlide();
                }}
                className="absolute left-0 top-[calc(50%-25px)] -translate-y-1/2 z-10 bg-slate-800/95 hover:bg-blue-600 text-slate-900 dark:text-white hover:!text-white p-2 rounded-full shadow-lg transition-all duration-200 -translate-x-1/2 border border-slate-600 hover:border-blue-500"
                aria-label="Prethodni članak"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Right Arrow - visible on all screens */}
              <button
                onClick={() => {
                  handleCarouselInteraction();
                  nextBlogSlide();
                }}
                className="absolute right-0 top-[calc(50%-25px)] -translate-y-1/2 z-10 bg-slate-800/95 hover:bg-blue-600 text-slate-900 dark:text-white hover:!text-white p-2 rounded-full shadow-lg transition-all duration-200 translate-x-1/2 border border-slate-600 hover:border-blue-500"
                aria-label="Sljedeći članak"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Carousel Track */}
              <div 
                ref={carouselRef}
                className="overflow-hidden rounded-xl mx-4"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div 
                  className="flex transition-transform duration-700 ease-out"
                  style={{ transform: `translateX(-${currentBlogIndex * (isDesktop ? 50 : 100)}%)` }}
                >
                  {visibleBlogPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex-shrink-0 flex-grow-0"
                      style={{ width: isDesktop ? '50%' : '100%' }}
                    >
                      <Link
                        href={`/blog/${post.slug || post.id}`}
                        className="block px-2"
                        onClick={() => window.scrollTo(0, 0)}
                      >
                        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all duration-300 group/card">
                          <div className="relative w-full overflow-hidden" style={{ paddingBottom: '56%' }}>
                            <img
                              src={getOptimizedImageUrl(post.image, { width: 960, quality: 78, resize: "cover" })}
                              srcSet={getImageSrcSet(post.image, [400, 640, 800, 1280], { quality: 78, resize: "cover" })}
                              sizes="(max-width: 768px) 100vw, 50vw"
                              alt={post.title}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                              loading="lazy"
                              decoding="async"
                              fetchPriority="low"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 overflow-hidden" style={{ maxHeight: '75%' }}>
                              <span className="keep-white inline-block bg-blue-600/90 px-3 py-1 rounded text-xs font-medium backdrop-blur-sm mb-2 text-white">
                                {post.category}
                              </span>
                              <h3 className="keep-white font-bold text-white group-hover/card:text-blue-300 transition-colors text-base md:text-xl lg:text-2xl line-clamp-2">
                                {post.title}
                              </h3>
                              <p className="keep-white text-slate-300 text-xs md:text-sm mt-1 line-clamp-2 hidden md:block">
                                {post.excerpt}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-0 mt-4">
                {Array.from({ length: maxIndex + 1 }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleCarouselInteraction();
                      setCurrentBlogIndex(index);
                    }}
                    className="p-3 group"
                    aria-label={`Idi na članak ${index + 1}`}
                  >
                    <span className={`block h-2 rounded-full transition-all duration-300 ${
                      index === currentBlogIndex 
                        ? 'bg-blue-500 w-6' 
                        : 'bg-slate-600 group-hover:bg-slate-500 w-2'
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Link 
              href="/automobili" 
              className="block bg-slate-800 p-6 rounded-lg border border-slate-700 hover-elevate active-elevate-2 cursor-pointer transition-all"
              data-testid="link-feature-cars"
            >
              <Car className="w-12 h-12 text-blue-400 mb-4" data-testid="icon-cars" />
              <h3 className="text-xl font-bold mb-2" data-testid="text-cars-title">Baza Automobila</h3>
              <p className="text-slate-400" data-testid="text-cars-description">
                Pregledajte našu opsežnu bazu automobila s detaljnim tehničkim specifikacijama i fotografijama.
              </p>
            </Link>
            <Link 
              href="/blog" 
              className="block bg-slate-800 p-6 rounded-lg border border-slate-700 hover-elevate active-elevate-2 cursor-pointer transition-all"
              data-testid="link-feature-blog"
            >
              <BookOpen className="w-12 h-12 text-blue-400 mb-4" data-testid="icon-blog" />
              <h3 className="text-xl font-bold mb-2" data-testid="text-blog-title">Blog & Vijesti</h3>
              <p className="text-slate-400" data-testid="text-blog-description">
                Pročitajte stručne članak o povijesti, tehnologiji i najnovijim trendovima u automobilskoj industriji.
              </p>
            </Link>
            <Link 
              href="/o-nama" 
              className="block bg-slate-800 p-6 rounded-lg border border-slate-700 hover-elevate active-elevate-2 cursor-pointer transition-all"
              data-testid="link-feature-about"
            >
              <Shield className="w-12 h-12 text-blue-400 mb-4" data-testid="icon-about" />
              <h3 className="text-xl font-bold mb-2" data-testid="text-about-title">Pouzdani Podaci</h3>
              <p className="text-slate-400" data-testid="text-about-description">
                Sve informacije su pažljivo provjerene i redovito ažurirane kako bismo osigurali točnost podataka.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
