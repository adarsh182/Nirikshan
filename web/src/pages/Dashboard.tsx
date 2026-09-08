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
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading field surveillance telemetry...</p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Tests Analyzed",
      value: stats?.total_tests ?? 0,
      badge: "Cryptographically Sealed",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      label: "Field Tests Today",
      value: stats?.tests_today ?? 0,
      badge: "Active Surveillance",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    },
    {
      label: "Presumptive Positive",
      value: stats?.positive_count ?? 0,
      badge: `${stats?.total_tests ? ((stats.positive_count / stats.total_tests) * 100).toFixed(0) : 0}% Positivity`,
      badgeColor: "bg-red-500/10 text-red-400 border-red-500/30",
    },
    {
      label: "Presumptive Negative",
      value: stats?.negative_count ?? 0,
      badge: "Target Excluded",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      label: "Inconclusive / Low Conf.",
      value: stats?.inconclusive_count ?? 0,
      badge: "Secondary Required",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            Narcotics Field Intelligence Dashboard
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Live Central Registry
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Presumptive field test records with SHA-256 HMAC chain of custody.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/capture"
            className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Capture Field Test
          </Link>
          <Link
            to="/tests"
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors"
          >
            Evidence Register
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-slate-700 transition-colors"
          >
            <div>
              <p className="text-xs font-medium text-slate-400">{card.label}</p>
              <p className="text-3xl font-extrabold text-slate-100 mt-2">{card.value}</p>
            </div>
            <div className="mt-3">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${card.badgeColor}`}
              >
                {card.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Field Seizure Location Intelligence */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Field Seizure Locations
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              GPS coordinates captured via field mobile units.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Positive
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Negative
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Inconclusive
            </span>
          </div>
        </div>

        <LocationCard tests={recentTests} />
      </div>

      {/* Recent Field Submissions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-100">Recent Field Test Submissions</h2>
            <p className="text-xs text-slate-400">Authenticated field captures awaiting confirmatory laboratory transit.</p>
          </div>
          <Link
            to="/tests"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            Open Evidence Register ({stats?.total_tests ?? 0})
          </Link>
        </div>

        {recentTests.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            No test records available in registry. Submit a test via mobile companion or capture page.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-left">
                  <th className="pb-3 font-semibold">Reaction Swatch</th>
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Reagent Kit</th>
                  <th className="pb-3 font-semibold">Field Operator</th>
                  <th className="pb-3 font-semibold">Presumptive Outcome</th>
                  <th className="pb-3 font-semibold">Match Conf.</th>
                  <th className="pb-3 font-semibold">Fix Status</th>
                  <th className="pb-3 font-semibold text-right">Integrity Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentTests.map((t) => {
                  const swatch = t.classification_details?.corrected_swatch_rgb as number[] | undefined;
                  const swatchBg = swatch
                    ? `rgb(${swatch[0]}, ${swatch[1]}, ${swatch[2]})`
                    : "#334155";

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded-md border border-slate-600 shadow-sm inline-block"
                            style={{ backgroundColor: swatchBg }}
                            title={swatch ? `RGB: ${swatch.join(",")}` : "Unknown"}
                          />
                          <span className="font-mono text-[10px] text-slate-400">
                            {swatch ? `${swatch[0]},${swatch[1]},${swatch[2]}` : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-slate-300">
                        {new Date(t.captured_at).toLocaleDateString()} {new Date(t.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 font-medium text-slate-200">
                        {t.kit_type_name || "Reagent Kit"}
                      </td>
                      <td className="py-3 text-slate-300">
                        <span className="font-mono font-medium text-slate-200">{t.operator_badge_id}</span>
                        {t.operator_name && <span className="text-slate-400 text-[11px] block">{t.operator_name}</span>}
                      </td>
                      <td className="py-3">
                        <ResultBadge result={t.result} />
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(10, t.confidence * 100))}%` }}
                            />
                          </div>
                          <span className="font-mono text-slate-400">
                            {(t.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-[11px]">
                        <span className={`px-2 py-0.5 rounded font-semibold ${
                          t.location_verified
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}>
                          {t.location_verified ? "GPS Lock" : "Approx. IP"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/tests/${t.id}`}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 rounded font-medium transition-colors inline-block"
                        >
                          Dossier
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
