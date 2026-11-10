/**
 * cazierfiscal.com lockup: a coral seal with a check, then the domain in ink.
 * Inline SVG + text, no image request. Colors from the `d-*` tokens, which
 * the `[data-brand="cazierfiscal"]` block in globals.css sets.
 */
export function CazierFiscalLogo({ size = 22, onDark = false }: { size?: number; onDark?: boolean }) {
  const mark = Math.round(size * 1.35);
  return (
    <span className="inline-flex items-center gap-2" style={{ fontSize: size }}>
      <svg width={mark} height={mark} viewBox="0 0 32 32" aria-hidden="true">
        <rect x="1" y="1" width="30" height="30" rx="9" className="fill-d-acc" />
        <path d="M10 16.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-d-ink" />
      </svg>
      <span className={`font-bold leading-none tracking-[-0.03em] ${onDark ? 'text-d-bg' : 'text-d-ink'}`}>
        cazierfiscal<span className="text-d-acc">.com</span>
      </span>
    </span>
  );
}
