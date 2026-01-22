import { useLocation } from "wouter";
import { Home } from "lucide-react";

const PEUGEOT_404_DESKTOP = "https://hjvuiqozcxuvwaedmgkm.supabase.co/storage/v1/object/public/car-images/peugeot-404-desktop.jpg";
const PEUGEOT_404_MOBILE = "https://hjvuiqozcxuvwaedmgkm.supabase.co/storage/v1/object/public/car-images/peugeot-404-mobile.jpg";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="relative min-h-[calc(100vh-200px)] flex flex-col items-center justify-end overflow-hidden">
      {/* Desktop background - hidden on mobile */}
      <div 
        className="absolute inset-0 z-0 hidden md:block"
        style={{
          backgroundImage: `url(${PEUGEOT_404_DESKTOP})`,
          backgroundSize: 'cover',
          backgroundPosition: '55% center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Mobile background - hidden on desktop */}
      <div 
        className="absolute inset-0 z-0 md:hidden"
        style={{
          backgroundImage: `url(${PEUGEOT_404_MOBILE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Overlay - different for light/dark mode */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-white/95 via-white/50 to-transparent dark:from-slate-950/95 dark:via-slate-950/60 dark:to-transparent" />

      {/* Content - positioned at bottom */}
      <div className="relative z-10 text-center max-w-2xl px-6 py-8 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-slate-900 dark:text-white drop-shadow-[0_2px_4px_rgba(255,255,255,0.5)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Stranica nije pronađena
        </h1>
        
        <p className="text-lg md:text-xl text-slate-800 dark:text-white/90 mb-2 drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Izgleda da ste zalutali...
        </p>
        
        <p className="text-slate-700 dark:text-white/80 mb-8 text-base drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          baš kao ovaj Peugeot 404
        </p>

        <div className="space-y-5">
          <button
            onClick={() => setLocation("/")}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Home size={20} />
            Povratak na početnu stranicu
          </button>

          <div className="mt-6">
            <p className="text-slate-700 dark:text-white/80 text-sm mb-3">Ili istražite:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="/automobili"
                className="text-slate-800 dark:text-white bg-white/70 dark:bg-black/40 hover:bg-white/90 dark:hover:bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 border border-slate-300 dark:border-white/20"
              >
                Automobili
              </a>
              <a
                href="/blog"
                className="text-slate-800 dark:text-white bg-white/70 dark:bg-black/40 hover:bg-white/90 dark:hover:bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 border border-slate-300 dark:border-white/20"
              >
                Blog
              </a>
              <a
                href="/o-nama"
                className="text-slate-800 dark:text-white bg-white/70 dark:bg-black/40 hover:bg-white/90 dark:hover:bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 border border-slate-300 dark:border-white/20"
              >
                O nama
              </a>
              <a
                href="/kontakt"
                className="text-slate-800 dark:text-white bg-white/70 dark:bg-black/40 hover:bg-white/90 dark:hover:bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 border border-slate-300 dark:border-white/20"
              >
                Kontakt
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
