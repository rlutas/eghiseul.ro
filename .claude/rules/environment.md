---
paths:
  - ".env*"
  - "docs/deployment/**"
  - "src/lib/services/**"
  - "src/app/api/webhooks/**"
---

# Environment Variables

Lista completă cu capcane. Sursa de adevăr pentru chei: `.env.example`; valorile reale sunt în `.env.local` (niciodată în git).

```env
# Core
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_AI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# AWS S3
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_DOCUMENTS=eghiseul-documents

# Courier
FANCOURIER_USERNAME=
FANCOURIER_PASSWORD=          # Quote if contains special chars
FANCOURIER_CLIENT_ID=
SAMEDAY_USERNAME=
SAMEDAY_PASSWORD=             # Quote if contains special chars
SAMEDAY_USE_DEMO=false

# Invoicing
OBLIO_CLIENT_ID=
OBLIO_CLIENT_SECRET=
OBLIO_COMPANY_CIF=
OBLIO_SERIES_NAME=EGH

# Other
CRON_SECRET=
RESEND_API_KEY=
RESEND_WEBHOOK_SECRET=       # Svix secret pt /api/webhooks/resend (bounce alerts)
SMSLINK_API_KEY=
CLOUDCONVERT_API_KEY=        # DOCX→PDF preview in admin (optional; dev uses local LibreOffice)
NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID=  # ChatGPT Ads pixel (public); docs/ads/chatgpt/06
OPENAI_ADS_API_KEY=          # ChatGPT Ads Conversions API (secret; fără ea serverul nu trimite conversii)
NEXT_PUBLIC_META_PIXEL_ID=   # Meta Pixel (public); docs/ads/meta/05
META_CAPI_ACCESS_TOKEN=      # Meta Conversions API (secret)
```
