import Image from 'next/image';
import { DOCUMENTERO_REVIEWS, DOCUMENTERO_REVIEWS_COLLECTED, type DocumenteroReview } from '@/lib/documentero/reviews';
import { GOOGLE_REVIEWS_URL, GOOGLE_REVIEW_WRITE_URL } from '@/config/contact';
import { SOCIAL_PROOF } from '@/lib/seo/constants';
import { Card, Eyebrow, H2, Initials, Section } from './ui';

const fmtRating = SOCIAL_PROOF.ratingValue.toString().replace('.', ',');

function GoogleG({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 010-4.2V7.06H2.18a11 11 0 000 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function Stars({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <span className="flex items-center gap-0.5" aria-label="5 din 5 stele" role="img">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`${className} fill-[#FBBC04] text-[#FBBC04]`} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

function Avatar({ r, size = 44, className = '' }: { r: DocumenteroReview; size?: number; className?: string }) {
  if (!r.avatar) {
    return <Initials text={r.name.charAt(0)} size={size} />;
  }
  return (
    <Image
      src={r.avatar}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Small stack of real client photos + the Google rating, for the hero.
 * Photos come from the reviews below — never generated faces.
 */
export function ReviewersStack({ count = 4 }: { count?: number }) {
  const withPhoto = DOCUMENTERO_REVIEWS.filter((r) => r.avatar).slice(0, count);
  return (
    <a
      href={GOOGLE_REVIEWS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3.5 pt-1.5 hover:opacity-90"
      aria-label={`Recenzii Google — ${fmtRating} din 5 din ${SOCIAL_PROOF.reviewCount} de recenzii`}
    >
      <div className="flex">
        {withPhoto.map((r, i) => (
          <span key={r.name} className={`inline-flex rounded-full border-2 border-d-bg ${i > 0 ? '-ml-3' : ''}`}>
            <Avatar r={r} size={40} />
          </span>
        ))}
      </div>
      <span className="text-[14px] text-d-muted">
        <span className="inline-flex items-center gap-1.5 align-middle">
          <GoogleG className="h-3.5 w-3.5" />
          <strong className="text-d-ink">{fmtRating} din 5</strong>
          <Stars className="h-3.5 w-3.5" />
        </span>
        <br className="sm:hidden" />
        <span className="sm:ml-1.5">· peste {SOCIAL_PROOF.roundedDown} de recenzii Google · eDigitalizare SRL, din 2023</span>
      </span>
    </a>
  );
}

/**
 * "Ce spun clienții" — six real Google reviews about civil-status documents,
 * with the reviewers' Google photos, and the honest provenance line: the
 * profile belongs to eDigitalizare SRL, the company behind documentero.ro
 * (named as the company, not as the sister brand — Raul, 19.09).
 */
export function ReviewsDocumentero({ limit = 6, match, title }: { limit?: number; match?: RegExp; title?: string }) {
  // On a service page only the reviews about THAT document; fall back to all
  // when fewer than two match, so the section never looks empty.
  const matched = match ? DOCUMENTERO_REVIEWS.filter((r) => match.test(r.service)) : DOCUMENTERO_REVIEWS;
  const items = (matched.length >= 2 ? matched : DOCUMENTERO_REVIEWS).slice(0, limit);
  return (
    <Section className="mt-24 flex flex-col gap-7 lg:mt-32">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <Eyebrow>Recenzii Google</Eyebrow>
          <H2>{title ?? 'Ce spun clienții despre actele de stare civilă'}</H2>
        </div>
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 rounded-full border border-d-line bg-d-card px-4 py-2.5 text-[14px] font-semibold hover:border-d-acc"
        >
          <GoogleG />
          <span className="font-bold">{fmtRating}</span>
          <Stars />
          <span className="text-d-muted">· {SOCIAL_PROOF.reviewCount} recenzii</span>
        </a>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((r) => (
          <Card key={r.name} className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <Stars />
              <GoogleG className="h-5 w-5" />
            </div>
            <blockquote className="m-0 flex-1 text-[16px] leading-[1.55] text-d-body">„{r.text}”</blockquote>
            <figcaption className="flex items-center gap-3 border-t border-d-line pt-4">
              <Avatar r={r} />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[14px] font-bold">{r.name}</span>
                <span className="text-[12px] text-d-muted">{r.service}</span>
              </div>
            </figcaption>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 text-[13px] text-d-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 max-w-[720px] leading-relaxed">
          Recenzii publice de pe profilul Google al eDigitalizare SRL, firma din spatele documentero.ro: aceeași echipă
          și același avocat obțin actele de stare civilă comandate aici. Citite la {DOCUMENTERO_REVIEWS_COLLECTED}.
        </p>
        <a href={GOOGLE_REVIEW_WRITE_URL} target="_blank" rel="noopener noreferrer" className="shrink-0 font-semibold text-d-ink underline underline-offset-4 hover:text-d-acc">
          Lasă o recenzie pe Google
        </a>
      </div>
    </Section>
  );
}
