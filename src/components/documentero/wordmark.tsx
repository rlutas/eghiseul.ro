/**
 * Text wordmark until the logo asset exists. Inline so it renders identically
 * in the header, the footer and the 404 page without an image request.
 */
export function DocumenteroWordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline font-semibold tracking-[-0.02em] text-[#1C1A17] ${className}`}
      style={{ fontSize: '1.5rem', lineHeight: 1 }}
    >
      documentero<span className="text-[#C8401F]">.ro</span>
    </span>
  );
}
