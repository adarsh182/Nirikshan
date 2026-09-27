/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: cobalt · design-system: design.md · designed-as-app */
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import ResultBadge from "../components/ResultBadge";
import DossierButton from "../components/DossierButton";
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
      toast.success("Dossier Purged", {
        description: `Evidence #${deleteTarget.id.slice(0, 8)} removed from active register.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete test record:", err);
      toast.error("Purge Failed", {
        description: "Failed to delete evidence record from registry.",
      });
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

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `field_tests_registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(total / pageSize);

  const filterOptions = [
    { value: "", label: "All Records" },
    { value: "positive", label: "Positive" },
    { value: "negative", label: "Negative" },
    { value: "inconclusive", label: "Inconclusive" },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header & Quick Export - Light Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-sky-700 font-semibold">
              Chain of Custody Ledger
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono font-semibold">
              {total} records
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display mt-0.5">
            Evidence Register
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Searchable cryptographically verified ledger of presumptive field tests with immutable SHA-256 HMAC stamps.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto pt-1 sm:pt-0">
          <Link
            to="/capture"
            className="hidden md:inline-flex apple-btn-primary px-4 py-2.5 items-center justify-center gap-1.5 whitespace-nowrap touch-target"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            <span>Capture Test</span>
          </Link>

          <button
            onClick={handleExportCsv}
            disabled={tests.length === 0}
            className="w-full sm:w-auto apple-btn-secondary px-3.5 py-2.5 disabled:opacity-40 flex items-center justify-center whitespace-nowrap gap-1.5 touch-target"
            title="Download CSV file for court evidence reporting"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-slate-500">
              <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
              <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-xs">
        <div className="relative">
          <input
            type="text"
            placeholder="Filter by badge ID, reagent kit, notes, hash, coordinates..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50/70 border border-slate-200/90 rounded-xl pl-3.5 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-sans shadow-2xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 text-xs tactile-btn touch-target rounded-full hover:bg-slate-200/60"
              aria-label="Clear search query"
            >
              ✕
            </button>
          )}
        </div>

        {/* Outcome Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline font-semibold">
            Filter:
          </span>
          {filterOptions.map((opt) => {
            const isActive = resultFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setResultFilter(opt.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 tactile-btn touch-target ${
                  isActive
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Evidence Presentation */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-500">Loading evidence registers...</p>
          </div>
        </div>
      ) : tests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2 shadow-xs">
          <p className="text-slate-900 font-bold font-mono text-sm">NO EVIDENCE SAMPLES MATCH CRITERIA</p>
          <p className="text-slate-500 text-xs">
            Try adjusting your search query or reset the outcome filter.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile-First: Tactile Forensic Cards (< 768px) - High Daylight Contrast */}
          <div className="block md:hidden space-y-3">
            {tests.map((test) => {
              const swatch = test.classification_details?.corrected_swatch_rgb as number[] | undefined;
              const swatchBg = swatch
                ? `rgb(${swatch[0]}, ${swatch[1]}, ${swatch[2]})`
                : "#e2e8f0";

              return (
                <div
                  key={test.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-5 h-5 rounded border border-slate-200 shadow-2xs shrink-0"
                        style={{ backgroundColor: swatchBg }}
                        title={swatch ? `RGB: ${swatch.join(",")}` : "Auto"}
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {test.kit_type_name || "Reagent Kit"}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(test.captured_at).toLocaleDateString()} · {new Date(test.captured_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                    <ResultBadge result={test.result} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-semibold">BADGE ID</span>
                      <span className="text-sky-700 font-semibold">{test.operator_badge_id || "OFF-001"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-semibold">MATCH SCORE</span>
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-slate-900 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(10, test.confidence * 100))}%` }}
                          />
                        </div>
                        <span className="text-slate-800 font-bold">{(test.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 truncate max-w-[170px]">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        test.location_verified
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {test.location_verified ? "GPS" : "IP"}
                      </span>
                      <span className="truncate">
                        {test.latitude ? `${test.latitude.toFixed(4)}°, ${test.longitude.toFixed(4)}°` : "No GPS"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(test)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors tactile-btn touch-target"
                        title="Delete record"
                        aria-label="Delete evidence record"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                        </svg>
                      </button>

                      <DossierButton testId={test.id} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Tabular View (>= 768px) */}
          <div className="hidden md:block bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="responsive-table-wrapper">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-500 text-left bg-slate-50/60">
                    <th className="px-4 py-3 font-semibold">Reaction swatch</th>
                    <th className="px-4 py-3 font-semibold">Timestamp</th>
                    <th className="px-4 py-3 font-semibold">Reagent kit</th>
                    <th className="px-4 py-3 font-semibold">Operator</th>
                    <th className="px-4 py-3 font-semibold">Outcome</th>
                    <th className="px-4 py-3 font-semibold">Confidence</th>
                    <th className="px-4 py-3 font-semibold">Geo fix</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tests.map((test) => {
                    const swatch = test.classification_details?.corrected_swatch_rgb as number[] | undefined;
                    const swatchColor = swatch
                      ? `rgb(${swatch[0]}, ${swatch[1]}, ${swatch[2]})`
                      : "#cbd5e1";

                    return (
                      <tr key={test.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 rounded-md border border-slate-200 shadow-2xs inline-block shrink-0"
                              style={{ backgroundColor: swatchColor }}
                              title={swatch ? `RGB: ${swatch.join(",")}` : "Auto"}
                            />
                            <span className="font-mono text-[10px] text-slate-500 font-semibold tabular-nums">
                              {swatch ? `${swatch.join(",")}` : "Auto"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-800 font-semibold tabular-nums">
                          {new Date(test.captured_at).toLocaleDateString()}{" "}
                          <span className="text-slate-400 font-normal">
                            {new Date(test.captured_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {test.kit_type_name || "Reagent"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-sky-700">{test.operator_badge_id}</span>
                          {test.operator_name && (
                            <span className="block text-[10px] text-slate-500">{test.operator_name}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <ResultBadge result={test.result} size="sm" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                              <div
                                className="h-full bg-sky-600"
                                style={{ width: `${Math.min(100, Math.max(10, test.confidence * 100))}%` }}
                              />
                            </div>
                            <span className="font-mono text-slate-700 font-bold tabular-nums">
                              {(test.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600">
                          <div className="tabular-nums">{test.latitude.toFixed(4)}°, {test.longitude.toFixed(4)}°</div>
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold mt-0.5 ${
                            test.location_verified
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {test.location_verified ? "GPS Lock" : "Approx IP"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <DossierButton testId={test.id} />
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(test)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors tactile-btn touch-target"
                              title="Delete Evidence Record"
                              aria-label="Delete evidence record"
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
        </>
      )}

      {/* Touch-Friendly Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs font-mono text-slate-500 tabular-nums">
            Page {page} of {totalPages} ({total} total records)
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="apple-btn-secondary flex-1 sm:flex-initial px-4 py-2 text-xs disabled:opacity-40 touch-target"
            >
              ← Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="apple-btn-secondary flex-1 sm:flex-initial px-4 py-2 text-xs disabled:opacity-40 touch-target"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Permanent Deletion Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 safe-bottom backdrop-enter">
          <div className="bg-white border border-rose-200/90 rounded-2xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-xl modal-enter">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-rose-600">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Purge evidence record?</h3>
                <p className="text-xs text-rose-700 font-mono">ID: {deleteTarget.id.slice(0, 8)}...</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Confirm deletion of presumptive test record for{" "}
              <strong className="text-slate-900 font-semibold">{deleteTarget.kit_type_name || "Field Test"}</strong> attributed to badge{" "}
              <strong className="text-sky-700 font-mono">{deleteTarget.operator_badge_id}</strong>.
            </p>
            <p className="text-[11px] text-rose-700 font-mono">
              Photographic evidence, SHA-256 HMAC hash, and audit coordinates will be permanently purged.
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="apple-btn-secondary px-4 py-2 text-xs touch-target"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-all duration-150 active:scale-[0.97] tactile-btn touch-target flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
              >
                {deleting ? "Purging..." : "Confirm Purge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
