/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: cobalt · design-system: design.md · designed-as-app */
import { Link } from "react-router-dom";

export default function ReferenceCardPage() {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSvg = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="50mm" height="30mm" viewBox="0 0 500 300">
  <rect width="500" height="300" fill="#f8fafc" rx="8"/>
  <rect x="15" y="15" width="145" height="125" fill="#FFFFFF" stroke="#334155" stroke-width="2" rx="4"/>
  <rect x="175" y="15" width="145" height="125" fill="#767676" stroke="#334155" stroke-width="2" rx="4"/>
  <rect x="335" y="15" width="145" height="125" fill="#EF4444" stroke="#334155" stroke-width="2" rx="4"/>
  <rect x="15" y="155" width="145" height="125" fill="#22C55E" stroke="#334155" stroke-width="2" rx="4"/>
  <rect x="175" y="155" width="145" height="125" fill="#3B82F6" stroke="#334155" stroke-width="2" rx="4"/>
  <rect x="335" y="155" width="145" height="125" fill="#0F172A" stroke="#334155" stroke-width="2" rx="4"/>
</svg>`;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "standard-reference-card-50x30mm.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-200">
        <div>
          <Link
            to="/"
            className="text-xs font-mono text-sky-700 hover:text-sky-800 font-semibold mb-1.5 inline-flex items-center gap-1 tactile-btn touch-target"
          >
            <span>←</span>
            <span>BACK TO DASHBOARD</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono">
              Calibration Standard Card
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold border border-sky-200">
              ISO/CIE COMPLIANT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            In-frame optical calibration card specification for field colorimetric normalization (FTC Standard v1.0).
          </p>
        </div>

        <div className="flex items-center gap-2.5 pt-1 sm:pt-0">
          <button
            onClick={handleDownloadSvg}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-mono font-semibold transition-colors tactile-btn touch-target flex items-center gap-1.5 shadow-xs"
          >
            <span>DOWNLOAD SVG</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-mono font-bold tracking-wider uppercase shadow-xs transition-all tactile-btn touch-target flex items-center gap-1.5"
          >
            <span>PRINT CARD</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Visual Card Display */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col items-center justify-center shadow-xs space-y-4">
          <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-semibold">
            ACTUAL SPECIFICATION: 50MM × 30MM (2:3 RATIO)
          </p>

          <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm max-w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 500 300"
              className="w-72 sm:w-96 h-auto drop-shadow-sm rounded-lg overflow-hidden bg-slate-900"
            >
              <rect width="500" height="300" fill="#0f172a" rx="8" />
              {/* Row 1 */}
              <rect x="20" y="20" width="135" height="115" fill="#FFFFFF" rx="4" />
              <text x="87" y="85" textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="bold">WHITE</text>
              <rect x="180" y="20" width="135" height="115" fill="#767676" rx="4" />
              <text x="247" y="85" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">18% GRAY</text>
              <rect x="340" y="20" width="135" height="115" fill="#EF4444" rx="4" />
              <text x="407" y="85" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="bold">RED</text>

              {/* Row 2 */}
              <rect x="20" y="165" width="135" height="115" fill="#22C55E" rx="4" />
              <text x="87" y="230" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="bold">GREEN</text>
              <rect x="180" y="165" width="135" height="115" fill="#3B82F6" rx="4" />
              <text x="247" y="230" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="bold">BLUE</text>
              <rect x="340" y="165" width="135" height="115" fill="#000000" stroke="#334155" strokeWidth="2" rx="4" />
              <text x="407" y="230" textAnchor="middle" fill="#64748b" fontSize="18" fontWeight="bold">BLACK</text>
            </svg>
          </div>

          <p className="text-[11px] text-slate-500 font-mono text-center max-w-sm">
            Print onto matte paper or display on a smartphone screen directly adjacent to the chemical spot plate for automated white-balance calibration.
          </p>
        </div>

        {/* Patch Technical Specifications */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2.5">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
              6-PATCH SPECTRAL SPECIFICATIONS
            </h2>
            <p className="text-xs text-slate-500">Standardized sRGB and CIE target matrices.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-mono text-left bg-slate-50">
                  <th className="px-3 py-2.5 font-semibold">PATCH</th>
                  <th className="px-3 py-2.5 font-semibold">COLOR</th>
                  <th className="px-3 py-2.5 font-semibold">sRGB</th>
                  <th className="px-3 py-2.5 font-semibold">OPTICAL ROLE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                <tr>
                  <td className="px-3 py-2.5 text-sky-700 font-bold">#1</td>
                  <td className="px-3 py-2.5 font-medium flex items-center gap-2 text-slate-900">
                    <span className="w-3.5 h-3.5 rounded bg-white border border-slate-300 inline-block shadow-2xs" />
                    White
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">255, 255, 255</td>
                  <td className="px-3 py-2.5 text-slate-600 font-sans">Sensor exposure ceiling & highlight clip</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 text-sky-700 font-bold">#2</td>
                  <td className="px-3 py-2.5 font-medium flex items-center gap-2 text-slate-900">
                    <span className="w-3.5 h-3.5 rounded bg-[#767676] inline-block shadow-2xs" />
                    18% Gray
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">118, 118, 118</td>
                  <td className="px-3 py-2.5 text-slate-600 font-sans">Mid-tone chromatic adaptation (L*=50)</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 text-sky-700 font-bold">#3</td>
                  <td className="px-3 py-2.5 font-medium flex items-center gap-2 text-slate-900">
                    <span className="w-3.5 h-3.5 rounded bg-[#ef4444] inline-block shadow-2xs" />
                    Red
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">239, 68, 68</td>
                  <td className="px-3 py-2.5 text-slate-600 font-sans">Primary long-wavelength channel anchor</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 text-sky-700 font-bold">#4</td>
                  <td className="px-3 py-2.5 font-medium flex items-center gap-2 text-slate-900">
                    <span className="w-3.5 h-3.5 rounded bg-[#22c55e] inline-block shadow-2xs" />
                    Green
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">34, 197, 94</td>
                  <td className="px-3 py-2.5 text-slate-600 font-sans">Mid-wavelength anchor & illuminant flux</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 text-sky-700 font-bold">#5</td>
                  <td className="px-3 py-2.5 font-medium flex items-center gap-2 text-slate-900">
                    <span className="w-3.5 h-3.5 rounded bg-[#3b82f6] inline-block shadow-2xs" />
                    Blue
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">59, 130, 246</td>
                  <td className="px-3 py-2.5 text-slate-600 font-sans">Short-wavelength channel anchor</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 text-sky-700 font-bold">#6</td>
                  <td className="px-3 py-2.5 font-medium flex items-center gap-2 text-slate-900">
                    <span className="w-3.5 h-3.5 rounded bg-black border border-slate-300 inline-block shadow-2xs" />
                    Black
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">0, 0, 0</td>
                  <td className="px-3 py-2.5 text-slate-600 font-sans">Dark current flare baseline calibration</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 font-mono">
            <p className="font-bold text-sky-700 text-[11px]">CALIBRATION ALGORITHM (OPENCV PIPELINE):</p>
            <p className="text-slate-600 text-[11px] font-sans">
              Isolates the reference card ROI in bottom-right quadrant, computes RGB channel gain multipliers against 18% neutral gray, and calculates delta-E Euclidean distance against verified narcotics library standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
