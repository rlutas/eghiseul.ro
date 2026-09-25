'use client';

/**
 * Client side of the order message thread (status page / account order page).
 * The team or the topograph asks something → the client reads it here (and in
 * the email that pointed here), answers, and can attach a photo or PDF of an
 * act. Auth: the order-client token from the status API, or the session.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, ImageIcon, Loader2, MessageSquare, Paperclip, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CLIENT_FILES_MAX_COUNT, type ClientFile } from '@/lib/orders/client-files';
import { uploadClientFile } from '@/lib/orders/client-files-upload';

interface ClientMessage {
  id: string;
  mine: boolean;
  author: string;
  body: string;
  attachments: Array<{ name: string; mimeType: string; size: number }>;
  createdAt: string;
  unread: boolean;
}

interface Props {
  orderId: string;
  /** Guests: token from `/api/orders/status`. Owners with a session: omit. */
  token?: string | null;
}

function when(iso: string): string {
  return new Date(iso).toLocaleString('ro-RO', {
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CustomerMessages({ orderId, token }: Props) {
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const qs = token ? `?token=${encodeURIComponent(token)}` : '';

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/messages${qs}`);
      const json = await res.json();
      if (json.success) setMessages(json.data.messages ?? []);
    } finally {
      setLoading(false);
    }
  }, [orderId, qs]);

  useEffect(() => {
    load();
  }, [load]);

  const addFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    setError(null);
    setUploading(true);
    let next = [...files];
    try {
      for (const file of Array.from(list)) {
        if (next.length >= CLIENT_FILES_MAX_COUNT) {
          setError(`Poți atașa cel mult ${CLIENT_FILES_MAX_COUNT} fișiere la un mesaj.`);
          break;
        }
        next = [...next, await uploadClientFile(orderId, file, { token })];
        setFiles(next);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Încărcarea a eșuat.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const send = async () => {
    const body = draft.trim() || (files.length ? 'Vă trimit actele atașate.' : '');
    if (!body) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, attachments: files, token: token || undefined }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Mesajul nu a fost trimis.');
      setDraft('');
      setFiles([]);
      setSent(true);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Mesajul nu a fost trimis.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card id="mesaje" className="scroll-mt-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Mesaje despre comandă
        </CardTitle>
        <CardDescription>
          Aici îți scriem dacă avem o întrebare despre comandă. Poți răspunde și poți atașa o poză
          sau un PDF (de exemplu un act vechi al imobilului).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Se încarcă...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nu ai mesaje. Dacă vrei să ne spui ceva despre comandă, scrie mai jos.
          </p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li
                key={m.id}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  m.mine ? 'ml-6 border-neutral-200 bg-neutral-50' : 'mr-6 border-primary-200 bg-primary-50'
                }`}
              >
                <div className="mb-1 flex flex-wrap items-center gap-x-2 text-xs text-neutral-500">
                  <span className="font-semibold text-secondary-900">{m.author}</span>
                  <span>{when(m.createdAt)}</span>
                  {m.unread && (
                    <span className="rounded-full bg-primary-500 px-1.5 py-0.5 text-[10px] font-bold text-secondary-900">
                      nou
                    </span>
                  )}
                </div>
                <p className="whitespace-pre-wrap break-words text-neutral-800">{m.body}</p>
                {m.attachments.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5">
                    {m.attachments.map((a, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-xs text-neutral-600">
                        <Paperclip className="h-3 w-3" />
                        {a.name}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setSent(false);
            }}
            rows={3}
            maxLength={4000}
            placeholder="Scrie răspunsul tău..."
            aria-label="Mesajul tău"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
          {files.length > 0 && (
            <ul className="space-y-1">
              {files.map((f) => (
                <li key={f.key} className="flex items-center gap-2 text-xs text-neutral-700">
                  {f.mimeType === 'application/pdf' ? <FileText className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                  <span className="min-w-0 flex-1 truncate">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((x) => x.key !== f.key))}
                    aria-label={`Scoate ${f.name}`}
                    className="text-neutral-400 hover:text-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading || sending || files.length >= CLIENT_FILES_MAX_COUNT}
            >
              {uploading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Paperclip className="mr-1.5 h-4 w-4" />}
              {uploading ? 'Se încarcă...' : 'Atașează poză sau PDF'}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={send}
              disabled={sending || uploading || (!draft.trim() && files.length === 0)}
              className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-semibold"
            >
              <Send className="mr-1.5 h-4 w-4" />
              {sending ? 'Se trimite...' : 'Trimite'}
            </Button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          {sent && !error && (
            <p className="text-xs text-green-700">Mesaj trimis. Îți răspundem pe email și aici.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
