'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Upload, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { findStatusLabel } from '@/lib/admin/status-options';

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
  services: { name: string; slug: string } | null;
  deliverable: string | null;
  documents: OrderDoc[];
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
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const res = await fetch(`/api/collaborator/orders/${orderId}`);
    const json = await res.json();
    if (json.success) setOrder(json.data);
    else toast.error(json.error || 'Eroare la încărcare');
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

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
  if (!order) return <p className="text-sm text-red-600">Comanda nu a fost găsită.</p>;

  const property = order.customer_data?.property ?? {};
  const hasDocs = order.documents.some((d) => d.metadata?.source === 'collaborator');
  const delivered = order.status === 'document_ready' || order.status === 'completed' || order.status === 'shipped' || order.status === 'delivered';

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/colaborator/orders" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
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
          <Field label="Adresă imobil" value={property.propertyAddress ?? property.address} />
          <Field label="Proprietar" value={property.ownerName} />
        </dl>
      </div>

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
          rows={3}
          placeholder="Scrie o notă pentru echipă..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
        <div className="mt-2 flex justify-end">
          <Button onClick={handleAddNote} disabled={savingNote || !note.trim()} variant="outline" size="sm">
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
        <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="h-11">
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
    </div>
  );
}
