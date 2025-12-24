import { Link } from "wouter";
import { Car, BookOpen, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Dobrodošli u Auto Wiki
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Vaša kompleta enciklopedija automobila s detaljnim specifikacijama, recenzijama i najnovijim vijestima iz automobilskog svijeta.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/automobili" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition" data-testid="button-browse-cars">
              Pregledaj Automobile
            </Link>
            <Link href="/blog" className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition" data-testid="button-read-blog">
              Pročitaj Blog
            </Link>
          </div>
        </div>
      </section>

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
