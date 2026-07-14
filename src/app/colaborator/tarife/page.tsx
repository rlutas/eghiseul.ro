import { TarifeAncpiTable } from '@/components/admin/tarife-ancpi-table';

/**
 * Official ANCPI tariff reference for collaborators (topographs). Auth is
 * enforced client-side by the /colaborator layout (role === 'collaborator');
 * the content itself is public information (Ordin ANCPI 16/2019).
 */
export default function ColaboratorTarifePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Tarife oficiale ANCPI</h1>
        <p className="text-sm text-neutral-600">
          Taxele de stat (Ordin 16/2019, actualizat 2024) pentru serviciile de cadastru și
          publicitate imobiliară — ca să știi exact ce taxe se plătesc la OCPI pe fiecare tip de
          lucrare, în regim normal și de urgență.
        </p>
      </div>
      <TarifeAncpiTable />
    </div>
  );
}
