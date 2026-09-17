'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { authErrorToRomanian } from '@/lib/auth/error-messages';
import { Footer } from '@/components/home/footer';

/**
 * Set a new password after following the reset link from email.
 *
 * `/auth/forgot-password` pointed its `redirectTo` at `/reset-password`, which
 * never existed — the link in the email led to a 404, so "forgot password" was
 * not a way back into an account either. Created 2026-09-17; the old
 * `/reset-password` path is redirected here in next.config.ts for links that are
 * already out in customers' inboxes.
 */
export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const router = useRouter();

  // Supabase turns the recovery link into a session on page load. Without one,
  // the link was already used or has expired.
  useEffect(() => {
    const supabase = createClient();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setHasSession(true);
    });

    supabase.auth.getSession().then(({ data }) => {
      setHasSession((current) => current ?? !!data.session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Parola trebuie să aibă cel puțin 8 caractere.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Parolele nu coincid.');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(authErrorToRomanian(updateError.message, updateError.code).message);
      } else {
        setSuccess(true);
        setTimeout(() => router.push('/account'), 2000);
      }
    } catch {
      setError('A apărut o eroare. Încearcă din nou sau sună-ne la 0757 708 181.');
    } finally {
      setIsLoading(false);
    }
  };

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
            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-secondary-900">Parolă schimbată</h1>
                <p className="text-neutral-600 mt-3">Te ducem în contul tău...</p>
              </div>
            ) : hasSession === false ? (
              <div className="text-center">
                <h1 className="text-2xl font-bold text-secondary-900">Link expirat</h1>
                <p className="text-neutral-600 mt-3">
                  Linkul de resetare a expirat sau a fost deja folosit. Cere unul nou și
                  deschide-l în maximum o oră.
                </p>
                <Link href="/auth/forgot-password">
                  <Button className="w-full h-12 mt-6 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold rounded-xl">
                    Cere un link nou
                  </Button>
                </Link>
                <p className="text-sm text-neutral-600 mt-4">
                  Sau sună-ne la{' '}
                  <a href="tel:+40757708181" className="text-primary-600 font-semibold">
                    0757 708 181
                  </a>
                  .
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-secondary-900">Parolă nouă</h1>
                  <p className="text-neutral-600 mt-2">Alege o parolă nouă pentru contul tău</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-error-100 border border-error-500 text-error-700 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-secondary-900 font-medium">
                      Parolă nouă
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minim 8 caractere"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-12 rounded-xl border-neutral-200 focus:border-primary-500 focus:ring-primary-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-secondary-900 font-medium">
                      Confirmă parola
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Repetă parola"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-12 h-12 rounded-xl border-neutral-200 focus:border-primary-500 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold rounded-xl"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Se salvează...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Salvează parola
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
