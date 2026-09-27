/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: cobalt · design-system: design.md · designed-as-app */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOperators } from "../services/api";
import NirikshanLogo from "../components/NirikshanLogo";
import type { Operator } from "../types";

export default function LoginPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { selectOperator } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getOperators()
      .then((ops) => {
        setOperators(ops);
      })
      .catch((err) => {
        console.error("Failed to load operator roster:", err);
        setError("Unable to connect to registry backend. Ensure service is operational.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (op: Operator) => {
    selectOperator(op);
    navigate("/");
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col justify-between items-center px-4 py-8 safe-top safe-bottom selection:bg-sky-500 selection:text-white">
      <div className="w-full max-w-md my-auto space-y-6">
        {/* Brand Shield & Title */}
        <div className="text-center space-y-2">
          <NirikshanLogo size={64} className="mx-auto drop-shadow-sm hover:scale-105 transition-transform" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-display">
            NIRIKSHAN
          </h1>
          <p className="text-xs text-sky-700 font-mono tracking-wider uppercase font-semibold">
            Forensic Colorimetric Field Companion
          </p>
        </div>

        {/* Operator Selection Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold font-display text-slate-900 tracking-tight">
                Operating officer sign-in
              </h2>
              <p className="text-[11px] text-slate-500">Select badge profile for cryptographic attribution</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold shadow-2xs">
              TERMINAL READY
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2 font-mono">
              <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p>LOADING OFFICER ROSTER...</p>
            </div>
          ) : operators.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-mono">
              NO OPERATORS FOUND IN DATABASE.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {operators.map((op) => (
                <button
                  key={op.id}
                  onClick={() => handleSelect(op)}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-sky-300 hover:bg-sky-50/40 active:bg-sky-100/50 transition-all duration-150 flex items-center justify-between gap-3 group tactile-btn touch-target shadow-2xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100/90 px-1.5 py-0.5 rounded-md border border-sky-200/80">
                        {op.badge_id}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-sky-800 transition-colors truncate">
                        {op.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block capitalize font-mono">
                      {op.role || "Field Narcotics Officer"}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 px-2.5 py-1 rounded-lg group-hover:shadow-xs transition-all shrink-0 shadow-2xs">
                    <span>Authenticate</span>
                    <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Statutory Legal Notice */}
      <div className="max-w-md text-center space-y-1">
        <p className="text-[11px] text-slate-500 font-medium">
          Presumptive screening result — confirmatory laboratory analysis required
        </p>
        <p className="text-[10px] text-slate-400 font-mono">
          Cryptographic chain of custody permanently binds operator badge and location to evidence photos.
        </p>
      </div>
    </div>
  );
}
