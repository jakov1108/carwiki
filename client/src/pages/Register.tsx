import { useState } from "react";
import { useAuth } from "../lib/auth";
import { useLocation, Link } from "wouter";
import { UserPlus } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(email, password, name);
      setLocation("/");
    } catch (err: any) {
      const msg = err.message || "Registracija neuspješna";
      if (msg.includes("already") || msg.includes("exists") || msg.includes("duplicate")) {
        setError("Račun s ovom email adresom već postoji. Pokušajte se prijaviti.");
      } else if (msg.includes("password") || msg.includes("short")) {
        setError("Lozinka mora imati najmanje 6 znakova.");
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Registracija
            </h1>
            <p className="text-slate-400">Stvorite novi račun</p>
            <p className="text-xs text-slate-500 mt-2">
              Registracijom dobivate mogućnost predlaganja novih automobila u našu bazu i praćenja statusa vaših prijedloga.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Ime</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Lozinka</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              {/* Password strength meter */}
              {password.length > 0 && (() => {
                let strength = 0;
                if (password.length >= 6) strength++;
                if (password.length >= 10) strength++;
                if (/[A-Z]/.test(password)) strength++;
                if (/[0-9]/.test(password)) strength++;
                if (/[^A-Za-z0-9]/.test(password)) strength++;
                const label = strength <= 1 ? "Slaba" : strength <= 3 ? "Srednja" : "Jaka";
                const color = strength <= 1 ? "bg-red-500" : strength <= 3 ? "bg-yellow-500" : "bg-green-500";
                const textColor = strength <= 1 ? "text-red-400" : strength <= 3 ? "text-yellow-400" : "text-green-400";
                const width = `${Math.min(100, strength * 20)}%`;
                return (
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${color}`}
                        style={{ width }}
                      />
                    </div>
                    <p className={`text-xs mt-1 ${textColor}`}>Jačina lozinke: {label}</p>
                  </div>
                );
              })()}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white keep-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Registriraj se</span>
            </button>
          </form>

          <div className="mt-6 text-center text-slate-400">
            <p>
              Već imate račun?{" "}
              <Link href="/prijava" className="text-blue-400 hover:text-blue-300" data-testid="link-login">
                Prijavite se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
