import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";
import { Car, Menu, X, LogOut, UserCircle, Scale, PlusCircle, Sun, Moon, Search } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  const submitSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/automobili?q=${encodeURIComponent(q)}`);
    closeSearch();
    closeMobileMenu();
  }, [searchQuery, navigate, closeSearch]);

  // "/" key shortcut: focus search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        openSearch();
      }
      if (e.key === "Escape" && searchOpen) closeSearch();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [openSearch, closeSearch, searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        closeMobileMenu();
        closeSearch();
      }
    };
    if (mobileMenuOpen || searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [mobileMenuOpen, searchOpen, closeSearch]);

  return (
    <nav ref={navRef} className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xl font-bold text-blue-500 hover:text-blue-400 transition"
            data-testid="link-home"
          >
            <Car className="w-6 h-6" />
            <span>Auto Wiki</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Global Search */}
            {searchOpen ? (
              <form onSubmit={submitSearch} className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Pretraži automobile..."
                    className="bg-slate-800 dark:bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder-slate-400 focus:outline-none w-52 transition-all"
                  />
                </div>
                <button type="submit" className="sr-only">Pretraži</button>
                <button type="button" onClick={closeSearch} className="p-1.5 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={openSearch}
                className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-1.5 rounded-md transition-all"
                title="Pretraži (/)" 
                aria-label="Pretraži automobile"
              >
                <Search className="w-4 h-4" />
                <span className="text-xs text-slate-400 font-mono">/</span>
              </button>
            )}
            <Link href="/automobili" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-1.5 rounded-md transition-all" data-testid="link-cars">
              Automobili
            </Link>
            <Link href="/usporedi" className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-1.5 rounded-md transition-all" data-testid="link-compare">
              <Scale className="w-4 h-4" />
              <span>Usporedi</span>
            </Link>
            <Link href="/blog" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-1.5 rounded-md transition-all" data-testid="link-blog">
              Blog
            </Link>
            <Link href="/kontakt" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-1.5 rounded-md transition-all" data-testid="link-contact">
              Kontakt
            </Link>
            <Link href="/o-nama" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-1.5 rounded-md transition-all" data-testid="link-about">
              O nama
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
              aria-label={theme === 'dark' ? 'Uključi svijetli način' : 'Uključi tamni način'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                {user.role !== "admin" && (
                  <Link href="/predlozi-auto" className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/20 px-3 py-1.5 rounded-md transition-all" data-testid="link-submit-car">
                    <PlusCircle className="w-4 h-4" />
                    <span>Dodaj auto</span>
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link href="/admin" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-md transition-all font-medium" data-testid="link-admin">
                    Upravljačka ploča
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 dark:text-slate-400 text-sm">{user.name}</span>
                  <button
                    onClick={() => logout()}
                    className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                    data-testid="button-logout"
                    aria-label="Odjava"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link href="/prijava" className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-md transition-all" data-testid="link-login">
                <UserCircle className="w-5 h-5" />
                <span>Prijava</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
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
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col gap-4">              {/* Mobile Search */}
              <form onSubmit={submitSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Pretraži automobile..."
                  className="w-full bg-slate-800 dark:bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
                />
              </form>              <Link 
                href="/automobili" 
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-2 rounded-md transition-all"
                data-testid="link-cars-mobile"
                onClick={closeMobileMenu}
              >
                Automobili
              </Link>
              <Link 
                href="/usporedi" 
                className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-2 rounded-md transition-all"
                data-testid="link-compare-mobile"
                onClick={closeMobileMenu}
              >
                <Scale className="w-4 h-4" />
                <span>Usporedi</span>
              </Link>
              <Link 
                href="/blog" 
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-2 rounded-md transition-all"
                data-testid="link-blog-mobile"
                onClick={closeMobileMenu}
              >
                Blog
              </Link>
              <Link 
                href="/kontakt" 
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-2 rounded-md transition-all"
                data-testid="link-contact-mobile"
                onClick={closeMobileMenu}
              >
                Kontakt
              </Link>
              <Link 
                href="/o-nama" 
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-2 rounded-md transition-all"
                data-testid="link-about-mobile"
                onClick={closeMobileMenu}
              >
                O nama
              </Link>

              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-2 rounded-md transition-all"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-5 h-5" />
                    <span>Svijetli način</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5" />
                    <span>Tamni način</span>
                  </>
                )}
              </button>

              {user ? (
                <>
                  {user.role !== "admin" && (
                    <Link 
                      href="/predlozi-auto" 
                      className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/20 px-3 py-2 rounded-md transition-all"
                      data-testid="link-submit-car-mobile"
                      onClick={closeMobileMenu}
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Dodaj auto</span>
                    </Link>
                  )}
                  {user.role === "admin" && (
                    <Link 
                      href="/admin" 
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/20 px-3 py-2 rounded-md transition-all font-medium"
                      data-testid="link-admin-mobile"
                      onClick={closeMobileMenu}
                    >
                      Upravljačka ploča
                    </Link>
                  )}
                  <div className="flex items-center justify-between py-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                    <span className="text-slate-400 text-sm">{user.name}</span>
                    <button
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-1.5 rounded-md transition-all"
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
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/20 px-3 py-2 rounded-md transition-all"
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
