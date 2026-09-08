import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOperators } from "../services/api";
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center px-4 py-8">
      <div className="w-full max-w-lg my-auto">
        {/* Brand Shield & Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Nirikshan
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono text-emerald-400">
            Forensic Intelligence & Presumptive Seizure Registry
          </p>
        </div>

        {/* Operator Selection Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Select Operating Officer</h2>
              <p className="text-xs text-slate-400">Choose badge profile for cryptographic attribution</p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              Terminal Active
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Loading officer roster...</p>
            </div>
          ) : operators.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No operators configured in registry database.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {operators.map((op) => (
                <button
                  key={op.id}
                  onClick={() => handleSelect(op)}
                  className="w-full text-left p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-800/60 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {op.badge_id}
                      </span>
                      <span className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                        {op.name}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block capitalize">
                      {op.role || "Field Officer"}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 group-hover:text-emerald-400 font-medium px-2 py-1 rounded bg-slate-900 border border-slate-800 group-hover:border-emerald-500/40 transition-colors shrink-0">
                    Select
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Statutory plain-language notice */}
      <div className="max-w-md text-center space-y-1">
        <p className="text-xs text-slate-400 font-medium">
          Presumptive screening result — confirmatory laboratory analysis required
        </p>
        <p className="text-[11px] text-slate-600">
          Cryptographic chain of custody permanently seals operator badge and location in forensic ledger.
        </p>
      </div>
    </div>
  );
}
