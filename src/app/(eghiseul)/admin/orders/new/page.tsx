'use client';

/**
 * Comandă telefonică nouă: echipa alege serviciul și completează WIZARD-UL
 * REAL în modul telefonic (?telefonic=1) — paritate 100% cu formularul
 * clientului: PF/PJ cu CUI→ANAF, câmpurile de constatator / carte funciară /
 * imobil, toate opțiunile cu prețuri live, cupoane/discount, curier cu
 * cotații reale. Pașii de acte + semnătură se sar (clientul le face prin
 * link-ul de completare, după plată), iar butonul final creează comanda fără
 * plată și te aduce înapoi pe pagina ei din admin.
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Phone, ShieldAlert } from 'lucide-react';
import { useAdminPermissions } from '@/hooks/use-admin-permissions';

interface Service {
  id: string;
  name: string;
  slug: string;
  category: string;
  base_price: number;
  is_active: boolean | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  juridic: 'Juridic',
  fiscal: 'Fiscal',
  auto: 'Auto',
  'stare-civila': 'Stare civilă',
  personale: 'Personale',
  imobiliare: 'Imobiliare',
  firme: 'Firme',
};

export default function NewPhoneOrderPage() {
  const router = useRouter();
  const { hasPermission } = useAdminPermissions();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch('/api/admin/settings/services');
          const json = await res.json();
          if (json.success) setServices((json.data as Service[]).filter((s) => s.is_active));
        } finally {
          setLoading(false);
        }
      })();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) => s.name.toLowerCase().includes(q) || s.slug.includes(q));
  }, [services, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of filtered) {
      const arr = map.get(s.category) || [];
      arr.push(s);
      map.set(s.category, arr);
    }
    return [...map.entries()];
  }, [filtered]);

  if (!hasPermission('orders.manage')) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nu ai permisiunea de a crea comenzi.</p>
      </div>
    );
  }

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
          Alegi serviciul, apoi completezi <strong>formularul real de comandă</strong> cu datele luate
          la telefon (PF/PJ cu CUI, opțiuni, curier, cupon — exact ca clientul). Pașii de acte și
          semnătură se sar automat — clientul le face prin link-ul de completare, după plată.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Alege serviciul</CardTitle>
          <CardDescription>Se deschide wizard-ul în modul telefonic</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Caută serviciu..." value={query} onChange={(e) => setQuery(e.target.value)} />
          {loading ? (
            <p className="text-sm text-muted-foreground">Se încarcă serviciile...</p>
          ) : (
            grouped.map(([category, items]) => (
              <div key={category} className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {CATEGORY_LABELS[category] || category}
                </p>
                {items.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => router.push(`/comanda/${s.slug}?telefonic=1`)}
                    className="flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-sm hover:border-primary-400 hover:bg-primary-50/40 transition-colors"
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      de la {s.base_price} lei <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
