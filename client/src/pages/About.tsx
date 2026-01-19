export default function About() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          O Auto Wiki Projektu
        </h1>
        
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Projekt</h2>
            <p className="text-slate-300 leading-relaxed">
              Auto Wiki je HCI (Human-Computer Interaction) projekt razvijen za Fakultet elektrotehnike, strojarstva i brodogradnje (FESB).
              Cilj projekta je izraditi modernu i pristupačnu platformu za ljubitelje automobila koja kombinira bazu podataka
              o automobilima (modeli, generacije i varijante) s blog sadržajem.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Tehnologije</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-cyan-400 mb-2">Frontend</h3>
                <ul className="text-slate-300 space-y-1">
                  <li>• React 18 s TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• Radix UI komponente</li>
                  <li>• TanStack Query</li>
                  <li>• Wouter routing</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-cyan-400 mb-2">Backend</h3>
                <ul className="text-slate-300 space-y-1">
                  <li>• Express.js</li>
                  <li>• PostgreSQL (Supabase)</li>
                  <li>• Drizzle ORM</li>
                  <li>• Better Auth (email/password autentifikacija)</li>
                  <li>• Zod validacija</li>
                  <li>• Supabase Storage (upload slika)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Značajke</h2>
            <ul className="text-slate-300 space-y-2">
              <li>• Katalog automobila s tehničkim specifikacijama (modeli → generacije → varijante)</li>
              <li>• Usporedba varijanti automobila</li>
              <li>• Blog sustav</li>
              <li>• Autentikacija korisnika + role-based pristup (user/admin)</li>
              <li>• Admin panel za upravljanje sadržajem</li>
              <li>• Upload slika za modele/generacije/varijante</li>
              <li>• Responzivni dizajn (mobile-first)</li>
              <li>• Pretraga i filtriranje</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Tim</h2>
            <p className="text-slate-300 leading-relaxed">
              Projekt je razvijen kao dio akademskog programa na FESB-u, s fokusom na moderan pristup
              dizajnu korisničkog sučelja i primjenu suvremenih web tehnologija.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
