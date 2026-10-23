# Security policy

## Supported versions

Looyaal is self-hosted. Security fixes land on the default branch and in the next release; please run the latest release.

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Use GitHub's private vulnerability reporting ("Security" tab, "Report a vulnerability") on this repository. Include the affected version or commit, the endpoint or file, reproduction steps and the impact you observed.

We aim to acknowledge reports within 3 working days and to agree on a disclosure date with you once a fix is available. We are happy to credit reporters in the release notes.

---

## Security model

Looyaal is designed for one cafe per install, operated by the cafe owner on their own infrastructure. It handles customer phone numbers, visit history and marketing preferences. It does not process payments and stores no card data.

### Actors

| Actor | Authenticates with | Can do |
| --- | --- | --- |
| Owner | Supabase Auth (email + password), created once on first run | manage the cafe, staff, app design, campaigns, integrations |
| Barista | Supabase Auth (password set by the barista after QR pairing) | scan and confirm customer QR codes at their assigned branch |
| Customer | **phone number only** (see below) | view their own card and offers, show QR codes, manage notifications, delete their data |
| Scheduler | `CRON_SECRET` bearer token | call `/api/cron/*` |
| POS system | `POS_WEBHOOK_SECRET` header (constant-time comparison) | attach receipts to visits |

### Customer login is phone-only: the trade-off

Customers sign in by typing their phone number. **There is no SMS code.** This keeps the first visit to a few seconds and removes the cost and the third-party dependency of an SMS provider, but it means:

> Anyone who types another person's phone number into the cafe's app gets access to that person's loyalty card: their name, stamp count, visit history and personal offers.

What limits the damage:

- **Nothing of value moves without the barista.** Every stamp, reward, campaign, offer and subscription redemption requires a barista to scan a QR code at the counter and confirm it. QR tokens are HMAC-derived, stored server-side, valid for **2 minutes** and consumed with an atomic compare-and-set, so each can be used exactly once. A barista sees the customer's name before confirming.
- **Abuse limits at the counter.** A second stamp for the same customer at the same branch within 30 seconds is rejected; a customer can hold only one pending reward claim at a time; each campaign can be redeemed once per customer (database unique constraint); personal offers are claimed atomically.
- **Low-value data.** No payment data, addresses or passwords are stored for customers. The phone number itself is the thing the attacker already knows.
- **Visible activity.** Unexpected redemptions show up in the owner's activity feed and the barista's recent list.

What it does **not** protect against: someone reading another customer's card or redeeming their earned reward in person by presenting their QR code to a barista who does not check the name. If this matters for your cafe, ask baristas to confirm the name shown on the scan screen for rewards, put rate limiting in front of `/api/public/*/login` at your reverse proxy, and consider contributing an optional verification step (see "Possible hardening" below).

### Customer session

After login the server sets an `httpOnly`, `Secure`, `SameSite=Lax` cookie containing `base64url({ phone, exp }).HMAC-SHA256(CUSTOMER_SESSION_SECRET)`, valid for one year (`lib/customer-session.ts`; verification uses a constant-time comparison). The PWA additionally keeps the customer record (including the customer id, a random UUID) on the device so the session survives the browser-to-installed-app transition. Customer API routes identify the customer by that id and scope every query to the cafe; treat the customer id as a credential and never log or expose it in URLs you share.

### Staff accounts

- The owner is created once through `/api/setup`; the endpoint is refused once an organization exists. After setup, set `DISABLE_SIGNUP=true` to close GoTrue's public sign-up endpoint.
- Baristas are created by the owner through the GoTrue admin API with a random internal email. Pairing uses a single-use setup token valid for 24 hours: 24 random hex characters plus an 8-character HMAC tag (`BARISTA_SETUP_SECRET`), stored server-side, revoked when a new one is issued and consumed atomically. The barista then sets their own password (minimum 8 characters).
- Barista actions check that the user is active and belongs to the same organization as the scanned token, and a barista must be assigned to a branch to confirm visits.

### Data access

- Every business table carries `org_id` and has row-level security enabled. Owner and barista JWTs can only reach rows where `org_id = get_user_org_id()`.
- Token and session tables (`qr_tokens`, `barista_setup_tokens`, `active_sessions`, `weather_data`) have RLS enabled with no policies, so only the service role can read them.
- The service-role key is used only in server code (`lib/supabase/admin.ts`) and is never sent to the browser. Customer routes, jobs and webhooks use it after doing their own authorization.
- Storage buckets are public-read (logos, banners and menu photos are shown to anonymous customers); writes are restricted to the owner's own `<org_id>/` folder.
- Postgres is not published by `docker-compose.yml`; Kong is the only public Supabase entry point.

### Outbound requests

The brand extractor fetches owner-supplied URLs through `lib/extractor/safe-fetch.ts`: http(s) only, every hostname (including each redirect hop, at most 4) must resolve to public IP addresses, and bodies are time-boxed and size-capped (3 MB page, 1.5 MB per stylesheet, 2 MB logo). The endpoint requires an owner session.

### Headers

`next.config.ts` sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` and `Referrer-Policy: strict-origin-when-cross-origin` on every response. The service worker is served with `Cache-Control: no-cache` and a restrictive `Content-Security-Policy`.

### Secrets

| Secret | Protects | Rotation impact |
| --- | --- | --- |
| `JWT_SECRET` (+ anon and service keys) | all Supabase access | everyone is signed out; regenerate both API keys |
| `POSTGRES_PASSWORD` | database roles | stored in the database; change through Postgres, not `.env` alone |
| `CUSTOMER_SESSION_SECRET` | customer cookies | customers are asked for their phone number again |
| `QR_TOKEN_SECRET` | QR token derivation | QR codes open at that moment stop working |
| `BARISTA_SETUP_SECRET` | setup tokens | unused setup QRs must be reissued |
| `CRON_SECRET`, `POS_WEBHOOK_SECRET` | jobs, POS | update your external cron or POS configuration |
| `VAPID_PRIVATE_KEY` | push | every customer must re-subscribe (they do so automatically on their next visit to the app) |

All of them are generated by `scripts/generate-secrets.mjs` and live only in `.env`. Never commit `.env`.

---

## Hardening checklist

- Serve both public origins over HTTPS only.
- Set `DISABLE_SIGNUP=true` after the owner account exists.
- Rate-limit `/api/public/*` (especially `login` and `qr/generate`) and `/api/setup` at the reverse proxy.
- Keep Postgres and the Studio profile off the public internet, or protect Studio with a strong `DASHBOARD_PASSWORD`.
- Configure SMTP so password resets work, and use a strong owner password.
- Back up `db-data`, `storage-data` and `.env`, and restrict access to the backups: they contain customer phone numbers.

## Possible hardening (contributions welcome)

- An optional verification step for customer login (SMS or WhatsApp code, or a PIN chosen on first login) behind a configuration flag.
- Verifying the signed session cookie in every customer route instead of relying on the customer id alone.
- Built-in rate limiting for public endpoints.

## Privacy

All data stays in your Postgres and storage volumes. Data leaves your server only for the integrations you enable: browser push services (notification payloads), OpenWeatherMap (city names), Google Business Profile and Instagram (OAuth tokens and API calls). Customers can delete their personal data from the app's profile screen (`/api/public/{slug}/customer/delete` clears name, email, notes, tags and the push subscription; the phone number, loyalty card and visit history remain in the cafe's records). As the operator, you are the data controller for your customers' data and are responsible for informing them according to the law that applies to your cafe.
