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
import { AlertTriangle, CheckCircle2, FileSignature, FileText, Loader2, Upload } from 'lucide-react';
import { SignaturePad } from './SignaturePad';
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

const IDENTITY_INPUTS: { key: string; label: string; placeholder?: string; inputMode?: 'numeric' }[] = [
  { key: 'nume', label: 'Nume și prenume', placeholder: 'Ex: Popescu Ion' },
  { key: 'cnp', label: 'CNP', inputMode: 'numeric' },
  { key: 'ci_serie', label: 'Seria buletinului', placeholder: 'Ex: IF' },
  { key: 'ci_numar', label: 'Numărul buletinului', inputMode: 'numeric' },
  { key: 'dom_localitate', label: 'Localitatea de domiciliu' },
  { key: 'dom_adresa', label: 'Strada, nr., bloc, ap.' },
  { key: 'dom_judet', label: 'Județ / sector' },
];

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
      {signed.length > 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50/60 p-4 space-y-1.5">
          {signed.map((r) => (
            <div key={r.id} className="flex items-start gap-2 text-sm text-green-900">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
              <span>
                Ai semnat {r.documents.map((d) => d.label).join(' și ')}
                {r.signedAt ? ` pe ${fmt(r.signedAt)}` : ''}. Le găsești la „Documente”.
              </span>
            </div>
          ))}
        </div>
      )}
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
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const identityComplete =
    !request.askIdentity ||
    (IDENTITY_INPUTS.filter((f) => f.key !== 'dom_judet').every((f) => identity[f.key]?.trim()) && idFiles.length > 0);
  const allRead = request.documents.every((d) => opened[d.kind]);
  const canSubmit = identityComplete && !!signature && consent.read && consent.signature && !submitting;

  const openDoc = async (kind: string) => {
    setError(null);
    setOpening(kind);
    // Phones: a blob PDF in a new tab is unreliable (Android Chrome shows a
    // blank tab) — hand it to the phone's PDF viewer as a download instead.
    // Desktop: open the tab inside the click (popup blockers), fill it later.
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const win = mobile ? null : window.open('', '_blank');
    try {
      const res = await fetch(`/api/orders/${orderId}/signature-requests/${request.id}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token ?? undefined, kind, identity: request.askIdentity ? identity : undefined }),
      });
      if (!res.ok) {
        win?.close();
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Documentul nu a putut fi deschis. Încearcă din nou.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (win) {
        win.location.href = url;
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${kind}.${blob.type === 'application/pdf' ? 'pdf' : 'docx'}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      setOpened((o) => ({ ...o, [kind]: true }));
    } catch {
      win?.close();
      setError('Eroare de rețea. Verifică conexiunea și încearcă din nou.');
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
      setDone(true);
      onSigned();
    } catch {
      setError('Eroare de rețea. Verifică conexiunea și încearcă din nou.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
        <div className="text-sm text-green-900">
          <p className="font-semibold">Mulțumim, documentele sunt semnate.</p>
          <p className="mt-0.5">Le-am trimis topografului. Exemplarele semnate apar la „Documente” după ce reîncarci pagina.</p>
        </div>
      </div>
    );
  }

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

      {/* Pasul 1 — datele din buletin, doar când cererea le cere */}
      {request.askIdentity && (
        <div className="rounded-lg bg-white border border-neutral-200 p-3 sm:p-4 space-y-3">
          <p className="text-sm font-semibold text-secondary-900">1. Datele din actul de identitate</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {IDENTITY_INPUTS.map((f) => (
              <label key={f.key} className="block text-xs text-neutral-600">
                {f.label}
                <input
                  type="text"
                  inputMode={f.inputMode}
                  value={identity[f.key] ?? ''}
                  placeholder={f.placeholder}
                  onChange={(e) => setIdentity((v) => ({ ...v, [f.key]: e.target.value }))}
                  className="mt-0.5 w-full rounded-md border border-neutral-300 px-2.5 py-2 text-sm text-neutral-900"
                />
              </label>
            ))}
          </div>
          <div>
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
        <p className="text-sm font-semibold text-secondary-900">{request.askIdentity ? '2.' : '1.'} Citește documentele</p>
        {request.documents.map((d) => (
          <div key={d.kind} className="flex items-center gap-3 rounded-lg bg-white border border-neutral-200 p-3">
            <FileText className={`h-5 w-5 shrink-0 ${opened[d.kind] ? 'text-green-600' : 'text-neutral-400'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900">{d.label}</p>
              <p className="text-xs text-neutral-500">{d.description}</p>
            </div>
            <button
              type="button"
              onClick={() => openDoc(d.kind)}
              disabled={opening !== null}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-primary-300 bg-primary-50 px-3 py-1.5 text-sm font-medium text-secondary-900 hover:bg-primary-100 disabled:opacity-50"
            >
              {opening === d.kind && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {opened[d.kind] ? 'Deschis ✓' : 'Deschide'}
            </button>
          </div>
        ))}
        {request.askIdentity && (
          <p className="text-[11px] text-neutral-500">Documentele se completează cu datele din buletin pe care le-ai scris mai sus.</p>
        )}
      </div>

      {/* Pasul 3 — semnează */}
      <div className="rounded-lg bg-white border border-neutral-200 p-3 sm:p-4 space-y-3">
        <p className="text-sm font-semibold text-secondary-900">{request.askIdentity ? '3.' : '2.'} Semnează o singură dată</p>
        <SignaturePad onChange={setSignature} disabled={submitting} />
        <div className="space-y-2">
          <label className="flex items-start gap-2 text-xs text-neutral-700 leading-relaxed cursor-pointer">
            <input type="checkbox" className="mt-0.5" checked={consent.read} onChange={(e) => setConsent((c) => ({ ...c, read: e.target.checked }))} />
            <span>Am citit documentele de mai sus și sunt de acord cu conținutul lor.</span>
          </label>
          <label className="flex items-start gap-2 text-xs text-neutral-700 leading-relaxed cursor-pointer">
            <input type="checkbox" className="mt-0.5" checked={consent.signature} onChange={(e) => setConsent((c) => ({ ...c, signature: e.target.checked }))} />
            <span>Sunt de acord ca semnătura mea electronică să fie aplicată pe toate documentele de mai sus.</span>
          </label>
        </div>
        {!allRead && <p className="text-[11px] text-amber-700">Îți recomandăm să deschizi fiecare document înainte să semnezi.</p>}
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
        {!identityComplete && (
          <p className="text-[11px] text-neutral-500 text-center">Completează datele din buletin și încarcă poza ca să poți semna.</p>
        )}
      </div>
    </div>
  );
}
