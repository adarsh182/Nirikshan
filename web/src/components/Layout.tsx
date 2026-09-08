import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NirikshanLogo from "./NirikshanLogo";

export default function Layout() {
  const { operator, switchOperator } = useAuth();
  const location = useLocation();

  const navItems = [
    {
      to: "/",
      label: "Dashboard",
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${active ? "text-sky-600" : "text-slate-500"}`}>
          <path d="M2 4.25A2.25 2.25 0 0 1 4.25 2h11.5A2.25 2.25 0 0 1 18 4.25v2a.75.75 0 0 1-.75.75H2.75A.75.75 0 0 1 2 6.25v-2ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 .75.75v5.75A2.25 2.25 0 0 1 15.75 18H4.25A2.25 2.25 0 0 1 2 15.75V10Z" />
        </svg>
      ),
    },
    {
      to: "/capture",
      label: "Capture",
      isPrimary: true,
      icon: (_active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white">
          <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
        </svg>
      ),
    },
    {
      to: "/tests",
      label: "Evidence",
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${active ? "text-sky-600" : "text-slate-500"}`}>
          <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      to: "/reference-card",
      label: "Standards",
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${active ? "text-sky-600" : "text-slate-500"}`}>
          <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2Zm0 13a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15Zm-6-5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 4 10Zm10 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 14 10Z" />
          <path fillRule="evenodd" d="M10 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm-3.5 5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white font-sans antialiased">
      {/* Top Tactical Status Bar - Clean Daylight Mode */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 print:hidden safe-top shadow-xs">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 flex items-center justify-between">
          {/* Brand & Wordmark */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 tactile-btn group">
              <NirikshanLogo size={32} className="shrink-0 group-hover:scale-105 transition-transform" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tracking-tight text-slate-900 font-mono">
                    NIRIKSHAN
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-1.5 py-0.2 bg-sky-50 text-sky-700 border border-sky-200 rounded font-semibold">
                    SECURE-FTC
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono block tracking-wide">
                  Field Drug Test Companion
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 ml-6 border-l border-slate-200 pl-6">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors tactile-btn ${
                      isActive
                        ? "bg-slate-100 text-sky-700 font-semibold border border-slate-200 shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Status & Officer Profile */}
          <div className="flex items-center gap-2.5">
            {/* Live Telemetry Ping */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden xs:inline text-slate-500">REGISTRY:</span>
              <span className="text-emerald-700 font-semibold">LIVE</span>
            </div>

            {/* Officer Badge Identifier */}
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <div className="text-right leading-tight">
                <span className="font-semibold text-slate-800 block truncate max-w-[100px] sm:max-w-none text-[11px] sm:text-xs">
                  {operator?.name?.split(" ")[0] || "Officer"}
                </span>
                <span className="font-mono text-[10px] text-sky-700 block tracking-wider font-semibold">
                  {operator?.badge_id || "OFF-001"}
                </span>
              </div>

              <button
                onClick={switchOperator}
                className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded transition-colors tactile-btn"
                title="Switch active operating officer"
                aria-label="Switch operator"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0-.75.75v4.482a.75.75 0 0 0 1.5 0v-2.072l.332.331a7 7 0 0 0 11.712-3.136.75.75 0 0 0-1.232-.51Zm1.938-2.848a.75.75 0 0 0-1.232-.51 5.5 5.5 0 0 1-9.201-2.466l-.312.311h2.433a.75.75 0 0 0 0-1.5H4.5a.75.75 0 0 0-.75.75v4.482a.75.75 0 0 0 1.5 0V7.471l.332-.331a7 7 0 0 0 11.712 3.136Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - padded for mobile thumb dock */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6 pb-24 md:pb-10">
        <Outlet />
      </main>

      {/* Mobile-First Ergonomic Thumb-Zone Bottom Dock (< 768px) - Clean Light Mode */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 safe-bottom print:hidden shadow-lg"
      >
        <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;

            if (item.isPrimary) {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center justify-center -mt-5 group tactile-btn"
                  aria-label="Launch Test Capture"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center shadow-md shadow-sky-500/30 border-2 border-white group-active:scale-95 transition-transform">
                    {item.icon(isActive)}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-sky-700 mt-1 uppercase tracking-wider">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center h-full touch-target transition-colors tactile-btn ${
                  isActive ? "text-sky-700" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <div className="relative">
                  {item.icon(isActive)}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-sky-600 rounded-full" />
                  )}
                </div>
                <span className={`text-[10px] font-mono tracking-wider mt-1 whitespace-nowrap ${isActive ? "font-bold text-sky-700" : "text-slate-500"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Footer */}
      <footer className="hidden md:block border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-slate-600">
            NIRIKSHAN FTC · LAW ENFORCEMENT COLORIMETRIC VERIFICATION
          </p>
          <p className="text-[11px] text-slate-500">
            Presumptive field screening indicator — strictly requires laboratory confirmation
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
