import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AccountSettingsForm } from './settings-form'

/**
 * /account/settings — password, email address, sign out everywhere.
 *
 * The account sidebar and the header user menu both linked here before the
 * page existed, so "Setări cont" was a 404 in production. Created 2026-09-17.
 */

export const metadata: Metadata = {
  title: 'Setări cont | eGhiseul.ro',
  robots: { index: false, follow: false },
}

export default async function AccountSettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white -mt-16 xl:-mt-[112px]">
      {/* Hero Header — bleed up under the fixed global header. */}
      <div className="bg-gradient-to-r from-secondary-900 via-secondary-800 to-secondary-900 text-white pt-16 xl:pt-[112px]">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          {/* trailingSlash: true in next.config.ts — the slash avoids a 308 hop. */}
          <Link
            href="/account/"
            className="inline-flex items-center gap-2 min-h-11 -ml-2 px-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Înapoi la cont
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold mt-2">Setări cont</h1>
          <p className="text-white/70 text-sm mt-1 break-all">{user.email}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <AccountSettingsForm currentEmail={user.email ?? ''} />
      </div>
    </div>
  )
}
