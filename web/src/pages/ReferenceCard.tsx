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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-200/80">
        <div>
          <Link
            to="/"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 mb-1.5 inline-flex items-center gap-1 tactile-btn touch-target group"
          >
            <span className="transition-transform duration-150 group-hover:-translate-x-0.5">←</span>
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
              Calibration Standard Card
            </h1>
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold border border-sky-200/80 shadow-2xs">
              ISO/CIE Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            In-frame optical calibration card specification for field colorimetric normalization (FTC Standard v1.0).
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 pt-1 sm:pt-0 w-full sm:w-auto">
          <button
            onClick={handleDownloadSvg}
            className="flex-1 sm:flex-initial apple-btn-secondary px-3.5 py-2.5 flex items-center justify-center gap-1.5 touch-target"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-500">
              <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
              <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
            </svg>
            <span>Download SVG</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial apple-btn-primary px-4 py-2.5 flex items-center justify-center gap-1.5 touch-target"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.5A1.75 1.75 0 0 1 16.75 8H17a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-.25A1.75 1.75 0 0 1 15 17.75v-1.5h-10v1.5A1.75 1.75 0 0 1 3.25 16H3a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h.25A1.75 1.75 0 0 1 5 6.25v-3.5Zm1.75.25a.25.25 0 0 0-.25.25v3.5c0 .138.112.25.25.25h6.5a.25.25 0 0 0 .25-.25v-3.5a.25.25 0 0 0-.25-.25h-6.5ZM15 14.75v-3.5a.25.25 0 0 0-.25-.25h-9.5a.25.25 0 0 0-.25.25v3.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25Z" clipRule="evenodd" />
            </svg>
            <span>Print card</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Visual Card Display */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center shadow-xs space-y-4">
          <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-semibold">
            Actual specification: 50mm × 30mm (2:3 ratio)
          </p>

          <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm max-w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 500 300"
              className="w-full max-w-[340px] sm:max-w-sm h-auto drop-shadow-sm rounded-lg overflow-hidden bg-slate-900"
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

          <div className="responsive-table-wrapper">
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
