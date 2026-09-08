import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import NirikshanLogo from "./NirikshanLogo";

export default function Layout() {
  const { operator, switchOperator } = useAuth();
  const location = useLocation();

  const nav = [
    { to: "/", label: "Surveillance Dashboard" },
    { to: "/capture", label: "Capture Test" },
    { to: "/tests", label: "Evidence Register" },
    { to: "/reference-card", label: "Calibration Standard" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          {/* Brand & Nav */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <NirikshanLogo size={36} className="shrink-0" />
              <div>
                <span className="text-sm font-bold text-slate-100 block">
                  Nirikshan
                </span>
                <span className="text-[10px] text-emerald-400 font-mono block">
                  Forensic Colorimetric Companion
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex gap-1">
              {nav.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Status & User */}
          <div className="flex items-center gap-3">
            {/* Quick Capture Action */}
            <Link
              to="/capture"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              <span className="hidden sm:inline">New Field Test</span>
            </Link>

            {/* Live API indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              API: 8000 OK
            </div>

            {/* Officer Profile & Switch Button */}
            <div className="flex items-center gap-3 border-l border-slate-800 pl-4 text-xs">
              <div className="text-right hidden sm:block">
                <span className="font-semibold text-slate-200 block">
                  {operator?.name || "Operating Officer"}
                </span>
                <span className="font-mono text-[10px] text-emerald-400 block">
                  {operator?.badge_id || "OFF-001"}
                </span>
              </div>

              <button
                onClick={switchOperator}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-md text-xs font-medium transition-colors"
                title="Switch active operating officer"
              >
                Switch Operator
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden border-t border-slate-800 px-4 py-1.5 gap-2 overflow-x-auto">
          {nav.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300 font-bold"
                    : "text-slate-400"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 px-4 text-center text-xs text-slate-400 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <p>
            Nirikshan | Forensic Colorimetric Companion
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Presumptive screening result — confirmatory laboratory analysis required
          </p>
        </div>
      </footer>
    </div>
  );
}

export function ProtectedRoute() {
  const { token, operator } = useAuth();
  if (!token && !operator) return <Navigate to="/login" replace />;
  return <Layout />;
}
