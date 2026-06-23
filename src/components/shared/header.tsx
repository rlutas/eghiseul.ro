'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Phone, User, Settings, FileText, LogOut, ChevronDown, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServicesMegaMenu } from '@/components/shared/services-mega-menu';
import { CalculatorsMegaMenu } from '@/components/shared/calculators-mega-menu';
import { SERVICES_NAV } from '@/config/services-nav';
import { CALCULATORS_NAV } from '@/config/calculators-nav';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const navLinks = [
  { href: '/', label: 'Acasă', type: 'route' as const },
  { href: '/servicii/', label: 'Servicii', type: 'route' as const },
  { href: '/calculator/', label: 'Calculatoare', type: 'route' as const },
  { href: '/blog/', label: 'Blog', type: 'route' as const },
  { href: '/comanda/status/', label: 'Status comandă', type: 'route' as const },
  { href: '/#contact', label: 'Contact', type: 'hash' as const },
];

// Smooth scroll utility
const smoothScrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const yOffset = -80;
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileCalculatorsOpen, setMobileCalculatorsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Defer mounting Radix portals/triggers to after hydration. Radix
  // generates aria-controls IDs with React.useId(); when ANY component
  // higher up in the tree renders a different number of useId() calls on
  // the server vs the client (which happens with auth-gated UIs even
  // though our initial isLoading/user values match), the sequential IDs
  // drift and the Sheet trigger throws a hydration mismatch warning. The
  // skeleton below renders identical markup on the server so the layout
  // doesn't shift; only the real Radix root mounts client-side.
  const [hydrated, setHydrated] = useState(false);
  // This is the canonical hydration-flip pattern — we deliberately want
  // a setState immediately after mount to swap from the SSR skeleton to
  // the real Radix-portal-mounting tree. React Compiler's
  // `set-state-in-effect` rule flags this because cascading renders can
  // hurt perf, but here a single set on mount is correct and unavoidable.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setHydrated(true); }, []);
  const pathname = usePathname();
  const router = useRouter();

  // Check auth state
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide header on admin routes (after all hooks)
  if (pathname.startsWith('/admin')) {
    return null;
  }

  // Handle logout
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const userInitials = user?.user_metadata?.first_name?.[0]?.toUpperCase() ||
                       user?.email?.[0]?.toUpperCase() || 'U';

  const isActiveLink = (link: typeof navLinks[number]) => {
    if (link.type === 'route') {
      return pathname === link.href;
    }
    return pathname === '/' && typeof window !== 'undefined' && window.location.hash === link.href;
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: typeof navLinks[number]) => {
    if (link.type === 'hash' && pathname === '/') {
      e.preventDefault();
      const sectionId = link.href.replace('/#', '');
      smoothScrollToSection(sectionId);
      setIsMobileMenuOpen(false);
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', link.href);
      }
    }
  };

  return (
    <>
      {/* Top Bar - Desktop only */}
      <div className="hidden xl:block bg-secondary-900 text-white py-2">
        <div className="container mx-auto px-4 max-w-[1100px]">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <span className="text-white/70">Luni - Vineri: 08:00 - 16:00</span>
              <span className="text-white/30">|</span>
              <a href="tel:+40757708181" className="flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-colors">
                <Phone className="w-4 h-4" />
                +40 757 708 181
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/70">Peste 200.000 documente procesate</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-[#FBBC04] fill-[#FBBC04]" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-white font-medium">4.9/5</span>
                <span className="text-white/50 text-xs">Google</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          'fixed top-0 xl:top-[40px] left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'xl:top-0 bg-white shadow-[0_4px_20px_rgba(6,16,31,0.08)]'
            : 'bg-white'
        )}
      >
        <div className="container mx-auto px-4 lg:px-6 max-w-[1100px]">
          <div className="flex items-center justify-between h-16 xl:h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center" aria-label="eGhișeul.ro - Acasă">
              <Image
                src="/images/brand/logo-wide.webp"
                alt="eGhișeul.ro"
                width={330}
                height={80}
                priority
                className="h-9 xl:h-10 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1" aria-label="Navigare principală">
              {navLinks.map((link) =>
                link.label === 'Servicii' ? (
                  <ServicesMegaMenu key={link.href} />
                ) : link.label === 'Calculatoare' ? (
                  <CalculatorsMegaMenu key={link.href} />
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link)}
                    className={cn(
                      'px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap',
                      isActiveLink(link)
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-secondary-700 hover:text-secondary-900 hover:bg-neutral-50'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Desktop Auth Buttons / User Menu */}
            <div className="hidden xl:flex items-center gap-3">
              {isLoading ? (
                <div className="w-9 h-9 rounded-full bg-neutral-100 animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-neutral-100 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center">
                        <span className="text-sm font-bold text-secondary-900">{userInitials}</span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2 border-b border-neutral-100">
                      <p className="text-sm font-semibold text-secondary-900">
                        {user.user_metadata?.first_name || 'Utilizator'}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    </div>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/account" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Contul meu
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/account" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Comenzile mele
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/account/settings" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Setări
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Deconectare
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    className="text-secondary-700 hover:text-secondary-900 hover:bg-neutral-100 font-semibold"
                  >
                    <Link href="/auth/login">Autentificare</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold px-6 rounded-xl shadow-[0_6px_14px_rgba(236,185,95,0.35)] hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)] hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <Link href="/auth/register">Începe Acum</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button.
                SSR placeholder: a plain button with the same look/size so
                the layout doesn't shift on hydration. The real Radix Sheet
                mounts client-side after `hydrated` flips — see the
                hydration-mismatch note at the top of this component for
                the why. The placeholder is non-interactive (no `Sheet`
                wrapping it) but that's fine: it's only visible for ~1
                frame on first paint. */}
            {!hydrated && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Deschide meniul"
                className="xl:hidden hover:bg-primary-50 min-h-[44px] min-w-[44px]"
              >
                <Menu className="h-6 w-6 text-secondary-900" />
              </Button>
            )}
            {hydrated && (
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="xl:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Deschide meniul"
                  className="hover:bg-primary-50 min-h-[44px] min-w-[44px]"
                >
                  <Menu className="h-6 w-6 text-secondary-900" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-50">
                    <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                      <Image src="/images/brand/logo-wide.webp" alt="eGhișeul.ro" width={330} height={80} className="h-8 w-auto" />
                    </Link>
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Închide meniul"
                        className="hover:bg-white"
                      >
                        <X className="h-5 w-5 text-secondary-700" />
                      </Button>
                    </SheetClose>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col p-4 flex-1 overflow-y-auto" aria-label="Navigare mobilă">
                    {navLinks.map((link) =>
                      link.label === 'Servicii' ? (
                        <div key={link.href} className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => setMobileServicesOpen((v) => !v)}
                            aria-expanded={mobileServicesOpen}
                            className="flex items-center justify-between text-base font-semibold px-4 py-4 rounded-xl text-secondary-700 hover:bg-neutral-50 border-l-4 border-l-transparent transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                          >
                            Servicii
                            <ChevronDown
                              className={cn(
                                'h-5 w-5 transition-transform duration-200 motion-reduce:transition-none',
                                mobileServicesOpen && 'rotate-180'
                              )}
                            />
                          </button>
                          {mobileServicesOpen && (
                            <div className="pl-3 pb-2">
                              {SERVICES_NAV.map((group) => (
                                <div key={group.category} className="mt-2">
                                  <p className="px-3 text-xs font-bold uppercase tracking-wider text-primary-700">
                                    {group.category}
                                  </p>
                                  {group.items.map((item) => (
                                    <div key={item.href}>
                                      <Link
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-secondary-700 hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                                      >
                                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                                          <item.icon className="h-4 w-4" />
                                        </span>
                                        {item.name}
                                      </Link>
                                      {item.children && (
                                        <div className="ml-11 border-l border-neutral-200 pl-3">
                                          {item.children.map((child) => (
                                            <Link
                                              key={child.name}
                                              href={child.href}
                                              onClick={() => setIsMobileMenuOpen(false)}
                                              className="flex min-h-10 items-center px-3 py-2 rounded-lg text-[13px] font-medium text-secondary-600 hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                                            >
                                              {child.name}
                                            </Link>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ))}
                              <Link
                                href="/servicii/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="mt-3 ml-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700"
                              >
                                Vezi toate serviciile
                                <ChevronDown className="h-4 w-4 -rotate-90" />
                              </Link>
                            </div>
                          )}
                        </div>
                      ) : link.label === 'Calculatoare' ? (
                        <div key={link.href} className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => setMobileCalculatorsOpen((v) => !v)}
                            aria-expanded={mobileCalculatorsOpen}
                            className="flex items-center justify-between text-base font-semibold px-4 py-4 rounded-xl text-secondary-700 hover:bg-neutral-50 border-l-4 border-l-transparent transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                          >
                            Calculatoare
                            <ChevronDown
                              className={cn(
                                'h-5 w-5 transition-transform duration-200 motion-reduce:transition-none',
                                mobileCalculatorsOpen && 'rotate-180'
                              )}
                            />
                          </button>
                          {mobileCalculatorsOpen && (
                            <div className="pl-3 pb-2">
                              {CALCULATORS_NAV.map((group) => (
                                <div key={group.category} className="mt-2">
                                  <p className="px-3 text-xs font-bold uppercase tracking-wider text-primary-700">
                                    {group.category}
                                  </p>
                                  {group.items.filter((item) => item.popular).map((item) => (
                                    <Link
                                      key={item.href}
                                      href={item.href}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                      className="flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-secondary-700 hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                                    >
                                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                                        <item.icon className="h-4 w-4" />
                                      </span>
                                      {item.name}
                                    </Link>
                                  ))}
                                </div>
                              ))}
                              <Link
                                href="/calculator/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="mt-3 ml-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700"
                              >
                                Vezi toate calculatoarele
                                <ChevronDown className="h-4 w-4 -rotate-90" />
                              </Link>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={(e) => {
                            handleNavClick(e, link);
                            setIsMobileMenuOpen(false);
                          }}
                          className={cn(
                            'text-base font-semibold px-4 py-4 rounded-xl transition-all border-l-4',
                            isActiveLink(link)
                              ? 'text-primary-700 bg-primary-50 border-l-primary-500'
                              : 'text-secondary-700 hover:bg-neutral-50 border-l-transparent hover:border-l-primary-300'
                          )}
                        >
                          {link.label}
                        </Link>
                      )
                    )}
                  </nav>

                  {/* Mobile Contact + order status */}
                  <div className="px-4 py-4 border-t border-neutral-100 bg-neutral-50 space-y-3">
                    <Link
                      href="/comanda/status/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <PackageSearch className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Ai deja o comandă?</p>
                        <p className="text-sm font-bold text-secondary-900">Verifică statusul comenzii</p>
                      </div>
                    </Link>
                    <a
                      href="tel:+40757708181"
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Sună-ne acum</p>
                        <p className="text-sm font-bold text-secondary-900">+40 757 708 181</p>
                      </div>
                    </a>
                  </div>

                  {/* Mobile Auth Buttons / User Info */}
                  <div className="p-4 space-y-3 border-t border-neutral-200">
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl mb-3">
                          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                            <span className="font-bold text-secondary-900">{userInitials}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-secondary-900 truncate">
                              {user.user_metadata?.first_name || 'Utilizator'}
                            </p>
                            <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            href="/account"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-secondary-700 bg-neutral-100 rounded-xl"
                          >
                            <User className="w-4 h-4" />
                            Cont
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsMobileMenuOpen(false);
                            }}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl"
                          >
                            <LogOut className="w-4 h-4" />
                            Ieșire
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          asChild
                          className="w-full border-2 border-neutral-200 h-12 text-secondary-700 font-semibold rounded-xl hover:bg-neutral-50"
                        >
                          <Link
                            href="/auth/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Autentificare
                          </Link>
                        </Button>
                        <Button
                          asChild
                          className="w-full bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold h-12 rounded-xl shadow-[0_6px_14px_rgba(236,185,95,0.35)]"
                        >
                          <Link
                            href="/auth/register"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Începe Acum
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            )}
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 xl:h-[112px]" />
    </>
  );
}
