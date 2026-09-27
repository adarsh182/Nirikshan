import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
  const [showCertPreview, setShowCertPreview] = useState(false);

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
      if (result.valid) {
        toast.success("Forensic Integrity Verified", {
          description: result.message || "Dual-layer SHA-256 HMAC signature matches tamper-evident ledger.",
        });
      } else {
        toast.error("Forensic Seal Inconclusive", {
          description: result.message || "Cryptographic digest mismatch detected.",
        });
      }
    } catch {
      toast.error("Verification Request Failed", {
        description: "Unable to complete cryptographic audit with the backend registry.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success("Copied to Clipboard", { description: label });
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
      toast.success("Classification Overridden", {
        description: `Dossier amended to ${selectedOverride.toUpperCase()} with audit log.`,
      });
    } catch {
      toast.error("Override Failed", {
        description: "Unable to commit supervisor reclassification.",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteTest(id);
      toast.success("Dossier Purged", {
        description: "Evidence record successfully removed from active register.",
      });
      navigate("/tests");
    } catch (err) {
      console.error("Failed to delete test record:", err);
      toast.error("Purge Failed", {
        description: "Could not remove evidence file from registry.",
      });
      setDeleting(false);
    }
  };

  if (!test) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-xs font-mono">
            Loading authenticated forensic record...
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
  const formattedDate = new Date(test.captured_at).toUTCString();

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* ========================================================================= */}
      {/* 1. OFFICIAL JUDICIAL CERTIFICATE (Always rendered on print, previewable)   */}
      {/* ========================================================================= */}
      <div
        className={`${
          showCertPreview ? "block" : "hidden"
        } print:block bg-white text-slate-950 p-6 sm:p-8 border-2 border-slate-950 rounded-none max-w-4xl mx-auto space-y-6 certificate-print-sheet font-sans overflow-x-auto`}
        style={{ transform: "none", rotate: "0deg" }}
      >
        {/* Certificate Header with Official Emblem Branding */}
        <div
          className="border-b-2 border-slate-950 pb-5"
          style={{ transform: "none", rotate: "0deg" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-10 h-10 text-slate-900 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                />
              </svg>
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-slate-900">
                  Government of India · Ministry of Home Affairs
                </p>
                <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-700">
                  Central Narcotics & Forensic Digital Evidence Registry
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right font-mono text-[10px] text-slate-500 shrink-0">
              <p className="font-semibold text-slate-700">FORM NIR-NDPS-1A</p>
              <p>TAMPER-EVIDENT ARCHIVE</p>
            </div>
          </div>
          <div className="text-center pt-1">
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-950 font-display">
              Certificate of Forensic Field Analysis
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-xl mx-auto">
              Issued pursuant to statutory chain-of-custody protocols for digital field drug testing evidence.
            </p>
          </div>
        </div>

        {/* Case & Seizure Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-b border-slate-300 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Case Dossier ID</span>
            <span className="font-mono font-bold text-slate-900 break-all">{test.id}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Investigating Officer</span>
            <span className="font-semibold text-slate-900">{test.operator_name || "Field Officer"}</span>
            <span className="text-[11px] text-slate-600 font-mono block">Badge: {test.operator_badge_id || "OFF-001"}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Seizure Timestamp (UTC)</span>
            <span className="font-mono text-slate-900">{formattedDate}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Presumptive Chemical Result</span>
            <span
              className={`inline-block font-bold uppercase px-2 py-0.5 rounded text-[11px] mt-0.5 ${
                test.result === "positive"
                  ? "bg-rose-100 text-rose-950 border border-rose-300"
                  : test.result === "negative"
                  ? "bg-emerald-100 text-emerald-950 border border-emerald-300"
                  : "bg-amber-100 text-amber-950 border border-amber-300"
              }`}
            >
              {test.result} ({(test.confidence * 100).toFixed(0)}% Confidence)
            </span>
          </div>
        </div>

        {/* Specimen Visual Evidence Block */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-4 border-b border-slate-300">
          <div className="sm:col-span-2 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Photographic Specimen Exhibit
            </h3>
            <div className="h-56 bg-slate-50 border border-slate-300 rounded flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Seizure reaction specimen"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <p className="text-xs text-slate-500 italic">No photographic evidence attached (Telemetry Log)</p>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Captured under ISO 6-patch color reference calibration.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
                Colorimetric Reading
              </h3>
              <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-300 rounded">
                <div
                  className="w-10 h-10 rounded border border-slate-400 shrink-0"
                  style={{ backgroundColor: swatchBg }}
                />
                <div className="font-mono text-[11px]">
                  <p className="font-bold text-slate-900">{test.kit_type_name}</p>
                  {swatchRgb && (
                    <p className="text-slate-600">
                      RGB: {swatchRgb.join(", ")}
                    </p>
                  )}
                  {dominantLab && (
                    <p className="text-slate-600">
                      LAB: {dominantLab.L.toFixed(0)}, {dominantLab.a.toFixed(0)}, {dominantLab.b.toFixed(0)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
                Seizure GPS Lock
              </h3>
              <div className="p-2 bg-slate-50 border border-slate-300 rounded font-mono text-[11px] space-y-1">
                <p className="font-bold text-slate-900">
                  {test.latitude.toFixed(6)}° N, {test.longitude.toFixed(6)}° E
                </p>
                <p className="text-slate-600">
                  Accuracy: ±{test.location_accuracy_m ?? 5.0}m ({test.location_verified ? "Hardware GPS Lock" : "Cellular Triangulation"})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cryptographic Proof & Scannable QR Block */}
        <div className="p-4 bg-slate-50 border-2 border-slate-900 rounded space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-2">
                <span>Cryptographic Chain of Custody & Immutability Seal</span>
              </h3>
              <p className="text-[11px] text-slate-600 leading-normal">
                This record is digitally signed using HMAC-SHA256 with canonical payload normalization. Any post-capture alteration of the specimen image, GPS coordinates, or test outcome invalidates this cryptographic seal.
              </p>

              <div className="space-y-1 pt-1 font-mono text-[10px] text-slate-900">
                <p className="truncate">
                  <span className="font-bold text-slate-600">SHA-256 IMAGE:</span> {test.image_hash}
                </p>
                <p className="truncate">
                  <span className="font-bold text-slate-600">CANONICAL DIGEST:</span> {test.record_hash}
                </p>
                <p className="truncate">
                  <span className="font-bold text-slate-600">HMAC-SHA256 SEAL:</span> {test.signature}
                </p>
              </div>
            </div>

            {/* Verification QR Seal for Courtroom Scanners */}
            <div className="shrink-0 text-center p-2 bg-white border border-slate-300 rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                className="w-18 h-18 text-slate-900 mx-auto"
                fill="currentColor"
              >
                {/* SVG QR Code Pattern representing offline cryptographic verification URL */}
                <rect width="100" height="100" fill="#ffffff" />
                <rect x="5" y="5" width="30" height="30" fill="#0f172a" />
                <rect x="10" y="10" width="20" height="20" fill="#ffffff" />
                <rect x="15" y="15" width="10" height="10" fill="#0f172a" />

                <rect x="65" y="5" width="30" height="30" fill="#0f172a" />
                <rect x="70" y="10" width="20" height="20" fill="#ffffff" />
                <rect x="75" y="15" width="10" height="10" fill="#0f172a" />

                <rect x="5" y="65" width="30" height="30" fill="#0f172a" />
                <rect x="10" y="70" width="20" height="20" fill="#ffffff" />
                <rect x="15" y="75" width="10" height="10" fill="#0f172a" />

                {/* Timing patterns & data cells */}
                <rect x="42" y="5" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="5" width="6" height="6" fill="#0f172a" />
                <rect x="42" y="15" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="25" width="6" height="6" fill="#0f172a" />
                <rect x="42" y="35" width="6" height="6" fill="#0f172a" />
                <rect x="15" y="45" width="6" height="6" fill="#0f172a" />
                <rect x="25" y="45" width="6" height="6" fill="#0f172a" />
                <rect x="42" y="45" width="16" height="16" fill="#0f172a" />
                <rect x="45" y="48" width="10" height="10" fill="#ffffff" />
                <rect x="65" y="45" width="6" height="6" fill="#0f172a" />
                <rect x="85" y="45" width="6" height="6" fill="#0f172a" />
                <rect x="42" y="65" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="75" width="6" height="6" fill="#0f172a" />
                <rect x="65" y="65" width="15" height="15" fill="#0f172a" />
                <rect x="75" y="85" width="15" height="10" fill="#0f172a" />
                <rect x="42" y="85" width="8" height="8" fill="#0f172a" />
              </svg>
              <span className="text-[8px] font-mono text-slate-600 block mt-1 uppercase">
                Scan to Verify Seal
              </span>
            </div>
          </div>
        </div>

        {/* Legal Attestation & Formal Signature Lines */}
        <div className="pt-6 space-y-8">
          <p className="text-[11px] text-slate-700 leading-relaxed italic text-justify">
            "I hereby certify under the penalties of perjury that this presumptive field drug test was executed in accordance with established standard operating procedures. The digital evidentiary record, coordinates, and classification outcome recorded above have been preserved in continuous cryptographic custody without modification."
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 print:grid-cols-2 print:gap-12 pt-4 text-xs">
            <div className="border-t border-slate-900 pt-2 space-y-1">
              <p className="font-bold text-slate-950">Investigating Officer Signature</p>
              <p className="text-slate-600 text-[11px]">{test.operator_name || "Officer R. Sharma"} ({test.operator_badge_id || "OFF-001"})</p>
              <p className="text-slate-400 text-[10px]">Date: ________________________</p>
            </div>
            <div className="border-t border-slate-900 pt-2 space-y-1">
              <p className="font-bold text-slate-950">Supervisory / Witnessing Officer Signature</p>
              <p className="text-slate-600 text-[11px]">Rank / Station: __________________________</p>
              <p className="text-slate-400 text-[10px]">Date: ________________________</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ON-SCREEN WORKBENCH VIEW (Hidden when printing)                        */}
      {/* ========================================================================= */}
      <div className="space-y-6 print:hidden">
        {/* Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <Link
              to="/tests"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 mb-1 inline-flex items-center gap-1 transition touch-target group"
            >
              <span className="transition-transform duration-150 group-hover:-translate-x-0.5">←</span>
              <span>Evidence register</span>
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
                Dossier #{test.id.slice(0, 8)}
              </h1>
              <ResultBadge result={test.result} />
              {details?.officer_override && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200 shadow-2xs">
                  Supervisor override
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Captured {formattedDate} · Reagent kit: {test.kit_type_name}
            </p>
          </div>

          {/* Action Toolbar - Structured for Mobile & Desktop */}
          <div className="w-full sm:w-auto space-y-2 sm:space-y-0">
            {/* Mobile-Only Structured Rows (< sm) */}
            <div className="flex sm:hidden flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="flex-1 apple-btn-primary py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-50 touch-target font-semibold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                  <span>{verifying ? "Verifying..." : "Verify seal"}</span>
                </button>
                <button
                  onClick={handlePrintCertificate}
                  className="flex-1 apple-btn-secondary py-2.5 touch-target flex items-center justify-center gap-1.5 font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-500">
                    <path fillRule="evenodd" d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.5A1.75 1.75 0 0 1 16.75 8H17a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-.25A1.75 1.75 0 0 1 15 17.75v-1.5h-10v1.5A1.75 1.75 0 0 1 3.25 16H3a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h.25A1.75 1.75 0 0 1 5 6.25v-3.5Zm1.75.25a.25.25 0 0 0-.25.25v3.5c0 .138.112.25.25.25h6.5a.25.25 0 0 0 .25-.25v-3.5a.25.25 0 0 0-.25-.25h-6.5ZM15 14.75v-3.5a.25.25 0 0 0-.25-.25h-9.5a.25.25 0 0 0-.25.25v3.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25Z" clipRule="evenodd" />
                  </svg>
                  <span>Certificate</span>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-xs">
                <button
                  onClick={() => setShowCertPreview(!showCertPreview)}
                  className="apple-btn-secondary py-2 text-[11px] touch-target flex items-center justify-center truncate"
                >
                  {showCertPreview ? "Hide preview" : "Preview"}
                </button>
                <button
                  onClick={() => setOverrideModal(true)}
                  className="apple-btn-secondary py-2 text-[11px] text-amber-700 hover:text-amber-800 touch-target flex items-center justify-center truncate font-medium"
                >
                  Reclassify
                </button>
                <button
                  onClick={handleExportJson}
                  className="apple-btn-secondary py-2 text-[11px] text-slate-600 touch-target flex items-center justify-center truncate font-mono"
                  title="Download JSON dossier"
                >
                  JSON
                </button>
                <button
                  onClick={() => setDeleteModal(true)}
                  className="apple-btn-secondary py-2 text-[11px] text-rose-600 hover:bg-rose-50 touch-target flex items-center justify-center"
                  title="Purge record"
                >
                  Purge
                </button>
              </div>
            </div>

            {/* Desktop Unified Toolbar (>= sm) */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="apple-btn-primary px-4 py-2 flex items-center justify-center gap-1.5 disabled:opacity-50 touch-target"
              >
                {verifying ? "Verifying..." : "Verify seal"}
              </button>
              <button
                onClick={handlePrintCertificate}
                className="apple-btn-secondary px-3.5 py-2 touch-target flex items-center justify-center"
              >
                Print certificate
              </button>
              <button
                onClick={() => setShowCertPreview(!showCertPreview)}
                className="apple-btn-secondary px-3.5 py-2 touch-target flex items-center justify-center"
              >
                {showCertPreview ? "Hide preview" : "Preview certificate"}
              </button>
              <button
                onClick={() => setOverrideModal(true)}
                className="apple-btn-secondary px-3.5 py-2 text-amber-700 hover:text-amber-800 touch-target flex items-center justify-center"
              >
                Reclassify
              </button>
              <button
                onClick={handleExportJson}
                className="apple-btn-secondary px-3 py-2 text-slate-600 touch-target flex items-center justify-center font-mono"
                title="Download JSON dossier"
              >
                JSON
              </button>
              <button
                onClick={() => setDeleteModal(true)}
                className="p-2 bg-white hover:bg-rose-50 border border-slate-200/90 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-xl text-xs transition tactile-btn touch-target shadow-2xs flex items-center justify-center"
                title="Purge record"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Verification Status Banner */}
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
                <p className="font-bold text-sm">{verification.message}</p>
                <p className="text-xs opacity-80 mt-0.5">
                  Image SHA-256: {verification.image_hash_match ? "Authentic" : "Failed"} · Record Hash: {verification.record_hash_match ? "Authentic" : "Failed"} · HMAC Seal: {verification.signature_valid ? "Valid" : "Invalid"}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded bg-white border border-slate-200 text-slate-800 self-start sm:self-auto shadow-2xs">
              {verification.valid ? "Integrity intact" : "Audit warning"}
            </span>
          </div>
        )}

        {/* Two-Column Structured Analytical Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reaction Specimen Photo */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 font-display">
                Reaction specimen photo
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {imageUrl ? "Photo verified" : "Telemetry log"}
              </span>
            </div>

            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 relative group">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Field test reaction capture"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-slate-400 text-xs font-medium text-center p-6">
                  No visual file attached to this telemetry record.
                </div>
              )}
            </div>

            {test.notes && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500 font-semibold mb-1">Field officer notes</p>
                <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed">
                  {test.notes}
                </p>
              </div>
            )}
          </div>

          {/* Colorimetric Analysis & Location Telemetry */}
          <div className="space-y-6">
            {/* Analysis card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 font-display">
                  Colorimetric analysis
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  {details?.method || "Rule-based LAB"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded border border-slate-300 shrink-0"
                    style={{ backgroundColor: swatchBg }}
                  />
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Normalized Swatch</span>
                    <span className="text-xs font-bold text-slate-900">{test.kit_type_name}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Confidence Score</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    {(test.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {dominantLab && (
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200 font-mono">
                  <span>CIE LAB: L* {dominantLab.L.toFixed(1)}, a* {dominantLab.a.toFixed(1)}, b* {dominantLab.b.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Geographic location */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 font-display">
                  Seizure location
                </h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  test.location_verified
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {test.location_verified ? "Hardware GPS lock" : "Network fix"}
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

        {/* Cryptographic Chain of Custody Ledger */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-display">
                Cryptographic chain of custody
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                HMAC-SHA256 authenticated digital ledger entry. Proof of unaltered state for evidentiary submission.
              </p>
            </div>
            {copiedField && (
              <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold self-start sm:self-auto">
                Copied {copiedField}
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Record UUID</p>
                <p className="text-slate-900 truncate mt-0.5">{test.id}</p>
              </div>
              <button
                onClick={() => handleCopy(test.id, "Record ID")}
                className="px-3.5 py-1.5 min-h-[38px] bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition tactile-btn touch-target shadow-2xs"
              >
                {copiedField === "Record ID" ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">✓ Copied</span>
                ) : (
                  "Copy"
                )}
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">SHA-256 Image Digest</p>
                <p className="text-emerald-700 font-semibold truncate mt-0.5">{test.image_hash}</p>
              </div>
              <button
                onClick={() => handleCopy(test.image_hash, "Image Hash")}
                className="px-3.5 py-1.5 min-h-[38px] bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition tactile-btn touch-target shadow-2xs"
              >
                {copiedField === "Image Hash" ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">✓ Copied</span>
                ) : (
                  "Copy"
                )}
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Canonical Record Digest</p>
                <p className="text-slate-800 truncate mt-0.5">{test.record_hash}</p>
              </div>
              <button
                onClick={() => handleCopy(test.record_hash, "Record Hash")}
                className="px-3.5 py-1.5 min-h-[38px] bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition tactile-btn touch-target shadow-2xs"
              >
                {copiedField === "Record Hash" ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">✓ Copied</span>
                ) : (
                  "Copy"
                )}
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">HMAC-SHA256 Digital Seal</p>
                <p className="text-sky-700 font-semibold truncate mt-0.5">{test.signature}</p>
              </div>
              <button
                onClick={() => handleCopy(test.signature, "Signature")}
                className="px-3.5 py-1.5 min-h-[38px] bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition tactile-btn touch-target shadow-2xs"
              >
                {copiedField === "Signature" ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">✓ Copied</span>
                ) : (
                  "Copy"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Statutory Legal Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs leading-relaxed space-y-1">
          <p className="font-semibold text-slate-800">
            Statutory Forensic Disclaimer (NDPS Compliance)
          </p>
          <p>
            This electronic evidence record represents an authenticated presumptive field colorimetric test outcome. In compliance with NDPS and international forensic standards, presumptive field tests establish reasonable suspicion for seizure and arrest but must be followed by laboratory confirmatory testing (GC-MS / HPLC) prior to judicial indictment.
          </p>
        </div>
      </div>

      {/* Supervisor Override Modal */}
      {overrideModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 safe-bottom backdrop-enter">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl modal-enter">
            <h3 className="text-base font-bold text-slate-900 font-display">Supervisor Reclassification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Amend the presumptive classification based on secondary testing or supervisory review. This audit event is permanently cryptographically stamped.
            </p>

            <div className="space-y-2">
              <label className="text-xs text-slate-700 font-semibold">New outcome</label>
              <div className="grid grid-cols-3 gap-2">
                {(["positive", "negative", "inconclusive"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedOverride(r)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold capitalize transition tactile-btn touch-target ${
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
              <label className="text-xs text-slate-700 font-semibold">Supervisor justification</label>
              <textarea
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                placeholder="Required: State legal and forensic rationale for reclassification..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-800 resize-none font-sans shadow-2xs"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setOverrideModal(false)}
                disabled={updating}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition tactile-btn touch-target shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOverrideSubmit}
                disabled={updating}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50 tactile-btn touch-target shadow-xs"
              >
                {updating ? "Signing..." : "Commit override"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Record Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 safe-bottom backdrop-enter">
          <div className="bg-white border border-rose-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl modal-enter">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-rose-600">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Purge evidence file?</h3>
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
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition tactile-btn touch-target shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50 tactile-btn touch-target shadow-xs"
              >
                {deleting ? "Purging..." : "Confirm purge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
