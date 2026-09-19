'use client';
/* eslint-disable @next/next/no-img-element -- client-side previews from data URLs */

/**
 * Pagina publică de COMPLETARE pentru comenzile telefonice: după plată,
 * clientul (1) confirmă emailul comenzii, (2) încarcă actele cerute
 * (CI + selfie), (3) semnează pe ecran. Fără login, mobile-first.
 *
 * Securitate: token unic + gate de email — GET-ul pe token nu dezvăluie NIMIC
 * înainte de confirmarea emailului; upload-urile și semnătura poartă proof-ul
 * HMAC primit la /verify.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Upload,
  Mail,
  PenLine,
  ShieldCheck,
  Eraser,
} from 'lucide-react';
import { compressImage } from '@/lib/images/compress';

interface RequestedDoc {
  type: string;
  label: string;
  hint: string;
  acceptsPdf: boolean;
  uploaded: boolean;
  optional?: boolean;
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'unusable'; status: string }
  | { kind: 'confirm'; expiresAt: string | null; error?: string | null; locked?: boolean }
  | {
      kind: 'ready';
      email: string;
      proof: string;
      orderCode: string | null;
      documents: RequestedDoc[];
      signatureRequired: boolean;
      signatureDone: boolean;
    }
  | { kind: 'done' };

export default function CompletionPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token as string;
  const [state, setState] = useState<LoadState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/reupload/${token}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.success) {
          setState({ kind: 'unusable', status: 'invalid' });
          return;
        }
        if (!data.data.usable) {
          setState({ kind: 'unusable', status: data.data.status });
        } else if (data.data.requiresEmailConfirm) {
          setState({ kind: 'confirm', expiresAt: data.data.expiresAt ?? null });
        } else {
          // Link de reupload clasic deschis pe pagina greșită — redirecționăm.
          window.location.replace(`/reincarca-poza/${token}`);
        }
      } catch {
        if (!cancelled) setState({ kind: 'unusable', status: 'invalid' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleVerified = useCallback(
    (payload: { email: string; proof: string; orderCode: string | null; documents: RequestedDoc[]; signatureRequired: boolean; signatureDone: boolean }) => {
      setState({ kind: 'ready', ...payload });
    },
    []
  );

  const refresh = useCallback(
    (documents: RequestedDoc[] | null, signatureDone: boolean | null, allDone: boolean) => {
      if (allDone) {
        setState({ kind: 'done' });
        return;
      }
      setState((prev) => {
        if (prev.kind !== 'ready') return prev;
        return {
          ...prev,
          documents: documents ?? prev.documents,
          signatureDone: signatureDone ?? prev.signatureDone,
        };
      });
    },
    []
  );

  return (
    <div className="flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          {state.kind === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-8 text-neutral-500">
              <Loader2 className="h-7 w-7 animate-spin text-primary-500" />
              <p className="text-sm">Se verifică linkul...</p>
            </div>
          )}

          {state.kind === 'unusable' && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <h1 className="text-lg font-semibold text-secondary-900">
                {state.status === 'expired'
                  ? 'Link expirat'
                  : state.status === 'completed'
                    ? 'Comandă deja completată'
                    : 'Link invalid'}
              </h1>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {state.status === 'completed'
                  ? 'Actele și semnătura au fost deja trimise. Dacă mai e nevoie de ceva, te contactăm noi.'
                  : 'Acest link nu mai este valabil. Contactează-ne și îți trimitem unul nou.'}
              </p>
            </div>
          )}

          {state.kind === 'confirm' && (
            <EmailConfirmCard token={token} state={state} onVerified={handleVerified} />
          )}

          {state.kind === 'done' && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h1 className="text-lg font-semibold text-secondary-900">Totul e complet!</h1>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Mulțumim. Comanda ta merge mai departe — echipa noastră a fost anunțată
                și te ținem la curent pe email. Poți închide această pagină.
              </p>
            </div>
          )}

          {state.kind === 'ready' && (
            <div className="space-y-4">
              <div className="text-center">
                {state.orderCode && (
                  <p className="text-xs font-mono text-neutral-400 mb-1">Comanda {state.orderCode}</p>
                )}
                <h1 className="text-lg font-semibold text-secondary-900">Completează comanda</h1>
                <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
                  {state.documents.filter((d) => !d.uploaded).length > 0
                    ? 'Încarcă actele de mai jos'
                    : ''}
                  {state.documents.filter((d) => !d.uploaded).length > 0 && state.signatureRequired && !state.signatureDone
                    ? ', apoi semnează'
                    : state.signatureRequired && !state.signatureDone
                      ? 'Mai e nevoie doar de semnătura ta'
                      : ''}
                  .
                </p>
              </div>

              {state.documents.map((doc) => (
                <CompletionDocCard
                  key={doc.type}
                  token={token}
                  email={state.email}
                  proof={state.proof}
                  doc={doc}
                  onUploaded={(documents, allDone) => refresh(documents, null, allDone)}
                />
              ))}

              {state.signatureRequired && (
                <SignatureCard
                  token={token}
                  email={state.email}
                  proof={state.proof}
                  done={state.signatureDone}
                  onSigned={(allDone) => refresh(null, true, allDone)}
                />
              )}
            </div>
          )}
        </div>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-neutral-400 mt-4">
          <ShieldCheck className="h-3.5 w-3.5" />
          Datele sunt criptate și folosite exclusiv pentru procesarea comenzii.
        </p>
      </div>
    </div>
  );
}

// ── Pas 1: confirmarea emailului ─────────────────────────────

function EmailConfirmCard({
  token,
  state,
  onVerified,
}: {
  token: string;
  state: Extract<LoadState, { kind: 'confirm' }>;
  onVerified: (p: {
    email: string;
    proof: string;
    orderCode: string | null;
    documents: RequestedDoc[];
    signatureRequired: boolean;
    signatureDone: boolean;
  }) => void;
}) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/reupload/${token}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Verificarea a eșuat. Încearcă din nou.');
        return;
      }
      onVerified({
        email: data.data.email,
        proof: data.data.proof,
        orderCode: data.data.orderCode ?? null,
        documents: data.data.documents ?? [],
        signatureRequired: !!data.data.signatureRequired,
        signatureDone: !!data.data.signatureDone,
      });
    } catch {
      setError('Eroare de rețea. Verifică conexiunea și încearcă din nou.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
          <Mail className="h-6 w-6 text-primary-600" />
        </div>
        <h1 className="text-lg font-semibold text-secondary-900">Confirmă adresa de email</h1>
        <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
          Pentru siguranța datelor tale, introdu <strong>adresa de email a comenzii</strong> (cea la
          care ai primit acest link).
        </p>
      </div>
      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="adresa@exemplu.ro"
        className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
      />
      {error && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={submitting || !email.trim()}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-secondary-900 font-semibold py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? 'Se verifică...' : 'Continuă'}
      </button>
      {state.expiresAt && (
        <p className="text-center text-xs text-neutral-400">
          Linkul este valabil până la{' '}
          {new Date(state.expiresAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}.
        </p>
      )}
    </div>
  );
}

// ── Pas 2: upload documente (cu proof) ───────────────────────

function CompletionDocCard({
  token,
  email,
  proof,
  doc,
  onUploaded,
}: {
  token: string;
  email: string;
  proof: string;
  doc: RequestedDoc;
  onUploaded: (documents: RequestedDoc[], allDone: boolean) => void;
}) {
  const [pending, setPending] = useState<{ base64: string; mimeType: string; preview: string | null } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    try {
      const compressed = await compressImage(file);
      setPending({ base64: compressed.base64, mimeType: compressed.mimeType, preview: compressed.dataUrl });
    } catch {
      setError('Nu am putut procesa fișierul. Încearcă altul.');
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!pending) return;
    setUploading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reupload/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-confirm-email': email,
          'x-confirm-proof': proof,
        },
        body: JSON.stringify({ documentType: doc.type, imageBase64: pending.base64, contentType: pending.mimeType }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Încărcarea a eșuat. Încearcă din nou.');
        return;
      }
      onUploaded(data.data.documents, data.data.allDone);
    } catch {
      setError('Eroare de rețea. Verifică conexiunea și încearcă din nou.');
    } finally {
      setUploading(false);
    }
  }, [pending, token, email, proof, doc.type, onUploaded]);

  if (doc.uploaded) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50/60 p-4 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-900">{doc.label}</p>
          <p className="text-xs text-green-700">Încărcat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-secondary-900">{doc.label}</p>
        {doc.hint && <p className="text-xs text-neutral-500 mt-0.5">{doc.hint}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
      {pending ? (
        <div className="space-y-2">
          {pending.preview && (
            <div className="relative aspect-[3/4] max-h-56 bg-neutral-100 rounded-lg overflow-hidden">
              <img src={pending.preview} alt="Previzualizare" className="w-full h-full object-contain" />
            </div>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full text-xs text-primary-700 hover:text-primary-800 underline disabled:opacity-50"
          >
            Alege alt fișier
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-primary-300 rounded-lg p-4 flex flex-col items-center gap-1.5 hover:border-primary-500 hover:bg-primary-50/40 transition-colors"
        >
          <div className="flex items-center gap-2 text-primary-700">
            <Camera className="h-4 w-4" />
            <Upload className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium text-primary-800">Apasă pentru a face / alege o poză</span>
          <span className="text-[11px] text-neutral-500">JPG, PNG sau WEBP</span>
        </button>
      )}
      {error && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {pending && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={uploading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-secondary-900 font-semibold py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
          {uploading ? 'Se încarcă...' : 'Trimite documentul'}
        </button>
      )}
    </div>
  );
}

// ── Pas 3: semnătura (canvas touch + mouse) ──────────────────

function SignatureCard({
  token,
  email,
  proof,
  done,
  onSigned,
}: {
  token: string;
  email: string;
  proof: string;
  done: boolean;
  onSigned: (allDone: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);
  const [consent, setConsent] = useState({ terms: false, privacy: false, signature: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    drawing.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setHasInk(true);
  };
  const end = () => {
    drawing.current = false;
  };
  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  };

  const submit = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasInk) return;
    setSubmitting(true);
    setError(null);
    try {
      const signatureBase64 = canvas.toDataURL('image/png');
      const res = await fetch(`/api/reupload/${token}/signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-confirm-email': email,
          'x-confirm-proof': proof,
        },
        body: JSON.stringify({
          signatureBase64,
          consent: { termsAccepted: consent.terms, privacyAccepted: consent.privacy, signatureConsent: consent.signature, withdrawalWaiver: true },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Trimiterea semnăturii a eșuat.');
        return;
      }
      onSigned(data.data.allDone);
    } catch {
      setError('Eroare de rețea. Verifică conexiunea și încearcă din nou.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50/60 p-4 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-900">Semnătura</p>
          <p className="text-xs text-green-700">Semnat</p>
        </div>
      </div>
    );
  }

  const allConsents = consent.terms && consent.privacy && consent.signature;

  return (
    <div className="rounded-xl border border-neutral-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-secondary-900 flex items-center gap-1.5">
          <PenLine className="h-4 w-4 text-primary-600" />
          Semnătura ta
        </p>
        {hasInk && (
          <button type="button" onClick={clear} className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700">
            <Eraser className="h-3.5 w-3.5" /> Șterge
          </button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-36 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 touch-none"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <p className="text-[11px] text-neutral-500 -mt-1">Semnează cu degetul (pe telefon) sau cu mouse-ul.</p>

      <div className="space-y-2">
        {(
          [
            ['terms', <>Am citit și accept <a href="/termeni-si-conditii/" target="_blank" className="underline">Termenii și condițiile</a></>],
            ['privacy', <>Am citit <a href="/politica-de-confidentialitate/" target="_blank" className="underline">Politica de confidențialitate</a> și sunt de acord cu prelucrarea datelor</>],
            ['signature', <>Sunt de acord ca semnătura electronică de mai sus să fie aplicată pe documentele comenzii (împuternicire avocațială, contract)</>],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-start gap-2 text-xs text-neutral-700 leading-relaxed cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={consent[key]}
              onChange={(e) => setConsent((c) => ({ ...c, [key]: e.target.checked }))}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={submitting || !hasInk || !allConsents}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-secondary-900 font-semibold py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? 'Se trimite...' : 'Semnează și trimite'}
      </button>
    </div>
  );
}
