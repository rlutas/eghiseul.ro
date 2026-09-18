'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  BellRing,
  Check,
  CheckCircle,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Radar,
  UserPlus,
  Zap,
} from 'lucide-react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DOCUMENT_VALIDITY_DAYS } from '@/lib/lifecycle/rules';

interface AccountOfferCardProps {
  /** Order UUID — the account is built from this order's data, server-side. */
  orderId: string;
  /** Email used on the order. The account is created on this address; the API
   *  rejects anything else, so we never ask the customer to retype it. */
  email: string;
  /** Service slug, used only to decide whether the expiry reminder is real. */
  serviceSlug?: string;
  /** True when the order is already linked to a user — nothing to offer. */
  alreadyLinked?: boolean;
  /** True when the order actually carries a scanned identity document. */
  hasIdentityDocuments?: boolean;
}

const MIN_PASSWORD_LENGTH = 8;

/**
 * AccountOfferCard
 *
 * Inline (never modal, never a wall) offer on the paid branch of the order
 * success page. The customer already gave us everything except a password, so
 * that is the only field: `POST /api/auth/register-from-order` copies name,
 * email, phone, CNP, address, billing and KYC from the order itself.
 *
 * Renders nothing when the visitor is already signed in or when the order is
 * already attached to an account — we never invite anyone to a second account.
 * Ignoring the offer costs nothing: the public tracking link keeps working.
 */
export function AccountOfferCard({
  orderId,
  email,
  serviceSlug,
  alreadyLinked = false,
  hasIdentityDocuments = false,
}: AccountOfferCardProps) {
  // null = still checking the session; we render nothing until we know, so the
  // offer never flashes in front of a signed-in customer.
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  /** Set on 409: the email already has an account — offer sign-in, not a retry. */
  const [accountExists, setAccountExists] = useState('');
  const [created, setCreated] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const checkSession = async () => {
      try {
        // Imported lazily so supabase-js stays out of the success page's
        // initial bundle (this page is a conversion-tracking hot path).
        const { createClient } = await import('@/lib/supabase/client');
        const {
          data: { user },
        } = await createClient().auth.getUser();
        if (!cancelled) setIsSignedIn(!!user);
      } catch (err) {
        console.error('Session check failed on success page:', err);
        // Fail closed: if we cannot tell, do not risk offering a second account.
        if (!cancelled) setIsSignedIn(true);
      }
    };
    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Parola trebuie să aibă cel puțin ${MIN_PASSWORD_LENGTH} caractere`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/register-from-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          email,
          password,
          // Both were accepted when the order was placed — asking again would
          // be asking twice for the same consent.
          acceptedTerms: true,
          acceptedPrivacy: true,
          saveKycData: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // The API already answers in Romanian — render its message as-is.
        const message = result?.message || result?.error || 'A apărut o eroare.';
        if (response.status === 409) {
          setAccountExists(message);
          return;
        }
        if (response.status === 429) {
          const retryAfter = Number(result?.retryAfterSeconds);
          setError(
            Number.isFinite(retryAfter) && retryAfter > 0
              ? `${message} Încearcă din nou peste ${retryAfter} secunde.`
              : message
          );
          return;
        }
        setError(message);
        return;
      }

      setNeedsEmailConfirmation(result?.data?.verificationSent === true);
      setCreated(true);
      setPassword('');
    } catch (err) {
      console.error('Account creation from success page failed:', err);
      setError('A apărut o eroare de rețea. Te rugăm să încerci din nou.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nothing to offer: already signed in, already linked, still checking, or no
  // email on the order (the API would refuse anyway).
  if (isSignedIn !== false || alreadyLinked || !email || !orderId) {
    return null;
  }

  if (created) {
    return (
      <Card className="mt-6 border-green-200">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 shrink-0 text-green-600" />
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-secondary-900">
                Contul tău este gata
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                {needsEmailConfirmation ? (
                  <>
                    Ți-am trimis un email de confirmare la{' '}
                    <strong className="text-secondary-900">{email}</strong>.
                    Deschide-l ca să îți activezi contul — comanda aceasta este
                    deja legată de el.
                  </>
                ) : (
                  <>
                    Comanda aceasta, documentele și datele tale sunt acum în
                    contul pe{' '}
                    <strong className="text-secondary-900">{email}</strong>.
                  </>
                )}
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Poți rămâne liniștit pe pagina asta — linkul de status de mai sus
                funcționează la fel.
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-4 h-11 w-full sm:w-auto"
              >
                <Link href="/account/">Deschide contul meu</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (accountExists) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 shrink-0 text-neutral-500" />
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-secondary-900">
                Ai deja un cont
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                {accountExists}
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-4 h-11 w-full sm:w-auto"
              >
                <Link href="/auth/login/">Autentifică-te</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const validityDays = serviceSlug ? DOCUMENT_VALIDITY_DAYS[serviceSlug] : undefined;

  // The four reasons to have an account, stated as what the customer gets —
  // not a checkbox (feedback 18.09.2026, #18). The KYC line only where an
  // identity document was actually scanned: 20 of the 31 services never ask
  // for one, and promising to keep it to a constatator customer is false.
  const benefits: Array<{ icon: typeof Download; text: string }> = [
    {
      icon: Zap,
      text: 'Completare automată la următoarea comandă: nume, adresă, date de facturare — nu le mai scrii.',
    },
    ...(hasIdentityDocuments
      ? [
          {
            icon: ShieldCheck,
            text: 'Identitatea verificată o singură dată: actul și selfie-ul rămân în cont, nu le mai faci la fiecare cerere.',
          },
        ]
      : []),
    {
      icon: Download,
      text: 'Istoricul comenzilor și documentele într-un singur loc, de descărcat oricând — nu doar din email.',
    },
    {
      icon: Radar,
      text: 'Stadiul comenzii în timp real, fără să cauți emailul cu linkul de status.',
    },
  ];
  if (validityDays) {
    benefits.push({
      icon: BellRing,
      text: `Te anunțăm înainte ca documentul să expire (are ${validityDays} de zile valabilitate).`,
    });
  }

  return (
    <Card className="mt-6">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 sm:flex">
            <UserPlus className="h-5 w-5 text-primary-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-secondary-900">
              Vrei un cont? Mai e nevoie doar de o parolă
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-neutral-600">
              Restul datelor sunt deja în comanda aceasta și le copiem noi. Nu
              ești obligat: linkul de status de mai sus funcționează și fără cont.
            </p>

            <ul className="mt-4 space-y-2">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <li key={benefit.text} className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    <span className="text-sm leading-relaxed text-neutral-700">
                      {benefit.text}
                    </span>
                  </li>
                );
              })}
            </ul>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="account-offer-password" className="text-sm">
                  Parolă pentru contul pe {email}
                </Label>
                <div className="relative">
                  <Input
                    id="account-offer-password"
                    name="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={MIN_PASSWORD_LENGTH}
                    placeholder={`Minim ${MIN_PASSWORD_LENGTH} caractere`}
                    disabled={isSubmitting}
                    aria-describedby="account-offer-password-hint"
                    className="h-11 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ascunde parola' : 'Arată parola'}
                    aria-pressed={showPassword}
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-md text-neutral-500 hover:text-secondary-900 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p
                  id="account-offer-password-hint"
                  className="text-xs text-neutral-500"
                >
                  Minim {MIN_PASSWORD_LENGTH} caractere.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full bg-primary-500 text-secondary-900 hover:bg-primary-600 sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Se creează contul...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Creează contul
                  </>
                )}
              </Button>

              <p className="text-xs leading-relaxed text-neutral-500">
                Contul se creează pe adresa comenzii, în aceleași{' '}
                <a
                  href="/termeni-si-conditii/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Termeni și Condiții
                </a>{' '}
                și{' '}
                <a
                  href="/politica-de-confidentialitate/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Politică de Confidențialitate
                </a>{' '}
                pe care le-ai acceptat la plasarea comenzii.
              </p>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
