'use client';

/**
 * Comandă telefonică nouă (admin, A→Z): serviciu + opțiuni + datele clientului
 * luate la telefon. Prețul afișat e informativ — serverul îl recalculează din
 * DB la creare (nu se trimite niciun preț din browser).
 *
 * După creare → pagina comenzii, unde echipa trimite link-ul de plată sau
 * marchează plata manuală, apoi link-ul de completare (acte + semnătură).
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Phone, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminPermissions } from '@/hooks/use-admin-permissions';

interface ServiceOption {
  id: string;
  code: string;
  name: string;
  price: number;
  is_active: boolean | null;
}
interface Service {
  id: string;
  name: string;
  category: string;
  base_price: number;
  is_active: boolean | null;
  service_options: ServiceOption[];
}

export default function NewPhoneOrderPage() {
  const router = useRouter();
  const { hasPermission } = useAdminPermissions();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [serviceId, setServiceId] = useState('');
  const [optionIds, setOptionIds] = useState<string[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'courier'>('email');
  const [contact, setContact] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [personal, setPersonal] = useState({ cnp: '', address: '', city: '', county: '' });
  const [billingType, setBillingType] = useState<'pf' | 'pj'>('pf');
  const [billingPj, setBillingPj] = useState({ companyName: '', cui: '' });
  const [note, setNote] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch('/api/admin/settings/services');
          const json = await res.json();
          if (json.success) {
            setServices((json.data as Service[]).filter((s) => s.is_active));
          }
        } catch {
          toast.error('Nu am putut încărca serviciile');
        } finally {
          setLoading(false);
        }
      })();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const service = useMemo(() => services.find((s) => s.id === serviceId) || null, [services, serviceId]);
  const activeOptions = useMemo(
    () => (service?.service_options || []).filter((o) => o.is_active !== false),
    [service]
  );

  const estimatedTotal = useMemo(() => {
    const base = Number(service?.base_price) || 0;
    const opts = activeOptions.filter((o) => optionIds.includes(o.id)).reduce((s, o) => s + (Number(o.price) || 0), 0);
    const delivery = deliveryMethod === 'courier' ? 25 : 0;
    return Math.round((base + opts + delivery) * 100) / 100;
  }, [service, activeOptions, optionIds, deliveryMethod]);

  if (!hasPermission('orders.manage')) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nu ai permisiunea de a crea comenzi.</p>
      </div>
    );
  }

  const submit = async () => {
    setSaving(true);
    try {
      const billing =
        billingType === 'pj'
          ? { type: 'company', companyName: billingPj.companyName, cui: billingPj.cui, address: personal.address, city: personal.city, county: personal.county }
          : {
              type: 'individual',
              firstName: contact.firstName,
              lastName: contact.lastName,
              cnp: personal.cnp || undefined,
              address: personal.address,
              city: personal.city,
              county: personal.county,
            };
      const res = await fetch('/api/admin/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          optionIds,
          delivery: { method: deliveryMethod },
          customer: {
            contact,
            personal: { firstName: contact.firstName, lastName: contact.lastName, cnp: personal.cnp || undefined },
            billing,
          },
          note: note || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || 'Eroare la crearea comenzii');
        return;
      }
      toast.success(`Comanda ${json.data.friendlyOrderId} creată — ${json.data.totalPrice} RON`);
      router.push(`/admin/orders/${json.data.id}`);
    } catch {
      toast.error('Eroare de rețea');
    } finally {
      setSaving(false);
    }
  };

  const canSubmit =
    !!serviceId &&
    contact.firstName.trim() &&
    contact.lastName.trim() &&
    contact.email.trim() &&
    contact.phone.trim() &&
    personal.address.trim() &&
    personal.city.trim() &&
    personal.county.trim() &&
    (billingType === 'pf' || (billingPj.companyName.trim() && billingPj.cui.trim()));

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-1" onClick={() => router.push('/admin/orders')}>
          <ArrowLeft className="h-4 w-4" /> Înapoi la comenzi
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Phone className="h-5 w-5" /> Comandă telefonică nouă
        </h1>
        <p className="text-sm text-muted-foreground">
          Introdu datele luate la telefon. După creare trimiți link-ul de plată (sau marchezi plata
          manuală), apoi link-ul unde clientul încarcă actele și semnează.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">1. Serviciul</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Se încarcă serviciile...</p>
          ) : (
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                setOptionIds([]);
              }}
            >
              <option value="">— alege serviciul —</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.base_price} lei
                </option>
              ))}
            </select>
          )}
          {activeOptions.length > 0 && (
            <div className="space-y-1.5">
              <Label>Opțiuni</Label>
              {activeOptions.map((o) => (
                <label key={o.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optionIds.includes(o.id)}
                    onChange={(e) =>
                      setOptionIds((prev) => (e.target.checked ? [...prev, o.id] : prev.filter((x) => x !== o.id)))
                    }
                  />
                  <span className="flex-1">{o.name}</span>
                  <span className="text-muted-foreground">+{o.price} lei</span>
                </label>
              ))}
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Livrare</Label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={deliveryMethod}
              onChange={(e) => setDeliveryMethod(e.target.value as 'email' | 'courier')}
            >
              <option value="email">Email (PDF) — 0 lei</option>
              <option value="courier">Curier (RO) — 25 lei</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">2. Clientul</CardTitle>
          <CardDescription>Datele de contact + adresa (necesare pentru factură)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Prenume *</Label>
              <Input value={contact.firstName} onChange={(e) => setContact({ ...contact, firstName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Nume *</Label>
              <Input value={contact.lastName} onChange={(e) => setContact({ ...contact, lastName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
              <p className="text-[11px] text-muted-foreground">Aici primește link-ul de plată și de completare — verifică-l cu clientul!</p>
            </div>
            <div className="space-y-1.5">
              <Label>Telefon *</Label>
              <Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>CNP (opțional)</Label>
              <Input value={personal.cnp} maxLength={13} onChange={(e) => setPersonal({ ...personal, cnp: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5 col-span-3 sm:col-span-1">
              <Label>Adresă (stradă, nr.) *</Label>
              <Input value={personal.address} onChange={(e) => setPersonal({ ...personal, address: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Localitate *</Label>
              <Input value={personal.city} onChange={(e) => setPersonal({ ...personal, city: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Județ *</Label>
              <Input value={personal.county} onChange={(e) => setPersonal({ ...personal, county: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Facturare</Label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={billingType === 'pf'} onChange={() => setBillingType('pf')} /> Persoană fizică
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={billingType === 'pj'} onChange={() => setBillingType('pj')} /> Firmă
              </label>
            </div>
          </div>
          {billingType === 'pj' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Denumire firmă *</Label>
                <Input value={billingPj.companyName} onChange={(e) => setBillingPj({ ...billingPj, companyName: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>CUI *</Label>
                <Input value={billingPj.cui} onChange={(e) => setBillingPj({ ...billingPj, cui: e.target.value })} />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Notă internă (opțional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="ex: client sunat pe 15.07, vrea urgent" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total estimat (serverul recalculează la creare)</p>
            <p className="text-2xl font-bold">{estimatedTotal.toFixed(2)} RON</p>
          </div>
          <Button onClick={submit} disabled={saving || !canSubmit}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Creează comanda
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
