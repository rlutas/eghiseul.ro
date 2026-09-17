import Image from 'next/image';
import Link from 'next/link';

/**
 * Wordmark for the auth screens, which all sit on the dark navy gradient.
 *
 * It is the shield asset plus white lettering rather than one of the logo
 * files: `logo.webp`, `logo-wide.webp` and `icon.webp` all have dark text baked
 * in, so the wide logo simply vanishes on this background. Before 2026-09-17
 * these pages worked around that with a gold square containing the letters
 * "eG", which read as a placeholder.
 */
export function AuthLogo({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const large = size === 'lg';
  return (
    <Link href="/" className={`inline-flex items-center ${large ? 'gap-3' : 'gap-2.5'}`}>
      <Image
        src="/images/brand/icon.webp"
        alt=""
        width={96}
        height={96}
        className={large ? 'h-12 w-auto drop-shadow-lg' : 'h-10 w-auto'}
        priority
      />
      <span className={`font-bold text-white ${large ? 'text-2xl' : 'text-xl'}`}>
        eGhișeul<span className="text-primary-500">.ro</span>
      </span>
    </Link>
  );
}
