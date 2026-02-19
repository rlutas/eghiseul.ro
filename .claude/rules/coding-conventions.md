# Coding Conventions

- TypeScript strict mode, absolute imports (`@/...`)
- Server components by default, `'use client'` only when needed
- shadcn/ui for UI components, Tailwind v4 for styling
- Romanian for UI text, English for code/comments/variable names
- snake_case for DB columns, camelCase for TypeScript
- Always use `createClient()` (server) or `createAdminClient()` (service role) from `@/lib/supabase/`
- File uploads: hidden input + ref.click() pattern (macOS compatibility)
- Error messages to user in Romanian, console.error in English
- API responses: `{ success: boolean, data?: T, error?: string }`
- Admin endpoints: always call `requirePermission(userId, 'permission.name')` before logic
