import { useState } from "react";
import DossierButton from "./DossierButton";
import type { TestRecord } from "../types";

interface LocationCardProps {
  latitude?: number;
  longitude?: number;
  accuracy?: number | null;
  tests?: TestRecord[];
  className?: string;
}

export function openGoogleMaps(lat: number, lon: number) {
  window.open(`https://www.google.com/maps?q=${lat},${lon}&z=17`, "_blank", "noopener,noreferrer");
}

export default function LocationCard({
  latitude,
  longitude,
  accuracy,
  tests,
  className = "",
}: LocationCardProps) {
  const [copied, setCopied] = useState(false);

  // Multiple tests — location summary cards
  if (tests && tests.length > 0) {
    const validTests = tests.filter((t) => t.latitude && t.longitude);

    if (validTests.length === 0) {
      return (
        <div className={`flex items-center justify-center bg-slate-100/60 text-slate-500 text-xs rounded-xl border border-slate-200 py-10 font-mono ${className}`}>
          NO GPS TELEMETRY RECORDED FOR RECENT SAMPLES
        </div>
      );
    }

    return (
      <div className={`space-y-2.5 ${className}`}>
        {validTests.slice(0, 6).map((t) => (
          <div
            key={t.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-xl p-3 sm:px-4 sm:py-3 hover:border-slate-300/90 hover:shadow-xs transition-all duration-150"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  t.result === "positive"
                    ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                    : t.result === "negative"
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                    : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                }`}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 text-xs truncate">
                    {t.kit_type_name || "Field Kit"}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                      t.result === "positive"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : t.result === "negative"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {t.result}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate tabular-nums">
                  {t.latitude.toFixed(4)}°, {t.longitude.toFixed(4)}° · {t.operator_badge_id || "OFF"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t border-slate-100 sm:border-0 shrink-0">
              <button
                onClick={() => openGoogleMaps(t.latitude, t.longitude)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-100/90 hover:bg-slate-200/80 active:bg-slate-300/70 border border-slate-200/80 text-slate-700 rounded-lg transition-all duration-150 active:scale-[0.97] tactile-btn touch-target shadow-2xs"
                title="Open in Google Maps"
              >
                <span>Map</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-slate-500">
                  <path fillRule="evenodd" d="M4.22 11.78a.75.75 0 0 1 0-1.06L9.44 5.5H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
                </svg>
              </button>
              <DossierButton testId={t.id} className="flex-1 sm:flex-initial justify-center" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Single test location
  if (latitude != null && longitude != null) {
    const handleCopyCoord = () => {
      navigator.clipboard.writeText(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className={`bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] text-sky-700 font-mono font-bold tracking-wider uppercase">
                GEOLOCATION LOCK
              </span>
              {accuracy && (
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-semibold">
                  ±{accuracy.toFixed(0)}m ACCURACY
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {latitude.toFixed(5)}° N
              </span>
              <span className="text-slate-400">,</span>
              <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {longitude.toFixed(5)}° E
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              WGS-84 Geodetic Reference Datum · Hardware Fixed
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyCoord}
              className="flex-1 sm:flex-initial px-3.5 py-2 apple-btn-secondary tactile-btn touch-target flex items-center justify-center gap-1.5"
            >
              <span>{copied ? "✓ Copied" : "Copy coordinates"}</span>
            </button>
            <button
              onClick={() => openGoogleMaps(latitude, longitude)}
              className="flex-1 sm:flex-initial px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all duration-150 active:scale-[0.97] tactile-btn touch-target flex items-center justify-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5Z" clipRule="evenodd" />
              </svg>
              <span>Google Maps</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-slate-100/60 text-slate-500 text-xs rounded-xl border border-slate-200 py-8 font-mono ${className}`}>
      GPS COORDINATES NOT RECORDED FOR THIS ENTRY
    </div>
  );
}
