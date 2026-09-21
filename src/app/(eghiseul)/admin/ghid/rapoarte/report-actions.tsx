'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

/** Butoanele lui Raul pe un raport: „În lucru”, „Rezolvat” (+ notă), „Redeschide”. */
export function ReportActions({ id, status, note }: { id: string; status: 'nou' | 'in_lucru' | 'rezolvat'; note: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState(note ?? '');
  const [showNote, setShowNote] = useState(false);

  async function set(next: 'nou' | 'in_lucru' | 'rezolvat') {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/knowledge/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next, note: text }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || 'Nu s-a putut salva.');
        return;
      }
      toast.success(next === 'rezolvat' ? 'Marcat rezolvat.' : 'Salvat.');
      setShowNote(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {status !== 'in_lucru' && status !== 'rezolvat' && (
          <Button size="sm" variant="outline" className="h-7 text-xs" disabled={busy} onClick={() => void set('in_lucru')}>
            În lucru
          </Button>
        )}
        {status !== 'rezolvat' && (
          <Button size="sm" className="h-7 text-xs" disabled={busy} onClick={() => (showNote ? void set('rezolvat') : setShowNote(true))}>
            {busy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
            {showNote ? 'Salvează ca rezolvat' : 'Rezolvat'}
          </Button>
        )}
        {status === 'rezolvat' && (
          <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={busy} onClick={() => void set('nou')}>
            Redeschide
          </Button>
        )}
      </div>
      {showNote && (
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ce ai făcut (opțional): „reparat în …”, „am completat ghidul X”…"
          rows={2}
          className="bg-white text-sm"
        />
      )}
    </div>
  );
}
