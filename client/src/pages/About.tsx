import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const faqItems = [
  {
    q: "Što je Auto Wiki?",
    a: "Auto Wiki je online enciklopedija automobila koja sadrži detaljne tehničke specifikacije, organizirane po markama, modelima, generacijama i varijantama motora. Također nudi blog sadržaj i mogućnost usporedbe vozila."
  },
  {
    q: "Što znače pojmovi Marka, Model, Generacija i Varijanta?",
    a: "Marka je proizvođač (npr. Volkswagen). Model je linija automobila (npr. Golf). Generacija je specifična verzija modela s različitim godinama proizvodnje (npr. Golf Mk8, 2019\u20132024). Varijanta je konkretna motorna izvedba unutar generacije (npr. 2.0 TSI GTI)."
  },
  {
    q: "Kako mogu predložiti novi automobil?",
    a: 'Registrirajte se ili prijavite, zatim kliknite "Dodaj auto" u navigaciji. Vodimo vas kroz 4 koraka: odabir marke, modela, generacije, i unos specifikacija varijante. Vaš prijedlog ide na pregled adminu prije objave.'
  },
  {
    q: "Kako radi usporedba automobila?",
    a: "Na stranici Usporedi možete odabrati do 3 varijante motora i uspoređivati ih po ključnim specifikacijama. Zelena oznaka pokazuje koja varijanta ima najbolju vrijednost u svakoj kategoriji."
  },
  {
    q: "Što ako moji podaci nisu točni?",
    a: "Svi prijedlozi prolaze admin pregled prije objave. Ako primijetite grešku u postojećim podacima, kontaktirajte nas putem stranice Kontakt."
  },
];

const glossaryItems = [
  { term: "FWD", desc: "Prednji pogon (Front-Wheel Drive) \u2013 samo prednji kotači pokreću vozilo" },
  { term: "RWD", desc: "Stražnji pogon (Rear-Wheel Drive) \u2013 samo stražnji kotači pokreću vozilo" },
  { term: "AWD / 4WD", desc: "Pogon na sva četiri kotača (All-Wheel / Four-Wheel Drive)" },
  { term: "KS", desc: "Konjska snaga \u2013 mjerna jedinica snage motora (1 KS \u2248 0,735 kW)" },
  { term: "kW", desc: "Kilovat \u2013 metrička mjerna jedinica snage" },
  { term: "Nm", desc: "Njuton-metar \u2013 mjerna jedinica okretnog momenta" },
  { term: "L/100km", desc: "Litara na 100 kilometara \u2013 mjera potrošnje goriva" },
  { term: "TSI / TFSI", desc: "Turbo motor s direktnim ubrizgavanjem benzina (VW / Audi)" },
  { term: "TDI / CDI / HDi", desc: "Turbodizel s direktnim ubrizgavanjem (različiti proizvođači)" },
  { term: "DSG", desc: "Automatizirani mjenjač s dvostrukom spojkom (VW grupa)" },
  { term: "CVT", desc: "Kontinuirano varijabilni mjenjač \u2013 bezstepeni automatik" },
  { term: "PHEV", desc: "Plug-in hibridno električno vozilo" },
  { term: "BEV", desc: "Potpuno električno vozilo (baterijsko)" },
];

export default function About() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="pb-1 text-4xl font-bold leading-tight mb-8 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
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

        {/* FAQ Section */}
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mt-8">
          <h2 className="text-2xl font-bold mb-6 text-blue-400 flex items-center gap-2">
            <HelpCircle className="w-6 h-6" />
            Česta pitanja (FAQ)
          </h2>
          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <div key={idx} className="border border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700/50 transition"
                >
                  <span className="font-medium text-white">{item.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-slate-300 text-sm leading-relaxed border-t border-slate-700 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Glossary Section */}
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mt-8">
          <h2 className="text-2xl font-bold mb-6 text-blue-400">
            Pojmovnik
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Kratice i tehnički pojmovi koji se koriste u specifikacijama automobila.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {glossaryItems.map((item) => (
              <div key={item.term} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                <span className="font-mono font-bold text-cyan-400 text-sm min-w-[80px] shrink-0">{item.term}</span>
                <span className="text-slate-300 text-sm">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
