"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-12 bg-red-500/5 border border-red-500/20 rounded-lg min-h-[300px]">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4 animate-pulse" />
          <h2 className="text-xl font-bold text-white mb-2">Erreur d'Application</h2>
          <p className="text-slate-400 text-sm mb-6 text-center max-w-md">
            Une exception s'est produite dans ce composant. 
            Code: <span className="font-mono text-red-400">{this.state.error?.message}</span>
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-full text-white text-xs font-bold transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            REDÉMARRER L'INTERFACE
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
