import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-700 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Auto Wiki
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sveobuhvatna enciklopedija automobila. Pronađite tehničke specifikacije, usporedite modele i pratite najnovije vijesti iz automobilskog svijeta.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Brze veze</h4>
            <ul className="space-y-2">
              {[
                { label: "Automobili", href: "/automobili" },
                { label: "Usporedi", href: "/usporedi" },
                { label: "Blog", href: "/blog" },
                { label: "Kontakt", href: "/kontakt" },
                { label: "O nama", href: "/o-nama" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-slate-400 hover:text-blue-400 transition text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Info */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Informacije</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>FESB — HCI projekt</li>
              <li>Split, Hrvatska</li>
              <li>
                <Link href="/kontakt" className="hover:text-blue-400 transition">
                  Kontaktirajte nas
                </Link>
              </li>
              <li>
                <Link href="/prijava-automobila" className="hover:text-blue-400 transition">
                  Dodajte automobil
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 text-center text-slate-500 text-sm">
          <p>&copy; 2026 Auto Wiki — FESB HCI Project. Sva prava pridržana.</p>
        </div>
      </div>
    </footer>
  );
}
