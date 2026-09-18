import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ResultBadge from "../components/ResultBadge";
import LocationCard from "../components/MapView";
import { getStats, getTests } from "../services/api";
import type { DashboardStats, TestRecord } from "../types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTests, setRecentTests] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getStats().catch(() => null),
      getTests({ page: 1, page_size: 10 }).catch(() => ({ items: [], total: 0 })),
    ])
      .then(([statsData, testsData]) => {
        setStats(statsData);
        setRecentTests(testsData.items);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-xs font-mono">
            Syncing forensic field telemetry...
          </p>
        </div>
      </div>
    );
  }

  const total = stats?.total_tests ?? 0;
  const positive = stats?.positive_count ?? 0;
  const negative = stats?.negative_count ?? 0;
  const inconclusive = stats?.inconclusive_count ?? 0;
  const today = stats?.tests_today ?? 0;
  const positivityRate = total > 0 ? ((positive / total) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Launch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-600">
              Live Field Surveillance
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            Field Evidence Register
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Real-time presumptive colorimetric drug analysis with SHA-256 HMAC cryptographic chain of custody.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/capture"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition tactile-btn touch-target flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            <span>New field test</span>
          </Link>
          <Link
            to="/tests"
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition tactile-btn touch-target shadow-xs"
          >
            All records ({total})
          </Link>
        </div>
      </div>

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analyzed Hero Card */}
        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs cascade-stagger-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Total evidence tests
            </span>
            <span className="text-[11px] font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
              Sealed
            </span>
          </div>
          <div className="my-3">
            <span className="text-3xl sm:text-4xl font-mono font-bold text-slate-900 tracking-tight">
              {total}
            </span>
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100 font-mono">
            <span>Today's seizures</span>
            <span className="text-emerald-600 font-bold">+{today}</span>
          </div>
        </div>

        {/* Positives */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs cascade-stagger-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-700">
              Presumptive positive
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <div className="my-3">
            <span className="text-3xl sm:text-4xl font-mono font-bold text-rose-600 tracking-tight">
              {positive}
            </span>
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100 font-mono">
            <span>Positivity ratio</span>
            <span className="text-rose-600 font-bold">{positivityRate}%</span>
          </div>
        </div>

        {/* Negatives */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs cascade-stagger-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-700">
              Presumptive negative
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="my-3">
            <span className="text-3xl sm:text-4xl font-mono font-bold text-emerald-600 tracking-tight">
              {negative}
            </span>
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100 font-mono">
            <span>Substance excluded</span>
            <span className="text-emerald-700 font-semibold">Clear</span>
          </div>
        </div>

        {/* Inconclusive */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs cascade-stagger-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">
              Inconclusive
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="my-3">
            <span className="text-3xl sm:text-4xl font-mono font-bold text-amber-700 tracking-tight">
              {inconclusive}
            </span>
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100 font-mono">
            <span>Confirmatory lab</span>
            <span className="text-amber-700 font-semibold">Required</span>
          </div>
        </div>
      </div>

      {/* Field Seizure Geolocation Intelligence */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">
              Field incident geolocations
            </h2>
            <p className="text-xs text-slate-500">
              Active GPS coordinates bound to evidence photos at the moment of field capture.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Positive
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Negative
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Inconclusive
            </span>
          </div>
        </div>

        <LocationCard tests={recentTests} />
      </div>

      {/* Recent Field Submissions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">
              Recent evidence dossiers
            </h2>
            <p className="text-xs text-slate-500">
              Cryptographically verified field captures awaiting confirmatory laboratory analysis.
            </p>
          </div>
          <Link
            to="/tests"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition tactile-btn touch-target flex items-center gap-1"
          >
            <span>Full register ({total})</span>
            <span>→</span>
          </Link>
        </div>

        {recentTests.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-medium">
            No evidence samples recorded yet. Click "New field test" to perform your first capture.
          </div>
        ) : (
          <>
            {/* Mobile View: High-Density Evidence Cards (< 768px) */}
            <div className="block md:hidden space-y-3">
              {recentTests.map((t) => {
                const swatch = t.classification_details?.corrected_swatch_rgb as number[] | undefined;
                const swatchBg = swatch
                  ? `rgb(${swatch[0]}, ${swatch[1]}, ${swatch[2]})`
                  : "#e2e8f0";

                return (
                  <Link
                    key={t.id}
                    to={`/tests/${t.id}`}
                    className="block bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg p-3.5 tactile-btn transition-colors shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-4 h-4 rounded border border-slate-300 shrink-0"
                          style={{ backgroundColor: swatchBg }}
                        />
                        <span className="font-semibold text-xs text-slate-800 truncate">
                          {t.kit_type_name || "Reagent Kit"}
                        </span>
                      </div>
                      <ResultBadge result={t.result} size="sm" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/80 font-mono">
                      <div>
                        <span className="font-semibold text-slate-700">{t.operator_badge_id || "OFF"}</span>
                        <span className="text-slate-400 mx-1.5">·</span>
                        <span>{new Date(t.captured_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-700 font-semibold">
                        <span>{(t.confidence * 100).toFixed(0)}% match</span>
                        <span>→</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Desktop View: Full Tabular Overview (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-left bg-slate-50/50">
                    <th className="px-4 py-3 font-semibold">Reaction swatch</th>
                    <th className="px-4 py-3 font-semibold">Timestamp</th>
                    <th className="px-4 py-3 font-semibold">Reagent kit</th>
                    <th className="px-4 py-3 font-semibold">Operator</th>
                    <th className="px-4 py-3 font-semibold">Outcome</th>
                    <th className="px-4 py-3 font-semibold">Confidence</th>
                    <th className="px-4 py-3 font-semibold">Geo lock</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTests.map((t) => {
                    const swatch = t.classification_details?.corrected_swatch_rgb as number[] | undefined;
                    const swatchBg = swatch
                      ? `rgb(${swatch[0]}, ${swatch[1]}, ${swatch[2]})`
                      : "#cbd5e1";

                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 rounded border border-slate-300 inline-block shrink-0"
                              style={{ backgroundColor: swatchBg }}
                              title={swatch ? `RGB: ${swatch.join(",")}` : "Unknown"}
                            />
                            <span className="font-mono text-[11px] text-slate-500">
                              {swatch ? `${swatch[0]}, ${swatch[1]}, ${swatch[2]}` : "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700">
                          {new Date(t.captured_at).toLocaleDateString()} {new Date(t.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {t.kit_type_name || "Reagent Kit"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          <span className="font-mono font-medium text-slate-900">{t.operator_badge_id}</span>
                          {t.operator_name && <span className="text-slate-500 text-[11px] block">{t.operator_name}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <ResultBadge result={t.result} size="sm" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <div
                                className="h-full bg-slate-900 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(10, t.confidence * 100))}%` }}
                              />
                            </div>
                            <span className="font-mono text-slate-700 font-semibold">
                              {(t.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          <span className={`px-2 py-0.5 rounded font-semibold ${
                            t.location_verified
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {t.location_verified ? "GPS lock" : "Network IP"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to={`/tests/${t.id}`}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium transition inline-block text-xs"
                          >
                            Open dossier
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
