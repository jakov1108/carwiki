import { useLocation } from "wouter";
import { Home } from "lucide-react";

const PEUGEOT_404_IMAGE = "https://hjvuiqozcxuvwaedmgkm.supabase.co/storage/v1/object/public/car-images/peugeot-404-background.jpg";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="relative min-h-[calc(100vh-200px)] flex flex-col items-center justify-center overflow-hidden">
      {/* Background image container */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${PEUGEOT_404_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay for better text readability - works for both light and dark modes */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-slate-950/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl px-6 py-12">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white drop-shadow-lg">
          Stranica nije pronađena
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-200 mb-3 drop-shadow-md">
          Izgleda da ste zalutali...
        </p>
        
        <p className="text-slate-300 mb-10 text-lg drop-shadow-sm">
          baš kao ovaj Peugeot 404
        </p>

        <div className="space-y-6">
          <button
            onClick={() => setLocation("/")}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-10 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Home size={22} />
            Povratak na početnu stranicu
          </button>

          <div className="mt-10">
            <p className="text-slate-300 text-sm mb-4 drop-shadow-sm">Ili istražite:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/automobili"
                className="text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full transition-all duration-200 hover:scale-105"
              >
                Automobili
              </a>
              <a
                href="/blog"
                className="text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full transition-all duration-200 hover:scale-105"
              >
                Blog
              </a>
              <a
                href="/o-nama"
                className="text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full transition-all duration-200 hover:scale-105"
              >
                O nama
              </a>
              <a
                href="/kontakt"
                className="text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full transition-all duration-200 hover:scale-105"
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
