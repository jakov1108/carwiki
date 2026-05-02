import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = `t-${++counterRef.current}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const success = useCallback((message: string) => toast(message, "success"), [toast]);
  const error = useCallback((message: string) => toast(message, "error"), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-20 left-1/2 z-[200] flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // trigger enter animation
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const icons = {
    success: <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-green-400 shrink-0" />,
    error: <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-yellow-400 shrink-0" />,
    info: <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />,
  };

  const variants = {
    success: "bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-emerald-950/10 dark:bg-slate-900/95 dark:border-green-500/40 dark:text-white dark:shadow-black/30",
    error: "bg-red-50/95 border-red-300 text-red-950 shadow-red-950/10 dark:bg-slate-900/95 dark:border-red-500/40 dark:text-white dark:shadow-black/30",
    warning: "bg-amber-50/95 border-amber-300 text-amber-950 shadow-amber-950/10 dark:bg-slate-900/95 dark:border-yellow-500/40 dark:text-white dark:shadow-black/30",
    info: "bg-blue-50/95 border-blue-300 text-blue-950 shadow-blue-950/10 dark:bg-slate-900/95 dark:border-blue-500/40 dark:text-white dark:shadow-black/30",
  };

  return (
    <div
      className={`pointer-events-auto flex min-h-16 w-full items-center gap-4 border rounded-xl px-5 py-4 shadow-2xl backdrop-blur transition-all duration-300 ${variants[toast.type]} ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95"}`}
    >
      {icons[toast.type]}
      <p className="text-base sm:text-lg font-medium flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded transition"
        aria-label="Zatvori poruku"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
