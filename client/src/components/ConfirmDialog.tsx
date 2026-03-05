import { useState, useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  /** If set, user must type this exact text to enable confirm */
  typeToConfirm?: string;
  isPending?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Potvrdi",
  cancelLabel = "Odustani",
  variant = "danger",
  typeToConfirm,
  isPending = false,
}: ConfirmDialogProps) {
  const [typedText, setTypedText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTypedText("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const canConfirm = typeToConfirm ? typedText === typeToConfirm : true;

  const variantStyles = {
    danger: {
      icon: "text-red-400",
      button: "bg-red-600 hover:bg-red-700 disabled:bg-red-800",
      border: "border-red-500/30",
      bg: "bg-red-900/20",
    },
    warning: {
      icon: "text-yellow-400",
      button: "bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800",
      border: "border-yellow-500/30",
      bg: "bg-yellow-900/20",
    },
    default: {
      icon: "text-blue-400",
      button: "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800",
      border: "border-blue-500/30",
      bg: "bg-blue-900/20",
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className={`relative bg-slate-800 rounded-xl border ${style.border} shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95`}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
          aria-label="Zatvori"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-full ${style.bg} shrink-0`}>
            <AlertTriangle className={`w-6 h-6 ${style.icon}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{description}</p>

            {typeToConfirm && (
              <div className="mt-4">
                <p className="text-xs text-slate-400 mb-2">
                  Upišite <span className="font-mono font-bold text-red-400">"{typeToConfirm}"</span> za potvrdu:
                </p>
                <input
                  ref={inputRef}
                  type="text"
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  placeholder={typeToConfirm}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 font-mono"
                  autoComplete="off"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={!canConfirm || isPending}
            className={`px-4 py-2 text-white keep-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${style.button}`}
          >
            {isPending ? "Učitavam..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
