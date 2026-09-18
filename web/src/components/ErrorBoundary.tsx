import React, { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Nirikshan Forensic UI Error caught:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-lg">
                !
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  {this.props.fallbackTitle || "System Interface Alert"}
                </h2>
                <p className="text-xs text-slate-400">Forensic terminal caught a rendering exception.</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs font-mono text-red-300 overflow-x-auto max-h-32">
              {this.state.error?.message || "An unexpected UI error occurred."}
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 min-h-[44px] px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                Reload Application
              </button>
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-300 font-medium rounded-lg text-sm transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
