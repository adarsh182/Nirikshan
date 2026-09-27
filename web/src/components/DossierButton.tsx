import { Link } from "react-router-dom";

interface DossierButtonProps {
  testId: string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Standardized Apple-design Dossier Action Button
 * Provides identical visual hierarchy, micro-interactions, and tactile response across all views.
 */
export default function DossierButton({
  testId,
  label = "Open dossier",
  size = "sm",
  className = "",
}: DossierButtonProps) {
  const sizeClasses =
    size === "sm"
      ? "px-2.5 py-1.5 text-xs gap-1.5"
      : "px-3.5 py-2 text-xs gap-2";

  return (
    <Link
      to={`/tests/${testId}`}
      className={`inline-flex items-center justify-center font-medium text-sky-700 bg-sky-50/90 hover:bg-sky-100/90 active:bg-sky-200/70 border border-sky-200/80 rounded-lg shadow-2xs hover:shadow-xs transition-all duration-150 active:scale-[0.97] group select-none tactile-btn touch-target shrink-0 ${sizeClasses} ${className}`}
      title={`Open forensic dossier for test #${testId.slice(0, 8)}`}
      aria-label={`Open forensic dossier for test #${testId.slice(0, 8)}`}
    >
      <span className="leading-none">{label}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5 text-sky-600 shrink-0"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"
          clipRule="evenodd"
        />
      </svg>
    </Link>
  );
}
