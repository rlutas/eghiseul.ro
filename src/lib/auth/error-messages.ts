/**
 * Romanian messages for Supabase Auth (GoTrue) errors.
 *
 * Until 2026-09-17 the auth screens rendered `error.message` verbatim, so a
 * customer who hit the project-wide email quota saw the raw string
 * "email rate limit exceeded" — English, no explanation, no way out. Customers
 * kept retrying, which burned the quota further.
 *
 * Keep every message actionable: say what happened AND what to do next.
 */

export interface AuthErrorInfo {
  /** Romanian message shown to the customer. */
  message: string
  /** True when retrying later is the answer (rate limits, quotas). */
  isRateLimit: boolean
  /** Seconds the customer must wait, when GoTrue tells us. */
  retryAfterSeconds?: number
}

/** GoTrue says "you can only request this after 47 seconds" — pull the number out. */
function parseRetrySeconds(raw: string): number | undefined {
  const match = raw.match(/after (\d+) seconds?/i)
  return match ? parseInt(match[1], 10) : undefined
}

function formatWait(seconds: number): string {
  if (seconds < 60) return `${seconds} secunde`
  const minutes = Math.ceil(seconds / 60)
  return minutes === 1 ? 'un minut' : `${minutes} minute`
}

/**
 * Translate a Supabase auth error into something a Romanian customer can act on.
 * `code` is the `error_code` from supabase-js when available (more reliable than
 * the message, which changes between GoTrue versions).
 */
export function authErrorToRomanian(raw: string, code?: string): AuthErrorInfo {
  const lower = (raw || '').toLowerCase()
  const errorCode = (code || '').toLowerCase()

  // Project-wide email quota. This is the one that killed signups for 39 days.
  if (errorCode === 'over_email_send_rate_limit' || lower.includes('email rate limit')) {
    return {
      isRateLimit: true,
      message:
        'Nu putem trimite emailul de confirmare chiar acum — sistemul nostru de email a atins limita pe oră. ' +
        'Nu este vina ta și nu ai greșit nimic. Încearcă din nou peste o oră sau sună-ne la 0757 708 181 ' +
        'și îți facem noi contul. Nu ai nevoie de cont ca să comanzi sau să urmărești o comandă.',
    }
  }

  // Per-email cooldown: "For security purposes, you can only request this after N seconds."
  if (lower.includes('for security purposes') || lower.includes('only request this after')) {
    const seconds = parseRetrySeconds(raw)
    return {
      isRateLimit: true,
      retryAfterSeconds: seconds,
      message: seconds
        ? `Ai încercat prea repede. Mai așteaptă ${formatWait(seconds)} și încearcă din nou.`
        : 'Ai încercat prea repede. Mai așteaptă puțin și încearcă din nou.',
    }
  }

  // Per-IP request limit.
  if (errorCode === 'over_request_rate_limit' || lower.includes('request rate limit')) {
    return {
      isRateLimit: true,
      message:
        'Prea multe încercări de pe aceeași conexiune. Așteaptă 5 minute și încearcă din nou, ' +
        'sau sună-ne la 0757 708 181.',
    }
  }

  if (errorCode === 'invalid_credentials' || lower.includes('invalid login credentials')) {
    return {
      isRateLimit: false,
      message: 'Email sau parolă greșită. Verifică datele sau folosește „Ai uitat parola?".',
    }
  }

  if (errorCode === 'email_not_confirmed' || lower.includes('email not confirmed')) {
    return {
      isRateLimit: false,
      message:
        'Contul există, dar emailul nu a fost confirmat. Caută mesajul nostru în Inbox și în Spam. ' +
        'Dacă nu îl găsești, sună-ne la 0757 708 181 și îți confirmăm noi contul.',
    }
  }

  if (errorCode === 'user_already_exists' || lower.includes('already registered') || lower.includes('user already')) {
    return {
      isRateLimit: false,
      message: 'Există deja un cont cu acest email. Autentifică-te sau folosește „Ai uitat parola?".',
    }
  }

  if (errorCode === 'weak_password' || lower.includes('password should be')) {
    return {
      isRateLimit: false,
      message: 'Parola este prea slabă. Folosește cel puțin 8 caractere, cu litere și cifre.',
    }
  }

  if (lower.includes('invalid') && lower.includes('email')) {
    return { isRateLimit: false, message: 'Adresa de email nu este validă.' }
  }

  if (errorCode === 'otp_expired' || lower.includes('token has expired') || lower.includes('expired')) {
    return {
      isRateLimit: false,
      message: 'Linkul a expirat. Cere unul nou și folosește-l în maximum o oră.',
    }
  }

  // Unknown error: never show the English original.
  return {
    isRateLimit: false,
    message: 'A apărut o eroare. Încearcă din nou sau sună-ne la 0757 708 181.',
  }
}
