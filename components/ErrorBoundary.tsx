import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-brand-black p-8 text-center font-sans">
          <div className="bg-white p-6 rounded-full shadow-xl mb-6 animate-bounce">
             <AlertTriangle size={48} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight mb-2">Algo salió mal</h1>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto font-medium">
            La aplicación ha encontrado un error inesperado al intentar renderizar la vista.
          </p>
          
          <div className="bg-red-50 border border-red-100 p-4 rounded-lg mb-8 max-w-sm w-full overflow-hidden text-left">
             <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Detalle del error:</p>
             <p className="text-[11px] font-mono text-red-600 break-words leading-tight">
                 {this.state.error?.message || "Error desconocido"}
             </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 bg-brand-black text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-transform hover:bg-gray-800"
          >
            <RefreshCw size={16} />
            <span>Reiniciar Aplicación</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}