import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { LogoutButton } from '@/components/shared/logout-button'
import { AccountTabs } from '@/components/account'
import { ProfileChecklist } from '@/components/account/ProfileChecklist'
import { profileCompleteness } from '@/lib/account/profile-completeness'
import type { Database } from '@/types/supabase'
import {
  Mail,
  CheckCircle,
  Clock,
  Plus,
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

  // Calculate actual KYC status (requires BOTH front ID AND selfie)
  const docTypes = kycDocs?.map((d: { document_type: string }) => d.document_type) || []
  const hasFrontId = docTypes.some((t: string) => t === 'ci_front' || t === 'ci_nou_front')
  const hasSelfie = docTypes.some((t: string) => t === 'selfie' || t === 'selfie_with_id')
  const isKycComplete = hasFrontId && hasSelfie
  const isKycPartial = (hasFrontId || hasSelfie) && !isKycComplete

  const completeness = profileCompleteness({
    firstName: profile?.first_name,
    lastName: profile?.last_name,
    cnp: profile?.cnp,
    phone: profile?.phone,
    kycDocumentTypes: docTypes,
    savedAddressCount: savedAddressCount ?? 0,
    billingProfileCount: billingProfileCount ?? 0,
  })

  const firstName = profile?.first_name || user.user_metadata?.first_name || ''
  const lastName = profile?.last_name || user.user_metadata?.last_name || ''
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white -mt-16 xl:-mt-[112px]">
      {/* Hero Header — bleed up under the fixed global header (elimină banda
          albă a spacer-ului dintre header și „Salut, nume"). */}
      <div className="bg-gradient-to-r from-secondary-900 via-secondary-800 to-secondary-900 text-white pt-16 xl:pt-[112px]">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg">
                <span className="text-2xl md:text-3xl font-bold text-secondary-900">{initials}</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {firstName ? `Salut, ${firstName}!` : 'Contul meu'}
                </h1>
                <p className="text-white/70 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 md:gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-500">{orders?.length || 0}</p>
                <p className="text-sm text-white/60">Comenzi</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-500">{kycDocs?.length || 0}</p>
                <p className="text-sm text-white/60">Acte salvate</p>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${isKycComplete ? 'text-green-400' : isKycPartial ? 'text-amber-400' : 'text-yellow-400'}`}>
                  {isKycComplete ? <CheckCircle className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
                </div>
                <p className="text-sm text-white/60">KYC</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">

          {/* Sidebar. On a phone it renders AFTER the tabs (order-2): the
              customer opened the account to see their orders, not to find
              "Comandă nouă" — which pushed the actual content below the fold. */}
          <div className="order-2 lg:order-1 lg:col-span-1 space-y-4">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
              <div className="p-4 border-b border-neutral-100 bg-neutral-50">
                <h3 className="font-semibold text-secondary-900">Acțiuni rapide</h3>
              </div>
              <div className="p-2">
                <Link
                  href="/servicii"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <Plus className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-secondary-900">Comandă nouă</p>
                    <p className="text-xs text-neutral-500">Cazier, certificate, etc.</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </Link>

                <Link
                  href="/account/settings/"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-secondary-900">Setări cont</p>
                    <p className="text-xs text-neutral-500">Parolă, email, sesiuni</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </Link>

                <div className="px-3 pt-3">
                  <LogoutButton />
                </div>
              </div>
            </div>

          </div>

          {/* Main Content Area - Tabs */}
          <div className="order-1 lg:order-2 lg:col-span-3 space-y-6">
            <ProfileChecklist completeness={completeness} />
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            }>
              <AccountTabs />
            </Suspense>
          </div>

        </div>
      </div>
    </div>
  )
}
