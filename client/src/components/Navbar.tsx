import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "../lib/auth";
import { Car, Menu, X, LogOut, UserCircle, Scale } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xl font-bold text-blue-400 hover:text-blue-300 transition"
            data-testid="link-home"
          >
            <Car className="w-6 h-6" />
            <span>Auto Wiki</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/automobili" className="text-slate-300 hover:text-white transition" data-testid="link-cars">
              Automobili
            </Link>
            <Link href="/usporedi" className="flex items-center gap-1 text-slate-300 hover:text-white transition" data-testid="link-compare">
              <Scale className="w-4 h-4" />
              <span>Usporedi</span>
            </Link>
            <Link href="/blog" className="text-slate-300 hover:text-white transition" data-testid="link-blog">
              Blog
            </Link>
            <Link href="/kontakt" className="text-slate-300 hover:text-white transition" data-testid="link-contact">
              Kontakt
            </Link>
            <Link href="/o-nama" className="text-slate-300 hover:text-white transition" data-testid="link-about">
              O nama
            </Link>

            {user ? (
              <>
                {user.role === "admin" && (
                  <Link href="/admin" className="text-blue-400 hover:text-blue-300 transition font-medium" data-testid="link-admin">
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm">{user.name}</span>
                  <button
                    onClick={() => logout()}
                    className="text-slate-400 hover:text-white transition"
                    data-testid="button-logout"
                    aria-label="Odjava"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link href="/prijava" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition" data-testid="link-login">
                <UserCircle className="w-5 h-5" />
                <span>Prijava</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white transition"
            data-testid="button-mobile-menu"
            aria-label="Otvori izbornik"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <div className="flex flex-col gap-4">
              <Link 
                href="/automobili" 
                className="text-slate-300 hover:text-white transition py-2"
                data-testid="link-cars-mobile"
                onClick={closeMobileMenu}
              >
                Automobili
              </Link>
              <Link 
                href="/usporedi" 
                className="flex items-center gap-2 text-slate-300 hover:text-white transition py-2"
                data-testid="link-compare-mobile"
                onClick={closeMobileMenu}
              >
                <Scale className="w-4 h-4" />
                <span>Usporedi</span>
              </Link>
              <Link 
                href="/blog" 
                className="text-slate-300 hover:text-white transition py-2"
                data-testid="link-blog-mobile"
                onClick={closeMobileMenu}
              >
                Blog
              </Link>
              <Link 
                href="/kontakt" 
                className="text-slate-300 hover:text-white transition py-2"
                data-testid="link-contact-mobile"
                onClick={closeMobileMenu}
              >
                Kontakt
              </Link>
              <Link 
                href="/o-nama" 
                className="text-slate-300 hover:text-white transition py-2"
                data-testid="link-about-mobile"
                onClick={closeMobileMenu}
              >
                O nama
              </Link>

              {user ? (
                <>
                  {user.role === "admin" && (
                    <Link 
                      href="/admin" 
                      className="text-blue-400 hover:text-blue-300 transition font-medium py-2"
                      data-testid="link-admin-mobile"
                      onClick={closeMobileMenu}
                    >
                      Admin
                    </Link>
                  )}
                  <div className="flex items-center justify-between py-2 border-t border-slate-800 pt-4">
                    <span className="text-slate-400 text-sm">{user.name}</span>
                    <button
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="flex items-center gap-2 text-slate-400 hover:text-white transition"
                      data-testid="button-logout-mobile"
                      aria-label="Odjava"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Odjava</span>
                    </button>
                  </div>
                </>
              ) : (
                <Link 
                  href="/prijava" 
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition py-2"
                  data-testid="link-login-mobile"
                  onClick={closeMobileMenu}
                >
                  <UserCircle className="w-5 h-5" />
                  <span>Prijava</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
