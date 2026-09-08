import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import ResultBadge from "../components/ResultBadge";
import { getTests, deleteTest } from "../services/api";
import type { TestRecord } from "../types";

export default function TestLogPage() {
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [resultFilter, setResultFilter] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<TestRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTest(deleteTarget.id);
      setTests((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete test record:", err);
      alert("Failed to delete evidence record.");
    } finally {
      setDeleting(false);
    }
  };

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
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/tests/${test.id}`}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-emerald-300 rounded font-medium transition-colors inline-block"
                          >
                            Dossier
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(test)}
                            className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete Evidence Record"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
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

      {/* Permanent Deletion Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/50 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-400">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Permanently Delete Evidence?</h3>
                <p className="text-xs text-red-400/80 font-mono">Dossier #{deleteTarget.id.slice(0, 8)}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete this evidence record for{" "}
              <strong className="text-slate-100">{deleteTarget.kit_type_name || "Presumptive Test"}</strong> captured by officer{" "}
              <strong className="text-emerald-400 font-mono">{deleteTarget.operator_badge_id}</strong>?
            </p>
            <p className="text-[11px] text-red-400/90 font-medium">
              This will permanently purge the photographic file, cryptographic signatures, and audit logs. This cannot be undone.
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleting ? "Purging..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
