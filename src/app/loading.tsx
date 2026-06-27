import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <main id="main-content" className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="size-8 animate-spin text-primary" aria-label="Se încarcă" />
    </main>
  );
}
