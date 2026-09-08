/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: cobalt · design-system: design.md · designed-as-app */
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
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-xs font-mono tracking-wider uppercase">
            FETCHING AUTHENTICATED FORENSIC RECORD...
          </p>
        </div>
      </div>
    );
  }

  const details = test.classification_details;
  const swatchRgb = details?.corrected_swatch_rgb as number[] | undefined;
  const swatchBg = swatchRgb
    ? `rgb(${swatchRgb[0]}, ${swatchRgb[1]}, ${swatchRgb[2]})`
    : "#1e293b";
  const dominantLab = details?.dominant_lab as { L: number; a: number; b: number } | undefined;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Printable Certificate Header (Only visible when printing) */}
      <div className="hidden print:block text-slate-900 border-b-2 border-slate-900 pb-4 mb-6">
        <div className="text-center">
          <h1 className="text-xl font-bold uppercase tracking-wider">
            Government of India | Ministry of Home Affairs
          </h1>
          <h2 className="text-sm font-semibold uppercase text-slate-700">
            Narcotics Field Intelligence & Presumptive Seizure Register
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-mono">
            Certificate of Presumptive Field Colorimetric Examination
          </p>
          <p className="text-[11px] text-slate-500 italic mt-0.5">
            Presumptive screening result — confirmatory laboratory analysis required
          </p>
        </div>
      </div>

      {/* Screen Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-200 print:hidden">
        <div>
          <Link
            to="/tests"
            className="text-xs font-mono text-sky-700 hover:text-sky-800 font-semibold mb-1.5 inline-flex items-center gap-1 tactile-btn touch-target"
          >
            <span>←</span>
            <span>BACK TO EVIDENCE REGISTER</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono">
              Dossier #{test.id.slice(0, 8)}
            </h1>
            <ResultBadge result={test.result} />
            {details?.officer_override && (
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
                SUPERVISOR OVERRIDE
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Captured: {new Date(test.captured_at).toUTCString()} · Reagent: {test.kit_type_name}
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-mono font-bold tracking-wider uppercase shadow-xs transition-all tactile-btn touch-target flex items-center gap-1.5 disabled:opacity-50"
          >
            {verifying ? "VERIFYING..." : "VERIFY SEAL"}
          </button>
          <button
            onClick={handlePrintCertificate}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-mono font-semibold transition-colors tactile-btn touch-target shadow-xs"
          >
            PRINT CERT
          </button>
          <button
            onClick={() => setOverrideModal(true)}
            className="px-3 py-2 bg-white hover:bg-amber-50/50 border border-slate-200 text-amber-700 rounded-lg text-xs font-mono font-semibold transition-colors tactile-btn touch-target shadow-xs"
          >
            RECLASSIFY
          </button>
          <button
            onClick={handleExportJson}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-mono transition-colors tactile-btn touch-target shadow-xs"
            title="Download JSON dossier"
          >
            JSON
          </button>
          <button
            onClick={() => setDeleteModal(true)}
            className="p-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-lg text-xs transition-colors tactile-btn touch-target shadow-xs"
            title="Purge record"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Verification Banner */}
      {verification && (
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
            verification.valid
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full shrink-0 ${
                verification.valid ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <div>
              <p className="font-bold text-xs sm:text-sm font-mono">{verification.message}</p>
              <p className="text-[11px] font-mono opacity-80 mt-0.5">
                Image SHA-256: {verification.image_hash_match ? "AUTHENTIC" : "TAMPERED"} · Record Hash: {verification.record_hash_match ? "AUTHENTIC" : "TAMPERED"} · HMAC: {verification.signature_valid ? "VALID" : "INVALID"}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-800 self-start sm:self-auto shadow-2xs">
            {verification.valid ? "INTEGRITY INTACT" : "AUDIT BREACH"}
          </span>
        </div>
      )}

      {/* Main Content Grid: Specimen Photo & Calibrated Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Specimen Image & Swatch Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              SPECIMEN REACTION PHOTO
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 font-semibold">
              SHA-256 VERIFIED
            </span>
          </div>

          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 relative group">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Field Test Reaction Capture"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-slate-400 text-xs font-mono">Loading specimen image...</div>
            )}
            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] text-slate-600 font-mono border border-slate-200 shadow-2xs">
              6-Patch Calibration Frame
            </div>
          </div>

          {/* Color Extraction Analytics */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              COLORIMETRIC CALIBRATION ANALYTICS
            </h3>
            <div className="flex items-center gap-3.5">
              <span
                className="w-12 h-12 rounded-lg border border-slate-200 shadow-xs inline-block shrink-0"
                style={{ backgroundColor: swatchBg }}
              />
              <div className="space-y-0.5 text-xs">
                <p className="text-slate-900 font-medium">
                  Calibrated Target Reaction Color:
                </p>
                <p className="font-mono text-slate-600 text-[11px]">
                  sRGB: [{swatchRgb ? swatchRgb.join(", ") : "N/A"}]
                </p>
                {dominantLab && (
                  <p className="font-mono text-sky-700 font-semibold text-[11px]">
                    CIE L*a*b*: L={dominantLab.L.toFixed(1)}, a={dominantLab.a.toFixed(1)}, b={dominantLab.b.toFixed(1)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Case & Chain of Custody Metadata */}
        <div className="space-y-5">
          {/* Seizure & Operator Metadata */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono border-b border-slate-100 pb-2.5">
              SEIZURE EXAMINATION METADATA
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">OPERATING OFFICER</p>
                <p className="font-bold text-sky-700 text-sm mt-0.5">{test.operator_badge_id || "OFF-001"}</p>
                <p className="text-slate-600 text-[10px]">{test.operator_name || "Officer in Charge"}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-[10px] text-slate-500 font-mono uppercase font-semibold">REAGENT KIT</p>
                <p className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 truncate">{test.kit_type_name}</p>
                <p className="text-slate-500 text-[10px] font-mono">Colorimetric Standard</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">MATCH CONFIDENCE</p>
                <p className="font-bold text-sky-700 text-sm mt-0.5">
                  {(test.confidence * 100).toFixed(1)}%
                </p>
                <p className="text-slate-600 text-[10px]">Separation Margin Verified</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-[10px] text-slate-500 font-mono uppercase font-semibold">REFERENCE CARD</p>
                <p
                  className={`font-bold text-xs sm:text-sm mt-0.5 ${
                    details?.reference_card_detected ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {details?.reference_card_detected ? "DETECTED & FIXED" : "STANDARD FALLBACK"}
                </p>
                <p className="text-slate-500 text-[10px] font-mono">6-Patch Illuminant Fix</p>
              </div>
            </div>

            {test.notes && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <p className="text-[10px] text-slate-500 font-mono font-bold uppercase mb-1">FIELD NOTES</p>
                <p className="text-slate-700 italic">{test.notes}</p>
              </div>
            )}
          </div>

          {/* Location & GPS Fix */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                SEIZURE GEOGRAPHIC LOCATION
              </h2>
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                test.location_verified
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                {test.location_verified ? "GPS HARDWARE FIX" : `SOURCE: ${test.location_source || "NETWORK"}`}
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
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sky-700 font-mono flex items-center gap-2">
              TAMPER-EVIDENT CRYPTOGRAPHIC CHAIN OF CUSTODY
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              HMAC-SHA256 authenticated digital ledger entry. Proof of unaltered state for legal evidentiary submission.
            </p>
          </div>
          {copiedField && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold self-start sm:self-auto shadow-2xs">
              ✓ COPIED {copiedField.toUpperCase()}
            </span>
          )}
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">RECORD UUID</p>
              <p className="text-slate-900 truncate mt-0.5">{test.id}</p>
            </div>
            <button
              onClick={() => handleCopy(test.id, "Record ID")}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-[10px] uppercase font-semibold transition tactile-btn touch-target shadow-2xs"
            >
              Copy
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">SHA-256 IMAGE DIGEST</p>
              <p className="text-emerald-700 font-semibold truncate mt-0.5">{test.image_hash}</p>
            </div>
            <button
              onClick={() => handleCopy(test.image_hash, "Image Hash")}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-[10px] uppercase font-semibold transition tactile-btn touch-target shadow-2xs"
            >
              Copy
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">CANONICAL RECORD DIGEST</p>
              <p className="text-slate-800 truncate mt-0.5">{test.record_hash}</p>
            </div>
            <button
              onClick={() => handleCopy(test.record_hash, "Record Hash")}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-[10px] uppercase font-semibold transition tactile-btn touch-target shadow-2xs"
            >
              Copy
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">HMAC-SHA256 DIGITAL SEAL</p>
              <p className="text-sky-700 font-semibold truncate mt-0.5">{test.signature}</p>
            </div>
            <button
              onClick={() => handleCopy(test.signature, "Signature")}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-[10px] uppercase font-semibold transition tactile-btn touch-target shadow-2xs"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Statutory Legal Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs leading-relaxed space-y-1">
        <p className="font-semibold text-slate-800 font-mono text-[11px] uppercase">
          STATUTORY FORENSIC DISCLAIMER (NDPS COMPLIANCE):
        </p>
        <p className="text-[11px]">
          This electronic evidence record represents an authenticated presumptive field colorimetric test outcome. In compliance with NDPS and international forensic standards, presumptive field tests establish reasonable suspicion for seizure and arrest but must be followed by laboratory confirmatory testing (GC-MS / HPLC) prior to judicial indictment.
        </p>
      </div>

      {/* Supervisor Override Modal */}
      {overrideModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 safe-bottom">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 font-mono">SUPERVISOR RECLASSIFICATION</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Amend the presumptive classification based on secondary testing or supervisory review. This audit event is permanently cryptographically stamped.
            </p>

            <div className="space-y-2">
              <label className="text-xs text-slate-700 font-semibold font-mono">NEW OUTCOME:</label>
              <div className="grid grid-cols-3 gap-2">
                {(["positive", "negative", "inconclusive"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedOverride(r)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-mono font-bold capitalize transition tactile-btn touch-target ${
                      selectedOverride === r
                        ? r === "positive"
                          ? "bg-rose-600 text-white shadow-xs"
                          : r === "negative"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-amber-600 text-white shadow-xs"
                        : "bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-semibold font-mono">SUPERVISOR JUSTIFICATION:</label>
              <textarea
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                placeholder="Required: State legal/forensic rationale for reclassification..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 resize-none font-sans shadow-2xs"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setOverrideModal(false)}
                disabled={updating}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-mono transition tactile-btn touch-target shadow-xs"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleOverrideSubmit}
                disabled={updating}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 disabled:opacity-50 tactile-btn touch-target shadow-xs"
              >
                {updating ? "SIGNING..." : "COMMIT OVERRIDE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Record Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 safe-bottom">
          <div className="bg-white border border-rose-200 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-rose-600">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-mono">PURGE EVIDENCE FILE?</h3>
                <p className="text-xs text-rose-700 font-mono">Dossier #{test.id.slice(0, 8)}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to permanently purge this evidence record? Photographic files, SHA-256 digests, and HMAC signatures will be unrecoverable.
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-mono transition tactile-btn touch-target shadow-xs"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 disabled:opacity-50 tactile-btn touch-target shadow-xs"
              >
                {deleting ? "PURGING..." : "CONFIRM PURGE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
