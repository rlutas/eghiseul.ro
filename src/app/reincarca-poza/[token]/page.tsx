'use client';
/* eslint-disable @next/next/no-img-element -- single client-side preview from a data URL */

/**
 * Public, token-gated page where a customer re-uploads one KYC photo (selfie)
 * after placing the order. Opened from the link in the admin-triggered email /
 * WhatsApp message. No login. Mobile-first — most customers open it on a phone.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, CheckCircle2, AlertTriangle, Camera, Upload } from 'lucide-react';
import { compressImage } from '@/lib/images/compress';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'unusable'; status: string }
  | { kind: 'ready'; documentLabel: string }
  | { kind: 'done' };

export default function ReuploadPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token as string;

  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingBase64, setPendingBase64] = useState<{ base64: string; mimeType: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
          setState({ kind: 'ready', documentLabel: data.data.documentLabel });
        }
      } catch {
        if (!cancelled) setState({ kind: 'unusable', status: 'invalid' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    try {
      const compressed = await compressImage(file);
      setPendingBase64({ base64: compressed.base64, mimeType: compressed.mimeType });
      setPreview(`data:${compressed.mimeType};base64,${compressed.base64.replace(/^data:[^;]+;base64,/, '')}`);
    } catch {
      setError('Nu am putut procesa imaginea. Încearcă altă poză.');
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!pendingBase64) return;
    setUploading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reupload/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: pendingBase64.base64, contentType: pendingBase64.mimeType }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Încărcarea a eșuat. Încearcă din nou.');
        return;
      }
      setState({ kind: 'done' });
    } catch {
      setError('Eroare de rețea. Verifică conexiunea și încearcă din nou.');
    } finally {
      setUploading(false);
    }
  }, [pendingBase64, token]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-xl font-bold text-secondary-900">eGhișeul.ro</div>
        </div>

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
                  ? 'Poza a fost deja încărcată. Dacă mai e nevoie de ceva, te contactăm noi.'
                  : 'Acest link nu mai este valabil. Contactează-ne și îți trimitem unul nou.'}
              </p>
            </div>
          )}

          {state.kind === 'done' && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h1 className="text-lg font-semibold text-secondary-900">Poză încărcată!</h1>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Mulțumim. Echipa noastră va verifica poza și va continua procesarea comenzii.
                Poți închide această pagină.
              </p>
            </div>
          )}

          {state.kind === 'ready' && (
            <div className="space-y-4">
              <div className="text-center">
                <h1 className="text-lg font-semibold text-secondary-900">
                  Reîncarcă {state.documentLabel}
                </h1>
                <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
                  Fă o poză clară, cu fața și documentul vizibile, bine luminată.
                </p>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="user"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = '';
                }}
              />

              {preview ? (
                <div className="space-y-3">
                  <div className="relative aspect-[3/4] bg-neutral-100 rounded-xl overflow-hidden">
                    <img src={preview} alt="Previzualizare" className="w-full h-full object-contain" />
                  </div>
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="w-full text-sm text-primary-700 hover:text-primary-800 underline disabled:opacity-50"
                  >
                    Alege altă poză
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="w-full border-2 border-dashed border-primary-300 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-primary-500 hover:bg-primary-50/40 transition-colors"
                >
                  <div className="flex items-center gap-2 text-primary-700">
                    <Camera className="h-5 w-5" />
                    <Upload className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-primary-800">Apasă pentru a face / alege o poză</span>
                  <span className="text-xs text-neutral-500">JPG, PNG sau WEBP</span>
                </button>
              )}

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!pendingBase64 || uploading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-secondary-900 font-semibold py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                {uploading ? 'Se încarcă...' : 'Trimite poza'}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-neutral-400 mt-4">
          Pozele sunt criptate și folosite exclusiv pentru verificarea identității.
        </p>
      </div>
    </div>
  );
}
