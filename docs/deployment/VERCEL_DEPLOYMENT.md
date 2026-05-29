# Vercel Deployment — eghiseul.ro

**Last Updated:** 2026-05-29
**Project:** `rlutas-projects-f53fc8de/eghiseul-ro`
**Test URL:** https://eghiseul-ro.vercel.app
**Status:** Live for internal testing (Stripe **TEST** mode)

Runbook for the Vercel deployment + payment setup. See also
[`DEPLOY-CHECKLIST.md`](./DEPLOY-CHECKLIST.md) and
[`PRODUCTION_SECURITY_SETUP.md`](./PRODUCTION_SECURITY_SETUP.md).

---

## 1. Environment variables

All env vars live in Vercel → Settings → Environment Variables (Production +
Preview). Source of truth for the full list + how they map to code:
`CLAUDE.md` (Environment Variables) and the generated `.env.production.local`
(gitignored).

**Gotchas learned the hard way:**

- **Env changes require a redeploy.** Vercel binds env vars at build/deploy
  time. Adding or editing a var does NOT affect the running deployment until you
  redeploy (`vercel redeploy <prod-url>`). Symptom of forgetting: vars show in
  the dashboard but the app behaves as if empty.
- **`NEXT_PUBLIC_*` are baked into the client bundle at build time** — a redeploy
  is mandatory for them, not just a restart.
- **`NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_SITE_URL` must match the domain you
  actually serve.** Currently `https://eghiseul-ro.vercel.app`. They drive
  Stripe success/cancel redirects and auth/email links — if set to an
  unconnected domain (e.g. `eghiseul.ro` before DNS is pointed here), payment
  redirects and emails break.
- `vercel env pull` shows encrypted/sensitive vars as empty `""` — that does NOT
  mean they're unset; sensitive values just can't be read back.

### Useful commands

```bash
vercel link --project eghiseul-ro          # link local dir to the project
vercel env ls                              # list var names + environments (no values)
vercel env rm  NAME production --yes        # remove
printf "%s" "VALUE" | vercel env add NAME production   # add (reads value from stdin)
vercel redeploy https://eghiseul-<id>-rlutas-projects-f53fc8de.vercel.app  # rebuild w/ current env
vercel ls eghiseul-ro                       # recent deployments + ages
```

> Note: on the CLI version in use (50.39.x), `vercel env add … preview` can
> fail intermittently. Production adds are reliable. If colleagues test via
> git-branch **preview** URLs, set the Preview vars via the dashboard.

---

## 2. Stripe webhook (TEST mode)

Order status only advances after payment via the Stripe webhook, so the endpoint
+ signing secret must be correct.

- **Endpoint:** `https://eghiseul-ro.vercel.app/api/webhooks/stripe/`
  **← trailing slash is required** (`next.config.ts` has `trailingSlash: true`).
  Without it Stripe gets a `308` redirect and delivery fails (Stripe does not
  follow redirects).
- **Events:** `checkout.session.completed`, `payment_intent.succeeded`,
  `payment_intent.payment_failed`, `charge.refunded`
  (handled in `src/app/api/webhooks/stripe/route.ts`).
- **Signing secret** → Vercel `STRIPE_WEBHOOK_SECRET` (must equal the endpoint's
  `whsec_…`). Test endpoint id: `we_1TcKAEQZ4o0fUl1zYgXuO08W`.

Health check (unsigned POST should be `400` = endpoint alive and verifying
signatures):

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST -d '{}' \
  https://eghiseul-ro.vercel.app/api/webhooks/stripe/      # expect 400
```

---

## 3. How to test a payment

1. Open https://eghiseul-ro.vercel.app, start an order (e.g. Cazier Judiciar).
2. Complete the wizard (KYC docs + selfie, signature).
3. At checkout pay with a **Stripe test card**: `4242 4242 4242 4242`, any
   future expiry, any CVC, any postal code.
4. Expect redirect back to `…/comanda/...` success page.
5. Verify in admin (`/admin/orders`) that the order moved to `paid` and an Oblio
   invoice number was issued.

Watch webhook deliveries: Stripe Dashboard → Developers → Webhooks → the
endpoint → recent deliveries (look for `200`).

---

## 4. Before going LIVE (real customers)

- [ ] Connect the real domain (e.g. `eghiseul.ro`) to the project; update
      `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_SITE_URL` to it; redeploy.
- [ ] Swap Stripe keys to **LIVE** (`sk_live_…`, `pk_live_…`).
- [ ] Create a **LIVE-mode** Stripe webhook for the live domain; set its
      `whsec_…` as `STRIPE_WEBHOOK_SECRET`; redeploy.
- [ ] Confirm Oblio series/CIF are the production invoicing values.
- [ ] Set Preview env vars (or disable preview deploys) so branch URLs don't
      leak a half-configured app.
```
