'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import { profileCompleteness, type ProfileCompleteness } from '@/lib/account/profile-completeness';

/**
 * Tells a signed-in customer how much of the order form their account already
 * covers, above the service catalogue.
 *
 * It never says what they may or may not order — every service is orderable with
 * an empty account and the wizard asks for whatever is missing. This only
 * answers "how much will I have to type this time".
 *
 * Client-side on purpose: /servicii is a static, SEO-critical page, so the
 * per-customer part is fetched after hydration and renders nothing at all for
 * visitors who are not signed in.
 */
export function ProfileReadinessBanner() {
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/user/prefill-data');
        if (!res.ok) return; // 401 for a visitor without an account — say nothing
        const json = await res.json();
        const d = json?.data;
        if (!d || cancelled) return;

        setCompleteness(
          profileCompleteness({
            firstName: d.personal?.firstName,
            lastName: d.personal?.lastName,
            cnp: d.personal?.cnp,
            phone: d.personal?.phone || d.contact?.phone,
            kycDocumentTypes: Object.keys(d.kyc_documents ?? {}),
            savedAddressCount: d.savedAddresses?.length ?? 0,
            billingProfileCount: d.billing_profiles?.length ?? 0,
          })
        );
      } catch {
        // A banner is not worth an error state.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!completeness) return null;

  const { doneCount, totalCount, percent, isComplete, nextStep } = completeness;

  if (isComplete) {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
        <Sparkles className="h-5 w-5 flex-shrink-0 text-green-600" />
        <p className="text-sm text-green-900">
          Profilul tău este complet — la orice serviciu de mai jos, datele se completează singure.
        </p>
      </div>
    );
  }

  return (
    <Link
      href={nextStep?.href ?? '/account/'}
      className="mb-6 flex items-center gap-3 rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3 transition-colors hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <Sparkles className="h-5 w-5 flex-shrink-0 text-primary-600" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-secondary-900">
          Profilul tău acoperă {doneCount} din {totalCount} pași ({percent}%)
        </p>
        <p className="text-sm text-neutral-600">
          Poți comanda orice serviciu de mai jos. Ce ai salvat în cont nu-ți mai este cerut în
          formular{nextStep ? ` — urmează „${nextStep.label}"` : ''}.
        </p>
      </div>
      <ChevronRight className="h-5 w-5 flex-shrink-0 text-neutral-400" />
    </Link>
  );
}
