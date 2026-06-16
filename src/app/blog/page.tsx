import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Footer } from '@/components/home/footer';
import { ARTICLES } from '@/config/articles';
import { buildPageMetadata } from '@/lib/seo';

const TITLE = 'Blog — Informații utile despre documente oficiale';
const DESCRIPTION =
  'Ghiduri și articole despre acte oficiale din România: carte funciară, cadastru, cazier judiciar, ' +
  'certificate de stare civilă, ONRC, pensii și rovinietă. Explicații clare, pas cu pas.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: `${TITLE} | eGhișeul`,
  description: DESCRIPTION,
  path: '/blog/',
});

export default function BlogPage() {
  const [featured, ...rest] = ARTICLES;

  return (
    <>
      <main id="main-content" className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-36 pb-12 lg:pb-16">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>
          <div className="relative container mx-auto px-4 max-w-[1100px]">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6 flex-wrap" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary-500 transition-colors">Acasă</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white font-medium">Blog</span>
            </nav>
            <span className="inline-block px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-4">
              Informații utile
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
              Blog eGhișeul
            </h1>
            <p className="text-lg text-white/85 leading-relaxed max-w-2xl">{DESCRIPTION}</p>
          </div>
        </section>

        {/* Featured + grid */}
        <section className="py-10 lg:py-16">
          <div className="container mx-auto px-4 max-w-[1100px]">
            {/* Featured article */}
            <Link
              href={`/${featured.slug}/`}
              className="group grid md:grid-cols-2 gap-6 rounded-3xl border border-neutral-200 bg-white p-4 lg:p-5 mb-8 hover:border-primary-300 hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-neutral-100">
                <Image
                  src={`/images/articole/${featured.slug}.webp`}
                  alt={featured.title}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-300 motion-reduce:transition-none"
                  sizes="(max-width: 768px) 100vw, 520px"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="inline-block w-fit px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full mb-3">
                  {featured.category}
                </span>
                <h2 className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-3 group-hover:text-primary-700 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-neutral-600 leading-relaxed mb-4">{featured.excerpt}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700">
                  Citește articolul
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none" aria-hidden="true" />
                </span>
              </div>
            </Link>

            {/* Rest grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((a) => (
                <Link
                  key={a.slug}
                  href={`/${a.slug}/`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white hover:border-primary-300 hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
                    <Image
                      src={`/images/articole/${a.slug}.webp`}
                      alt={a.title}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-300 motion-reduce:transition-none"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 340px"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <span className="inline-block w-fit px-2.5 py-0.5 bg-primary-50 text-primary-700 text-[11px] font-semibold rounded-full mb-2.5">
                      {a.category}
                    </span>
                    <h3 className="text-base font-bold text-secondary-900 mb-2 leading-snug group-hover:text-primary-700 transition-colors">
                      {a.title}
                    </h3>
                    <p className="text-sm text-neutral-600 leading-relaxed mb-4 line-clamp-3">{a.excerpt}</p>
                    <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700">
                      Citește
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
