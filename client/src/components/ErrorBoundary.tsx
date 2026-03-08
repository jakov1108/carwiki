import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
          <div className="max-w-md text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-900/30 rounded-full border border-red-500/30">
                <AlertTriangle className="w-12 h-12 text-red-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Nešto je pošlo po zlu</h1>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Došlo je do neočekivane greške. Pokušajte osvježiti stranicu ili se
              vratite na početnu stranicu.
            </p>
            {this.state.error && (
              <p className="text-xs text-slate-600 mb-6 font-mono bg-slate-900 rounded-lg p-3 text-left break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition"
              >
                <RotateCcw className="w-4 h-4" />
                Osvježi stranicu
              </button>
              <a
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition"
              >
                <Home className="w-4 h-4" />
                Početna
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
