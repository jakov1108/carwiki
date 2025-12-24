import { useState } from "react";
import { useAuth } from "../lib/auth";
import { useLocation, Link } from "wouter";
import { LogIn } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      setLocation("/");
    } catch (err: any) {
      setError(err.message || "Prijava neuspješna");
    }
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Prijava
            </h1>
            <p className="text-slate-400">Prijavite se na svoj račun</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2"
            >
              <LogIn className="w-5 h-5" />
              <span>Prijavi se</span>
            </button>
          </form>

          <div className="mt-6 text-center text-slate-400">
            <p>
              Nemate račun?{" "}
              <Link href="/registracija" className="text-blue-400 hover:text-blue-300" data-testid="link-register">
                Registrirajte se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
