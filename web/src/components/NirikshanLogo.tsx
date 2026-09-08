export default function NirikshanLogo({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="50%" stopColor="#090E1A" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        <linearGradient id="logoShieldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        <linearGradient id="logoGlassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.8" />
        </linearGradient>

        <linearGradient id="logoReagentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="60%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Base Squircle */}
      <rect width="512" height="512" rx="112" fill="url(#logoBgGrad)" />
      <rect width="508" height="508" x="2" y="2" rx="110" fill="none" stroke="url(#logoShieldBorder)" strokeWidth="3" strokeOpacity="0.4" />

      {/* Optical Reticle */}
      <circle cx="256" cy="256" r="160" fill="none" stroke="#1E293B" strokeWidth="2" strokeDasharray="6 8" />
      <circle cx="256" cy="256" r="110" fill="none" stroke="#1E293B" strokeWidth="2" />

      {/* Outer Custody Shield */}
      <path
        d="M256 92 C328 126 386 128 386 128 C386 244 354 340 256 396 C158 340 126 244 126 128 C126 128 184 126 256 92 Z"
        fill="#0D1626"
        stroke="url(#logoShieldBorder)"
        strokeWidth="9"
        strokeLinejoin="round"
      />

      {/* Chemical Flask */}
      <path d="M236 172 L276 172 L276 216 L236 216 Z" fill="url(#logoGlassGrad)" />
      <rect x="230" y="166" width="52" height="8" rx="4" fill="url(#logoGlassGrad)" />
      <path
        d="M236 216 L200 292 C194 304 203 318 217 318 L295 318 C309 318 318 304 312 292 L276 216 Z"
        fill="url(#logoGlassGrad)"
        fillOpacity="0.15"
        stroke="url(#logoGlassGrad)"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* Reagent Fluid */}
      <path
        d="M208 274 Q232 282 256 274 Q280 266 304 274 L308 296 C312 306 305 316 295 316 L217 316 C207 316 200 306 204 296 Z"
        fill="url(#logoReagentGrad)"
      />

      {/* Calibration Dots */}
      <circle cx="218" cy="346" r="7" fill="#10B981" />
      <circle cx="256" cy="346" r="7" fill="#F59E0B" />
      <circle cx="294" cy="346" r="7" fill="#8B5CF6" />

      {/* Reticle Marks */}
      <path d="M196 176 L180 176 L180 192" fill="none" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" />
      <path d="M316 176 L332 176 L332 192" fill="none" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" />
      <path d="M180 290 L180 306 L196 306" fill="none" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" />
      <path d="M332 290 L332 306 L316 306" fill="none" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" />
      <circle cx="256" cy="242" r="4" fill="#F8FAFC" />
    </svg>
  );
}
