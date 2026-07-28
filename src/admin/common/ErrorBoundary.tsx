import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  moduleName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[ErrorBoundary - ${this.props.moduleName || 'Admin'}]`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 p-6 text-stone-200" style={{ fontFamily: 'Inter, sans-serif' }}>
          <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 font-bold text-xl">
              ⚠️
            </div>
            <h2 className="text-amber-400 font-bold text-lg">
              Errore nel modulo {this.props.moduleName ? `"${this.props.moduleName}"` : 'Amministrativo'}
            </h2>
            <p className="text-xs text-stone-400 font-medium leading-relaxed">
              Si è verificato un problema durante il rendering. È possibile ricaricare la pagina o tornare al Bivio di selezione reparto.
            </p>
            <div className="bg-stone-950/80 border border-stone-850 p-4 rounded-xl text-left overflow-auto max-h-[160px]">
              <code className="text-red-400 text-[10px] whitespace-pre-wrap break-words">
                {this.state.error?.toString() || 'Errore sconosciuto'}
              </code>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex-1 py-2.5 bg-stone-800 text-stone-200 border border-stone-700 hover:border-stone-500 rounded-xl text-xs uppercase tracking-wider font-extrabold cursor-pointer transition-all"
              >
                Riprova
              </button>
              <button
                onClick={() => window.location.href = '/admin'}
                className="flex-1 py-2.5 bg-emerald-800 text-white hover:bg-emerald-700 rounded-xl text-xs uppercase tracking-wider font-extrabold cursor-pointer transition-all"
              >
                Torna al Bivio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
