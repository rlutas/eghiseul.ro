import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Footer } from '@/components/home/footer';

interface LegalLayoutProps {
  title: string;
  updated: string;
  children: React.ReactNode;
}

/** Shared layout for legal pages (terms, privacy, GDPR, cookies). */
export function LegalLayout({ title, updated, children }: LegalLayoutProps) {
  return (
    <>
      <main id="main-content" className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        <header className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-32 pb-10 lg:pb-14">
          <div className="relative container mx-auto px-4 max-w-[820px]">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-5" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary-500 transition-colors">Acasă</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white font-medium">{title}</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{title}</h1>
            <p className="mt-3 text-sm text-white/60">Ultima actualizare: {updated}</p>
          </div>
        </header>

        <article className="py-10 lg:py-14 bg-white">
          <div className="container mx-auto px-4 max-w-[760px]">
            <div
              className="prose prose-neutral max-w-none
                prose-headings:font-bold prose-headings:text-secondary-900
                prose-h2:text-xl prose-h2:mt-9 prose-h2:mb-3
                prose-p:text-neutral-700 prose-p:leading-relaxed
                prose-li:text-neutral-700 prose-li:marker:text-primary-500
                prose-a:text-primary-700 prose-a:underline prose-strong:text-secondary-900"
            >
              {children}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
