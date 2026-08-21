'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Upload, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { findStatusLabel } from '@/lib/admin/status-options';
import { usePreviewAs, withPreview } from '@/lib/collaborator/preview';
import { taxaEliberare } from '@/lib/ancpi/taxe-eliberare';

interface OrderDoc {
  id: string;
  type: string;
  file_name: string;
  file_size: number | null;
  visible_to_client: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface OrderDetail {
  id: string;
  friendly_order_id: string | null;
  status: string;
  created_at: string;
  customer_data: Record<string, any> | null; // eslint-disable-line @typescript-eslint/no-explicit-any
  services: { name: string; slug: string; processing_config?: { ancpi_cost_ron?: number | string | null } | null } | null;
  deliverable: string | null;
  documents: OrderDoc[];
  /** Angajamentul de execuție semnat de client (convenția cu executantul). */
  conventii: OrderDoc[];
  /** Cererile de depus la OCPI (Anexa 6) — una per imobil de pe comandă. */
  cereri: { index: number; name: string }[];
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase text-slate-400">{label}</dt>
      <dd className="text-sm text-slate-800">{value}</dd>
    </div>
  );
}

export default function CollaboratorOrderDetail() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const previewAs = usePreviewAs();
  // Preview de admin: secțiunile de lucru se VĂD (altfel adminul nu poate
  // verifica ce are colaboratorul la dispoziție), dar comenzile sunt
  // dezactivate; rutele care scriu cer oricum rol de colaborator.
  const readOnly = !!previewAs;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [regNumber, setRegNumber] = useState('');
  // Taxa OCPI diferă pe serviciu (20 lei extras CF, 15 lei plan cadastral) —
  // se precompletează după ce se încarcă comanda, ca să nu o tasteze de o sută
  // de ori; rămâne editabilă pentru cazurile în care diferă.
  const [costRon, setCostRon] = useState('');
  const [savingDepunere, setSavingDepunere] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const res = await fetch(withPreview(`/api/collaborator/orders/${orderId}`, previewAs));
    const json = await res.json();
    if (json.success) {
      setOrder(json.data);
      const taxa = taxaEliberare(json.data?.services?.slug, json.data?.services?.processing_config);
      // Doar cât timp câmpul e neatins — nu suprascriem ce a tastat el.
      setCostRon((current) => (current === '' && taxa !== null ? String(taxa) : current));
    }
    else toast.error(json.error || 'Eroare la încărcare');
    setLoading(false);
  };

  /** Varianta editabilă (.docx) a convenției — PDF-ul e pentru tipărit. */
  const downloadOriginal = async (docId: string) => {
    try {
      const res = await fetch(
        withPreview(`/api/collaborator/orders/${orderId}/document?docId=${docId}&format=docx`, previewAs)
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      window.open(json.data.url, '_blank');
    } catch {
      toast.error('Nu s-a putut descărca documentul');
    }
  };

  useEffect(() => {
    // Așteaptă citirea `?as=` din URL înainte de fetch (altfel adminul ar primi 403).
    if (typeof window !== 'undefined' && !previewAs && window.location.search.includes('as=')) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, previewAs]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/collaborator/orders/${orderId}/upload-pdf`, { method: 'POST', body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Eroare la încărcare');
      const { delivered } = json.data;
      if (delivered) {
        toast.success('Document încărcat și trimis clientului — statusul comenzii s-a actualizat automat.');
      } else {
        toast.warning('Documentul s-a încărcat, dar trimiterea către client a eșuat. Reîncearcă sau anunță echipa.');
      }
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Eroare la încărcare');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/collaborator/orders/${orderId}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Eroare');
      toast.success('Notă adăugată — vizibilă echipei în istoricul comenzii.');
      setNote('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Eroare');
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Se încarcă...</p>;
  const handleDepunere = async () => {
    setSavingDepunere(true);
    try {
      const res = await fetch(withPreview(`/api/collaborator/orders/${orderId}/depunere`, previewAs), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: regNumber.trim(), costRon: costRon.trim() }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Eroare');
      toast.success('Depunerea a fost înregistrată.');
      setRegNumber('');
      const taxa = taxaEliberare(order?.services?.slug, order?.services?.processing_config);
      setCostRon(taxa !== null ? String(taxa) : '');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Eroare la salvare');
    } finally {
      setSavingDepunere(false);
    }
  };

  if (!order) return <p className="text-sm text-red-600">Comanda nu a fost găsită.</p>;

  const property = order.customer_data?.property ?? {};
  const hasDocs = order.documents.some((d) => d.metadata?.source === 'collaborator');
  const delivered = order.status === 'document_ready' || order.status === 'completed' || order.status === 'shipped' || order.status === 'delivered';

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={withPreview('/colaborator/orders', previewAs)} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> Înapoi la comenzi
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {order.friendly_order_id || order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-slate-500">{order.services?.name}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{findStatusLabel(order.status)}</span>
      </div>

      {/* Customer + property data */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Date pentru lucrare</h2>
        <dl className="grid grid-cols-2 gap-4">
          <Field label="Județ" value={property.county} />
          <Field label="Localitate" value={property.locality} />
          <Field label="Carte Funciară" value={property.carteFunciara} />
          <Field label="Nr. cadastral" value={property.cadastral} />
          <Field label="Nr. topografic" value={property.topografic} />
          <Field
            label="Adresă imobil"
            value={
              property.propertyAddress ||
              property.address ||
              [property.imobilStreet, property.imobilLocality].filter(Boolean).join(', ') ||
              undefined
            }
          />
          <Field label="Proprietar" value={property.ownerName ?? property.beneficiaryName} />
          <Field label="Motivul solicitării" value={property.motiv} />
          <Field label="Alte informații de la client" value={property.additionalInfo} />
        </dl>
      </div>

      {/* Angajamentul de execuție — contractul dintre client și executant,
          semnat de client în comandă. Exemplarul lui, de descărcat/tipărit. */}
      {(order.conventii?.length ?? 0) > 0 && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">
            Angajament de execuție documentație
          </h2>
          <p className="mb-3 text-xs text-slate-500">
            Semnat electronic de client odată cu comanda. Îl poți descărca și tipări pentru dosarul
            de la BCPI.
          </p>
          <ul className="space-y-2">
            {order.conventii.map((d) => (
              <li key={d.id} className="flex items-center gap-2 text-sm text-slate-700">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="flex-1">{d.file_name}</span>
                <a
                  href={withPreview(`/api/collaborator/orders/${orderId}/document?docId=${d.id}`, previewAs)}
                  target="_blank"
                  rel="noopener"
                  className="text-xs font-medium text-primary-700 hover:underline"
                >
                  Deschide PDF
                </a>
                <button
                  type="button"
                  onClick={() => downloadOriginal(d.id)}
                  className="text-xs text-slate-500 hover:underline"
                >
                  Word
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cererile de depus la OCPI — generate din datele comenzii, denumite
          după convenția lui (nr. CF - UAT-Județ), câte una per imobil. */}
      {(order.cereri?.length ?? 0) > 0 && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">Cerere pentru OCPI</h2>
          <p className="mb-3 text-xs text-slate-500">
            Completată cu datele imobilului și denumită după numărul de carte funciară, UAT și
            județ. O descarci, o semnezi electronic și o depui — nu mai trebuie să o completezi.
          </p>
          <ul className="space-y-2">
            {order.cereri.map((c) => (
              <li key={c.index} className="flex items-center gap-2 text-sm text-slate-700">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="flex-1 break-all">{c.name}</span>
                <a
                  href={withPreview(
                    `/api/collaborator/orders/${orderId}/cerere?imobil=${c.index}`,
                    previewAs
                  )}
                  className="text-xs font-medium text-primary-700 hover:underline"
                >
                  Descarcă
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Depunerea la OCPI — nr. de înregistrare + cât ne-a costat eliberarea.
          Mută comanda în „Trimis instituție", ca statusul clientului să nu mai
          arate „în procesare" cât timp lucrarea e la ghișeu. */}
      {/* Apare pentru serviciile pe care le depunem la OCPI — și acolo unde
          generăm cererea (extras CF), și unde încă nu (plan cadastral), ca taxa
          plătită la ghișeu să nu rămână neînregistrată. */}
      {((order.cereri?.length ?? 0) > 0
        || taxaEliberare(order.services?.slug, order.services?.processing_config) !== null)
        && !delivered && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">Am depus cererea la OCPI</h2>
          <p className="mb-3 text-xs text-slate-500">
            Trece comanda în &bdquo;Trimis instituție&rdquo; și înregistrează costul eliberării.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-1">
              <label htmlFor="reg-number" className="mb-1 block text-xs text-slate-500">
                Nr. de înregistrare OCPI
              </label>
              <input
                id="reg-number"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                disabled={readOnly}
                placeholder="ex. 84512/12.09.2026"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>
            <div className="w-36">
              <label htmlFor="cost-ron" className="mb-1 block text-xs text-slate-500">
                Cost eliberare (lei)
              </label>
              <input
                id="cost-ron"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={costRon}
                onChange={(e) => setCostRon(e.target.value)}
                disabled={readOnly}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>
            <Button
              onClick={handleDepunere}
              disabled={readOnly || savingDepunere || (!regNumber.trim() && !costRon.trim())}
              variant="outline"
              className="h-10"
            >
              {savingDepunere ? 'Se salvează...' : 'Salvează depunerea'}
            </Button>
          </div>
        </div>
      )}

      {/* Deliverable — what Mircea must obtain + upload for this order */}
      {order.deliverable && (
        <div className="mb-6 rounded-lg border border-primary-200 bg-primary-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">De livrat către client</p>
          <p className="mt-1 text-base font-bold text-secondary-900">{order.deliverable}</p>
          <p className="mt-1 text-xs text-slate-500">Obține documentul de la OCPI/ANCPI, scanează-l și încarcă-l mai jos, apoi marchează comanda gata.</p>
        </div>
      )}

      {/* Documents */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Documente</h2>
        {order.documents.length === 0 ? (
          <p className="text-sm text-slate-500">Niciun document încărcat încă.</p>
        ) : (
          <ul className="space-y-2">
            {order.documents.map((d) => (
              <li key={d.id} className="flex items-center gap-2 text-sm text-slate-700">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="flex-1">{d.file_name}</span>
                {d.file_size != null && (
                  <span className="text-xs text-slate-400">
                    {d.file_size < 1024 * 1024
                      ? `${Math.max(1, Math.round(d.file_size / 1024))} KB`
                      : `${(d.file_size / 1024 / 1024).toFixed(1)} MB`}
                  </span>
                )}
                {d.visible_to_client ? (
                  <span className="text-xs text-green-600">livrat</span>
                ) : (
                  <span className="text-xs text-amber-600">nelivrat</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Note for the team */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-slate-900">Notă pentru echipă</h2>
        <p className="mb-3 text-xs text-slate-500">Ex: nr. înregistrare, observații, dacă lipsește ceva. Apare în istoricul comenzii în admin.</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={readOnly}
          rows={3}
          placeholder="Scrie o notă pentru echipă..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
        <div className="mt-2 flex justify-end">
          <Button onClick={handleAddNote} disabled={readOnly || savingNote || !note.trim()} variant="outline" size="sm">
            {savingNote ? 'Se salvează...' : 'Adaugă notă'}
          </Button>
        </div>
      </div>

      {/* Actions — one step: upload = deliver (docs visible + status + email) */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
          }}
        />
        <Button onClick={() => fileRef.current?.click()} disabled={readOnly || uploading} className="h-11">
          {delivered ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
          {uploading
            ? 'Se încarcă și se trimite...'
            : delivered
              ? 'Livrată — încarcă document suplimentar'
              : 'Încarcă PDF și trimite clientului'}
        </Button>
      </div>
      {!hasDocs && !delivered && (
        <p className="mt-2 text-xs text-slate-400">
          La încărcare, documentul se trimite automat clientului și statusul comenzii se actualizează.
        </p>
      )}
      {readOnly && (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Previzualizare de admin: vezi tot ce are colaboratorul la dispoziție, dar acțiunile sunt
          dezactivate. Descărcarea cererilor funcționează.
        </p>
      )}
    </div>
  );
}
