'use client';

import { useEffect } from 'react';

// Catches errors in the root layout itself. Must render its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error boundary:', error);
  }, [error]);

  return (
    <html lang="ro">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '1rem',
          margin: 0,
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>A apărut o eroare</h1>
        <p style={{ marginTop: '0.75rem', maxWidth: '28rem', color: '#52525b' }}>
          Ne pare rău, ceva n-a mers cum trebuie. Încearcă din nou sau revino mai târziu.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: '1.5rem',
            padding: '0.5rem 1.25rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: '#1d4ed8',
            color: '#fff',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Încearcă din nou
        </button>
      </body>
    </html>
  );
}
