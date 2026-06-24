/**
 * Customer Layout
 *
 * Layout for customer-facing pages (account, orders). Header comes from the
 * root layout; Footer is added here (the customer pages don't import it
 * individually like the marketing pages do).
 */
import { Footer } from '@/components/home/footer'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Footer />
    </>
  )
}
