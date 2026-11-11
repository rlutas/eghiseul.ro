/**
 * certificat-constatator-express.ro lockup: an ink tile with a lime bolt,
 * then "Constatator" and "express" on a lime marker. The full domain is too
 * long for a header; it appears in the footer and the legal pages.
 * Inline SVG + text, no image request. Colors from the `d-*` tokens, which
 * the `[data-brand="constatator"]` block in globals.css sets.
 */
export function ConstatatorLogo({ size = 22, onDark = false }: { size?: number; onDark?: boolean }) {
  const mark = Math.round(size * 1.35);
  return (
    <span className="inline-flex items-center gap-2" style={{ fontSize: size }}>
      <svg width={mark} height={mark} viewBox="0 0 32 32" aria-hidden="true">
        <rect x="1" y="1" width="30" height="30" rx="9" className={onDark ? 'fill-d-acc' : 'fill-d-ink'} />
        <path d="M18 5L9 18h6l-2 9 10-14h-6.5L18 5z" className={onDark ? 'fill-d-ink' : 'fill-d-acc'} />
      </svg>
      <span className={`font-bold leading-none tracking-[-0.03em] ${onDark ? 'text-d-bg' : 'text-d-ink'}`}>
        Constatator{' '}
        <span className="rounded-[0.25em] bg-d-acc px-[0.22em] pb-[0.06em] text-d-ink">express</span>
      </span>
    </span>
  );
}
