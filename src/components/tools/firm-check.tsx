'use client';

import { useState } from 'react';
import { AlertTriangle, ArrowRight, Building2, CheckCircle, Loader2, Search, XCircle } from 'lucide-react';
import type { FirmReport } from '@/lib/company/firm-report';
import { TrackedLink } from '@/components/articole/tracked-link';

const lei = (n: number | null) =>
  n === null ? '—' : `${n.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} lei`;
const roDate = (iso: string | null) => {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
};

function Flag({ ok, yes, no }: { ok: boolean; yes: string; no: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold ${ok ? 'text-green-700' : 'text-neutral-600'}`}>
      {ok ? <CheckCircle className="h-4 w-4" aria-hidden="true" /> : <XCircle className="h-4 w-4 text-neutral-400" aria-hidden="true" />}
      {ok ? yes : no}
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-0.5 border-t border-neutral-100 py-2.5 sm:grid-cols-[200px_1fr] sm:gap-4">
      <dt className="text-sm text-neutral-500">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-secondary-900">{children}</dd>
    </div>
  );
}

export function FirmCheck({ constatatorHref, constatatorPrice }: { constatatorHref: string; constatatorPrice: string }) {
  const [cui, setCui] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<FirmReport | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setReport(null);
    if (!cui.trim()) {
      setError('Scrie CUI-ul firmei (cu sau fără „RO”).');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/tools/verificare-firma/?cui=${encodeURIComponent(cui.trim())}`);
      const json = await res.json();
      if (json.success) setReport(json.data);
      else setError(json.error ?? 'Nu am putut verifica firma.');
    } catch {
      setError('Nu am putut verifica firma. Verifică conexiunea și încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  const deregistered = !!report?.deregisteredOn || /radiat/i.test(report?.registrationState ?? '');
  const status = !report
    ? null
    : deregistered
      ? { label: 'Radiată', cls: 'bg-red-100 text-red-800' }
      : report.inactive
        ? { label: 'Inactivă fiscal', cls: 'bg-amber-100 text-amber-900' }
        : { label: 'Activă', cls: 'bg-green-100 text-green-800' };

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-lg sm:p-7">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row" noValidate>
        <label htmlFor="firm-cui" className="sr-only">
          CUI-ul firmei
        </label>
        <input
          id="firm-cui"
          inputMode="numeric"
          autoComplete="off"
          value={cui}
          onChange={(e) => setCui(e.target.value)}
          placeholder="CUI, de exemplu 14399840 sau RO14399840"
          className="h-12 min-w-0 flex-1 rounded-xl border border-neutral-300 px-4 text-base text-secondary-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 font-bold text-secondary-900 transition-colors hover:bg-primary-600 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Search className="h-5 w-5" aria-hidden="true" />}
          Verifică firma
        </button>
      </form>
      <p className="mt-2 text-xs text-neutral-500">Gratuit, fără cont. Datele vin din evidențele publice ANAF.</p>

      <div aria-live="polite">
        {error && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        {report && status && (
          <div className="mt-6 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-800">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold leading-snug text-secondary-900">{report.name}</h2>
                  <p className="text-sm text-neutral-500">
                    CUI {report.cui}
                    {report.regCom ? ` · ${report.regCom}` : ''}
                  </p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${status.cls}`}>{status.label}</span>
            </div>

            <dl>
              <Row label="Stare la ANAF">{report.registrationState || '—'}</Row>
              {report.inactive && (
                <Row label="Inactivă din">{roDate(report.inactiveSince) ?? 'dată nepublicată'}</Row>
              )}
              {report.deregisteredOn && <Row label="Radiată la">{roDate(report.deregisteredOn)}</Row>}
              <Row label="Înregistrată la">{roDate(report.registeredOn) ?? '—'}</Row>
              <Row label="Forma juridică">{report.legalForm || '—'}</Row>
              <Row label="Cod CAEN">
                {report.caen || '—'}
                {report.caenLabel ? ` · ${report.caenLabel}` : ''}
              </Row>
              <Row label="Sediul">{report.address || '—'}</Row>
              <Row label="Plătitor de TVA">
                <Flag ok={report.vatPayer} yes={report.vatSince ? `Da, din ${roDate(report.vatSince)}` : 'Da'} no="Nu" />
              </Row>
              <Row label="TVA la încasare">
                <Flag ok={report.vatOnReceipt} yes="Da" no="Nu" />
              </Row>
              <Row label="Organ fiscal">{report.taxOffice || '—'}</Row>
            </dl>

            {report.financials.length > 0 ? (
              <div>
                <h3 className="text-base font-bold text-secondary-900">Bilanț depus la ANAF</h3>
                <div className="mt-2 overflow-x-auto rounded-xl border border-neutral-200">
                  <table className="w-full min-w-[420px] text-sm">
                    <thead>
                      <tr className="bg-neutral-50 text-left text-xs text-neutral-500">
                        <th className="px-3 py-2">An</th>
                        <th className="px-3 py-2 text-right">Cifră de afaceri</th>
                        <th className="px-3 py-2 text-right">Profit / pierdere netă</th>
                        <th className="px-3 py-2 text-right">Angajați (medie)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.financials.map((f) => {
                        const loss = (f.netLoss ?? 0) > 0;
                        return (
                          <tr key={f.year} className="border-t border-neutral-100">
                            <td className="px-3 py-2 font-semibold text-secondary-900">{f.year}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{lei(f.turnover)}</td>
                            <td className={`px-3 py-2 text-right tabular-nums ${loss ? 'text-red-700' : 'text-green-700'}`}>
                              {loss ? `−${lei(f.netLoss)}` : lei(f.netProfit)}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">{f.employees ?? '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                Nu există bilanț publicat pentru ultimii doi ani (firmă nouă, PFA sau bilanț nedepus).
              </p>
            )}

            <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
              <div>
                <p className="font-bold text-secondary-900">Cine sunt asociații și administratorii?</p>
                <p className="mt-1 text-sm text-neutral-700">
                  ANAF nu publică asociații, administratorii, capitalul social sau punctele de lucru. Le găsești în
                  certificatul constatator ONRC, documentul pe care îl cer băncile, notarii și autoritățile la
                  licitații. Îl obținem pe CUI-ul ăsta și îl primești pe email, de la {constatatorPrice}.
                </p>
              </div>
              <TrackedLink
                href={constatatorHref}
                placement="tool"
                service="certificat-constatator"
                className="mt-3 inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-bold text-secondary-900 hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2 sm:mt-0"
              >
                Certificat constatator
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedLink>
            </div>

            <p className="text-xs text-neutral-400">
              Verificat la {roDate(report.checkedAt)}, din registrul ANAF al plătitorilor de TVA și din bilanțurile
              publicate de ANAF. Informativ; nu ține loc de document oficial.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
