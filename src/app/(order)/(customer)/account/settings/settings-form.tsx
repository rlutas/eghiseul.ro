'use client'

/**
 * Account settings: password, email address, sign out everywhere.
 *
 * The page was linked from the account sidebar and from the header user menu
 * long before it existed — both links 404'd. Created 2026-09-17.
 *
 * Password changes go through POST /api/user/password, which re-checks the
 * current password server-side. Email changes and the global sign-out run on
 * the browser client, since both need nothing more than the live session.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { authErrorToRomanian } from '@/lib/auth/error-messages'
import { cn } from '@/lib/utils'

const MIN_PASSWORD_LENGTH = 8
const GENERIC_ERROR = 'A apărut o eroare. Încearcă din nou sau sună-ne la 0757 708 181.'

interface AccountSettingsFormProps {
  currentEmail: string
}

/** Shared card shell so the three sections read as one block. */
function SettingsCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-neutral-100 flex items-start gap-3">
        <div className="w-10 h-10 shrink-0 rounded-lg bg-neutral-100 flex items-center justify-center">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-secondary-900">{title}</h2>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  )
}

export function AccountSettingsForm({ currentEmail }: AccountSettingsFormProps) {
  const router = useRouter()

  // --- Password ---
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // --- Email ---
  const [newEmail, setNewEmail] = useState('')
  const [isSavingEmail, setIsSavingEmail] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailPending, setEmailPending] = useState<string | null>(null)

  // --- Global sign out ---
  const [confirmSignOut, setConfirmSignOut] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Parola nouă trebuie să aibă cel puțin ${MIN_PASSWORD_LENGTH} caractere.`)
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Parolele nu coincid.')
      return
    }

    setIsSavingPassword(true)
    try {
      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const result = await response.json()

      if (!response.ok || !result?.success) {
        // The API already translates GoTrue errors via authErrorToRomanian.
        setPasswordError(typeof result?.error === 'string' ? result.error : GENERIC_ERROR)
        return
      }

      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error('Error changing password:', err)
      setPasswordError(GENERIC_ERROR)
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError(null)
    setEmailPending(null)

    const trimmed = newEmail.trim().toLowerCase()

    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Adresa de email nu este validă.')
      return
    }
    if (trimmed === currentEmail.trim().toLowerCase()) {
      setEmailError('Aceasta este deja adresa contului tău.')
      return
    }

    setIsSavingEmail(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ email: trimmed })

      if (error) {
        setEmailError(authErrorToRomanian(error.message, error.code).message)
        return
      }

      setEmailPending(trimmed)
      setNewEmail('')
    } catch (err) {
      console.error('Error changing email:', err)
      setEmailError(GENERIC_ERROR)
    } finally {
      setIsSavingEmail(false)
    }
  }

  const handleGlobalSignOut = async () => {
    setSignOutError(null)
    setIsSigningOut(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut({ scope: 'global' })

      if (error) {
        setSignOutError(authErrorToRomanian(error.message, error.code).message)
        setIsSigningOut(false)
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('Error signing out everywhere:', err)
      setSignOutError(GENERIC_ERROR)
      setIsSigningOut(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Password */}
      <SettingsCard
        icon={<Lock className="w-5 h-5 text-neutral-500" />}
        title="Schimbare parolă"
        description="Îți cerem parola actuală, ca nimeni altcineva să nu o poată schimba."
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          )}

          {passwordSuccess && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Parola a fost schimbată. Folosește-o la următoarea autentificare.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Parola actuală</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="h-12 pr-14 rounded-xl"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                aria-label={showPasswords ? 'Ascunde parolele' : 'Arată parolele'}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-neutral-400 hover:text-neutral-600 rounded-lg"
              >
                {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Parolă nouă</Label>
            <Input
              id="newPassword"
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={`Minim ${MIN_PASSWORD_LENGTH} caractere`}
              autoComplete="new-password"
              className="h-12 rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmă parola nouă</Label>
            <Input
              id="confirmPassword"
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetă parola nouă"
              autoComplete="new-password"
              className={cn(
                'h-12 rounded-xl',
                confirmPassword.length > 0 && confirmPassword !== newPassword && 'border-red-500'
              )}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSavingPassword}
            className="w-full sm:w-auto h-12 px-6 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold rounded-xl"
          >
            {isSavingPassword ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvează parola
          </Button>
        </form>
      </SettingsCard>

      {/* Email */}
      <SettingsCard
        icon={<Mail className="w-5 h-5 text-neutral-500" />}
        title="Schimbare adresă de email"
        description="Adresa pe care primești confirmările și documentele comenzilor."
      >
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {emailError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{emailError}</AlertDescription>
            </Alert>
          )}

          {emailPending && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Ți-am trimis un link de confirmare la <strong className="break-all">{emailPending}</strong>.
                Schimbarea are loc doar după ce dai clic pe acel link. Primești un mesaj și pe
                adresa actuală, ca să știi că cererea a pornit de la tine. Până confirmi,
                autentificarea se face în continuare cu adresa veche.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-1">
            {/* Not a <Label>: there is no field to bind it to. */}
            <p className="text-sm text-neutral-500">Adresa actuală</p>
            <p className="font-medium text-secondary-900 break-all">{currentEmail}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newEmail">Adresa nouă</Label>
            <Input
              id="newEmail"
              type="email"
              inputMode="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="nume@exemplu.ro"
              autoComplete="email"
              className="h-12 rounded-xl"
              required
            />
            <p className="text-sm text-neutral-500">
              Trimitem un link de confirmare pe adresa nouă. Schimbarea se aplică abia după
              ce deschizi linkul din acel email.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSavingEmail}
            className="w-full sm:w-auto h-12 px-6 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold rounded-xl"
          >
            {isSavingEmail ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            Trimite linkul de confirmare
          </Button>
        </form>
      </SettingsCard>

      {/* Global sign out */}
      <SettingsCard
        icon={<ShieldCheck className="w-5 h-5 text-neutral-500" />}
        title="Deconectare de pe toate dispozitivele"
        description="Închide sesiunile de pe telefon, tabletă și orice alt calculator."
      >
        <div className="space-y-4">
          {signOutError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{signOutError}</AlertDescription>
            </Alert>
          )}

          <p className="text-sm text-neutral-600">
            Folosește această opțiune dacă ai rămas autentificat pe un dispozitiv străin sau
            dacă bănuiești că altcineva îți folosește contul. Vei fi deconectat și de aici și
            va trebui să te autentifici din nou.
          </p>

          {!confirmSignOut ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmSignOut(true)}
              className="w-full sm:w-auto h-12 px-6 rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Deconectează-mă de peste tot
            </Button>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <p className="font-medium text-amber-800">
                Sigur închizi toate sesiunile, inclusiv pe aceasta?
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleGlobalSignOut}
                  disabled={isSigningOut}
                  className="w-full sm:w-auto h-12 px-6 rounded-xl"
                >
                  {isSigningOut ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-2" />
                  )}
                  Da, deconectează-mă
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmSignOut(false)}
                  disabled={isSigningOut}
                  className="w-full sm:w-auto h-12 px-6 rounded-xl bg-white"
                >
                  Anulează
                </Button>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>
    </div>
  )
}
