'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { Footer } from '@/components/home/footer';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect URL from query params (set by middleware)
  const redirectTo = searchParams.get('redirect') || '/account';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        // Redirect to the original page or account
        router.push(redirectTo);
        router.refresh();
      }
    } catch {
      setError('A apărut o eroare. Vă rugăm încercați din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col -mt-16 lg:-mt-[112px]">
      <div className="min-h-screen bg-gradient-to-b from-secondary-900 to-[#0C1A2F] flex">
      {/* Left Side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20">
        <div className="max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-secondary-900 font-bold text-lg">eG</span>
            </div>
            <span className="text-2xl font-bold text-white">
              eGhișeul<span className="text-primary-500">.ro</span>
            </span>
          </Link>

          <h1 className="text-3xl xl:text-4xl font-extrabold text-white mb-6 leading-tight">
            Bine ai revenit!
          </h1>
          <p className="text-lg text-white/80 mb-10">
            Accesează contul tău pentru a urmări comenzile și a solicita documente noi.
          </p>

          <div className="space-y-6">
            {[
              { icon: Shield, title: 'Cont securizat', desc: 'Date protejate prin criptare SSL' },
              { icon: Clock, title: 'Istoric complet', desc: 'Toate comenzile tale într-un singur loc' },
              { icon: CheckCircle, title: 'Status în timp real', desc: 'Urmărește progresul comenzilor' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{item.title}</h3>
                  <p className="text-white/60 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
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
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-secondary-900">Autentificare</h2>
              <p className="text-neutral-600 mt-2">Introdu datele contului tău</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-error-100 border border-error-500 text-error-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-secondary-900 font-medium">
                  Adresă de email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 rounded-xl border-neutral-200 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-secondary-900 font-medium">
                    Parolă
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Ai uitat parola?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold rounded-xl shadow-[0_6px_14px_rgba(236,185,95,0.35)] hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)] transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Se procesează...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Autentificare
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
              <p className="text-neutral-600">
                Nu ai cont încă?{' '}
                <Link
                  href="/auth/register"
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Înregistrează-te
                </Link>
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 flex justify-center gap-6 text-white/60 text-xs">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              SSL Securizat
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              GDPR Compliant
            </span>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-secondary-900 to-[#0C1A2F] items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
