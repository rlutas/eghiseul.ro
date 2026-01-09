import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/shared/logout-button'
import { AccountTabs } from '@/components/account'
import type { Database } from '@/types/supabase'
import {
  Mail,
  Shield,
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

  // Calculate actual KYC status (requires BOTH front ID AND selfie)
  const docTypes = kycDocs?.map((d: { document_type: string }) => d.document_type) || []
  const hasFrontId = docTypes.some((t: string) => t === 'ci_front' || t === 'ci_nou_front')
  const hasSelfie = docTypes.some((t: string) => t === 'selfie' || t === 'selfie_with_id')
  const isKycComplete = hasFrontId && hasSelfie
  const isKycPartial = (hasFrontId || hasSelfie) && !isKycComplete

  const firstName = profile?.first_name || user.user_metadata?.first_name || ''
  const lastName = profile?.last_name || user.user_metadata?.last_name || ''
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-secondary-900 via-secondary-800 to-secondary-900 text-white">
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
                <p className="text-sm text-white/60">Documente</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
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
                  href="/account/settings"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-secondary-900">Setări cont</p>
                    <p className="text-xs text-neutral-500">Parolă, notificări</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </Link>

                <div className="px-3 pt-3">
                  <LogoutButton />
                </div>
              </div>
            </div>

            {/* KYC Status Badge */}
            <div className={`rounded-2xl p-4 ${
              isKycComplete
                ? 'bg-green-50 border border-green-200'
                : isKycPartial
                  ? 'bg-amber-50 border border-amber-200'
                  : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isKycComplete
                    ? 'bg-green-100'
                    : isKycPartial
                      ? 'bg-amber-100'
                      : 'bg-yellow-100'
                }`}>
                  <Shield className={`w-5 h-5 ${
                    isKycComplete
                      ? 'text-green-600'
                      : isKycPartial
                        ? 'text-amber-600'
                        : 'text-yellow-600'
                  }`} />
                </div>
                <div>
                  <p className={`font-semibold ${
                    isKycComplete
                      ? 'text-green-800'
                      : isKycPartial
                        ? 'text-amber-800'
                        : 'text-yellow-800'
                  }`}>
                    {isKycComplete
                      ? 'KYC Verificat'
                      : isKycPartial
                        ? 'KYC Incomplet'
                        : 'KYC Neverificat'}
                  </p>
                  <p className={`text-xs ${
                    isKycComplete
                      ? 'text-green-600'
                      : isKycPartial
                        ? 'text-amber-600'
                        : 'text-yellow-600'
                  }`}>
                    {isKycComplete
                      ? 'Identitate confirmată'
                      : isKycPartial
                        ? `Lipsește ${!hasFrontId ? 'actul de identitate' : 'selfie-ul'}`
                        : 'Scanează actul în tab-ul KYC'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area - Tabs */}
          <div className="lg:col-span-3">
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
