'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Soft-refresh button for server-component admin pages (ONRC/ANCPI queues):
 * router.refresh() re-fetches the server data WITHOUT a full browser reload —
 * scroll position and page state stay put.
 */
export function RefreshButton({ label = 'Reîncarcă' }: { label?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [spinning, setSpinning] = useState(false);

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        setSpinning(true);
        startTransition(() => {
          router.refresh();
          // Keep the spinner visible briefly so the click clearly "did something".
          setTimeout(() => setSpinning(false), 800);
        });
      }}
    >
      <RefreshCw className={`mr-1 h-4 w-4 ${isPending || spinning ? 'animate-spin' : ''}`} />
      {label}
    </Button>
  );
}
