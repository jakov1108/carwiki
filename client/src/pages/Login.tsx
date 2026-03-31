import { useState } from "react";
import { useAuth } from "../lib/auth";
import { authClient } from "../lib/auth-client";
import { useLocation, Link } from "wouter";
import { LogIn } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showResendLink, setShowResendLink] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  const emailError = !email.trim() ? "Email je obavezan" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Unesite ispravnu email adresu" : "";
  const passwordError = !password ? "Lozinka je obavezna" : password.length < 6 ? "Lozinka mora imati najmanje 6 znakova" : "";

  const isFormValid = !emailError && !passwordError;

  const fieldClass = (fieldError: string, field: string) =>
    `w-full bg-slate-900 border rounded-lg px-4 py-2 focus:outline-none transition ${
      touched[field] && fieldError
        ? "border-red-500 focus:border-red-400"
        : touched[field] && !fieldError
          ? "border-green-600 focus:border-green-500"
          : "border-slate-700 focus:border-blue-500"
    }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isFormValid) return;
    setError("");
    setShowResendLink(false);
    setResendSuccess(false);
    try {
      await login(email, password);
      setLocation("/");
    } catch (err: any) {
      const msg = err.message || "Prijava neuspješna";
      if (msg.includes("Invalid") || msg.includes("invalid") || msg.includes("credentials")) {
        setError("Neispravna email adresa ili lozinka. Provjerite podatke i pokušajte ponovno.");
      } else if (msg.includes("not found") || msg.includes("No user")) {
        setError("Ne postoji račun s ovom email adresom. Možda se trebate registrirati?");
      } else if (msg.includes("Email not verified") || msg.includes("not verified")) {
        setError("Email adresa nije verificirana. Provjerite svoju poštu i potvrdite email prije prijave.");
        setShowResendLink(true);
      } else {
        setError(msg);
      }
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendSuccess(false);
    try {
      const response = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendSuccess(true);
        setError("Verification email poslan! Provjerite svoju poštu.");
        setShowResendLink(false);
      } else {
        setError("Greška prilikom slanja emaila. Pokušajte kasnije.");
      }
    } catch (error) {
      setError("Greška prilikom slanja emaila. Pokušajte kasnije.");
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err: any) {
      setError("Google prijava nije uspjela. Pokušajte ponovno.");
      setIsGoogleLoading(false);
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
            <p className="text-xs text-slate-500 mt-2">
              Prijavljeni korisnici mogu predlagati nove automobile, pratiti status prijedloga i pristupiti svom dashboardu.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-100 border border-red-500 text-red-800 px-4 py-3 rounded dark:bg-red-900/50 dark:border-red-700 dark:text-red-300">
              <p>{error}</p>
              {showResendLink && (
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="mt-3 text-sm underline hover:no-underline disabled:opacity-50"
                >
                  {isResending ? "Slanje..." : "Pošalji verification email ponovno"}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full bg-white hover:bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-3 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FcGoogle className="w-5 h-5" />
              <span>{isGoogleLoading ? "Prijava..." : "Nastavi s Google računom"}</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800 text-slate-400">ili</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => markTouched("email")}
                className={fieldClass(emailError, "email")}
              />
              {touched.email && emailError && (
                <p className="text-red-400 text-xs mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Lozinka</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => markTouched("password")}
                className={fieldClass(passwordError, "password")}
              />
              {touched.password && passwordError && (
                <p className="text-red-400 text-xs mt-1">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white keep-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2"
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
