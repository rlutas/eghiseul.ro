/**
 * Shown while `/account` is being rendered on the server. Without it the
 * click from a service page sat on the old page with no feedback until every
 * query had answered (Raul, 18.09.2026).
 */
export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 -mt-16 xl:-mt-[112px]" aria-busy="true">
      <div className="bg-secondary-900 pt-16 xl:pt-[112px]">
        <div className="container mx-auto max-w-6xl px-4 pt-6 pb-7">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 animate-pulse rounded-2xl bg-white/15 motion-reduce:animate-none sm:h-14 sm:w-14" />
            <div className="space-y-2">
              <div className="h-6 w-40 animate-pulse rounded bg-white/15 motion-reduce:animate-none" />
              <div className="h-4 w-56 animate-pulse rounded bg-white/10 motion-reduce:animate-none" />
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto max-w-6xl space-y-6 px-4 py-6 lg:py-8">
        <div className="h-44 animate-pulse rounded-2xl border border-neutral-200 bg-white motion-reduce:animate-none" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-[52px] animate-pulse rounded-xl bg-white motion-reduce:animate-none" />
          <div className="h-[52px] animate-pulse rounded-xl bg-white motion-reduce:animate-none" />
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />
        <span className="sr-only">Se încarcă contul</span>
      </div>
    </div>
  );
}
