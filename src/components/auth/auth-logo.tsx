import Image from 'next/image';
import Link from 'next/link';

/**
 * The brand lockup for screens with a dark background.
 *
 * It is the real logo, not a hand-set imitation: the wordmark is uppercase
 * "eGHISEUL" without diacritics, and writing it as HTML text got both wrong.
 * `logo-wide-white.webp` is the same file as the header's, with only the
 * lettering repainted white — see `scripts/build-white-logo.mjs`.
 */
export function AuthLogo({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  return (
    <Link href="/" className="inline-flex items-center" aria-label="eGhișeul.ro — acasă">
      <Image
        src="/images/brand/logo-wide-white.webp"
        alt="eGhișeul.ro"
        width={330}
        height={80}
        className={size === 'lg' ? 'h-11 w-auto' : 'h-9 w-auto'}
        priority
      />
    </Link>
  );
}
