import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkPermission } from '@/lib/admin/permissions';
import { TarifeAncpiTable } from '@/components/admin/tarife-ancpi-table';

export const dynamic = 'force-dynamic';

export default async function AdminTarifeAncpiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  if (!(await checkPermission(user.id, 'orders.view'))) redirect('/admin');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Tarife oficiale ANCPI</h1>
        <p className="text-sm text-neutral-600">
          Taxele de stat pentru serviciile de cadastru și publicitate imobiliară (Ordin 16/2019) —
          referință pentru echipă la calculul costurilor și al urgențelor. Aceeași listă e vizibilă
          și colaboratorilor în portalul lor.
        </p>
      </div>
      <TarifeAncpiTable />
    </div>
  );
}
