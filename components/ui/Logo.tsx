type LogoProps = {
  light?: boolean;
  compact?: boolean;
};

export default function Logo({ light = false, compact = false }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 place-items-center">
        <span
          className={`absolute inset-0 rounded-[12px] ${light ? "bg-white/15" : "bg-accent-soft"}`}
        />
        <svg viewBox="0 0 28 28" className="relative h-6 w-6" aria-hidden="true">
          <rect x="2" y="2" width="24" height="24" rx="8" fill={light ? "#ffffff" : "#0e7c74"} />
          <path
            d="M8 14.2c0-3 1.5-5.6 4-7M8.5 18.8a9 9 0 0 0 11-11M12.2 16.4a4.6 4.6 0 0 0 3.4-3.4"
            fill="none"
            stroke={light ? "#0e7c74" : "#ffffff"}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="18.8" cy="9.2" r="1.9" fill={light ? "#e7a64b" : "#e7a64b"} />
        </svg>
      </span>
      {!compact && (
        <span
          className={`font-display text-[1.15rem] font-extrabold tracking-tight ${light ? "text-white" : "text-ink"}`}
        >
          Ring<span className={light ? "text-amber" : "text-accent"}>sure</span>
        </span>
      )}
    </span>
  );
}
