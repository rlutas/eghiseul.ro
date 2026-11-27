'use client';

/**
 * Status page card „Documente de semnat": documents the topograph / the team
 * asked the client to sign after the order (OCPI archive request, convention).
 * The client reads each one (PDF, exactly as it will be signed), completes his
 * ID data when asked, signs once on screen — the signature goes into all of them.
 *
 * Renders nothing when the order has no request.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Circle, Download, Eye, FileSignature, FileText, Loader2, Lock, Upload } from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import { PdfPreviewModal, type PreviewFile } from './PdfPreviewModal';
import { uploadClientFile } from '@/lib/orders/client-files-upload';
import type { ClientFile } from '@/lib/orders/client-files';

interface RequestDoc {
  kind: string;
  label: string;
  description: string;
}

interface ClientRequest {
  id: string;
  status: 'pending' | 'signed';
  documents: RequestDoc[];
  askIdentity: boolean;
  identity: Record<string, string> | null;
  note: string | null;
  createdAt: string;
  signedAt: string | null;
}

const IDENTITY_INPUTS: { key: string; label: string; placeholder?: string; inputMode?: 'numeric'; required: boolean }[] = [
  { key: 'nume', label: 'Nume și prenume', placeholder: 'Ex: Popescu Ion', required: true },
  { key: 'cnp', label: 'CNP', inputMode: 'numeric', placeholder: '13 cifre', required: true },
  { key: 'ci_serie', label: 'Seria buletinului', placeholder: 'Ex: IF', required: true },
  { key: 'ci_numar', label: 'Numărul buletinului', inputMode: 'numeric', required: true },
  { key: 'dom_localitate', label: 'Localitatea de domiciliu', required: true },
  { key: 'dom_adresa', label: 'Strada, nr., bloc, ap.', required: true },
  { key: 'dom_judet', label: 'Județ / sector', required: false },
];

const Req = () => <span className="text-red-600 font-semibold" aria-hidden> *</span>;

/** Fetches one document (unsigned preview, or the signed copy once signed). */
async function fetchDocument(
  orderId: string,
  requestId: string,
  kind: string,
  token: string | null | undefined,
  identity?: Record<string, string>
): Promise<Blob> {
  const res = await fetch(`/api/orders/${orderId}/signature-requests/${requestId}/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: token ?? undefined, kind, identity }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Documentul nu a putut fi deschis. Încearcă din nou.');
  }
  return res.blob();
}

const fileNameFor = (kind: string, blob: Blob, signed: boolean) =>
  `${kind}${signed ? '-semnat' : ''}.${blob.type === 'application/pdf' ? 'pdf' : 'docx'}`;

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** `token`: the status page's order-client token; omitted on the account page (session). */
export function CustomerSignatureRequests({ orderId, token }: { orderId: string; token?: string | null }) {
  const [requests, setRequests] = useState<ClientRequest[] | null>(null);

  // Bumped after a signature to fetch the list again.
  const [reloadKey, setReloadKey] = useState(0);
  const load = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/orders/${orderId}/signature-requests${token ? `?token=${encodeURIComponent(token)}` : ''}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) setRequests(data.data.requests);
      })
      .catch(() => {
        /* the card is optional: no network, no card */
      });
    return () => {
      cancelled = true;
    };
  }, [orderId, token, reloadKey]);

  if (!requests || requests.length === 0) return null;
  const pending = requests.filter((r) => r.status === 'pending');
  const signed = requests.filter((r) => r.status === 'signed');

  return (
    <div id="documente-de-semnat" className="space-y-3">
      {pending.map((r) => (
        <PendingRequest key={r.id} orderId={orderId} token={token} request={r} onSigned={load} />
      ))}
      {signed.map((r) => (
        <SignedRequest key={r.id} orderId={orderId} token={token} request={r} />
      ))}
    </div>
  );
}

function SignedRequest({ orderId, token, request }: { orderId: string; token?: string | null; request: ClientRequest }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewFile | null>(null);

  const get = async (kind: string, label: string, mode: 'view' | 'download') => {
    setError(null);
    setBusy(`${kind}:${mode}`);
    try {
      const blob = await fetchDocument(orderId, request.id, kind, token);
      const fileName = fileNameFor(kind, blob, true);
      if (mode === 'view') {
        setPreview({ title: `${label} (semnat)`, blob, fileName });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare de rețea. Încearcă din nou.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="rounded-xl border border-green-200 bg-green-50/60 p-4 space-y-3">
      <div className="flex items-start gap-2 text-sm text-green-900">
        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
        <div>
          <p className="font-semibold">Documente semnate{request.signedAt ? ` pe ${fmt(request.signedAt)}` : ''}</p>
          <p className="text-xs text-green-800 mt-0.5">Le-am primit și le depunem noi. Le poți vedea sau descărca oricând de aici.</p>
        </div>
      </div>
      {request.documents.map((d) => (
        <div key={d.kind} className="flex flex-wrap items-center gap-2 rounded-lg bg-white border border-green-200 p-3">
          <FileText className="h-5 w-5 text-green-600 shrink-0" />
          <p className="flex-1 min-w-[10rem] text-sm font-medium text-secondary-900">{d.label}</p>
          <button
            type="button"
            onClick={() => get(d.kind, d.label, 'view')}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
          >
            {busy === `${d.kind}:view` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
            Vezi
          </button>
          <button
            type="button"
            onClick={() => get(d.kind, d.label, 'download')}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
          >
            {busy === `${d.kind}:download` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Descarcă
          </button>
        </div>
      ))}
      {error && <p className="text-xs text-red-700">{error}</p>}
      {preview && <PdfPreviewModal file={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

function PendingRequest({
  orderId,
  token,
  request,
  onSigned,
}: {
  orderId: string;
  token?: string | null;
  request: ClientRequest;
  onSigned: () => void;
}) {
  const [identity, setIdentity] = useState<Record<string, string>>(request.identity ?? {});
  const [idFiles, setIdFiles] = useState<ClientFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const [opening, setOpening] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [consent, setConsent] = useState({ read: false, signature: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewFile | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const cnpOk = /^\d{13}$/.test((identity.cnp ?? '').replace(/\s/g, ''));
  const fieldsComplete =
    !request.askIdentity || (IDENTITY_INPUTS.filter((f) => f.required).every((f) => identity[f.key]?.trim()) && cnpOk);
  const photoOk = !request.askIdentity || idFiles.length > 0;
  const allRead = request.documents.every((d) => opened[d.kind]);
  // Signing unlocks only once the data is in and every document was opened:
  // the client signs what he has seen.
  const canSign = fieldsComplete && photoOk && allRead;
  const canSubmit = canSign && !!signature && consent.read && consent.signature && !submitting;

  // Opening a document after editing the ID data must show the new data.
  const identityKey = JSON.stringify(identity);
  const [openedFor, setOpenedFor] = useState(identityKey);
  if (request.askIdentity && openedFor !== identityKey) {
    setOpenedFor(identityKey);
    setOpened({});
  }

  // The pad unmounts while locked: drop a signature drawn before.
  if (!canSign && signature) setSignature(null);

  const todo: { label: string; ok: boolean }[] = [
    ...(request.askIdentity
      ? [
          { label: 'Completează datele din buletin (cele cu *)', ok: fieldsComplete },
          { label: 'Încarcă poza buletinului', ok: photoOk },
        ]
      : []),
    ...request.documents.map((d) => ({ label: `Deschide și citește: ${d.label}`, ok: !!opened[d.kind] })),
  ];

  const openDoc = async (kind: string, label: string) => {
    setError(null);
    setOpening(kind);
    try {
      const blob = await fetchDocument(orderId, request.id, kind, token, request.askIdentity ? identity : undefined);
      setPreview({ title: label, blob, fileName: fileNameFor(kind, blob, false) });
      setOpened((o) => ({ ...o, [kind]: true }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(/failed to fetch|network|load failed/i.test(msg) || !msg ? 'Eroare de rețea. Verifică conexiunea și încearcă din nou.' : msg);
    } finally {
      setOpening(null);
    }
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded = await uploadClientFile(orderId, file, { token });
      setIdFiles((f) => [...f, uploaded].slice(0, 2));
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      // Network / CORS failures surface as the browser's English text.
      setError(
        !msg || /failed to fetch|network|load failed/i.test(msg)
          ? 'Poza nu a putut fi trimisă. Verifică conexiunea și încearcă din nou.'
          : msg
      );
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/signature-requests/${request.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token ?? undefined,
          signatureBase64: signature,
          identity: request.askIdentity ? identity : undefined,
          identityFiles: request.askIdentity ? idFiles : undefined,
          consent: { documentsRead: consent.read, signatureConsent: consent.signature },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Semnarea nu a reușit. Încearcă din nou.');
        return;
      }
      onSigned();
    } catch {
      setError('Eroare de rețea. Verifică conexiunea și încearcă din nou.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border-2 border-amber-300 bg-amber-50/40 p-4 sm:p-5 space-y-4">
      <div className="flex items-start gap-3">
        <FileSignature className="h-6 w-6 text-amber-600 shrink-0" />
        <div>
          <h2 className="text-base font-bold text-secondary-900">Documente de semnat ({request.documents.length})</h2>
          <p className="text-sm text-neutral-700 mt-0.5">
            Ca să putem depune cererea în numele tău, avem nevoie de semnătura ta. Le-am completat cu datele din comandă.
          </p>
          {request.note && <p className="text-sm text-neutral-800 mt-2 whitespace-pre-wrap">{request.note}</p>}
        </div>
      </div>

      <div className="rounded-lg bg-white border border-neutral-200 p-3">
        <p className="text-xs font-semibold text-secondary-900 mb-1.5">Ca să poți semna:</p>
        <ul className="space-y-1">
          {todo.map((t) => (
            <li key={t.label} className={`flex items-start gap-2 text-xs ${t.ok ? 'text-green-700' : 'text-neutral-700'}`}>
              {t.ok ? <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" /> : <Circle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-neutral-400" />}
              <span>{t.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pasul 1 — datele din buletin, doar când cererea le cere */}
      {request.askIdentity && (
        <div className="rounded-lg bg-white border border-neutral-200 p-3 sm:p-4 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-secondary-900">1. Datele din actul de identitate</p>
            <p className="text-[11px] text-neutral-500"><span className="text-red-600 font-semibold">*</span> obligatoriu</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {IDENTITY_INPUTS.map((f) => (
              <label key={f.key} className="block text-xs text-neutral-600">
                {f.label}
                {f.required ? <Req /> : <span className="text-neutral-400"> (opțional)</span>}
                <input
                  type="text"
                  inputMode={f.inputMode}
                  value={identity[f.key] ?? ''}
                  placeholder={f.placeholder}
                  onChange={(e) => setIdentity((v) => ({ ...v, [f.key]: e.target.value }))}
                  aria-required={f.required}
                  className={`mt-0.5 w-full rounded-md border px-2.5 py-2 text-sm text-neutral-900 ${
                    f.key === 'cnp' && identity.cnp && !cnpOk ? 'border-red-400' : 'border-neutral-300'
                  }`}
                />
                {f.key === 'cnp' && identity.cnp && !cnpOk && (
                  <span className="mt-0.5 block text-[11px] text-red-600">CNP-ul are 13 cifre.</span>
                )}
              </label>
            ))}
          </div>
          <div>
            <p className="text-xs text-neutral-600 mb-1">Poza buletinului<Req /></p>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={onPickFile} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {idFiles.length ? 'Adaugă încă o poză (verso)' : 'Încarcă poza buletinului'}
            </button>
            {idFiles.map((f) => (
              <p key={f.key} className="mt-1 text-xs text-green-700 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> {f.name}
              </p>
            ))}
            <p className="mt-1 text-[11px] text-neutral-500">O poză clară, cu toate colțurile vizibile. O trimitem doar topografului, pentru depunere.</p>
          </div>
        </div>
      )}

      {/* Pasul 2 — citește */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-secondary-900">
          {request.askIdentity ? '2.' : '1.'} Citește documentele<Req />
        </p>
        <p className="text-[11px] text-neutral-500 -mt-1">Se deschid aici, în pagină. Le poți și descărca din fereastra care se deschide.</p>
        {request.documents.map((d) => (
          <div key={d.kind} className="flex items-center gap-3 rounded-lg bg-white border border-neutral-200 p-3">
            <FileText className={`h-5 w-5 shrink-0 ${opened[d.kind] ? 'text-green-600' : 'text-neutral-400'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900">{d.label}</p>
              <p className="text-xs text-neutral-500">{d.description}</p>
            </div>
            <button
              type="button"
              onClick={() => openDoc(d.kind, d.label)}
              disabled={opening !== null}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-primary-300 bg-primary-50 px-3 py-1.5 text-sm font-medium text-secondary-900 hover:bg-primary-100 disabled:opacity-50"
            >
              {opening === d.kind ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
              {opened[d.kind] ? 'Citit ✓' : 'Citește'}
            </button>
          </div>
        ))}
        {request.askIdentity && (
          <p className="text-[11px] text-neutral-500">Documentele se completează cu datele din buletin pe care le-ai scris mai sus.</p>
        )}
      </div>

      {/* Pasul 3 — semnează */}
      <div className="rounded-lg bg-white border border-neutral-200 p-3 sm:p-4 space-y-3">
        <p className="text-sm font-semibold text-secondary-900">{request.askIdentity ? '3.' : '2.'} Semnează o singură dată<Req /></p>
        {!canSign ? (
          <div className="flex items-start gap-2 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 text-xs text-neutral-600">
            <Lock className="h-4 w-4 shrink-0 text-neutral-400" />
            <span>Semnătura se deblochează după ce bifezi tot din lista „Ca să poți semna” de mai sus.</span>
          </div>
        ) : (
          <SignaturePad onChange={setSignature} disabled={submitting} />
        )}
        <div className="space-y-2">
          <label className="flex items-start gap-2 text-xs text-neutral-700 leading-relaxed cursor-pointer">
            <input type="checkbox" className="mt-0.5" disabled={!canSign} checked={consent.read} onChange={(e) => setConsent((c) => ({ ...c, read: e.target.checked }))} />
            <span>Am citit documentele de mai sus și sunt de acord cu conținutul lor.</span>
          </label>
          <label className="flex items-start gap-2 text-xs text-neutral-700 leading-relaxed cursor-pointer">
            <input type="checkbox" className="mt-0.5" disabled={!canSign} checked={consent.signature} onChange={(e) => setConsent((c) => ({ ...c, signature: e.target.checked }))} />
            <span>Sunt de acord ca semnătura mea electronică să fie aplicată pe toate documentele de mai sus.</span>
          </label>
        </div>
        {error && (
          <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-secondary-900 font-semibold py-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Se semnează...' : 'Semnează documentele'}
        </button>
        {canSign && !canSubmit && !submitting && (
          <p className="text-[11px] text-neutral-500 text-center">Semnează în chenar și bifează cele două acorduri.</p>
        )}
      </div>
      {preview && <PdfPreviewModal file={preview} onClose={() => setPreview(null)} confirmLabel="Am citit documentul" />}
    </div>
  );
}
