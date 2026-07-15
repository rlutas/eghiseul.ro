/**
 * Layout pentru pagina publică de COMPLETARE comandă telefonică (acte +
 * semnătură, după plată). Header-ul global vine din root layout.
 */

import { Footer } from '@/components/home/footer';

export const metadata = {
  title: 'Completează comanda — eGhișeul.ro',
  robots: { index: false, follow: false },
};

export default function CompletionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
