import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { LogoutButton } from '@/components/shared/logout-button'
import { AccountTabs } from '@/components/account'
import { ProfileChecklist } from '@/components/account/ProfileChecklist'
import { OnboardingQuestion } from '@/components/account/OnboardingQuestion'
import { profileCompleteness, hasIdentityDocuments } from '@/lib/account/profile-completeness'
import { parseInterests, sortByInterest } from '@/lib/account/service-interests'
import { serviceRequirements, serviceReadiness } from '@/lib/account/service-readiness'
import { createPublicClient } from '@/lib/supabase/public'
import type { AccountServiceRow } from '@/components/account/ServicesTab'
import type { Database } from '@/types/supabase'
import {
  Mail,
  Settings,
  ChevronRight,
  Loader2,
} from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function AccountPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Pull in orders this customer placed before they had an account. Runs on
  // every visit rather than once at sign-up, so it also picks up orders placed
  // later while logged out, and heals the accounts that existed before this
  // shipped. The UPDATE touches nothing once everything is claimed.
  // Gated on a confirmed email: that is the same proof of mailbox control the
  // public order-status page already accepts.
  if (user.email && user.email_confirmed_at) {
    const admin = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: claimError } = await (admin as any).rpc('claim_guest_orders', {
      p_user_id: user.id,
      p_email: user.email,
    })
    // Never block the account on this — worst case the customer sees the same
    // list as before and we try again on the next visit.
    if (claimError) console.error('claim_guest_orders failed:', claimError.message)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  // Fetch stats for header
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: kycDocs } = await (supabase as any)
    .from('kyc_verifications')
    .select('id, document_type')
    .eq('user_id', user.id)
    .eq('is_active', true)

  const { data: orders } = await supabase
    .from('orders')
    .select('id')
    .eq('user_id', user.id)
    .neq('status', 'draft')

  // Counted for the checklist below. Each query gets its own `from()` — reusing
  // a builder stacks the filters and silently returns nothing.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: savedAddressCount } = await (supabase as any)
    .from('user_saved_data')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: billingProfileCount } = await (supabase as any)
    .from('billing_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: savedVehicleCount } = await (supabase as any)
    .from('user_saved_vehicles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Calculate actual KYC status (requires BOTH front ID AND selfie)
  const docTypes = kycDocs?.map((d: { document_type: string }) => d.document_type) || []

  // The answer to the account's single onboarding question. Read off the profile
  // row we already have — `service_interests` and `onboarding_completed_at` exist
  // in the database (migration 173); the generated types are stale.
  // NULL means never asked, `{}` means asked and skipped: both leave the account
  // asking exactly what it asked before, and only the first one shows the card.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serviceInterests = parseInterests((profile as any)?.service_interests)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasAnsweredOnboarding = !!(profile as any)?.onboarding_completed_at

  const completeness = profileCompleteness({
    firstName: profile?.first_name,
    lastName: profile?.last_name,
    cnp: profile?.cnp,
    phone: profile?.phone,
    kycDocumentTypes: docTypes,
    savedAddressCount: savedAddressCount ?? 0,
    billingProfileCount: billingProfileCount ?? 0,
    serviceInterests,
  })

  // The catalogue, with what each service will still ask this customer for.
  // Computed here rather than in the browser so the tab renders complete on
  // first paint. `createPublicClient` because services are public data and this
  // needs no user context.
  // Cazier Judiciar PF/PJ are left out for the same reason /servicii leaves them
  // out: the hub service covers both.
  const HIDDEN_SLUGS = new Set(['cazier-judiciar-persoana-fizica', 'cazier-judiciar-persoana-juridica'])
  const GROUP_TITLES: Record<string, string> = {
    imobiliare: 'Carte Funciară & Cadastru',
    juridice: 'Caziere & Integritate',
    comerciale: 'Firme',
    fiscale: 'Fiscal',
    personale: 'Stare Civilă',
    auto: 'Auto',
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: serviceRows } = await (createPublicClient() as any)
    .from('services')
    .select('slug, name, short_description, description, base_price, category, verification_config')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  const accountData = {
    hasPersonalData: !!(profile?.first_name && profile?.last_name && profile?.cnp),
    hasIdentityDocuments: hasIdentityDocuments(docTypes),
    // company_* exist on `profiles` in the database; the generated types are stale.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hasCompanyData: !!(profile as any)?.company_cui,
    hasAddress: (savedAddressCount ?? 0) > 0,
    hasBilling: (billingProfileCount ?? 0) > 0,
    hasVehicle: (savedVehicleCount ?? 0) > 0,
  }

  // Ordered by what this customer said they came for, before the rows lose their
  // `category` in the mapping below. Stable, so everything else keeps the
  // catalogue's own `display_order`; with no answer it is a no-op.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortedServiceRows = sortByInterest((serviceRows ?? []) as any[], serviceInterests)

  const accountServices: AccountServiceRow[] = sortedServiceRows
    .filter((row) => !HIDDEN_SLUGS.has(row.slug))
    .map((row) => {
      const readiness = serviceReadiness(serviceRequirements(row.verification_config), accountData)
      return {
        slug: row.slug,
        name: row.name,
        description: row.short_description ?? row.description ?? null,
        price: row.base_price == null ? null : Number(row.base_price),
        group: GROUP_TITLES[row.category as string] ?? 'Alte servicii',
        ready: readiness.ready,
        missing: readiness.missing,
      }
    })

  const firstName = profile?.first_name || user.user_metadata?.first_name || ''
  const lastName = profile?.last_name || user.user_metadata?.last_name || ''
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-neutral-50 -mt-16 xl:-mt-[112px]">
      {/* Header. Compact on purpose: it used to be a full hero with three big
          stat columns, which on a phone meant the content started below the
          fold. The KYC stat is gone — the checklist below already tracks it and
          the header should not be the third place saying the same thing. */}
      <div className="bg-secondary-900 text-white pt-16 xl:pt-[112px]">
        <div className="container mx-auto px-4 pt-6 pb-7 max-w-6xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-500 sm:h-14 sm:w-14">
              <span className="text-lg font-bold text-secondary-900 sm:text-xl">{initials}</span>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold sm:text-2xl">
                {firstName ? `Salut, ${firstName}!` : 'Contul meu'}
              </h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/60">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
            </div>

            {/* Counts, not a scoreboard: small, aligned right, tabular so they
                do not jiggle as they change. */}
            <div className="hidden flex-shrink-0 gap-6 sm:flex">
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums text-primary-500">{orders?.length || 0}</p>
                <p className="text-xs text-white/50">Comenzi</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums text-primary-500">{kycDocs?.length || 0}</p>
                <p className="text-xs text-white/50">Acte salvate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-6 lg:py-8">
        <div className="space-y-6">
          {/* Asked once, on the first visit, and never again: the answer decides
              whether the checklist below asks for an identity document at all. */}
          {!hasAnsweredOnboarding && <OnboardingQuestion />}

          {/* Before anything else, because it is the thing a new account should
              act on — and it removes itself once complete. */}
          <ProfileChecklist completeness={completeness} />

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            }
          >
            <AccountTabs services={accountServices} serviceInterests={serviceInterests} />
          </Suspense>

          {/* Account-level actions, deliberately last and visually quieter than
              the navigation: signing out is not something to put next to the
              destinations someone is trying to reach. */}
          <div className="flex flex-col gap-2 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/account/settings/"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-white hover:text-secondary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <Settings className="h-4 w-4" />
              Setări cont — parolă, email, sesiuni
              <ChevronRight className="h-4 w-4 text-neutral-400" />
            </Link>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  )
}
