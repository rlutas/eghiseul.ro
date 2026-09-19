/**
 * documentero.ro brand mark and lockup. Geometry from docs/documentero/design.md:
 * a lowercase "d" whose stem folds like a page corner. Inline SVG so it renders
 * without an image request, in any color, at any size.
 */
export function DocumenteroMark({
  size = 28,
  ink = 'var(--d-ink)',
  accent = 'var(--d-acc)',
  className,
}: {
  size?: number;
  ink?: string;
  accent?: string;
  className?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      <path d="M36 8h5l13 13v35h-18z" fill={ink} />
      <path d="M41 8v13h13z" fill={accent} />
      <circle cx="28" cy="39" r="10" fill="none" stroke={ink} strokeWidth="12" />
      <rect x="36" y="22" width="8" height="34" fill={ink} />
    </svg>
  );
}

export function DocumenteroLogo({
  size = 24,
  onDark = false,
  className = '',
}: {
  /** Wordmark font size in px; the mark is 1.25× it. */
  size?: number;
  onDark?: boolean;
  className?: string;
}) {
  const ink = onDark ? 'var(--d-bg)' : 'var(--d-ink)';
  return (
    <span className={`inline-flex items-center ${className}`} style={{ gap: Math.round(size * 0.28) }}>
      <DocumenteroMark size={Math.round(size * 1.25)} ink={ink} />
      <span
        className="font-bold leading-none tracking-[-0.035em]"
        style={{ fontSize: size, color: ink }}
      >
        documentero<span style={{ color: 'var(--d-acc)' }}>.ro</span>
      </span>
    </span>
  );
}
