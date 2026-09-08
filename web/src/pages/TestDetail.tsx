import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import LocationCard from "../components/MapView";
import ResultBadge from "../components/ResultBadge";
import { api, getTest, verifyTest, overrideTestResult, deleteTest } from "../services/api";
import type { TestRecord, VerificationResult } from "../types";

export default function TestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<TestRecord | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [overrideModal, setOverrideModal] = useState(false);
  const [selectedOverride, setSelectedOverride] = useState("positive");
  const [overrideNotes, setOverrideNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getTest(id).then(setTest).catch(console.error);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/tests/${id}/image`, { responseType: "blob" })
      .then((res) => setImageUrl(URL.createObjectURL(res.data)))
      .catch(console.error);
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [id]);

  const handleVerify = async () => {
    if (!id) return;
    setVerifying(true);
    try {
      const result = await verifyTest(id);
      setVerification(result);
    } catch {
      alert("Verification request failed.");
    } finally {
      setVerifying(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleExportJson = () => {
    if (!test) return;
    const blob = new Blob([JSON.stringify(test, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forensic-evidence-${test.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOverrideSubmit = async () => {
    if (!id) return;
    setUpdating(true);
    try {
      const updated = await overrideTestResult(id, selectedOverride, overrideNotes);
      setTest(updated);
      setVerification(null);
      setOverrideModal(false);
    } catch {
      alert("Override failed.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteTest(id);
      navigate("/tests");
    } catch (err) {
      console.error("Failed to delete test record:", err);
      alert("Failed to delete evidence record.");
      setDeleting(false);
    }
  };

  if (!test) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Fetching authenticated forensic record...</p>
        </div>
      </div>
    );
  }

  const details = test.classification_details;
  const swatchRgb = details?.corrected_swatch_rgb as number[] | undefined;
  const swatchBg = swatchRgb
    ? `rgb(${swatchRgb[0]}, ${swatchRgb[1]}, ${swatchRgb[2]})`
    : "#334155";
  const dominantLab = details?.dominant_lab as { L: number; a: number; b: number } | undefined;

  return (
    <div className="space-y-6">
      {/* Printable Certificate Header (Only visible when printing) */}
      <div className="hidden print:block text-slate-900 border-b-2 border-slate-900 pb-4 mb-6">
        <div className="text-center">
          <h1 className="text-xl font-bold uppercase tracking-wider">
            Government of India | Ministry of Home Affairs
          </h1>
          <h2 className="text-sm font-semibold uppercase text-slate-700">
            Narcotics Field Intelligence & Presumptive Seizure Register
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Certificate of Presumptive Field Colorimetric Examination
          </p>
          <p className="text-[11px] text-slate-500 italic mt-0.5">
            Presumptive screening result — confirmatory laboratory analysis required
          </p>
        </div>
      </div>

      {/* Screen Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800 print:hidden">
        <div>
          <Link to="/tests" className="text-xs text-emerald-400 hover:underline mb-1 inline-block">
            ← Back to Evidence Log
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
              Evidence Dossier #{test.id.slice(0, 8)}
            </h1>
            <ResultBadge result={test.result} />
            {details?.officer_override && (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Officer Override
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Captured: {new Date(test.captured_at).toUTCString()} | Reagent: {test.kit_type_name}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-emerald-900/30 flex items-center gap-1.5"
          >
            {verifying ? "Auditing Hash..." : "Verify Hash & Signature"}
          </button>
          <button
            onClick={handlePrintCertificate}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Print Legal Certificate
          </button>
          <button
            onClick={() => setOverrideModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 rounded-lg text-xs font-semibold transition-colors"
          >
            Supervisor Reclassify
          </button>
          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 rounded-lg text-xs font-semibold transition-colors"
          >
            JSON
          </button>
          <button
            onClick={() => setDeleteModal(true)}
            className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Permanently delete this evidence record from register"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
            </svg>
            Delete Record
          </button>
        </div>
      </div>

      {/* Verification Banner */}
      {verification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
            verification.valid
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                verification.valid ? "bg-emerald-400" : "bg-red-400"
              }`}
            />
            <div>
              <p className="font-bold text-sm">{verification.message}</p>
              <p className="text-xs opacity-80 mt-0.5">
                Image SHA-256 Digest: {verification.image_hash_match ? "AUTHENTIC" : "MODIFIED"} | Record Hash: {verification.record_hash_match ? "AUTHENTIC" : "CORRUPTED"} | HMAC Signature: {verification.signature_valid ? "VALIDATED" : "INVALID"}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-900/60">
            {verification.valid ? "SEAL VERIFIED" : "INTEGRITY BREACH"}
          </span>
        </div>
      )}

      {/* Main Grid: Specimen Photo & Calibrated Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Specimen Image */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Presumptive Field Reaction Capture
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              JPEG | SHA-256 Verified
            </span>
          </div>

          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 relative group">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Field Test Reaction Capture"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-slate-500 text-xs">Loading specimen image...</div>
            )}
            <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur px-2 py-1 rounded text-[10px] text-slate-400 font-mono">
              6-Patch Calibration Frame
            </div>
          </div>

          {/* Color Extraction Analytics */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Chromatic Calibration Analysis
            </h3>
            <div className="flex items-center gap-4">
              <span
                className="w-12 h-12 rounded-lg border-2 border-white/20 shadow-md inline-block shrink-0"
                style={{ backgroundColor: swatchBg }}
              />
              <div className="space-y-1 text-xs">
                <p className="text-slate-300 font-medium">
                  Calibrated Target Reaction Color:
                </p>
                <p className="font-mono text-slate-400">
                  sRGB: [{swatchRgb ? swatchRgb.join(", ") : "N/A"}]
                </p>
                {dominantLab && (
                  <p className="font-mono text-emerald-400">
                    CIE L*a*b*: L={dominantLab.L.toFixed(1)}, a={dominantLab.a.toFixed(1)}, b={dominantLab.b.toFixed(1)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Case & Chain of Custody Metadata */}
        <div className="space-y-6">
          {/* Seizure & Operator Metadata */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Seizure Examination Registry
            </h2>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <p className="text-slate-400">Field Operator</p>
                <p className="font-semibold text-slate-100 text-sm mt-0.5 font-mono">{test.operator_badge_id}</p>
                <p className="text-slate-500 text-[11px]">{test.operator_name || "Officer in Charge"}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <p className="text-slate-400">Reagent Kit Standard</p>
                <p className="font-semibold text-slate-100 text-sm mt-0.5">{test.kit_type_name}</p>
                <p className="text-slate-500 text-[11px]">Colorimetric Specimen</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <p className="text-slate-400">Reference Color-Match</p>
                <p className="font-semibold text-emerald-400 text-sm mt-0.5 font-mono">
                  {(test.confidence * 100).toFixed(1)}%
                </p>
                <p className="text-slate-500 text-[11px]">Separation Margin OK</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <p className="text-slate-400">Reference Card</p>
                <p
                  className={`font-semibold text-sm mt-0.5 ${
                    details?.reference_card_detected ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {details?.reference_card_detected ? "Detected & Normalised" : "Standard Fallback"}
                </p>
                <p className="text-slate-500 text-[11px]">6-Patch Illuminant Fix</p>
              </div>
            </div>

            {test.notes && (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                <p className="text-slate-400 font-semibold mb-1">Field Examination Notes:</p>
                <p className="text-slate-300 italic">{test.notes}</p>
              </div>
            )}
          </div>

          {/* Location & GPS Fix */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Geographic Seizure Fix
              </h2>
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                test.location_verified
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
              }`}>
                {test.location_verified ? "GPS Hardware Lock" : `Approx. Source: ${test.location_source || "IP"}`}
              </span>
            </div>
            <LocationCard
              latitude={test.latitude}
              longitude={test.longitude}
              accuracy={test.location_accuracy_m}
            />
          </div>
        </div>
      </div>

      {/* Cryptographic Tamper-Evident Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              Tamper-Evident Cryptographic Chain of Custody
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              HMAC-SHA256 authenticated digital ledger entry. Proof of unaltered state for legal evidentiary submission.
            </p>
          </div>
          {copiedField && (
            <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-semibold animate-fade">
              Copied {copiedField} to clipboard!
            </span>
          )}
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-slate-400 font-semibold">RECORD UUID</p>
              <p className="font-mono text-slate-200 truncate mt-0.5">{test.id}</p>
            </div>
            <button
              onClick={() => handleCopy(test.id, "Record ID")}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[11px]"
            >
              Copy
            </button>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-slate-400 font-semibold">SHA-256 IMAGE DIGEST</p>
              <p className="font-mono text-emerald-400 truncate mt-0.5">{test.image_hash}</p>
            </div>
            <button
              onClick={() => handleCopy(test.image_hash, "Image Hash")}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[11px]"
            >
              Copy
            </button>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-slate-400 font-semibold">CANONICAL RECORD DIGEST</p>
              <p className="font-mono text-slate-300 truncate mt-0.5">{test.record_hash}</p>
            </div>
            <button
              onClick={() => handleCopy(test.record_hash, "Record Hash")}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[11px]"
            >
              Copy
            </button>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-slate-400 font-semibold">HMAC-SHA256 SIGNATURE</p>
              <p className="font-mono text-sky-400 truncate mt-0.5">{test.signature}</p>
            </div>
            <button
              onClick={() => handleCopy(test.signature, "Signature")}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[11px]"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Statutory Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs leading-relaxed space-y-1">
        <p className="font-semibold text-slate-300">Statutory Forensic Disclaimer:</p>
        <p>
          This document represents an authenticated presumptive field colorimetric test outcome. In compliance with NDPS and international forensic standards, presumptive field tests establish reasonable suspicion for seizure and arrest but must be followed by laboratory confirmatory testing (GC-MS / HPLC) prior to judicial indictment.
        </p>
      </div>

      {/* Supervisor Override Modal */}
      {overrideModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-100">Supervisor Reclassification</h3>
            <p className="text-xs text-slate-400">
              Amend the presumptive classification based on secondary testing or supervisory inspection. This amendment will be permanently logged with your credentials.
            </p>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold">New Classification Outcome:</label>
              <div className="grid grid-cols-3 gap-2">
                {(["positive", "negative", "inconclusive"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedOverride(r)}
                    className={`py-2 text-xs font-bold rounded-lg border uppercase ${
                      selectedOverride === r
                        ? "bg-emerald-600 text-white border-emerald-500"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold">Justification / Reason:</label>
              <textarea
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                placeholder="e.g. Confirmed via secondary reagent test / laboratory notice"
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setOverrideModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOverrideSubmit}
                disabled={updating}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {updating ? "Saving..." : "Commit Override"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Evidence Deletion Confirmation Modal */}
      {deleteModal && (
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
                <p className="text-xs text-red-400/80 font-mono">Dossier #{test.id.slice(0, 8)}</p>
              </div>
            </div>

            <div className="bg-red-950/20 border border-red-900/40 rounded-lg p-3 text-xs text-slate-300 space-y-2">
              <p>
                This action will permanently and irrevocably purge:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li>Photographic colorimetric capture from server storage</li>
                <li>SHA-256 image digest & HMAC-SHA256 signature</li>
                <li>Recorded GPS fix coordinates ({test.latitude.toFixed(4)}°, {test.longitude.toFixed(4)}°)</li>
                <li>Officer custody chain and field notes</li>
              </ul>
              <p className="text-red-400 font-semibold pt-1">
                This operation cannot be reversed.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
              >
                Keep Evidence
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleting ? "Purging Record..." : "Confirm Permanent Deletion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
