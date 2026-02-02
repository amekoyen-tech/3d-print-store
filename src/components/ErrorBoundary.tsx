import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
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
      return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-[#111] border border-red-500/30 p-8 rounded-3xl text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight mb-4">
              系統發生錯誤<br />
              <span className="text-[#FF5722]">(SYSTEM ERROR)</span>
            </h1>
            <p className="text-gray-400 font-mono text-xs mb-8 leading-relaxed">
              {this.state.error?.message || "未知錯誤，請嘗試重新整理。"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#FF5722] text-black font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-[#E64A19] transition-colors"
            >
              <RefreshCcw size={18} /> 重新整理 (RELOAD)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
