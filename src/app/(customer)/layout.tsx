/**
 * Customer Layout
 *
 * Layout for customer-facing pages (account, orders).
 * Uses the main app layout's Header and Footer.
 */
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
