import type { MonthlyStatement } from '@/lib/collaborator/statement';

/**
 * The monthly settlement statement, the same for the collaborator portal and
 * admin: what the month earned, what is owed for it, what was paid.
 */

const lei = (n: number) =>
  `${n.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei`;

const signed = (n: number) => (n < 0 ? `−${lei(Math.abs(n))}` : lei(n));

export function monthName(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const label = new Date(Date.UTC(y!, m! - 1, 1)).toLocaleDateString('ro-RO', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function Row({ label, value, strong, muted }: { label: string; value: number; strong?: boolean; muted?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-1.5 ${strong ? 'border-t border-slate-200 font-semibold text-slate-900' : ''}`}>
      <dt className={muted ? 'pl-4 text-slate-500' : 'text-slate-700'}>{label}</dt>
      <dd className="tabular-nums">{signed(value)}</dd>
    </div>
  );
}

export function SettlementStatement({
  statement,
  audience,
}: {
  statement: MonthlyStatement;
  audience: 'admin' | 'collaborator';
}) {
  const s = statement;
  const r = s.result;
  const p = s.payment;
  const name = monthName(s.month);
  const you = audience === 'collaborator';
  const collaboratorLabel = you ? 'Tu' : 'Mircea';
  const ownerLabel = you ? 'eGhiseul' : 'Raul';
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('ro-RO');

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-2">
      {/* 1. What the month earned */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 text-sm">
        <h2 className="text-base font-semibold text-slate-900">{name}: rezultatul lunii</h2>
        <p className="mb-3 text-xs text-slate-500">
          {s.orderCount} comenzi plătite în {name.toLowerCase()}
          {s.inProgress ? ' (luna e în curs, cifrele se mai schimbă)' : ''}.
        </p>
        <dl>
          <Row label="Încasat de la clienți (cu TVA)" value={r.collectedWithVat} />
          <Row label="TVA 21%" value={-r.vat} />
          <Row label="Taxe OCPI plătite" value={-r.ocpiCosts} />
          <Row label="Comisioane plată cu cardul (Stripe)" value={-r.stripeFees} />
          {r.otherCosts > 0 && <Row label="Reclamă" value={-r.otherCosts} />}
          <Row label="Profit" value={r.grossProfit} strong />
          <Row label="Impozite firmă (16% profit + 16% dividende)" value={-(r.profitTax + r.dividendTax)} />
          <Row label="De împărțit" value={r.distributable} strong />
        </dl>
        <div className="mt-3 flex items-baseline justify-between rounded-md bg-primary-50 px-3 py-2">
          <span className="font-semibold text-secondary-900">{you ? 'Partea ta' : 'Partea fiecăruia'} (50%)</span>
          <span className="text-lg font-bold tabular-nums text-secondary-900">{lei(r.sharePerSide)}</span>
        </div>
      </section>

      {/* 2. Payment for the month */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 text-sm">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Plata pentru {name.toLowerCase()}</h2>
        {!p ? (
          <p className="text-slate-600">
            Luna a fost decontată împreună cu {monthName(s.settledWithMonth ?? s.month).toLowerCase()}. Vezi plata acolo.
          </p>
        ) : (
          <>
            <dl>
              <Row label={`Partea pe ${name.toLowerCase()}`} value={p.shareThisMonth} />
              {p.correctionPrevious !== 0 && (
                <Row
                  label={
                    p.correctionPrevious < 0
                      ? 'Corecție: taxe intrate după plata lunilor trecute'
                      : 'Luni anterioare încă neplătite'
                  }
                  value={p.correctionPrevious}
                />
              )}
              <Row label={`De plată fiecăruia`} value={p.dueEach} strong />
            </dl>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-slate-200 p-3">
                <p className="mb-1 text-xs font-semibold uppercase text-slate-500">{ownerLabel}</p>
                <p className="text-lg font-bold tabular-nums text-slate-900">{lei(p.dueEach)}</p>
              </div>
              <div className="rounded-md border border-primary-200 bg-primary-50 p-3">
                <p className="mb-1 text-xs font-semibold uppercase text-primary-700">{collaboratorLabel}</p>
                <p className="text-lg font-bold tabular-nums text-secondary-900">{lei(p.collaboratorDue)}</p>
                {p.collaboratorExtraPrior !== 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    {lei(p.dueEach)} minus {lei(p.collaboratorExtraPrior)} primiți în plus pe factura anterioară (TVA)
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-600">
                  Factură comision: <strong>{lei(p.commissionToInvoice)}</strong>
                  <br />
                  Transfer în cont: <strong>{lei(p.transferToCollaborator)}</strong>
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 font-semibold text-slate-900">
                {you ? 'Factura ta către EDIGITALIZARE SRL' : 'Factura de comision de la Mircea'}
              </p>
              <dl>
                <Row
                  label={`Comision ${name.toLowerCase()}: ${s.commissionOrderCount} comenzi × 15 lei`}
                  value={p.commissionThisMonth}
                />
                {p.commissionCorrectionPrior !== 0 && (
                  <Row
                    label={p.commissionCorrectionPrior < 0 ? 'Facturat în plus pe facturile anterioare' : 'Rămas nefacturat din lunile anterioare'}
                    value={p.commissionCorrectionPrior}
                  />
                )}
                <Row label="De facturat (TVA inclus în sumă)" value={p.commissionToInvoice} strong />
              </dl>
              <p className="mt-1 text-xs text-slate-500">
                Suma de pe factură e cu TVA inclus: 15 lei pe comandă înseamnă 15 lei în total, nu 15 lei + TVA.
              </p>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-3">
              {p.paid.length === 0 ? (
                <p className="font-medium text-amber-700">Neplătit încă.</p>
              ) : (
                <>
                  {p.paid.map((d) => (
                    <p key={d.on} className="text-slate-700">
                      Plătit pe {fmtDate(d.on)}: {collaboratorLabel.toLowerCase() === 'tu' ? 'ție' : 'lui Mircea'}{' '}
                      {lei(d.collaboratorCashRon)} transfer + {lei(d.collaboratorInvoicedRon)} factură
                    </p>
                  ))}
                  <p className={`mt-1 font-semibold ${Math.abs(p.remainingCollaborator) < 0.01 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {Math.abs(p.remainingCollaborator) < 0.01
                      ? 'Achitat integral.'
                      : p.remainingCollaborator > 0
                        ? `Mai ${you ? 'ai' : 'are'} de primit ${lei(p.remainingCollaborator)}.`
                        : `Plătit în plus ${lei(-p.remainingCollaborator)}; se scade luna viitoare.`}
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </section>

      {/* 3. OCPI fees still to come for this month's orders */}
      {s.pending.count > 0 && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 lg:col-span-2">
          <h2 className="mb-1 font-semibold">Taxe OCPI care urmează pentru comenzile din {name.toLowerCase()}</h2>
          <p>
            {s.pending.count} {s.pending.count === 1 ? 'comandă nu are' : 'comenzi nu au'} încă taxa trecută
            {s.pending.total > 0 && <> (estimat ~{lei(s.pending.total)})</>}
            {s.pending.unknownCount > 0 && <>, din care {s.pending.unknownCount} fără sumă de estimat</>}. Taxa se
            plătește oricum, iar când e trecută pe comandă se scade automat la plata lunii următoare.
            Identificări: 20 lei cu extras CF direct, 100 lei cu cerere depusă la OCPI.
          </p>
        </section>
      )}
    </div>
  );
}
