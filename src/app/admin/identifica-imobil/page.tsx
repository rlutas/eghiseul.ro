import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkPermission } from '@/lib/admin/permissions';
import { IdentificaImobilTool } from './IdentificaImobilTool';

export const dynamic = 'force-dynamic';

export default async function AdminIdentificaImobilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  if (!(await checkPermission(user.id, 'orders.view'))) redirect('/admin');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Identifică imobil (geoportal)</h1>
        <p className="text-sm text-neutral-600">
          Unealtă operator pentru comenzile de <strong>Identificare imobil după adresă</strong>. Introdu adresa din
          comandă → caută parcela în geoportalul ANCPI (geocode + identify, cu retry). Pentru apartamente întoarce
          CF-ul parcelei/blocului (punct de plecare). Geoportalul ANCPI e flaky — dacă dă „indisponibil", reîncearcă.
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Dacă imobilul nu e înscris în CF sau e apartament, continuă investigarea manual (geoportal + viitor
          rp.ancpi.ro/owner-registry — căutare după proprietar, prin avocat).
        </p>
      </div>
      <IdentificaImobilTool />
    </div>
  );
}
