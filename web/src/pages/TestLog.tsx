import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import ResultBadge from "../components/ResultBadge";
import { getTests } from "../services/api";
import type { TestRecord } from "../types";

export default function TestLogPage() {
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [resultFilter, setResultFilter] = useState("");
  const [search, setSearch] = useState("");

  const pageSize = 12;

  const fetchRecords = useCallback(() => {
    setLoading(true);
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (resultFilter) params.result = resultFilter;
    if (search) params.q = search;

    getTests(params)
      .then((data) => {
        setTests(data.items);
        setTotal(data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, resultFilter, search]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleExportCsv = () => {
    if (tests.length === 0) return;
    const headers = [
      "Record_ID",
      "Timestamp_UTC",
      "Kit_Type",
      "Result",
      "Confidence",
      "Operator_Badge",
      "Latitude",
      "Longitude",
      "Accuracy_M",
      "Image_SHA256",
      "HMAC_Signature",
    ];

    const rows = tests.map((t) => [
      `"${t.id}"`,
      `"${t.captured_at}"`,
      `"${t.kit_type_name || ""}"`,
      `"${t.result}"`,
      t.confidence.toFixed(2),
      `"${t.operator_badge_id || ""}"`,
      t.latitude,
      t.longitude,
      t.location_accuracy_m ?? "",
      `"${t.image_hash}"`,
      `"${t.signature}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `field_tests_registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            Forensic Evidence & Chain of Custody Log
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {total} Total Records
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Searchable permanent ledger of presumptive drug test outcomes, GPS fixes, and digital signatures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/capture"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            <span>Capture New Test</span>
          </Link>

          <button
            onClick={handleExportCsv}
            disabled={tests.length === 0}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
          >
            Export CSV Ledger
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Search badge ID, reagent kit, notes, coordinates..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium">Outcome:</label>
          <select
            value={resultFilter}
            onChange={(e) => {
              setResultFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Outcomes</option>
            <option value="positive">Positive Only</option>
            <option value="negative">Negative Only</option>
            <option value="inconclusive">Inconclusive Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tests.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-slate-300 font-semibold">No evidence records match your criteria.</p>
          <p className="text-slate-500 text-xs mt-1">
            Try adjusting your search query or outcome filter.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-left bg-slate-950/50">
                  <th className="px-4 py-3 font-semibold">Calibrated Swatch</th>
                  <th className="px-4 py-3 font-semibold">Capture Time</th>
                  <th className="px-4 py-3 font-semibold">Kit Reagent</th>
                  <th className="px-4 py-3 font-semibold">Field Operator</th>
                  <th className="px-4 py-3 font-semibold">Presumptive Result</th>
                  <th className="px-4 py-3 font-semibold">Confidence</th>
                  <th className="px-4 py-3 font-semibold">Location Fix</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {tests.map((test) => {
                  const swatch = test.classification_details?.corrected_swatch_rgb as number[] | undefined;
                  const swatchColor = swatch
                    ? `rgb(${swatch[0]}, ${swatch[1]}, ${swatch[2]})`
                    : "#334155";

                  return (
                    <tr key={test.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded-md border border-slate-700 shadow-sm inline-block"
                            style={{ backgroundColor: swatchColor }}
                          />
                          <span className="font-mono text-[10px] text-slate-500">
                            {swatch ? `${swatch.join(",")}` : "Auto"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {new Date(test.captured_at).toLocaleDateString()}{" "}
                        <span className="text-slate-500">
                          {new Date(test.captured_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-200">
                        {test.kit_type_name || "Reagent"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-medium text-emerald-400">{test.operator_badge_id}</span>
                        {test.operator_name && (
                          <span className="block text-[10px] text-slate-400">{test.operator_name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ResultBadge result={test.result} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${Math.min(100, Math.max(10, test.confidence * 100))}%` }}
                            />
                          </div>
                          <span className="font-mono text-slate-400">
                            {(test.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">
                        <div>{test.latitude.toFixed(4)}°, {test.longitude.toFixed(4)}°</div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${
                          test.location_verified
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}>
                          {test.location_verified ? "GPS Verified" : "Approx. Fix"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/tests/${test.id}`}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-emerald-300 rounded font-medium transition-colors inline-block"
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
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Page {page} of {totalPages} ({total} total records)
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded text-xs text-slate-300 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded text-xs text-slate-300 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
