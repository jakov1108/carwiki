import { useState } from "react";
import { useAuth } from "../lib/auth";
import { Mail, CheckCircle, AlertCircle, X } from "lucide-react";

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!user || user.emailVerified || isDismissed) {
    return null;
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    setShowSuccess(false);
    setShowError(false);

    try {
      const response = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email: user.email }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        setShowError(true);
      }
    } catch (error) {
      setShowError(true);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-yellow-100 border-b border-yellow-400 dark:bg-yellow-900/50 dark:border-yellow-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Mail className="w-5 h-5 text-yellow-700 dark:text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                <strong>Email nije verificiran.</strong> Molimo provjerite svoju email poštu i potvrdite adresu.
              </p>
              {showSuccess && (
                <p className="text-xs text-green-700 dark:text-green-300 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Email poslan! Provjerite svoju poštu.
                </p>
              )}
              {showError && (
                <p className="text-xs text-red-700 dark:text-red-300 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Greška prilikom slanja. Pokušajte kasnije.
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isResending ? "Slanje..." : "Pošalji ponovno"}
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-yellow-700 hover:text-yellow-900 dark:text-yellow-300 dark:hover:text-yellow-100 transition"
              aria-label="Zatvori"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
