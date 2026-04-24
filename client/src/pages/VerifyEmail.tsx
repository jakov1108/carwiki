import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmail() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      
      if (!token) {
        setStatus("error");
        setMessage("Nevažeći link za verifikaciju");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          setStatus("success");
          setMessage("Email uspješno verificiran! Preusmjeravanje...");
          setTimeout(() => setLocation("/?verified=success"), 2000);
        } else {
          const data = await response.json();
          setStatus("error");
          setMessage(data.message || "Verifikacija nije uspjela");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Došlo je do greške");
      }
    };

    verifyEmail();
  }, [searchParams, setLocation]);

  return (
    <div className="min-h-screen py-12 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-400" />
              <h1 className="text-2xl font-bold mb-2">Verificiranje emaila...</h1>
              <p className="text-slate-400">Molimo pričekajte</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <h1 className="text-2xl font-bold mb-2 text-green-400">Uspješno!</h1>
              <p className="text-slate-400">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h1 className="text-2xl font-bold mb-2 text-red-400">Greška</h1>
              <p className="text-slate-400 mb-6">{message}</p>
              <button
                onClick={() => setLocation("/")}
                className="bg-blue-600 hover:bg-blue-700 text-white keep-white px-6 py-2 rounded-lg transition"
              >
                Povratak na početnu
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
