import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Vitest config for eghiseul.ro
// Conventions:
//   tests/unit         pure logic, no network, no DOM unless explicit
//   tests/integration  real DB / API / Gemini, opt-in via RUN_INTEGRATION=1
//   tests/e2e          Playwright, NOT run by Vitest

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.{ts,mjs}'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    environment: 'node',
    globals: false,
    testTimeout: 15000,
    reporters: process.env.CI ? ['default', 'junit'] : ['default'],
    outputFile: { junit: './tests/reports/junit.xml' },
    // Provide dummy values for env vars that modules read at import time.
    // Real values come from .env.local during dev — these only matter for tests.
    env: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_dummy',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_dummy',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
