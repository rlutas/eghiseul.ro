'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLogo } from '@/components/auth/auth-logo';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Shield, Clock, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { createClient } from '@/lib/supabase/client';
import { authErrorToRomanian } from '@/lib/auth/error-messages';
import { Footer } from '@/components/home/footer';
import { normalizePhone } from '@/lib/format/normalize-phone';
import { validatePhone } from '@/lib/format/validate-phone';
import { PhoneInput } from '@/components/shared/PhoneInput';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Parolele nu coincid.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Parola trebuie să aibă cel puțin 8 caractere.');
      return;
    }

    if (!agreeTerms) {
      setError('Trebuie să accepți termenii și condițiile.');
      return;
    }

    // Same check as the order form: a number we cannot dial would sit in
    // `profiles.phone` and prefill every future order with it.
    const phoneMessage = validatePhone(formData.phone);
    if (phoneMessage) {
      setError(phoneMessage);
      document.getElementById('phone')?.focus();
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            // Same shape as everywhere else: `handle_new_user()` copies this
            // straight into `profiles.phone`, which the order wizard reads back
            // to prefill its phone field.
            phone: normalizePhone(formData.phone),
          },
          // Without this the confirmation link falls back to site_url and drops
          // the customer on the homepage, still logged out, with nothing saying
          // the account is now active. Route it through the callback so the code
          // is exchanged for a session and they land in their account.
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
        },
      });

      if (error) {
        setError(authErrorToRomanian(error.message, error.code).message);
      } else {
        router.push('/auth/verify-email?email=' + encodeURIComponent(formData.email));
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
          <div className="mb-12">
            <AuthLogo size="lg" />
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold text-white mb-6 leading-tight">
            Creează-ți contul gratuit
          </h1>
          <p className="text-lg text-white/80 mb-10">
            Alătură-te celor peste 200.000 de clienți care au ales eGhișeul.ro pentru documentele lor.
          </p>

          <div className="space-y-6">
            {[
              { icon: FileText, title: 'Toate documentele într-un loc', desc: 'Cazier, certificate, extras CF și multe altele' },
              { icon: Clock, title: 'Livrare rapidă', desc: 'Documente în 24-48h, fără cozi' },
              { icon: Shield, title: '100% Legal și sigur', desc: 'Documente, recunoscute de stat' },
              { icon: CheckCircle, title: 'Fără deplasări', desc: 'Tot procesul se face online' },
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

          {/* Social Proof */}
          <div className="mt-10 flex items-center gap-4 bg-white/5 rounded-xl p-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-primary-500/30 border-2 border-secondary-900 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-500" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-white text-sm font-medium">200,000+ clienți mulțumiți</p>
              <p className="text-white/60 text-xs">4.9/5 pe Google Reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <AuthLogo />
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-secondary-900">Înregistrare</h2>
              <p className="text-neutral-600 mt-2">Creează un cont nou în câteva secunde</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="bg-error-100 border border-error-500 text-error-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-secondary-900 font-medium">
                    Prenume
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Ion"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="pl-12 h-12 rounded-xl border-neutral-200 focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-secondary-900 font-medium">
                    Nume
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Popescu"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="h-12 rounded-xl border-neutral-200 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-secondary-900 font-medium">
                  Adresă de email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="exemplu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-12 h-12 rounded-xl border-neutral-200 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-secondary-900 font-medium">
                  Telefon
                </Label>
                {/* The order form's field: country picker, dial code, the
                    number checked per country before the account is created. */}
                <PhoneInput
                  id="phone"
                  value={formData.phone}
                  onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-secondary-900 font-medium">
                  Parolă
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minim 8 caractere"
                    value={formData.password}
                    onChange={handleChange}
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
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repetă parola"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-12 pr-12 h-12 rounded-xl border-neutral-200 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 py-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  className="mt-0.5 border-neutral-300 data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500"
                />
                <label htmlFor="terms" className="text-sm text-neutral-600 cursor-pointer">
                  Accept{' '}
                  <Link href="/termeni-si-conditii/" className="text-primary-600 hover:text-primary-700 font-medium">
                    Termenii și Condițiile
                  </Link>{' '}
                  și{' '}
                  <Link href="/politica-de-confidentialitate/" className="text-primary-600 hover:text-primary-700 font-medium">
                    Politica de Confidențialitate
                  </Link>
                </label>
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
                    Creează contul
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-neutral-200 text-center">
              <p className="text-neutral-600">
                Ai deja un cont?{' '}
                <Link
                  href="/auth/login"
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Autentifică-te
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
