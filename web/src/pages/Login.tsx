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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center px-4 py-8">
      <div className="w-full max-w-lg my-auto">
        {/* Brand Shield & Header */}
        <div className="text-center mb-6">
          <NirikshanLogo size={68} className="mx-auto mb-3" />
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
