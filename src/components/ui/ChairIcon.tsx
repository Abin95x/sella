/** Hand-drawn line icons of the two chairs, used in chips and marquee tiles. */
export function ChairIcon({ kind, color = "currentColor", className }: { kind: "arc" | "flow"; color?: string; className?: string }) {
  if (kind === "arc") {
    return (
      <svg viewBox="0 0 100 120" className={className} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M26 30c14-7 34-7 48 0" strokeWidth="9" />
        <path d="M30 32 26 112M70 32l4 80" strokeWidth="5" />
        <path d="M22 66h58" strokeWidth="8" />
        <path d="M32 70 36 112M68 70l-4 42" strokeWidth="5" />
        <path d="M29 94h42" strokeWidth="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 120" className={className} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M70 14c4 20 0 36-8 46-6 6-22 8-44 6" strokeWidth="9" />
      <path d="M44 68v8" strokeWidth="8" />
      <path d="M44 76 22 112M44 76l26 36M44 76l-8 36M44 76l12 36" strokeWidth="4" />
    </svg>
  );
}

export function Stars({ count, total = 5 }: { count: number; total?: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${count} out of ${total} stars`}>
      {Array.from({ length: total }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="size-3.5" aria-hidden="true">
          <path
            d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.8l-5.1 2.6 1-5.6-4.1-4 5.7-.8z"
            fill={i < count ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      ))}
    </span>
  );
}
