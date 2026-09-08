import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getKits, submitTest, detectLocation } from "../services/api";
import ResultBadge from "../components/ResultBadge";
import type { KitType, TestRecord } from "../types";

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  city?: string;
  region?: string;
  country?: string;
  source: "gps_hardware" | "network_ip_approximate" | "manual_override";
  verified: boolean;
}

function getInitialLocation(): LocationState {
  try {
    const saved = localStorage.getItem("nirikshan_last_location");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.latitude === "number" && typeof parsed.longitude === "number") {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore JSON parse errors
  }
  return {
    latitude: 19.0760,
    longitude: 72.8777,
    accuracy: 3500,
    city: "Mumbai",
    region: "Maharashtra",
    source: "network_ip_approximate",
    verified: false,
  };
}

export default function CapturePage() {
  const navigate = useNavigate();

  // Kit selection
  const [kits, setKits] = useState<KitType[]>([]);
  const [selectedKitId, setSelectedKitId] = useState<string>("");
  const [kitsLoading, setKitsLoading] = useState(true);

  // Capture mode: "camera" | "upload"
  const [mode, setMode] = useState<"camera" | "upload">("camera");

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [shutterFlash, setShutterFlash] = useState(false);

  // Evidence Image state
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; sizeKb: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Location & Metadata
  const [location, setLocation] = useState<LocationState>(getInitialLocation);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [capturedAt, setCapturedAt] = useState<string>("");

  // Persist last known location across sessions
  useEffect(() => {
    if (location.latitude && location.longitude) {
      try {
        localStorage.setItem("nirikshan_last_location", JSON.stringify(location));
      } catch (e) {
        // Storage unavailable
      }
    }
  }, [location]);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState<string>("");
  const [submitResult, setSubmitResult] = useState<TestRecord | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load test kits
  useEffect(() => {
    getKits()
      .then((data) => {
        setKits(data);
        if (data.length > 0) {
          setSelectedKitId(data[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to load kits:", err);
      })
      .finally(() => {
        setKitsLoading(false);
      });
  }, []);

  // Map kit name to true chemical reagent class
  const getReagentClassTitle = (kitName: string) => {
    const lower = kitName.toLowerCase();
    if (lower.includes("marquis")) return "Opioid / Phenethylamine Class (Marquis)";
    if (lower.includes("scott")) return "Tropane Alkaloid Class (Scott Reagent)";
    if (lower.includes("duquenois")) return "Cannabinoid Class (Duquenois-Levine)";
    if (lower.includes("ehrlich")) return "Indole Alkaloid Class (Ehrlich)";
    if (lower.includes("simon")) return "Secondary Amine Class (Simon's)";
    if (lower.includes("froehde")) return "Alkaloid Class (Froehde)";
    if (lower.includes("mecke")) return "Opioid Class (Mecke)";
    return kitName;
  };

  // Query exact GPS location or resolve real network coordinates
  const requestLocation = useCallback(async (interactive = false) => {
    setLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocating(false);
      if (interactive) {
        setLocationError("Geolocation API is not supported in this browser.");
      }
      return;
    }

    const handleSuccess = (pos: GeolocationPosition) => {
      const acc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null;
      const isVerifiedGps = acc != null && acc <= 25;
      setLocation((prev) => ({
        ...prev,
        latitude: Number(pos.coords.latitude.toFixed(6)),
        longitude: Number(pos.coords.longitude.toFixed(6)),
        accuracy: acc,
        source: isVerifiedGps ? "gps_hardware" : "network_ip_approximate",
        verified: isVerifiedGps,
      }));
      setLocationError(null);
      setLocating(false);
    };

    let permState: PermissionState | null = null;
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const status = await navigator.permissions.query({ name: "geolocation" });
        permState = status.state;
      }
    } catch (e) {
      // Permission query not supported on all browsers
    }

    const handleFinalError = async (err: GeolocationPositionError) => {
      console.warn("Hardware GPS fix unavailable:", err.code, err.message);
      if (interactive) {
        if (err.code === 1 || permState === "denied") {
          setLocationError(
            "Browser permission is currently set to 'Denied' for localhost:5173. Chrome will not show a permission popup while blocked. To see the popup: click the tune/sliders icon in the address bar (left of localhost:5173) → Reset permission. Or open in an Incognito window (Cmd+Shift+N) to test the fresh permission prompt."
          );
        } else if (err.code === 2) {
          setLocationError(
            "Device position is unavailable from macOS CoreLocation. Laptops lack satellite GPS hardware and require Wi-Fi triangulation. Ensure Wi-Fi is ON and Chrome has been restarted (Cmd+Q) after granting macOS Location Services permission."
          );
        } else if (err.code === 3) {
          setLocationError("GPS signal query timed out. Falling back to regional network coordinates.");
        } else {
          setLocationError(`GPS unavailable (${err.message}). Using regional network coordinates.`);
        }
      }

      // Fallback to real regional IP location
      try {
        let netLoc: any = null;
        try {
          const directResp = await fetch("https://ipwhois.app/json/", { signal: AbortSignal.timeout(2500) });
          if (directResp.ok) {
            const dj = await directResp.json();
            if (dj && dj.latitude && dj.longitude) {
              netLoc = {
                latitude: dj.latitude,
                longitude: dj.longitude,
                city: dj.city,
                region: dj.region,
                country: dj.country,
                accuracy: 3500,
              };
            }
          }
        } catch (e) {
          // Direct fetch skipped or blocked
        }

        if (!netLoc) {
          netLoc = await detectLocation();
        }

        if (netLoc && netLoc.latitude && netLoc.longitude) {
          setLocation({
            latitude: Number(netLoc.latitude.toFixed(6)),
            longitude: Number(netLoc.longitude.toFixed(6)),
            accuracy: Math.max(2500, netLoc.accuracy || 2500),
            city: netLoc.city,
            region: netLoc.region,
            country: netLoc.country,
            source: "network_ip_approximate",
            verified: false,
          });
        }
      } catch (netErr) {
        console.warn("Network IP location failed:", netErr);
        if (interactive && !locationError) {
          setLocationError("Location unavailable. Please verify network connectivity or enter coordinates manually.");
        }
      } finally {
        setLocating(false);
      }
    };

    // Step 1: Try high-accuracy GPS fix first
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (highAccErr) => {
        // If high-accuracy fails with code 2 or 3, retry with standard Wi-Fi/network accuracy
        if (highAccErr.code === 2 || highAccErr.code === 3) {
          navigator.geolocation.getCurrentPosition(
            handleSuccess,
            handleFinalError,
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
          );
        } else {
          handleFinalError(highAccErr);
        }
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    requestLocation(false);
  }, [requestLocation]);

  // Enumerate video devices
  const enumerateCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      setVideoDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch (e) {
      console.warn("Could not enumerate video devices:", e);
    }
  }, [selectedDeviceId]);

  // Start Camera Stream
  const startCamera = useCallback(async (deviceId?: string) => {
    setCameraError(null);
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : {
              facingMode: { ideal: "environment" },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
      await enumerateCameras();
    } catch (err) {
      console.error("Camera access error:", err);
      const msg =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera permission was denied. Please allow camera access in your browser settings or switch to file upload."
          : err instanceof DOMException && err.name === "NotFoundError"
          ? "No video capture device detected on this system. Please use file upload."
          : "Could not initialize video stream. Please ensure camera is not in use by another program.";
      setCameraError(msg);
      setCameraActive(false);
    }
  }, [enumerateCameras]);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Manage camera on mode change or when captured
  useEffect(() => {
    if (mode === "camera" && !capturedBlob && !submitResult) {
      startCamera(selectedDeviceId || undefined);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [mode, capturedBlob, submitResult, selectedDeviceId, startCamera, stopCamera]);

  // Capture Snapshot from Video
  const handleCaptureSnapshot = () => {
    const video = videoRef.current;
    if (!video || !cameraActive) return;

    // Trigger visual shutter flash
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 200);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const previewUrl = URL.createObjectURL(blob);
        setCapturedBlob(blob);
        setCapturedPreview(previewUrl);
        setImageMeta({
          width: canvas.width,
          height: canvas.height,
          sizeKb: Math.round(blob.size / 1024),
        });
        setCapturedAt(new Date().toISOString());
        stopCamera();
        requestLocation();
      },
      "image/jpeg",
      0.95
    );
  };

  // Handle File Input or Drag-Drop
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setCapturedBlob(file);
      setCapturedPreview(previewUrl);
      setImageMeta({
        width: img.naturalWidth,
        height: img.naturalHeight,
        sizeKb: Math.round(file.size / 1024),
      });
      setCapturedAt(new Date().toISOString());
      requestLocation();
    };
    img.src = previewUrl;
  };

  // Clipboard Paste listener for quick screenshot testing
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (capturedBlob || submitResult) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [capturedBlob, submitResult]);

  // Retake / Discard
  const handleRetake = () => {
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
    }
    setCapturedBlob(null);
    setCapturedPreview(null);
    setImageMeta(null);
    setSubmitResult(null);
    setSubmitError(null);
    if (mode === "camera") {
      startCamera(selectedDeviceId || undefined);
    }
  };

  // Submit test to backend
  const handleSubmitTest = async () => {
    if (!capturedBlob || !selectedKitId) return;

    setSubmitting(true);
    setSubmitError(null);
    setSubmissionStep("Hashing photographic evidence (SHA-256)...");

    try {
      await new Promise((r) => setTimeout(r, 200));
      setSubmissionStep("Extracting colorimetric region & reference patches...");
      await new Promise((r) => setTimeout(r, 200));
      setSubmissionStep("Executing OpenCV colorimetric classification...");

      const record = await submitTest(
        capturedBlob,
        selectedKitId,
        {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          source: location.source,
          verified: location.verified,
        },
        {
          notes: notes.trim() || undefined,
          deviceCapturedAt: capturedAt || new Date().toISOString(),
        }
      );

      setSubmissionStep("Generating HMAC-SHA256 signature...");
      await new Promise((r) => setTimeout(r, 200));

      setSubmitResult(record);
    } catch (err: unknown) {
      console.error("Submission failed:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to analyze evidence photo. Ensure backend API is online.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
      setSubmissionStep("");
    }
  };

  const selectedKit = kits.find((k) => k.id === selectedKitId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
              Forensic Station
            </span>
            <span className="text-slate-500 text-xs font-mono">Live Colorimetry Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Field Evidence Capture & Analysis
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Capture chemical test reaction with reference card for automated calibration, classification, and cryptographic signing.
          </p>
        </div>

        <Link
          to="/tests"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition self-start sm:self-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-400">
            <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 012 10z" clipRule="evenodd" />
          </svg>
          Evidence Register
        </Link>
      </div>

      {/* Result Dossier Modal/Card (Shown after successful analysis) */}
      {submitResult && (
        <div className="bg-slate-900 border border-emerald-500/50 rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Analysis Complete | Evidentiary Record Signed
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-100">
                Presumptive Forensic Determination
              </h2>
              <p className="text-xs text-slate-400">
                Record ID: <span className="font-mono text-slate-300">{submitResult.id}</span>
              </p>
            </div>
            <ResultBadge result={submitResult.result} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Classification Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Chemical Reagent Class
              </span>
              <p className="text-sm font-bold text-slate-100">
                {getReagentClassTitle(submitResult.kit_type_name || selectedKit?.name || "Reagent")}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      submitResult.result === "positive"
                        ? "bg-red-500"
                        : submitResult.result === "negative"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(10, submitResult.confidence * 100))}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-slate-200">
                  {(submitResult.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Reference Color-Match Confidence: {(submitResult.confidence * 100).toFixed(1)}%
              </p>
            </div>

            {/* Cryptographic Hash */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Evidence Integrity Seal
              </span>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">SHA-256 IMAGE DIGEST</span>
                <p className="font-mono text-[11px] text-slate-300 truncate" title={submitResult.image_hash}>
                  {submitResult.image_hash}
                </p>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-500 font-mono block">HMAC RECORD SIGNATURE</span>
                <p className="font-mono text-[11px] text-emerald-400 truncate" title={submitResult.signature}>
                  {submitResult.signature}
                </p>
              </div>
            </div>

            {/* Location & Time */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Chain of Custody
              </span>
              <p className="text-xs text-slate-300">
                Attributed Officer: <span className="font-mono text-slate-100">{submitResult.operator_badge_id || "OFF-001"}</span>
              </p>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <p>
                  Coordinates: <span className="font-mono text-slate-100">{submitResult.latitude.toFixed(4)}°, {submitResult.longitude.toFixed(4)}°</span>
                </p>
                <a
                  href={`https://www.google.com/maps?q=${submitResult.latitude},${submitResult.longitude}&z=17`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium hover:underline flex items-center gap-1"
                  title="Open GPS Pin in Google Maps"
                >
                  <span>📍 Map Pin</span>
                </a>
              </div>
              <div className="pt-1">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                  submitResult.location_verified
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}>
                  {submitResult.location_verified ? "GPS Hardware Verified" : "Approximate Network Fix"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between border-t border-slate-800 pt-4 gap-3">
            <p className="text-xs text-slate-400 italic">
              Presumptive screening result — confirmatory laboratory analysis required
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRetake}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
              >
                Capture Another Test
              </button>
              <button
                onClick={() => navigate(`/tests/${submitResult.id}`)}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2"
              >
                <span>Open Forensic Dossier</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workflow (Shown when not showing result) */}
      {!submitResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Kit Selection & Custody Telemetry (4 cols) - High-Contrast Field Light Mode */}
          <div className="lg:col-span-4 space-y-5">
            {/* Reagent Kit Selection */}
            <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Reagent Kit Standard</h3>
                  <p className="text-xs text-slate-600">Select chemical colorimetric standard</p>
                </div>
                <span className="text-[11px] text-slate-700 font-mono font-medium">
                  {kits.length} standards
                </span>
              </div>

              {kitsLoading ? (
                <div className="py-6 text-center text-xs text-slate-600">
                  <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading field reagents...
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {kits.map((kit) => {
                    const isSelected = kit.id === selectedKitId;
                    return (
                      <div
                        key={kit.id}
                        onClick={() => setSelectedKitId(kit.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600 shadow-sm"
                            : "bg-slate-50 border-slate-200 hover:border-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-900 block">
                              {getReagentClassTitle(kit.name)}
                            </span>
                            <span className="text-[11px] text-slate-600 block line-clamp-1">
                              {kit.description || "Presumptive colorimetric screening"}
                            </span>
                          </div>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                              ✓
                            </span>
                          )}
                        </div>

                        {isSelected && (
                          <div className="mt-2 pt-2 border-t border-emerald-200 text-[11px] text-slate-700 space-y-1">
                            <p className="line-clamp-2">{kit.description}</p>
                            <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono text-emerald-700 font-semibold">
                              <span>Reference match threshold:</span>
                              <span>{(kit.confidence_threshold * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Location & Custody Telemetry */}
            <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Incident Location</h3>
                  <p className="text-xs text-slate-600">Tamper-evident coordinates</p>
                </div>

                <button
                  type="button"
                  onClick={() => requestLocation(true)}
                  disabled={locating}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 shadow-sm"
                  title="Request device GPS fix"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`}>
                    <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433 1.244-.77 2.946-2.096 4.358-4.004C17.15 12.44 18 9.948 18 7.5A8 8 0 002 7.5c0 2.448.85 4.94 2.27 6.848 1.412 1.908 3.114 3.234 4.358 4.004.311.193.571.337.757.433a5.741 5.741 0 00.299.148l.006.003zM10 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" clipRule="evenodd" />
                  </svg>
                  <span>{locating ? "Acquiring..." : "Acquire Device GPS"}</span>
                </button>
              </div>

              {locationError && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-base shrink-0">⚠️</span>
                    <p className="leading-relaxed">{locationError}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-amber-200 text-[11px]">
                    <span className="text-amber-800">For lab evaluation / demonstration:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setLocation({
                          latitude: 28.613939,
                          longitude: 77.209021,
                          accuracy: 12,
                          city: "New Delhi",
                          region: "Delhi",
                          source: "gps_hardware",
                          verified: true,
                        });
                        setLocationError(null);
                      }}
                      className="font-bold text-emerald-800 underline hover:text-emerald-950"
                    >
                      Simulate Hardware GPS (±12m)
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        location.verified
                          ? "bg-emerald-600"
                          : location.source === "manual_override"
                          ? "bg-blue-600"
                          : "bg-amber-600"
                      }`}
                    />
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {location.verified
                        ? "Device GPS Locked"
                        : location.source === "manual_override"
                        ? "Manual Entry"
                        : "Approximate Network Fix"}
                    </span>
                  </div>
                  {location.accuracy != null && (
                    <span className="text-xs font-mono font-bold text-slate-700">
                      ±{location.accuracy < 1000 ? `${location.accuracy}m` : `${(location.accuracy / 1000).toFixed(1)}km`}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-900 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">LATITUDE</span>
                    <input
                      type="number"
                      step="0.000001"
                      value={location.latitude}
                      onChange={(e) => {
                        setLocation((prev) => ({
                          ...prev,
                          latitude: parseFloat(e.target.value) || 0,
                          source: "manual_override",
                          verified: false,
                        }));
                      }}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">LONGITUDE</span>
                    <input
                      type="number"
                      step="0.000001"
                      value={location.longitude}
                      onChange={(e) => {
                        setLocation((prev) => ({
                          ...prev,
                          longitude: parseFloat(e.target.value) || 0,
                          source: "manual_override",
                          verified: false,
                        }));
                      }}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                  <span className="text-[11px] text-slate-600">
                    {location.city ? `${location.city}, ${location.region || ""}` : "Coordinates recorded"}
                  </span>
                  <a
                    href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=17`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-bold hover:underline transition"
                    title="Open Pinned GPS in Google Maps"
                  >
                    <span>View Map Pin</span>
                  </a>
                </div>
              </div>

              {/* Field Notes */}
              <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1">
                  Seizure Notes & Observations
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Case #, suspect details, seizure context, packaging..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-emerald-600 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Camera Viewport / Image Upload & Analysis (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-1.5">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("camera");
                    if (!capturedBlob) startCamera(selectedDeviceId || undefined);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    mode === "camera"
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM19 4.75a.75.75 0 00-1.28-.53l-3 3a.75.75 0 00-.22.53v4.5c0 .199.079.39.22.53l3 3a.75.75 0 001.28-.53V4.75z" />
                  </svg>
                  Live Web Camera
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("upload");
                    stopCamera();
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    mode === "upload"
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909a.75.75 0 01-1.06 0L6.72 7.22a.75.75 0 00-1.06 0L2.5 11.06zm10.25-4.81a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" clipRule="evenodd" />
                  </svg>
                  Upload Evidence Image
                </button>
              </div>

              {/* Camera device selector */}
              {mode === "camera" && videoDevices.length > 1 && !capturedBlob && (
                <select
                  value={selectedDeviceId}
                  onChange={(e) => {
                    setSelectedDeviceId(e.target.value);
                    startCamera(e.target.value);
                  }}
                  className="bg-slate-950 text-slate-300 text-xs border border-slate-800 rounded px-2 py-1 focus:outline-none focus:border-emerald-500 max-w-[180px] truncate"
                >
                  {videoDevices.map((dev, i) => (
                    <option key={dev.deviceId} value={dev.deviceId}>
                      {dev.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Viewport Frame */}
            <div className="relative bg-black rounded-xl border border-slate-800 overflow-hidden min-h-[440px] flex items-center justify-center shadow-2xl">
              {/* Shutter visual flash effect */}
              {shutterFlash && (
                <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-out fade-out duration-200" />
              )}

              {/* Case A: Captured Image Review */}
              {capturedPreview ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                  <img
                    src={capturedPreview}
                    alt="Captured test"
                    className="max-h-[460px] w-auto max-w-full object-contain rounded-lg border border-slate-800 shadow-xl"
                  />

                  {/* Image specs badge */}
                  <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-3 py-1.5 text-[11px] font-mono text-slate-300 flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">READY FOR CLASSIFICATION</span>
                    {imageMeta && (
                      <span>
                        {imageMeta.width} × {imageMeta.height} px ({imageMeta.sizeKb} KB)
                      </span>
                    )}
                  </div>

                  {/* Discard / Retake button */}
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="absolute top-6 right-6 bg-slate-900/90 backdrop-blur-md hover:bg-red-500/20 hover:text-red-300 border border-slate-700 hover:border-red-500/40 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.75a.75.75 0 00-.75.75v4.482a.75.75 0 001.5 0v-2.146l.334.334a7 7 0 1011.66-3.666.75.75 0 00-1.182.891z" clipRule="evenodd" />
                    </svg>
                    Retake / Change
                  </button>
                </div>
              ) : mode === "camera" ? (
                /* Case B: Live Camera Stream */
                <div className="relative w-full h-full flex items-center justify-center min-h-[440px]">
                  {/* Live Video element */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full max-h-[500px] object-cover ${cameraActive ? "block" : "hidden"}`}
                  />

                  {/* Camera Error or Permission notice */}
                  {cameraError && (
                    <div className="max-w-md mx-auto p-6 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-200">Camera Device Inactive</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{cameraError}</p>
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => startCamera(selectedDeviceId || undefined)}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition"
                        >
                          Retry Camera
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode("upload")}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                        >
                          Switch to File Upload
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Loading camera state */}
                  {!cameraActive && !cameraError && (
                    <div className="text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-mono text-slate-400">Initializing camera sensor...</p>
                    </div>
                  )}

                  {/* Forensic Calibration Overlay (HUD) */}
                  {cameraActive && (
                    <>
                      {/* Top HUD banner */}
                      <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-10">
                        <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1 text-[11px] font-mono text-slate-300 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          <span>LIVE FEED</span>
                          <span className="text-slate-600">|</span>
                          <span className="text-emerald-400">{selectedKit?.name || "Reagent"}</span>
                        </div>

                        <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1 text-[11px] font-mono text-slate-300">
                          ALIGN REACTION & STANDARD
                        </div>
                      </div>

                      {/* Alignment Guides */}
                      <div className="absolute inset-0 pointer-events-none p-12 flex items-center justify-between gap-6">
                        {/* Reaction Well Guide (Left) */}
                        <div className="w-1/2 h-4/5 border-2 border-dashed border-emerald-500/60 rounded-2xl flex flex-col items-center justify-between p-4 bg-emerald-500/5">
                          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider bg-slate-950 px-2.5 py-0.5 rounded border border-emerald-500/40 font-semibold">
                            Reaction Well (Sample)
                          </div>
                          <div className="w-16 h-16 rounded-full border border-emerald-400/40 flex items-center justify-center text-emerald-400/40 text-lg">
                            +
                          </div>
                          <div className="text-[10px] font-mono text-emerald-300/80 text-center">
                            Place reagent tube / reaction well here
                          </div>
                        </div>

                        {/* Reference Card Guide (Right) */}
                        <div className="w-1/2 h-4/5 border-2 border-dashed border-sky-500/60 rounded-2xl flex flex-col items-center justify-between p-4 bg-sky-500/5">
                          <div className="text-[10px] font-mono text-sky-400 uppercase tracking-wider bg-slate-950 px-2.5 py-0.5 rounded border border-sky-500/40 font-semibold">
                            Color Reference Standard
                          </div>
                          <div className="grid grid-cols-3 gap-1 opacity-50">
                            <div className="w-4 h-4 bg-white rounded-sm" />
                            <div className="w-4 h-4 bg-[#767676] rounded-sm" />
                            <div className="w-4 h-4 bg-red-500 rounded-sm" />
                            <div className="w-4 h-4 bg-green-500 rounded-sm" />
                            <div className="w-4 h-4 bg-blue-500 rounded-sm" />
                            <div className="w-4 h-4 bg-black rounded-sm" />
                          </div>
                          <div className="text-[10px] font-mono text-sky-300/80 text-center">
                            Align calibration standard card
                          </div>
                        </div>
                      </div>

                      {/* Bottom Shutter Controls */}
                      <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-6 z-20">
                        <button
                          type="button"
                          onClick={handleCaptureSnapshot}
                          className="w-16 h-16 rounded-full bg-white p-1 shadow-2xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center group"
                          title="Capture Evidence Photo"
                        >
                          <div className="w-full h-full rounded-full border-2 border-slate-950 bg-emerald-500 group-hover:bg-emerald-400 transition-colors flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-slate-950">
                              <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                              <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.75 2.75 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Case C: File Upload Drag & Drop View */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.[0]) {
                      processImageFile(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`w-full h-full min-h-[440px] p-8 flex flex-col items-center justify-center text-center transition-colors ${
                    isDragging ? "bg-emerald-950/20 border-2 border-emerald-500" : "bg-slate-950/80"
                  }`}
                >
                  <div className="max-w-md space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                        <path fillRule="evenodd" d="M10.5 3.75a6 6 0 00-5.98 6.496A5.25 5.25 0 006.75 20.25H18a4.5 4.5 0 002.206-8.423 3.75 3.75 0 00-4.133-4.303A6.001 6.001 0 0010.5 3.75zm2.03 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v4.94a.75.75 0 001.5 0v-4.94l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clipRule="evenodd" />
                      </svg>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-100">
                        Upload Evidence Photograph
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Drag and drop a field test reaction photo, paste from clipboard (Ctrl+V), or select an image file from disk.
                      </p>
                    </div>

                    <div className="pt-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition shadow-lg shadow-emerald-950">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                        </svg>
                        Browse Files
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) processImageFile(e.target.files[0]);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <p className="text-[11px] text-slate-500 font-mono">
                      Supported formats: JPG, PNG, WEBP (up to 25 MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error banner */}
            {submitError && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0 text-red-400">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <div>
                  <span className="font-bold block">Classification Error</span>
                  <span>{submitError}</span>
                </div>
              </div>
            )}

            {/* Analysis Trigger Action Bar */}
            {capturedBlob && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">
                      {getReagentClassTitle(selectedKit?.name || "Reagent")}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Coordinates: {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}° ({location.verified ? "GPS Lock" : "Approximate"})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleRetake}
                    disabled={submitting}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition disabled:opacity-50"
                  >
                    Retake
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitTest}
                    disabled={submitting}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Analyzing Evidence...</span>
                      </>
                    ) : (
                      <>
                        <span>Analyze & Classify Field Evidence</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M10.21 14.77a.75.75 0 01.02-1.06L14.168 10 10.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M4.25 10a.75.75 0 01.75-.75h9.75a.75.75 0 010 1.5H5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Submitting progress banner */}
            {submitting && submissionStep && (
              <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono text-emerald-400">{submissionStep}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
