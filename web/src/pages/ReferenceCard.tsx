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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/" className="text-sm text-emerald-400 hover:underline mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            Forensic Reference Color Card Specification
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              ISO/CIE Standard
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            In-frame lighting calibration standard for field drug test colorimetry (FTC Standard v1.0).
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownloadSvg}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            Download SVG
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/30 flex items-center gap-2"
          >
            Print Standard Card
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Card Display */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-4 font-semibold">
            Actual Card Dimension: 50mm × 30mm (2:3 Aspect)
          </p>

          <div className="bg-slate-950 p-6 rounded-2xl border-2 border-dashed border-slate-700 shadow-2xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 500 300"
              className="w-80 sm:w-96 h-auto drop-shadow-md rounded-lg overflow-hidden bg-slate-900"
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

          <p className="text-xs text-slate-500 mt-4 text-center max-w-sm">
            Print on matte photo paper or display on a smartphone screen beside the test kit for in-frame calibration.
          </p>
        </div>

        {/* Patch Specifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-base font-semibold mb-4 text-slate-200">Color Patch Technical Specifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-left">
                  <th className="pb-2">Patch</th>
                  <th className="pb-2">Color</th>
                  <th className="pb-2">sRGB</th>
                  <th className="pb-2">Calibration Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="py-2.5 font-mono text-emerald-400">#1</td>
                  <td className="py-2.5 font-medium flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-white border border-slate-600 inline-block" />
                    White
                  </td>
                  <td className="py-2.5 font-mono text-slate-400">255, 255, 255</td>
                  <td className="py-2.5 text-slate-300">White balance & sensor exposure ceiling</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-mono text-emerald-400">#2</td>
                  <td className="py-2.5 font-medium flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#767676] inline-block" />
                    18% Gray
                  </td>
                  <td className="py-2.5 font-mono text-slate-400">118, 118, 118</td>
                  <td className="py-2.5 text-slate-300">Mid-tone chromatic adaptation ($L^*=50$)</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-mono text-emerald-400">#3</td>
                  <td className="py-2.5 font-medium flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#ef4444] inline-block" />
                    Red
                  </td>
                  <td className="py-2.5 font-mono text-slate-400">239, 68, 68</td>
                  <td className="py-2.5 text-slate-300">Primary long-wavelength color channel anchor</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-mono text-emerald-400">#4</td>
                  <td className="py-2.5 font-medium flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#22c55e] inline-block" />
                    Green
                  </td>
                  <td className="py-2.5 font-mono text-slate-400">34, 197, 94</td>
                  <td className="py-2.5 text-slate-300">Mid-wavelength channel anchor & luminance</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-mono text-emerald-400">#5</td>
                  <td className="py-2.5 font-medium flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#3b82f6] inline-block" />
                    Blue
                  </td>
                  <td className="py-2.5 font-mono text-slate-400">59, 130, 246</td>
                  <td className="py-2.5 text-slate-300">Short-wavelength channel anchor</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-mono text-emerald-400">#6</td>
                  <td className="py-2.5 font-medium flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-black border border-slate-700 inline-block" />
                    Black
                  </td>
                  <td className="py-2.5 font-mono text-slate-400">0, 0, 0</td>
                  <td className="py-2.5 text-slate-300">Dark level & flare baseline compensation</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
            <p className="font-semibold">Calibration Algorithm (Backend OpenCV Pipeline):</p>
            <p className="text-slate-400">
              The algorithm isolates the reference card ROI in the bottom-right quadrant, samples the 18% neutral gray patch to derive channel multipliers, corrects the test zone in CIE L*a*b* space, and computes Euclidean color distances against authenticated forensic reagent standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
