'use client';

/**
 * „Ai un act care ne ajută să găsim imobilul?" — identificare imobil only.
 *
 * The topograph finds a property far faster from an old CF extract, a title
 * deed or a sale contract: they carry the old CF number, the topographic
 * number and the owner exactly as the land book knows them. Optional: a „Nu"
 * is a perfectly fine answer. Files go straight to S3 under the order's
 * namespace; the admin and the topograph see them on the order.
 */

import { useRef, useState } from 'react';
import { FileText, ImageIcon, Loader2, Paperclip, Trash2, Upload } from 'lucide-react';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CLIENT_FILES_MAX_COUNT } from '@/lib/orders/client-files';
import { uploadClientFile } from '@/lib/orders/client-files-upload';

const EXAMPLES = [
  'extras de carte funciară vechi (chiar și de acum 10–20 de ani)',
  'titlu de proprietate',
  'contract de vânzare-cumpărare, donație sau certificat de moștenitor',
  'orice act în care apare nr. de carte funciară, nr. cadastral sau nr. topografic',
];

function formatSize(bytes: number): string {
  if (!bytes) return '';
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function SupportingDocsCard() {
  const { state, updateProperty } = useModularWizard();
  const property = state.property;
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!property) return null;
  const answer = property.supportingDocsAnswer;
  const docs = property.supportingDocuments ?? [];
  const canUpload = !!state.orderId;

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || !state.orderId) return;
    setError(null);
    setUploading(true);
    let next = [...docs];
    try {
      for (const file of Array.from(files)) {
        if (next.length >= CLIENT_FILES_MAX_COUNT) {
          setError(`Poți încărca cel mult ${CLIENT_FILES_MAX_COUNT} fișiere.`);
          break;
        }
        const uploaded = await uploadClientFile(state.orderId, file, {
          email: state.contact.email,
          resumeToken: state.resumeToken,
        });
        next = [...next, uploaded];
        updateProperty?.({ supportingDocuments: next, supportingDocsAnswer: 'yes' });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Încărcarea a eșuat. Încearcă din nou.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeDoc = (key: string) =>
    updateProperty?.({ supportingDocuments: docs.filter((d) => d.key !== key) });

  return (
    <Card className="py-4 gap-4 sm:py-6 sm:gap-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          Ai un act care ne ajută să găsim imobilul?
        </CardTitle>
        <CardDescription>
          Opțional, dar grăbește mult identificarea: topograful vede pe act numerele vechi ale
          imobilului și numele proprietarului exact cum apar la OCPI.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 space-y-4">
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Ai un act pentru imobil?">
          {([
            ['yes', 'Da, am un act'],
            ['no', 'Nu am'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={answer === value}
              onClick={() => updateProperty?.({ supportingDocsAnswer: value })}
              className={`rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                answer === value
                  ? 'border-primary-500 bg-primary-50 text-secondary-900'
                  : 'border-neutral-200 text-neutral-700 hover:border-primary-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {answer === 'yes' && (
          <div className="space-y-3">
            <div className="rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
              <p className="mb-1 font-medium text-secondary-900">Ne ajută, de exemplu:</p>
              <ul className="list-disc space-y-0.5 pl-4">
                {EXAMPLES.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
              <p className="mt-1.5">Ajunge o poză clară făcută cu telefonul, cu toată pagina vizibilă.</p>
            </div>

            {docs.length > 0 && (
              <ul className="space-y-2">
                {docs.map((d) => (
                  <li
                    key={d.key}
                    className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  >
                    {d.mimeType === 'application/pdf' ? (
                      <FileText className="h-4 w-4 shrink-0 text-neutral-500" />
                    ) : (
                      <ImageIcon className="h-4 w-4 shrink-0 text-neutral-500" />
                    )}
                    <span className="min-w-0 flex-1 truncate">{d.name}</span>
                    <span className="text-xs text-neutral-400">{formatSize(d.size)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDoc(d.key)}
                      aria-label={`Șterge ${d.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
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
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={() => inputRef.current?.click()}
              disabled={!canUpload || uploading || docs.length >= CLIENT_FILES_MAX_COUNT}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {uploading ? 'Se încarcă...' : docs.length ? 'Mai adaugă un act' : 'Încarcă poza sau PDF-ul'}
            </Button>
            {!canUpload && (
              <p className="text-xs text-neutral-500">Salvăm comanda; butonul se activează imediat.</p>
            )}
            {error && <p className="text-xs text-red-600">{error}</p>}
            {docs.length === 0 && !error && (
              <p className="text-xs text-neutral-500">
                Poți continua și fără: dacă găsești actul mai târziu, îl trimiți din pagina comenzii.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
