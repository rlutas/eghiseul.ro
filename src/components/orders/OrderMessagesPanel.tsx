'use client';

/**
 * Staff side of the order message thread — used in admin (order page) and in
 * the collaborator portal. Everything written here reaches the CLIENT by
 * email and on the status page; internal notes stay in the notes card.
 */

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FileText, ImageIcon, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Attachment {
  key: string;
  name: string;
  mimeType: string;
  size: number;
  url?: string;
}

interface StaffMessage {
  id: string;
  author_type: 'client' | 'team' | 'collaborator';
  author_name: string;
  body: string;
  attachments: Attachment[];
  created_at: string;
  read_by_client_at: string | null;
}

export interface MessageTemplate {
  label: string;
  text: string;
}

interface Props {
  /** GET + POST endpoint, e.g. `/api/admin/orders/<id>/messages`. */
  endpoint: string;
  readOnly?: boolean;
  templates?: MessageTemplate[];
  className?: string;
}

const AUTHOR_LABEL: Record<StaffMessage['author_type'], string> = {
  client: 'Client',
  team: 'Echipa',
  collaborator: 'Topograf',
};

function when(iso: string): string {
  return new Date(iso).toLocaleString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderMessagesPanel({ endpoint, readOnly, templates, className }: Props) {
  const [messages, setMessages] = useState<StaffMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(endpoint);
      const json = await res.json();
      if (json.success) setMessages(json.data.messages ?? []);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  const send = async () => {
    if (!draft.trim()) return;
    setSending(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: draft.trim() }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Mesajul nu a fost trimis');
      toast.success(
        json.data?.emailed?.length
          ? 'Mesaj trimis — clientul a primit emailul.'
          : 'Mesaj salvat pe comandă (emailul nu a plecat — verificați adresa clientului).'
      );
      setDraft('');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Mesajul nu a fost trimis');
    } finally {
      setSending(false);
    }
  };

  return (
    <div id="mesaje" className={className ?? 'mb-6 rounded-lg border border-slate-200 bg-white p-5'}>
      <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <MessageSquare className="h-4 w-4" />
        Mesaje cu clientul
      </h2>
      <p className="mb-3 text-xs text-slate-500">
        Ce scrieți aici ajunge la client pe email și în pagina comenzii; el poate răspunde, cu
        poze atașate. Pentru observații interne folosiți notele.
      </p>

      {loading ? (
        <p className="text-sm text-slate-500">Se încarcă...</p>
      ) : messages.length === 0 ? (
        <p className="mb-3 text-sm text-slate-500">Niciun mesaj încă.</p>
      ) : (
        <ul className="mb-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {messages.map((m) => {
            const fromClient = m.author_type === 'client';
            return (
              <li
                key={m.id}
                className={`rounded-lg px-3 py-2 text-sm ${
                  fromClient ? 'mr-8 bg-amber-50 border border-amber-200' : 'ml-8 bg-slate-50 border border-slate-200'
                }`}
              >
                <div className="mb-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {AUTHOR_LABEL[m.author_type]}
                    {m.author_type !== 'client' && m.author_name ? ` · ${m.author_name}` : ''}
                  </span>
                  <span>{when(m.created_at)}</span>
                  {!fromClient && (
                    <span className={m.read_by_client_at ? 'text-green-600' : 'text-slate-400'}>
                      {m.read_by_client_at ? 'văzut de client' : 'nevăzut încă'}
                    </span>
                  )}
                </div>
                <p className="whitespace-pre-wrap break-words text-slate-800">{m.body}</p>
                {m.attachments?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {m.attachments.map((a) => (
                      <li key={a.key} className="flex items-center gap-1.5 text-xs">
                        {a.mimeType === 'application/pdf' ? (
                          <FileText className="h-3.5 w-3.5 text-slate-400" />
                        ) : (
                          <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                        )}
                        {a.url ? (
                          <a href={a.url} target="_blank" rel="noopener" className="font-medium text-primary-700 hover:underline">
                            {a.name}
                          </a>
                        ) : (
                          <span>{a.name}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {templates && templates.length > 0 && !readOnly && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {templates.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setDraft(t.text)}
              className="rounded-full border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:border-primary-400 hover:text-slate-900"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        disabled={readOnly || sending}
        rows={4}
        maxLength={4000}
        placeholder="Scrie clientului..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
      />
      <div className="mt-2 flex justify-end">
        <Button onClick={send} disabled={readOnly || sending || !draft.trim()} size="sm">
          <Send className="mr-1.5 h-4 w-4" />
          {sending ? 'Se trimite...' : 'Trimite clientului'}
        </Button>
      </div>
    </div>
  );
}
