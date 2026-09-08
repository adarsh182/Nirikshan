import logoSrc from "../assets/logo.png";

export default function NirikshanLogo({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src={logoSrc}
      alt="Nirikshan Evidence Vault"
      width={size}
      height={size}
      className={`object-contain inline-block shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      loading="eager"
    />
  );
}
