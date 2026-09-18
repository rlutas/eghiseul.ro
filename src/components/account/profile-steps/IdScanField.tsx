'use client';

/**
 * „Scanează actul și completează automat" — the optional shortcut at the top of
 * the personal-data step.
 *
 * It reads the document and hands the fields back; it does NOT save anything.
 * The photo is not stored: this screen is about the customer's own data, and
 * storing an identity document is something the identity step asks for
 * explicitly, with a selfie next to it. Everything the scan fills in stays
 * editable, and a failed read leaves the form exactly as usable as before.
 *
 * Same pipeline the KYC tab uses: compress in the browser, then
 * `POST /api/ocr/extract` with the document type, then judge the DATA rather
 * than Gemini's confidence score (`isOcrResultUsable`).
 */

import { useCallback, useRef, useState } from 'react';
import { Camera, Loader2, ScanLine } from 'lucide-react';
import { uploadToS3 } from '@/lib/aws/upload-client';
import { base64ToFile } from '@/lib/images/compress';
import { useKycStatus } from '@/hooks/useKycStatus';
import { ACCOUNT_DATA_SAVED_EVENT } from '../account-events';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { compressImage, ImageCompressionError } from '@/lib/images/compress';
import { ocrDocumentTypeFor, isOcrResultUsable } from '@/lib/kyc/identity-documents';
import type { ExtractedIdData } from '@/components/shared/IdScanner';

type ScanChoice = 'ci' | 'passport';

const CHOICES: { id: ScanChoice; label: string; ocrType: 'ci_front' | 'passport_opened' }[] = [
  { id: 'ci', label: 'Carte de identitate', ocrType: 'ci_front' },
  { id: 'passport', label: 'Pașaport', ocrType: 'passport_opened' },
];

const UNREADABLE =
  'Nu am putut citi actul. Asigură-te că imaginea este clară și că se vede tot documentul — sau completează câmpurile de mai jos manual.';

/** Base64 + mime of the picked file, compressed when the browser can do it. */
async function readForOcr(file: File): Promise<{ base64: string; mimeType: string }> {
  try {
    const compressed = await compressImage(file);
    return { base64: compressed.base64, mimeType: compressed.mimeType };
  } catch (error) {
    // An empty file or a HEIC photo cannot be recovered by trying harder, and
    // both already carry a message written for the customer.
    if (
      error instanceof ImageCompressionError &&
      (error.code === 'EMPTY_FILE' || error.code === 'HEIC_UNSUPPORTED')
    ) {
      throw error;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    return { base64: dataUrl.split(',')[1], mimeType: file.type || 'image/jpeg' };
  }
}

export function IdScanField({ onExtracted }: { onExtracted: (data: ExtractedIdData) => void }) {
  // Hidden input + ref.click(): the file picker does not open reliably on
  // macOS from a styled label (see .claude/rules/coding-conventions.md).
  const inputRef = useRef<HTMLInputElement>(null);
  const [choice, setChoice] = useState<ScanChoice>('ci');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { saveDocument } = useKycStatus();

  /**
   * The scanned document goes into the account too (Raul, 18.09.2026): the
   * customer had just photographed their ID here and the „Act de identitate"
   * tab asked for it again. Same path as the profile tab's scanner — S3 first,
   * then the row; no data-URL fallback, a copy we cannot store in S3 is not
   * stored at all. Never blocks the fields: a failed save is logged and the
   * customer can still save what the OCR read.
   */
  const storeDocument = useCallback(
    async (documentType: 'ci_front' | 'passport_opened', base64: string, mimeType: string, extracted: ExtractedIdData) => {
      try {
        const verificationId = crypto.randomUUID();
        const uploaded = await uploadToS3({
          category: 'kyc',
          file: base64ToFile(base64, mimeType, `${documentType}.jpg`),
          documentType,
          verificationId,
        });
        const saved = await saveDocument({
          documentType,
          fileUrl: uploaded.url,
          fileKey: uploaded.key,
          mimeType,
          extractedData: extracted,
          documentExpiry: extracted.documentExpiry,
          // The fields are still being edited in this dialog; the profile and
          // the address are written when the customer presses „Salvează".
          storeOnly: true,
        });
        if (saved) window.dispatchEvent(new CustomEvent(ACCOUNT_DATA_SAVED_EVENT, { detail: { step: 'identity' } }));
      } catch (err) {
        console.error('Personal data scan: document not stored in the account:', err);
      }
    },
    [saveDocument]
  );

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setBusy(true);
      try {
        const { base64, mimeType } = await readForOcr(file);
        const storedType = CHOICES.find((c) => c.id === choice)!.ocrType;
        const documentType = ocrDocumentTypeFor(storedType);

        const response = await fetch('/api/ocr/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'specific', imageBase64: base64, mimeType, documentType }),
        });
        if (!response.ok) throw new Error('OCR request failed');

        const result = await response.json();
        const ocr = result.data?.ocr;
        // Gemini reports confidence 0 on documents it read perfectly, so the
        // data decides, not the score.
        if (!isOcrResultUsable(ocr)) {
          setError(UNREADABLE);
          return;
        }
        onExtracted(ocr.extractedData as ExtractedIdData);
        await storeDocument(storedType, base64, mimeType, ocr.extractedData as ExtractedIdData);
      } catch (err) {
        console.error('Personal data scan failed:', err);
        setError(err instanceof ImageCompressionError ? err.message : UNREADABLE);
      } finally {
        setBusy(false);
      }
    },
    [choice, onExtracted, storeDocument]
  );

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-sm font-semibold text-secondary-900">Completează din act</p>
      <p className="mt-1 text-xs leading-relaxed text-neutral-500">
        Fotografiază actul și îți completăm câmpurile de mai jos. Poza se salvează în contul tău,
        la „Act de identitate&quot;, ca să nu o mai încarci la comandă. Datele rămân editabile; poți
        sări peste și scrie totul de mână.
      </p>

      <fieldset className="mt-3" disabled={busy}>
        <legend className="sr-only">Ce act scanezi</legend>
        <div className="flex gap-2">
          {CHOICES.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={choice === c.id}
              onClick={() => setChoice(c.id)}
              className={cn(
                'min-h-[44px] flex-1 rounded-xl border-2 px-3 text-sm font-medium transition-colors',
                choice === c.id
                  ? 'border-primary-500 bg-primary-50 text-secondary-900'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary-300'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </fieldset>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Cleared right away, so picking the same photo again re-triggers it.
          e.target.value = '';
          if (file) void handleFile(file);
        }}
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        // `whitespace-normal`: the button label is a sentence, and at 360px the
        // shadcn default (`nowrap`) pushes it past the button's own edges.
        className="mt-3 h-auto min-h-[44px] w-full border-primary-300 bg-white py-2.5 font-semibold whitespace-normal text-secondary-900 hover:bg-primary-50"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Citim actul…
          </>
        ) : (
          <>
            <Camera className="h-4 w-4" aria-hidden="true" />
            Scanează actul și completează automat
          </>
        )}
      </Button>

      {busy && (
        <p role="status" className="mt-2 text-xs text-neutral-500">
          Poate dura câteva secunde.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-2 flex items-start gap-1.5 text-xs font-medium leading-relaxed text-red-600"
        >
          <ScanLine className="mt-px h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
