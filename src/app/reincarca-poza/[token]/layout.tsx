/**
 * Layout for the public document-upload page: light branded header (logo) +
 * the full site footer, so the token-gated page doesn't feel detached from
 * the rest of the site.
 */

import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '@/components/home/footer';

export const metadata = {
  title: 'Încarcă documentele — eGhișeul.ro',
  robots: { index: false, follow: false },
};

export default function ReuploadLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" aria-label="eGhișeul.ro - Acasă">
            <Image
              src="/images/brand/logo-wide.webp"
              alt="eGhișeul.ro"
              width={330}
              height={80}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <a
            href="https://wa.me/40757708181?text=Bun%C4%83%20ziua!%20Am%20o%20%C3%AEntrebare%20despre%20documentele%20solicitate."
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            Ai nevoie de ajutor?
          </a>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
