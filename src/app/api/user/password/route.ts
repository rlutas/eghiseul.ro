import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'
import { authErrorToRomanian } from '@/lib/auth/error-messages'

/**
 * POST /api/user/password
 *
 * Change the password of the logged-in customer.
 *
 * The current password is re-checked with `signInWithPassword` before the
 * update, so a stolen/leaked session alone cannot silently take over the
 * account. The check runs server-side on a throwaway anon client
 * (`persistSession: false`), never on the cookie-bound client — otherwise a
 * successful re-auth would rewrite the customer's session cookies, and a
 * failed one would be attributed to the live session.
 */

const MIN_PASSWORD_LENGTH = 8

interface PasswordChangeResponse {
  success: boolean
  error?: string
  retryAfterSeconds?: number
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user?.email) {
      return NextResponse.json<PasswordChangeResponse>(
        { success: false, error: 'Sesiunea a expirat. Autentifică-te din nou.' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => null)
    const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : ''
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : ''

    if (!currentPassword) {
      return NextResponse.json<PasswordChangeResponse>(
        { success: false, error: 'Introdu parola actuală.' },
        { status: 400 }
      )
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json<PasswordChangeResponse>(
        { success: false, error: `Parola nouă trebuie să aibă cel puțin ${MIN_PASSWORD_LENGTH} caractere.` },
        { status: 400 }
      )
    }

    if (newPassword === currentPassword) {
      return NextResponse.json<PasswordChangeResponse>(
        { success: false, error: 'Parola nouă trebuie să fie diferită de cea actuală.' },
        { status: 400 }
      )
    }

    // Re-authenticate on a client that does not touch the request cookies.
    const verifier = createPublicClient()
    const { error: signInError } = await verifier.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (signInError) {
      const info = authErrorToRomanian(signInError.message, signInError.code)
      console.error('Password change re-auth failed:', signInError.message)
      return NextResponse.json<PasswordChangeResponse>(
        {
          success: false,
          // invalid_credentials here means "wrong CURRENT password" — say so,
          // the generic login wording would send the customer to "Ai uitat parola?".
          error: signInError.code === 'invalid_credentials'
            ? 'Parola actuală este greșită. Verifică și încearcă din nou.'
            : info.message,
          retryAfterSeconds: info.retryAfterSeconds,
        },
        { status: info.isRateLimit ? 429 : 400 }
      )
    }

    // Drop the throwaway session locally. `scope: 'local'` on purpose: the
    // default scope is global and would revoke the customer's real sessions.
    await verifier.auth.signOut({ scope: 'local' })

    // The actual update runs on the customer's own session.
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

    if (updateError) {
      const info = authErrorToRomanian(updateError.message, updateError.code)
      console.error('Password update failed:', updateError.message)
      return NextResponse.json<PasswordChangeResponse>(
        { success: false, error: info.message, retryAfterSeconds: info.retryAfterSeconds },
        { status: info.isRateLimit ? 429 : 400 }
      )
    }

    return NextResponse.json<PasswordChangeResponse>({ success: true })
  } catch (err) {
    console.error('Unexpected error changing password:', err)
    return NextResponse.json<PasswordChangeResponse>(
      { success: false, error: 'A apărut o eroare. Încearcă din nou sau sună-ne la 0757 708 181.' },
      { status: 500 }
    )
  }
}
