'use client';

/**
 * Full-screen reader for one document, inside the page: the PDF pages are drawn
 * with pdf.js, so it works the same on phones (where an inline PDF or a blob tab
 * is unreliable) and on desktop. „Descarcă" saves the same file.
 */

import { useEffect, useRef, useState } from 'react';
import { Download, Loader2, X } from 'lucide-react';

export interface PreviewFile {
  title: string;
  blob: Blob;
  fileName: string;
}

export function PdfPreviewModal({
  file,
  onClose,
  confirmLabel,
}: {
  file: PreviewFile;
  onClose: () => void;
  /** Main button at the bottom (e.g. „Am citit"); defaults to „Închide". */
  confirmLabel?: string;
}) {
  const pagesRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const isPdf = file.blob.type === 'application/pdf';

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (!isPdf) return;
    let cancelled = false;
    const host = pagesRef.current;
    (async () => {
      try {
        const pdfjs = (await import('pdfjs-dist/legacy/build/pdf.mjs')) as unknown as typeof import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString();
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.blob.arrayBuffer()) }).promise;
        if (!host || cancelled) return;
        host.innerHTML = '';
        const width = Math.min(host.clientWidth || 800, 900);
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        for (let n = 1; n <= pdf.numPages; n++) {
          const page = await pdf.getPage(n);
          if (cancelled) return;
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: (width / base.width) * ratio });
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = '100%';
          canvas.className = 'block bg-white shadow-sm rounded';
          host.appendChild(canvas);
          await page.render({ canvas, canvasContext: canvas.getContext('2d')!, viewport }).promise;
          if (n === 1 && !cancelled) setState('ready');
        }
        if (!cancelled) setState('ready');
      } catch {
        if (!cancelled) setState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file, isPdf]);

  const download = () => {
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-neutral-900/80" role="dialog" aria-modal="true" aria-label={file.title}>
      <div className="flex items-center gap-2 bg-white px-3 py-2.5 sm:px-4 border-b">
        <p className="flex-1 min-w-0 truncate text-sm font-semibold text-secondary-900">{file.title}</p>
        <button
          type="button"
          onClick={download}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-medium hover:bg-neutral-50"
        >
          <Download className="h-3.5 w-3.5" /> Descarcă
        </button>
        <button type="button" onClick={onClose} aria-label="Închide" className="rounded-lg p-1.5 hover:bg-neutral-100">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto bg-neutral-200 px-2 py-3 sm:px-6">
        <div className="mx-auto max-w-[900px]">
          {isPdf && state === 'loading' && (
            <p className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-600">
              <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă documentul…
            </p>
          )}
          {(!isPdf || state === 'error') && (
            <div className="rounded-lg bg-white p-6 text-center text-sm text-neutral-700">
              Documentul nu poate fi afișat aici. Apasă „Descarcă” ca să-l deschizi pe dispozitiv.
            </div>
          )}
          <div ref={pagesRef} className="space-y-3" />
        </div>
      </div>
      <div className="bg-white border-t px-3 py-2.5 sm:px-4">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-primary-500 hover:bg-primary-600 py-2.5 text-sm font-semibold text-secondary-900"
        >
          {confirmLabel ?? 'Închide'}
        </button>
      </div>
    </div>
  );
}
