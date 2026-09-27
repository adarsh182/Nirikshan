import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ResultBadge from "../components/ResultBadge";
import LocationCard from "../components/MapView";
import DossierButton from "../components/DossierButton";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <span className="text-xs font-semibold text-slate-600">
              Live Field Surveillance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
            Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Real-time presumptive colorimetric drug analysis with SHA-256 HMAC cryptographic chain of custody.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          <Link
            to="/capture"
            className="apple-btn-primary px-4 py-2.5 flex items-center justify-center gap-2 touch-target"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            <span>New field test</span>
          </Link>
        </div>
      </div>

      {/* Telemetry Summary Cards - Responsive 2x2 on Mobile, 4-Col on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 card-container">
        {/* Total Analyzed Hero Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all duration-200 cascade-stagger-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 truncate mr-1">
              Total tests
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-700 bg-slate-100/90 px-1.5 sm:px-2 py-0.5 rounded-md border border-slate-200 font-semibold shrink-0">
              Sealed
            </span>
          </div>
          <div className="my-2 sm:my-3">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-slate-900 tracking-tight tabular-nums">
              {total}
            </span>
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100 font-mono">
            <span className="truncate mr-1">Today's</span>
            <span className="text-emerald-600 font-bold tabular-nums shrink-0">+{today}</span>
          </div>
        </div>

        {/* Positives */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all duration-200 cascade-stagger-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-rose-700 truncate mr-1">
              Positive
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
          </div>
          <div className="my-2 sm:my-3">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-rose-600 tracking-tight tabular-nums">
              {positive}
            </span>
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100 font-mono">
            <span className="truncate mr-1">Rate</span>
            <span className="text-rose-600 font-bold tabular-nums shrink-0">{positivityRate}%</span>
          </div>
        </div>

        {/* Negatives */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all duration-200 cascade-stagger-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-emerald-700 truncate mr-1">
              Negative
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
          </div>
          <div className="my-2 sm:my-3">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-emerald-600 tracking-tight tabular-nums">
              {negative}
            </span>
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100 font-mono">
            <span className="truncate mr-1">Excluded</span>
            <span className="text-emerald-700 font-semibold shrink-0">Clear</span>
          </div>
        </div>

        {/* Inconclusive */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all duration-200 cascade-stagger-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-amber-800 truncate mr-1">
              Inconclusive
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
          </div>
          <div className="my-2 sm:my-3">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-amber-700 tracking-tight tabular-nums">
              {inconclusive}
            </span>
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100 font-mono">
            <span className="truncate mr-1">Lab check</span>
            <span className="text-amber-700 font-semibold shrink-0">Required</span>
          </div>
        </div>
      </div>

      {/* Field Seizure Geolocation Intelligence */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="mb-4 pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 font-display">
            Field incident geolocations
          </h2>
          <p className="text-xs text-slate-500">
            Active GPS coordinates bound to evidence photos at the moment of field capture.
          </p>
        </div>

        <LocationCard tests={recentTests} />
      </div>

      {/* Recent Field Submissions */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
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
            className="text-xs font-medium text-slate-700 hover:text-slate-950 transition tactile-btn touch-target flex items-center gap-1 group"
          >
            <span>Full register ({total})</span>
            <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
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
                  <div
                    key={t.id}
                    className="block bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl p-3.5 transition-all shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-5 h-5 rounded-md border border-slate-200 shadow-2xs shrink-0"
                          style={{ backgroundColor: swatchBg }}
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-slate-900 truncate block">
                            {t.kit_type_name || "Reagent Kit"}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            {new Date(t.captured_at).toLocaleDateString()} · {new Date(t.captured_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                      <ResultBadge result={t.result} size="sm" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 font-mono bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-semibold">BADGE:</span>
                        <span className="font-semibold text-slate-800">{t.operator_badge_id || "OFF"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-semibold">CONF:</span>
                        <span className="font-bold text-slate-800">{(t.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          t.location_verified
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {t.location_verified ? "GPS" : "IP"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500 font-mono truncate max-w-[180px]">
                        {t.latitude ? `📍 ${t.latitude.toFixed(4)}°, ${t.longitude.toFixed(4)}°` : "No GPS fix"}
                      </span>
                      <DossierButton testId={t.id} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Full Tabular Overview (>= 768px) */}
            <div className="hidden md:block responsive-table-wrapper">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-500 text-left bg-slate-50/50">
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
                      <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 rounded-md border border-slate-200 inline-block shrink-0 shadow-2xs"
                              style={{ backgroundColor: swatchBg }}
                              title={swatch ? `RGB: ${swatch.join(",")}` : "Unknown"}
                            />
                            <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                              {swatch ? `${swatch[0]}, ${swatch[1]}, ${swatch[2]}` : "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700 tabular-nums">
                          {new Date(t.captured_at).toLocaleDateString()} {new Date(t.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
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
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                              <div
                                className="h-full bg-slate-900 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(10, t.confidence * 100))}%` }}
                              />
                            </div>
                            <span className="font-mono text-slate-700 font-semibold tabular-nums">
                              {(t.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${
                            t.location_verified
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {t.location_verified ? "GPS lock" : "Network IP"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DossierButton testId={t.id} />
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
