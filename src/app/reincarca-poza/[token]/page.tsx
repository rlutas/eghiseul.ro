'use client';
/* eslint-disable @next/next/no-img-element -- client-side previews from data URLs */

/**
 * Public, token-gated page where a customer uploads the documents requested by
 * the team ("Solicită documente") after placing the order — selfie, CI,
 * pașaport, certificat firmă (PDF)... Opened from the link in the
 * admin-triggered email / WhatsApp message or from the order status page.
 * No login. Mobile-first — most customers open it on a phone.
 *
 * The header/footer chrome lives in layout.tsx.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Upload,
  FileText,
  MessageSquareText,
  ShieldCheck,
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
  | {
      kind: 'ready';
      documents: RequestedDoc[];
      reason: string | null;
      orderCode: string | null;
      expiresAt: string | null;
    }
  | { kind: 'done' };

const MAX_PDF_BYTES = 9 * 1024 * 1024;

export default function ReuploadPage() {
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
        } else {
          setState({
            kind: 'ready',
            documents: data.data.documents,
            reason: data.data.reason ?? null,
            orderCode: data.data.orderCode ?? null,
            expiresAt: data.data.expiresAt ?? null,
          });
        }
      } catch {
        if (!cancelled) setState({ kind: 'unusable', status: 'invalid' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleUploaded = useCallback((documents: RequestedDoc[], allDone: boolean) => {
    if (allDone) {
      setState({ kind: 'done' });
    } else {
      setState((prev) =>
        prev.kind === 'ready' ? { ...prev, documents } : prev
      );
    }
  }, []);

  const remaining =
    state.kind === 'ready'
      ? state.documents.filter((d) => !d.uploaded && !d.optional).length
      : 0;
  const requiredCount =
    state.kind === 'ready' ? state.documents.filter((d) => !d.optional).length : 0;

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
                  ? 'Link deja folosit'
                  : 'Link invalid'}
              </h1>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {state.status === 'completed'
                  ? 'Documentele au fost deja încărcate. Dacă mai e nevoie de ceva, te contactăm noi.'
                  : 'Acest link nu mai este valabil. Contactează-ne și îți trimitem unul nou.'}
              </p>
            </div>
          )}

          {state.kind === 'done' && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h1 className="text-lg font-semibold text-secondary-900">
                Documente încărcate!
              </h1>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Mulțumim. Echipa noastră a fost anunțată, verifică documentele și
                continuă procesarea comenzii. Poți închide această pagină.
              </p>
            </div>
          )}

          {state.kind === 'ready' && (
            <div className="space-y-4">
              <div className="text-center">
                {state.orderCode && (
                  <p className="text-xs font-mono text-neutral-400 mb-1">
                    Comanda {state.orderCode}
                  </p>
                )}
                <h1 className="text-lg font-semibold text-secondary-900">
                  {requiredCount === 1
                    ? 'Încarcă documentul solicitat'
                    : 'Încarcă documentele solicitate'}
                </h1>
                <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
                  {remaining === requiredCount
                    ? `Avem nevoie de ${requiredCount === 1 ? 'un document' : `${requiredCount} documente`} pentru a continua comanda.`
                    : `Încă ${remaining} ${remaining === 1 ? 'document rămas' : 'documente rămase'}.`}
                </p>
              </div>

              {state.reason && (
                <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-100 px-3.5 py-3">
                  <MessageSquareText className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-blue-900 mb-0.5">
                      Mesaj de la echipa eGhișeul.ro
                    </p>
                    <p className="text-sm text-blue-900/90 leading-relaxed">{state.reason}</p>
                  </div>
                </div>
              )}

              {state.documents.map((doc) => (
                <DocUploadCard
                  key={doc.type}
                  token={token}
                  doc={doc}
                  onUploaded={handleUploaded}
                />
              ))}

              {state.expiresAt && (
                <p className="text-center text-xs text-neutral-400">
                  Linkul este valabil până la{' '}
                  {new Date(state.expiresAt).toLocaleDateString('ro-RO', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  .
                </p>
              )}
            </div>
          )}
        </div>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-neutral-400 mt-4">
          <ShieldCheck className="h-3.5 w-3.5" />
          Documentele sunt criptate și folosite exclusiv pentru procesarea comenzii.
        </p>
      </div>
    </div>
  );
}

function DocUploadCard({
  token,
  doc,
  onUploaded,
}: {
  token: string;
  doc: RequestedDoc;
  onUploaded: (documents: RequestedDoc[], allDone: boolean) => void;
}) {
  const [pending, setPending] = useState<{
    base64: string;
    mimeType: string;
    preview: string | null;
    fileName: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      try {
        if (file.type === 'application/pdf') {
          if (!doc.acceptsPdf) {
            setError('Pentru acest document acceptăm doar poze (JPG/PNG).');
            return;
          }
          if (file.size > MAX_PDF_BYTES) {
            setError('PDF-ul e prea mare (max 9 MB).');
            return;
          }
          const base64 = await fileToBase64(file);
          setPending({ base64, mimeType: 'application/pdf', preview: null, fileName: file.name });
        } else {
          const compressed = await compressImage(file);
          setPending({
            base64: compressed.base64,
            mimeType: compressed.mimeType,
            preview: compressed.dataUrl,
            fileName: file.name,
          });
        }
      } catch {
        setError('Nu am putut procesa fișierul. Încearcă altul.');
      }
    },
    [doc.acceptsPdf]
  );

  const handleSubmit = useCallback(async () => {
    if (!pending) return;
    setUploading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reupload/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: doc.type,
          imageBase64: pending.base64,
          contentType: pending.mimeType,
        }),
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
  }, [pending, token, doc.type, onUploaded]);

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

  const accept = doc.acceptsPdf
    ? 'image/jpeg,image/png,image/webp,application/pdf'
    : 'image/jpeg,image/png,image/webp';

  return (
    <div className="rounded-xl border border-neutral-200 p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-secondary-900">
          {doc.label}
          {doc.optional && (
            <span className="ml-1.5 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500 align-middle">
              opțional
            </span>
          )}
        </p>
        {doc.hint && <p className="text-xs text-neutral-500 mt-0.5">{doc.hint}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture={doc.type === 'selfie' ? 'user' : undefined}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />

      {pending ? (
        <div className="space-y-2">
          {pending.preview ? (
            <div className="relative aspect-[3/4] max-h-56 bg-neutral-100 rounded-lg overflow-hidden">
              <img
                src={pending.preview}
                alt="Previzualizare"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-neutral-700 bg-neutral-100 rounded-lg px-3 py-2">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{pending.fileName}</span>
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
          <span className="text-xs font-medium text-primary-800">
            Apasă pentru a face / alege {doc.acceptsPdf ? 'o poză sau un PDF' : 'o poză'}
          </span>
          <span className="text-[11px] text-neutral-500">
            {doc.acceptsPdf ? 'JPG, PNG, WEBP sau PDF' : 'JPG, PNG sau WEBP'}
          </span>
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

/** Raw base64 (no data: prefix) from a File. */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.replace(/^data:[^;]+;base64,/, ''));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
