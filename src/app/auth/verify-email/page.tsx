'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, ArrowRight, Loader2, CheckCircle, Inbox, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { authErrorToRomanian } from '@/lib/auth/error-messages';
import { Footer } from '@/components/home/footer';

/**
 * Landing page after a successful sign-up.
 *
 * `/auth/register` has redirected here since it was written, but the page never
 * existed — every customer who managed to create an account landed on a 404 and
 * never learned they had to confirm their email. That is why 38 of 73 accounts
 * sat unconfirmed. Created 2026-09-17.
 *
 * Only the `?email=` part is inside Suspense: `useSearchParams` opts its subtree
 * out of server rendering, and wrapping the whole page in it shipped an empty
 * document — the instructions must be readable before the JS lands.
 */
function ResendSection() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Countdown for the resend button, so nobody hammers the email quota.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || isSending || cooldown > 0) return;
    setIsSending(true);
    setError(null);
    setSent(false);

    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (resendError) {
        const info = authErrorToRomanian(resendError.message, resendError.code);
        setError(info.message);
        setCooldown(info.retryAfterSeconds ?? 60);
      } else {
        setSent(true);
        setCooldown(60);
      }
    } catch {
      setError('A apărut o eroare. Încearcă din nou sau sună-ne la 0757 708 181.');
    } finally {
      setIsSending(false);
    }
  };

  if (!email) return null;

  return (
    <>
      <p className="text-neutral-600 text-center -mt-4 mb-6">
        Am trimis mesajul la <span className="font-semibold text-secondary-900">{email}</span>.
      </p>

      {sent && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm mb-4 flex gap-2">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span>Am retrimis emailul de confirmare.</span>
        </div>
      )}

      {error && (
        <div className="bg-error-100 border border-error-500 text-error-700 px-4 py-3 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      <Button
        onClick={handleResend}
        disabled={isSending || cooldown > 0}
        variant="outline"
        className="w-full h-12 rounded-xl font-semibold"
      >
        {isSending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Se trimite...
          </span>
        ) : cooldown > 0 ? (
          `Retrimite emailul (${cooldown}s)`
        ) : (
          'Retrimite emailul de confirmare'
        )}
      </Button>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col -mt-16 lg:-mt-[112px]">
      <div className="min-h-screen bg-gradient-to-b from-secondary-900 to-[#0C1A2F] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <span className="text-secondary-900 font-bold">eG</span>
              </div>
              <span className="text-xl font-bold text-white">
                eGhișeul<span className="text-primary-500">.ro</span>
              </span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold text-secondary-900">
                Confirmă-ți adresa de email
              </h1>
              <p className="text-neutral-600 mt-3">
                Ți-am trimis un email. Deschide-l și apasă pe linkul de confirmare ca să-ți
                activezi contul.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <Inbox className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Nu găsești emailul?</p>
                  <p>
                    Caută-l și în <strong>Spam</strong> sau <strong>Promoții</strong>. Poate să
                    întârzie câteva minute.
                  </p>
                </div>
              </div>
            </div>

            <Suspense fallback={null}>
              <ResendSection />
            </Suspense>

            <Link href="/auth/login">
              <Button className="w-full h-12 mt-3 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold rounded-xl">
                <span className="flex items-center gap-2">
                  Am confirmat, mergi la autentificare
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Button>
            </Link>

            <div className="mt-6 pt-6 border-t border-neutral-200 text-sm text-neutral-600 space-y-3">
              <p className="flex items-start gap-2">
                <Phone className="h-4 w-4 flex-shrink-0 mt-0.5 text-neutral-400" />
                <span>
                  Dacă emailul tot nu ajunge, sună-ne la{' '}
                  <a href="tel:+40757708181" className="text-primary-600 font-semibold">
                    0757 708 181
                  </a>{' '}
                  și îți activăm noi contul.
                </span>
              </p>
              <p>
                Nu ai nevoie de cont ca să comanzi sau să urmărești o comandă —{' '}
                <Link href="/comanda/status" className="text-primary-600 font-semibold">
                  verifică statusul cu codul comenzii
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
