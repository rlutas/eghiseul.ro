/**
 * Layout for the public document-upload page: adds the site footer under the
 * upload card (the global header already comes from the root layout) so the
 * token-gated page doesn't feel detached from the rest of the site.
 */

import { Footer } from '@/components/home/footer';

export const metadata = {
  title: 'Încarcă documentele — eGhișeul.ro',
  robots: { index: false, follow: false },
};

export default function ReuploadLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
