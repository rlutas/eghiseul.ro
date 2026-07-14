'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Document validity checker: pick the document + issue date → still valid?
 * until when? Each rule carries its legal basis; documents without a statutory
 * term use the customary maximum institutions accept (flagged as such).
 * Expired/near-expiry verdicts link straight to re-ordering the document.
 */

interface DocRule {
  key: string;
  label: string;
  /** Validity in days (calendar). */
  days: number;
  basis: string;
  /** True when the term is customary (institution practice), not statutory. */
  customary?: boolean;
  serviceHref: string;
  serviceLabel: string;
}

const RULES: DocRule[] = [
  {
    key: 'cazier-judiciar',
    label: 'Cazier judiciar',
    days: 183,
    basis: 'Legea 290/2004 — valabilitate 6 luni de la eliberare',
    serviceHref: '/servicii/cazier-judiciar-online/',
    serviceLabel: 'Comandă cazier judiciar nou',
  },
  {
    key: 'cazier-fiscal',
    label: 'Cazier fiscal',
    days: 30,
    basis: 'OG 39/2015 — valabilitate 30 de zile de la eliberare',
    serviceHref: '/servicii/cazier-fiscal-online/',
    serviceLabel: 'Comandă cazier fiscal nou',
  },
  {
    key: 'certificat-integritate',
    label: 'Certificat de integritate comportamentală',
    days: 183,
    basis: 'Legea 118/2019 — valabilitate 6 luni de la eliberare',
    serviceHref: '/servicii/certificat-de-integritate-comportamentala/',
    serviceLabel: 'Comandă certificat de integritate nou',
  },
  {
    key: 'extras-cf-informare',
    label: 'Extras CF de informare (bancă, instituții)',
    days: 30,
    basis: 'Fără termen legal — instituțiile cer de regulă un extras de maximum 30 de zile',
    customary: true,
    serviceHref: '/servicii/extras-de-carte-funciara/',
    serviceLabel: 'Extras CF nou — automat, în minute',
  },
  {
    key: 'extras-cf-autentificare',
    label: 'Extras CF pentru autentificare (notar)',
    days: 10,
    basis: 'Legea 7/1996 — valabil 10 zile lucrătoare; îl obține exclusiv notarul',
    serviceHref: '/servicii/extras-de-carte-funciara/',
    serviceLabel: 'Extras CF de informare — pentru verificări prealabile',
  },
  {
    key: 'certificat-constatator',
    label: 'Certificat constatator ONRC',
    days: 30,
    basis: 'Fără termen legal — băncile și licitațiile cer de regulă maximum 30 de zile',
    customary: true,
    serviceHref: '/servicii/certificat-constatator-online/',
    serviceLabel: 'Certificat constatator nou — instant, pe CUI',
  },
  {
    key: 'cazier-auto',
    label: 'Cazier auto (istoric sancțiuni)',
    days: 30,
    basis: 'Fără termen legal — instituțiile acceptă de regulă documente de maximum 30 de zile',
    customary: true,
    serviceHref: '/servicii/cazier-auto-online/',
    serviceLabel: 'Comandă cazier auto nou',
  },
];

const df = new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });

export function ValabilitateCalculator() {
  const [docKey, setDocKey] = useState(RULES[0]!.key);
  const [issued, setIssued] = useState('');
  // "Now" captured once per mount — keeps render pure (react-compiler rule);
  // day-level precision makes intra-session drift irrelevant.
  const [now] = useState(() => Date.now());

  const rule = RULES.find((r) => r.key === docKey)!;

  const result = useMemo(() => {
    if (!issued) return null;
    const issuedDate = new Date(issued + 'T00:00:00');
    if (Number.isNaN(issuedDate.getTime()) || issuedDate.getTime() > now) return null;
    const expiry = new Date(issuedDate);
    expiry.setDate(expiry.getDate() + rule.days);
    const msLeft = expiry.getTime() - now;
    const daysLeft = Math.ceil(msLeft / 86_400_000);
    return { expiry, daysLeft, valid: daysLeft > 0, expiringSoon: daysLeft > 0 && daysLeft <= 7 };
  }, [issued, rule, now]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="val-doc">Documentul</Label>
          <select
            id="val-doc"
            value={docKey}
            onChange={(e) => setDocKey(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            {RULES.map((r) => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="val-data">Data eliberării (de pe document)</Label>
          <Input
            id="val-data"
            type="date"
            value={issued}
            max={new Date(now).toISOString().slice(0, 10)}
            onChange={(e) => setIssued(e.target.value)}
          />
        </div>
      </div>
      <p className="text-xs text-neutral-500">{rule.basis}.</p>

      {result && (
        <div
          className={`rounded-xl p-4 space-y-2 ${
            result.valid
              ? result.expiringSoon
                ? 'bg-amber-50'
                : 'bg-green-50'
              : 'bg-red-50'
          }`}
        >
          <p className="text-lg font-bold text-secondary-900">
            {result.valid
              ? result.expiringSoon
                ? `⚠️ Mai e valabil doar ${result.daysLeft} ${result.daysLeft === 1 ? 'zi' : 'zile'}`
                : '✓ Documentul este încă valabil'
              : '✗ Documentul a expirat'}
          </p>
          <p className="text-sm text-secondary-700">
            {result.valid ? (
              <>
                Valabil până la <strong>{df.format(result.expiry)}</strong>
                {rule.key === 'extras-cf-autentificare' && ' (atenție: termenul legal e în zile lucrătoare — aproximăm calendaristic)'}
                {rule.customary && ' — termen uzual cerut de instituții, nu termen legal'}.
              </>
            ) : (
              <>
                A expirat la <strong>{df.format(result.expiry)}</strong> (acum{' '}
                {Math.abs(result.daysLeft)} {Math.abs(result.daysLeft) === 1 ? 'zi' : 'zile'}).
              </>
            )}
          </p>
          {(!result.valid || result.expiringSoon) && (
            <Link
              href={rule.serviceHref}
              className="inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              {rule.serviceLabel} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
