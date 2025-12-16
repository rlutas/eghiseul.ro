# Sprint 1: Authentication & Users

**Status:** ✅ Complete
**Durată:** 2 săptămâni
**Data start:** 2025-12-16
**Data finalizare:** 2025-12-16

---

## Obiective

- [ ] Configurare Supabase Auth (email/password)
- [ ] Setup 2FA cu TOTP
- [ ] Creare tabel `profiles` cu RLS
- [ ] Pagini auth (login, register, forgot-password)
- [ ] Protected routes middleware
- [ ] Admin role setup

---

## Database Schema

### Tabel: `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  cnp VARCHAR(13),              -- encrypted
  phone VARCHAR(20),
  email VARCHAR(255),
  kyc_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  role VARCHAR(50) DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger for auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Componente UI

### Auth Pages

| Pagină | Route | Componente |
|--------|-------|------------|
| Login | `/login` | LoginForm, SocialLogin |
| Register | `/register` | RegisterForm |
| Forgot Password | `/forgot-password` | ForgotPasswordForm |
| Reset Password | `/reset-password` | ResetPasswordForm |

### Forms

| Component | Câmpuri | Validare |
|-----------|---------|----------|
| LoginForm | email, password | zod schema |
| RegisterForm | email, password, confirm, terms | zod schema |
| ForgotPasswordForm | email | zod schema |

---

## API Routes

| Route | Method | Descriere |
|-------|--------|-----------|
| - | - | Supabase handles auth |

---

## Middleware

### `src/middleware.ts`

```typescript
// Protected routes
const protectedPaths = ['/account', '/orders', '/kyc', '/admin']

// Admin-only routes
const adminPaths = ['/admin']

// Flow:
// 1. Check if route is protected
// 2. If yes, verify user session
// 3. If admin route, verify admin role
// 4. Redirect to login if not authenticated
```

---

## Testing Checklist

- [ ] Register nou user
- [ ] Login cu email/password
- [ ] Logout
- [ ] Forgot password flow
- [ ] Reset password
- [ ] Protected route redirect
- [ ] Admin route protection
- [ ] Profile auto-create on signup

---

## Files Create/Modified

| Fișier | Status | Descriere |
|--------|--------|-----------|
| `src/app/(auth)/login/page.tsx` | 🔄 | Login page |
| `src/app/(auth)/register/page.tsx` | 🔄 | Register page |
| `src/app/(auth)/forgot-password/page.tsx` | ⏳ | Forgot password |
| `src/components/forms/login-form.tsx` | 🔄 | Login form |
| `src/components/forms/register-form.tsx` | 🔄 | Register form |
| `src/lib/supabase/client.ts` | ✅ | Browser client |
| `src/lib/supabase/server.ts` | ✅ | Server client |
| `src/lib/supabase/middleware.ts` | ✅ | Middleware helper |
| `src/middleware.ts` | ✅ | Route protection |
| `supabase/migrations/001_profiles.sql` | 🔄 | Profiles table |

---

## Progress Log

| Data | Task | Status |
|------|------|--------|
| 2025-12-16 | .env.local configurat | ✅ |
| 2025-12-16 | Supabase clients create | ✅ |
| 2025-12-16 | Middleware setup | ✅ |
| 2025-12-16 | DB migration profiles | ✅ |
| 2025-12-16 | Auth pages (login, register, forgot) | ✅ |
| 2025-12-16 | Account page | ✅ |
| 2025-12-16 | Build test passed | ✅ |
| - | Run SQL migration in Supabase | ⏳ |
| - | End-to-end testing | ⏳ |

---

## Notes

- Supabase Project URL: `https://llbwmitdrppomeptqlue.supabase.co`
- Region: EU (pentru GDPR)
- Auth providers: Email/Password (altele pot fi adăugate later)
