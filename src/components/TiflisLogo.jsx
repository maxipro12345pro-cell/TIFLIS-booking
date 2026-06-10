export default function TiflisLogo({ className = 'h-14 w-14', label = 'TIFLIS' }) {
  return (
    <img
      src="/tiflis-logo.svg"
      alt={label}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}
