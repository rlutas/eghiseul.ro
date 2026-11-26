'use client';

/**
 * „Documente de semnat de client" — used by the team (admin order page) and by
 * the topograph (collaborator portal). Pick the documents, check the data
 * prefilled from the order, preview, send. The client gets a message + email
 * and signs on the order page; the signed copies come back here.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, FileSignature, FileText, Loader2, XCircle } from 'lucide-react';

interface Field {
  key: string;
  label: string;
  group: string;
  hint?: string;
  multiline?: boolean;
  options?: { value: string; label: string }[];
}

interface KindDef {
  kind: string;
  label: string;
  description: string;
  fields: Field[];
}

interface RequestRow {
  id: string;
  kinds: string[];
  labels: string[];
  fields: Record<string, string>;
  askIdentity: boolean;
  note: string | null;
  status: 'pending' | 'signed' | 'cancelled';
  requestedBy: string;
  createdAt: string;
  signedAt: string | null;
  signedDocumentIds: string[];
  ip: string | null;
}

interface SignedDoc {
  id: string;
  type: string;
  fileName: string;
  s3Key?: string;
}

interface Payload {
  kinds: KindDef[];
  groups: Record<string, string>;
  prefill: Record<string, string>;
  requests: RequestRow[];
  signedDocuments: SignedDoc[];
  recipient: { orderNumber: string; clientName: string | null; closed: boolean };
}

const IDENTITY_KEYS = ['nume', 'cnp', 'ci_serie', 'ci_numar', 'dom_localitate', 'dom_adresa'];

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function SignatureRequestComposer({
  base,
  query = '',
  readOnly = false,
  docHref,
  defaultOpen = false,
}: {
  /** e.g. `/api/admin/orders/<id>/signature-requests` */
  base: string;
  /** e.g. `?as=<collaboratorId>` for the admin preview of the portal */
  query?: string;
  readOnly?: boolean;
  /** Link to open a signed document (admin: by S3 key, portal: by id). */
  docHref: (doc: SignedDoc) => string;
  defaultOpen?: boolean;
}) {
  const [data, setData] = useState<Payload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [open, setOpen] = useState(defaultOpen);
  const [kinds, setKinds] = useState<string[]>([]);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [askIdentity, setAskIdentity] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${base}${query}`);
      const json = await res.json();
      if (!json.success) {
        setLoadError(json.error || 'Nu s-a putut încărca');
        return;
      }
      setData(json.data);
    } catch {
      setLoadError('Eroare de rețea');
    }
  }, [base, query]);

  useEffect(() => {
    load();
  }, [load]);

  const startNew = () => {
    if (!data) return;
    setKinds(data.kinds.map((k) => k.kind));
    setFields(data.prefill);
    // No ID data on the order (the usual case on property services) → ask for it.
    setAskIdentity(IDENTITY_KEYS.some((k) => !data.prefill[k]?.trim()));
    setNote('');
    setError(null);
    setSent(false);
    setOpen(true);
  };

  const visibleFields = useMemo(() => {
    if (!data) return [] as Field[];
    const seen = new Set<string>();
    const out: Field[] = [];
    for (const k of data.kinds) {
      if (!kinds.includes(k.kind)) continue;
      for (const f of k.fields) {
        if (seen.has(f.key)) continue;
        seen.add(f.key);
        out.push(f);
      }
    }
    return out;
  }, [data, kinds]);

  const groups = useMemo(() => {
    const map = new Map<string, Field[]>();
    for (const f of visibleFields) {
      if (!map.has(f.group)) map.set(f.group, []);
      map.get(f.group)!.push(f);
    }
    return [...map.entries()];
  }, [visibleFields]);

  const preview = async (kind: string) => {
    setError(null);
    setBusy(`preview:${kind}`);
    const win = window.open('', '_blank');
    try {
      const res = await fetch(`${base}/preview${query}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, fields }),
      });
      if (!res.ok) {
        win?.close();
        const j = await res.json().catch(() => ({}));
        setError(j.error || 'Previzualizarea a eșuat');
        return;
      }
      const url = URL.createObjectURL(await res.blob());
      if (win) win.location.href = url;
      else window.open(url, '_blank');
    } catch {
      win?.close();
      setError('Eroare de rețea');
    } finally {
      setBusy(null);
    }
  };

  const send = async () => {
    if (kinds.length === 0) {
      setError('Alege cel puțin un document');
      return;
    }
    const r = data?.recipient;
    const who = r?.clientName ? `${r.clientName} (comanda ${r.orderNumber})` : `clientul comenzii ${r?.orderNumber ?? ''}`;
    if (
      !window.confirm(
        `Trimiți cererea de semnătură către ${who}?\n\nClientul primește un email și un mesaj în pagina comenzii.` +
          (r?.closed ? '\n\nAtenție: comanda e deja finalizată.' : '')
      )
    ) {
      return;
    }
    setError(null);
    setBusy('send');
    try {
      const res = await fetch(`${base}${query}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kinds, fields, askIdentity, note }),
      });
      const j = await res.json();
      if (!j.success) {
        setError(j.error || 'Cererea nu a putut fi trimisă');
        return;
      }
      setSent(true);
      setOpen(false);
      await load();
    } catch {
      setError('Eroare de rețea');
    } finally {
      setBusy(null);
    }
  };

  const cancel = async (id: string) => {
    if (!window.confirm('Anulezi cererea? Clientul nu o mai vede în pagina comenzii.')) return;
    setBusy(`cancel:${id}`);
    try {
      const sep = query ? '&' : '?';
      await fetch(`${base}${query}${sep}requestId=${id}`, { method: 'DELETE' });
      await load();
    } finally {
      setBusy(null);
    }
  };

  if (loadError) return null;

  const docsById = new Map((data?.signedDocuments ?? []).map((d) => [d.id, d]));
  const visibleRequests = (data?.requests ?? []).filter((r) => r.status !== 'cancelled').slice(0, 5);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <FileSignature className="h-4 w-4 text-slate-500" />
            Documente de semnat de client
          </h2>
          {data?.recipient && (
            <p className="mt-0.5 text-xs font-medium text-slate-700">
              Client: {data.recipient.clientName ?? '—'} · comanda {data.recipient.orderNumber}
            </p>
          )}
          <p className="mt-0.5 text-xs text-slate-500">
            Cererea de copii din arhiva OCPI și convenția, completate din comandă. Clientul le semnează cu degetul în
            pagina comenzii, iar exemplarele semnate apar aici.
          </p>
        </div>
        {!readOnly && !open && data && (
          <button
            type="button"
            onClick={startNew}
            className="shrink-0 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Cere semnătura clientului
          </button>
        )}
      </div>

      {!data && (
        <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Se încarcă…
        </p>
      )}

      {sent && (
        <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-xs text-green-800">
          Trimis. Clientul a primit un mesaj și un email cu linkul spre pagina comenzii.
        </p>
      )}

      {visibleRequests.length > 0 && (
        <ul className="mt-3 space-y-2">
          {visibleRequests.map((r) => (
            <li key={r.id} className="rounded-md border border-slate-200 p-3 text-xs">
              <div className="flex items-center gap-2">
                {r.status === 'signed' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-800">
                    <CheckCircle2 className="h-3 w-3" /> Semnat {r.signedAt ? fmt(r.signedAt) : ''}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                    <Clock className="h-3 w-3" /> Așteaptă semnătura clientului
                  </span>
                )}
                <span className="text-slate-500">
                  cerut de {r.requestedBy}, {fmt(r.createdAt)}
                </span>
                {r.status === 'pending' && !readOnly && (
                  <button
                    type="button"
                    onClick={() => cancel(r.id)}
                    disabled={busy !== null}
                    className="ml-auto inline-flex items-center gap-1 text-slate-500 hover:text-red-600"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Anulează
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-slate-700">{r.labels.join(' · ')}</p>
              {r.status === 'signed' && (
                <div className="mt-2 space-y-1">
                  {r.signedDocumentIds.map((id) => {
                    const d = docsById.get(id);
                    if (!d) return null;
                    return (
                      <a
                        key={id}
                        href={docHref(d)}
                        target="_blank"
                        rel="noopener"
                        className="flex items-center gap-1.5 font-medium text-primary-700 hover:underline"
                      >
                        <FileText className="h-3.5 w-3.5" /> {d.fileName.replace(/\.docx$/, '')} — deschide PDF
                      </a>
                    );
                  })}
                  {r.ip && <p className="text-[11px] text-slate-400">Semnat electronic de pe IP {r.ip}.</p>}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {open && data && (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-700">Ce semnează clientul</p>
            {data.kinds.map((k) => (
              <label key={k.kind} className="flex items-start gap-2 py-1 text-sm text-slate-800">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={kinds.includes(k.kind)}
                  onChange={(e) =>
                    setKinds((v) => (e.target.checked ? [...v, k.kind] : v.filter((x) => x !== k.kind)))
                  }
                />
                <span>
                  {k.label}
                  <span className="block text-xs text-slate-500">{k.description}</span>
                </span>
              </label>
            ))}
          </div>

          <label className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
            <input type="checkbox" className="mt-1" checked={askIdentity} onChange={(e) => setAskIdentity(e.target.checked)} />
            <span>
              Cere clientului actul de identitate
              <span className="block text-xs text-amber-800">
                Clientul încarcă poza buletinului și completează CNP-ul, seria, numărul și domiciliul înainte să semneze.
                Bifează-l când comanda nu are buletinul. Poza ajunge în mesajele comenzii.
              </span>
            </span>
          </label>

          {groups.map(([group, list]) => (
            <fieldset key={group} className="space-y-2">
              <legend className="text-xs font-semibold text-slate-700">
                {data.groups[group] ?? group}
                {group === 'identitate' && askIdentity && (
                  <span className="ml-1 font-normal text-slate-500">— le completează clientul; ce scrii aici e doar precompletare</span>
                )}
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {list.map((f) => (
                  <label key={f.key} className={`block text-xs text-slate-500 ${f.multiline ? 'sm:col-span-2' : ''}`}>
                    {f.label}
                    {f.options ? (
                      <select
                        value={fields[f.key] ?? ''}
                        onChange={(e) => setFields((v) => ({ ...v, [f.key]: e.target.value }))}
                        className="mt-0.5 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
                      >
                        {f.options.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : f.multiline ? (
                      <textarea
                        rows={2}
                        value={fields[f.key] ?? ''}
                        placeholder={f.hint}
                        onChange={(e) => setFields((v) => ({ ...v, [f.key]: e.target.value }))}
                        className="mt-0.5 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
                      />
                    ) : (
                      <input
                        type="text"
                        value={fields[f.key] ?? ''}
                        placeholder={f.hint}
                        onChange={(e) => setFields((v) => ({ ...v, [f.key]: e.target.value }))}
                        className="mt-0.5 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
                      />
                    )}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          <label className="block text-xs text-slate-500">
            Mesaj pentru client (opțional)
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Cererea o depunem noi la OCPI Sector 4, imediat după semnare."
              className="mt-0.5 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
            />
          </label>

          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

          <div className="flex flex-wrap items-center gap-2">
            {data.kinds
              .filter((k) => kinds.includes(k.kind))
              .map((k) => (
                <button
                  key={k.kind}
                  type="button"
                  onClick={() => preview(k.kind)}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {busy === `preview:${k.kind}` && <Loader2 className="h-3 w-3 animate-spin" />}
                  Previzualizează: {k.label.split(' (')[0]}
                </button>
              ))}
            <span className="flex-1" />
            <button type="button" onClick={() => setOpen(false)} className="px-3 py-1.5 text-xs text-slate-500 hover:underline">
              Renunță
            </button>
            <button
              type="button"
              onClick={send}
              disabled={busy !== null || kinds.length === 0}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-secondary-900 hover:bg-primary-600 disabled:opacity-50"
            >
              {busy === 'send' && <Loader2 className="h-4 w-4 animate-spin" />}
              Trimite clientului
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            O cerere nouă o înlocuiește pe cea în așteptare. Clientul primește un mesaj în pagina comenzii și un email.
          </p>
        </div>
      )}
    </div>
  );
}
