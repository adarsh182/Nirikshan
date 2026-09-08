/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: cobalt (canonical light) · design-system: design.md · designed-as-app */
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
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-xs font-mono tracking-wider uppercase">
            Syncing Central Forensic Telemetry...
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
    <div className="space-y-5 sm:space-y-6">
      {/* Mobile-First Header & Quick Action Launch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-sky-700 font-bold">
              FIELD SURVEILLANCE FEED
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono mt-0.5">
            Presumptive Seizure Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Real-time chemical colorimetric analysis with cryptographic SHA-256 HMAC chain of custody.
          </p>
        </div>

        <div className="flex items-center gap-2.5 pt-1 sm:pt-0">
          <Link
            to="/capture"
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white rounded-lg text-xs font-mono font-bold tracking-wider uppercase shadow-sm transition-all tactile-btn touch-target flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            <span>Launch Test</span>
          </Link>
          <Link
            to="/tests"
            className="px-3.5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-mono font-semibold transition-colors tactile-btn touch-target flex items-center justify-center whitespace-nowrap shadow-xs"
          >
            Log ({total})
          </Link>
        </div>
      </div>

      {/* Asymmetric Telemetry Grid - Clean Daylight Light Mode */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Analyzed Hero Card */}
        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
              Total Evidence Tests
            </span>
            <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 font-bold">
              SEALED
            </span>
          </div>
          <div className="my-2">
            <span className="text-3xl sm:text-4xl font-mono font-bold text-slate-900 tracking-tight">
              {total}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Today's Seizures</span>
            <span className="text-emerald-600 font-bold">+{today}</span>
          </div>
        </div>

        {/* Positives */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-rose-700 uppercase tracking-wider font-bold">
              Presumptive Positive
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="my-2">
            <span className="text-3xl sm:text-4xl font-mono font-bold text-rose-600 tracking-tight">
              {positive}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Positivity Ratio</span>
            <span className="text-rose-600 font-semibold">{positivityRate}%</span>
          </div>
        </div>

        {/* Negatives */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-700 uppercase tracking-wider font-bold">
              Presumptive Negative
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="my-2">
            <span className="text-3xl sm:text-4xl font-mono font-bold text-emerald-600 tracking-tight">
              {negative}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Substance Excluded</span>
            <span className="text-emerald-700 font-semibold">CLEAR</span>
          </div>
        </div>

        {/* Inconclusive */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-amber-800 uppercase tracking-wider font-bold">
              Inconclusive
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="my-2">
            <span className="text-3xl sm:text-4xl font-mono font-bold text-amber-700 tracking-tight">
              {inconclusive}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Secondary Test</span>
            <span className="text-amber-700 font-semibold">REQUIRED</span>
          </div>
        </div>
      </div>

      {/* Field Seizure Geolocation Intelligence */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 font-mono uppercase tracking-wide">
              FIELD INCIDENT GEOLOCATIONS
            </h2>
            <p className="text-xs text-slate-500">
              Active GPS coordinates bound to evidence photos at point of seizure.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> POSITIVE
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> NEGATIVE
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> INCONCL.
            </span>
          </div>
        </div>

        <LocationCard tests={recentTests} />
      </div>

      {/* Recent Field Submissions - Adaptive Mobile Cards & Desktop Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 font-mono uppercase tracking-wide">
              RECENT EVIDENCE DOSSIERS
            </h2>
            <p className="text-xs text-slate-500">
              Verified field captures awaiting forensic laboratory confirmation.
            </p>
          </div>
          <Link
            to="/tests"
            className="text-xs font-mono text-sky-700 hover:text-sky-800 font-semibold tactile-btn touch-target flex items-center gap-1"
          >
            <span>FULL REGISTER ({total})</span>
            <span>→</span>
          </Link>
        </div>

        {recentTests.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            NO EVIDENCE SAMPLES RECORDED YET. TAP "LAUNCH TEST" TO PERFORM FIRST CAPTURE.
          </div>
        ) : (
          <>
            {/* Mobile View: High-Density Tactical Evidence Cards (< 768px) */}
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
                          className="w-4 h-4 rounded-full border border-slate-300 shrink-0 shadow-xs"
                          style={{ backgroundColor: swatchBg }}
                        />
                        <span className="font-semibold text-xs text-slate-800 truncate">
                          {t.kit_type_name || "Reagent Kit"}
                        </span>
                      </div>
                      <ResultBadge result={t.result} size="sm" />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200/80">
                      <div>
                        <span className="font-semibold text-slate-700">{t.operator_badge_id || "OFF"}</span>
                        <span className="text-slate-400 mx-1.5">·</span>
                        <span>{new Date(t.captured_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sky-700 font-bold">
                          {(t.confidence * 100).toFixed(0)}% MATCH
                        </span>
                        <span className="text-slate-400">→</span>
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
                  <tr className="border-b border-slate-200 text-slate-500 font-mono text-left bg-slate-50/70">
                    <th className="px-4 py-3 font-semibold">REACTION SWATCH</th>
                    <th className="px-4 py-3 font-semibold">TIMESTAMP</th>
                    <th className="px-4 py-3 font-semibold">REAGENT KIT</th>
                    <th className="px-4 py-3 font-semibold">OPERATOR</th>
                    <th className="px-4 py-3 font-semibold">OUTCOME</th>
                    <th className="px-4 py-3 font-semibold">CONFIDENCE</th>
                    <th className="px-4 py-3 font-semibold">GEO LOCK</th>
                    <th className="px-4 py-3 font-semibold text-right">ACTION</th>
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
                              className="w-5 h-5 rounded border border-slate-300 shadow-xs inline-block shrink-0"
                              style={{ backgroundColor: swatchBg }}
                              title={swatch ? `RGB: ${swatch.join(",")}` : "Unknown"}
                            />
                            <span className="font-mono text-[10px] text-slate-500">
                              {swatch ? `${swatch[0]},${swatch[1]},${swatch[2]}` : "—"}
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
                                className="h-full bg-sky-600 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(10, t.confidence * 100))}%` }}
                              />
                            </div>
                            <span className="font-mono text-slate-600 font-semibold">
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
                            {t.location_verified ? "GPS Lock" : "Approx. IP"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to={`/tests/${t.id}`}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-sky-700 hover:text-sky-800 rounded font-mono font-semibold transition-colors inline-block"
                          >
                            DOSSIER →
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
