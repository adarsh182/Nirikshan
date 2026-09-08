import { Link } from "react-router-dom";
import type { TestRecord } from "../types";

interface LocationCardProps {
  latitude?: number;
  longitude?: number;
  accuracy?: number | null;
  tests?: TestRecord[];
  className?: string;
}

function openGoogleMaps(lat: number, lon: number) {
  window.open(`https://www.google.com/maps?q=${lat},${lon}&z=16`, "_blank");
}

export default function LocationCard({
  latitude,
  longitude,
  accuracy,
  tests,
  className = "",
}: LocationCardProps) {
  // Multiple tests — location summary table
  if (tests && tests.length > 0) {
    const validTests = tests.filter((t) => t.latitude && t.longitude);

    if (validTests.length === 0) {
      return (
        <div className={`flex items-center justify-center bg-slate-950 text-slate-500 text-sm rounded-xl border border-slate-800 py-12 ${className}`}>
          No GPS coordinates recorded for recent tests
        </div>
      );
    }

    return (
      <div className={`space-y-1.5 ${className}`}>
        {validTests.slice(0, 8).map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between gap-3 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 hover:border-slate-700 transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  t.result === "positive"
                    ? "bg-red-500"
                    : t.result === "negative"
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                }`}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-200 truncate">
                    {t.kit_type_name || "Presumptive Kit"}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                      t.result === "positive"
                        ? "bg-red-500/15 text-red-400"
                        : t.result === "negative"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {t.result}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {t.latitude.toFixed(4)}°, {t.longitude.toFixed(4)}°
                  <span className="text-slate-600 ml-2">
                    {t.operator_badge_id} · {new Date(t.captured_at).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openGoogleMaps(t.latitude, t.longitude)}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 border border-slate-700 text-slate-400 rounded-md transition-colors"
                title="Open in Google Maps"
              >
                📍 Open Map
              </button>
              <Link
                to={`/tests/${t.id}`}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md transition-colors"
              >
                View →
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Single test location
  if (latitude != null && longitude != null) {
    return (
      <div className={`bg-slate-950 border border-slate-800 rounded-xl p-5 ${className}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">
              GPS Coordinates
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-lg font-bold text-slate-100">
                {latitude.toFixed(5)}°
              </span>
              <span className="text-slate-600 text-sm">N</span>
              <span className="text-slate-700 mx-1">·</span>
              <span className="font-mono text-lg font-bold text-slate-100">
                {longitude.toFixed(5)}°
              </span>
              <span className="text-slate-600 text-sm">E</span>
            </div>
            {accuracy && (
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                GPS Accuracy: ±{accuracy.toFixed(0)}m
              </p>
            )}
          </div>
          <button
            onClick={() => openGoogleMaps(latitude, longitude)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5Z" clipRule="evenodd" />
            </svg>
            Open in Google Maps
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-slate-950 text-slate-500 text-sm rounded-xl border border-slate-800 py-12 ${className}`}>
      GPS coordinate data not available for this record
    </div>
  );
}
