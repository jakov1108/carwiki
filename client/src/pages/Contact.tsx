import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  const nameError = !formData.name.trim() ? "Ime je obavezno" : "";
  const emailError = !formData.email.trim() ? "Email je obavezan" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? "Unesite ispravnu email adresu" : "";
  const messageError = !formData.message.trim() ? "Poruka je obavezna" : formData.message.trim().length < 10 ? "Poruka mora imati barem 10 znakova" : "";

  const isFormValid = !nameError && !emailError && !messageError;

  const fieldClass = (fieldError: string, field: string) =>
    `w-full bg-slate-900 border rounded-lg px-4 py-2 focus:outline-none transition ${
      touched[field] && fieldError
        ? "border-red-500 focus:border-red-400"
        : touched[field] && !fieldError
          ? "border-green-600 focus:border-green-500"
          : "border-slate-700 focus:border-blue-500"
    }`;

  const sendMessage = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
      setTouched({});
      setTimeout(() => setSuccess(false), 5000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (!isFormValid) return;
    sendMessage.mutate(formData);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="pb-1 text-4xl font-bold leading-tight mb-8 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Kontaktirajte Nas
        </h1>

        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          {success && (
            <div className="mb-6 bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded">
              Poruka uspješno poslana! Javit ćemo vam se uskoro.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label className="block text-sm font-medium mb-2">Ime i prezime</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={() => markTouched("name")}
                className={fieldClass(nameError, "name")}
              />
              {touched.name && nameError && (
                <p className="text-red-400 text-xs mt-1">{nameError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() => markTouched("email")}
                className={fieldClass(emailError, "email")}
              />
              {touched.email && emailError && (
                <p className="text-red-400 text-xs mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Poruka</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                onBlur={() => markTouched("message")}
                rows={6}
                className={fieldClass(messageError, "message")}
              />
              {touched.message && messageError && (
                <p className="text-red-400 text-xs mt-1">{messageError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={sendMessage.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white keep-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>{sendMessage.isPending ? "Šaljem..." : "Pošalji Poruku"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
