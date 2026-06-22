import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/**
 * Imagine OG generată dinamic pentru paginile de calculator (1200×630).
 * Brandată: gradient navy + accent auriu + logo + titlul calculatorului.
 * Folosită prin `ogImage: /api/og/calculator?title=...` în buildPageMetadata.
 * Font: Liberation Sans (bundle în repo) — suportă diacriticele românești.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get('title') ?? 'Calculator gratuit 2026').slice(0, 90);
  // Scoatem prefixul „Calculator " ca să nu se repete cu badge-ul.
  const title = raw.replace(/^Calculator\s+/i, '');

  const [bold, regular] = await Promise.all([
    fetch(new URL('./font-bold.ttf', import.meta.url)).then((r) => r.arrayBuffer()),
    fetch(new URL('./font-regular.ttf', import.meta.url)).then((r) => r.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          padding: '70px',
          background: 'linear-gradient(135deg, #06101F 0%, #0C1A2F 100%)',
          color: '#ffffff',
          fontFamily: 'Liberation',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Accent auriu decorativ (colț dreapta-sus) */}
        <div
          style={{
            position: 'absolute',
            top: '-180px',
            right: '-140px',
            width: '520px',
            height: '520px',
            borderRadius: '9999px',
            background: '#ECB95F',
            opacity: 0.1,
            display: 'flex',
          }}
        />

        {/* Header: logo + brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '62px',
              height: '62px',
              borderRadius: '16px',
              background: '#ECB95F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 700,
              color: '#06101F',
            }}
          >
            eG
          </div>
          <div style={{ display: 'flex', fontSize: '34px', fontWeight: 700 }}>
            <span>eGhișeul</span>
            <span style={{ color: '#ECB95F' }}>.ro</span>
          </div>
        </div>

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            marginTop: '64px',
            background: '#ECB95F',
            color: '#06101F',
            padding: '10px 24px',
            borderRadius: '9999px',
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '1px',
          }}
        >
          CALCULATOR GRATUIT · 2026
        </div>

        {/* Titlu */}
        <div
          style={{
            display: 'flex',
            fontSize: '64px',
            fontWeight: 700,
            lineHeight: 1.1,
            marginTop: '26px',
            maxWidth: '1000px',
          }}
        >
          {title}
        </div>

        {/* Subtitlu */}
        <div
          style={{
            display: 'flex',
            fontSize: '28px',
            color: 'rgba(255,255,255,0.72)',
            marginTop: '22px',
          }}
        >
          Rezultat instant, fără cont · reguli actualizate 2026
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 'auto',
            paddingTop: '28px',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            fontSize: '24px',
            color: '#ECB95F',
          }}
        >
          eghiseul.ro/calculator
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Liberation', data: regular, weight: 400, style: 'normal' },
        { name: 'Liberation', data: bold, weight: 700, style: 'normal' },
      ],
    }
  );
}
