# HTTP API

All endpoints are Next.js route handlers under `app/api/`. Request and response bodies are JSON unless noted; inputs are validated with Zod. Paths below are relative to `NEXT_PUBLIC_APP_URL`.

Authentication types used in the tables:

| Type | Meaning |
| --- | --- |
| public | no credentials |
| customer | identifies the customer by `customerId` (from the phone login); see `SECURITY.md` |
| session | Supabase session cookie of an owner or barista (`auth.getUser()`); many routes additionally require `role = 'owner'` |
| barista | session of an active staff user whose organization matches the QR token |
| cron | `Authorization: Bearer <CRON_SECRET>` |
| webhook | `x-webhook-secret: <POS_WEBHOOK_SECRET>`, compared in constant time |

`{slug}` is the cafe's internal slug. The customer app at `/` resolves it for you; `GET /api/public/{slug}/info` returns it.

---

## Setup

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/setup` | public | `{ needsSetup }`: whether the owner account still has to be created |
| POST | `/api/setup` | public, first run only | `{ email, password, fullName, orgName }` creates the owner and the organization; `403` once an organization exists |

## Customer app (`/api/public/{slug}`)

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `login` | public | `{ phone, fullName? }` (E.164 `+90` format today). Finds or creates the customer, loyalty card with a welcome stamp and signup visit; sets the signed `httpOnly` session cookie; returns `{ customer, isNew }` |
| GET | `info` | public | cafe name, slug, logo, banner, color, city, address |
| GET | `theme` | public | `{ config, tokens }`: the `PwaConfig` merged over defaults and its generated CSS tokens |
| GET | `manifest` | public | per-cafe web app manifest |
| GET | `icon/{192,512}` | public | square PNG home-screen icon generated from the logo |
| GET | `menu` | public | active menu items |
| GET | `campaigns` | public / customer | active campaigns (excluding ones the customer already redeemed when `customerId` is given) |
| GET | `card?customerId=` | customer | customer and loyalty card with program |
| GET | `visits?customerId=&limit=` | customer | recent visits |
| GET | `offers?customerId=` | customer | active personal offers (`customer_offers`) |
| GET | `deals`, `notifications` | customer | personalised deals and notification history |
| GET | `streak?customerId=` | customer | current and longest streak, grace availability |
| GET | `challenges?customerId=` | customer | active challenge and completed count |
| POST | `qr/generate` | customer | `{ customerId, type: stamp | reward | campaign | subscription, campaignId?, redemptionId?, subscriptionId? }` returns a 2-minute HMAC token and the QR payload |
| GET | `qr/status?token=` | public | `{ used }`, polled by the QR overlay |
| POST | `offer/claim` | customer | `{ customerId, offerId }` atomically flips the offer to `claimed` and returns an `offer` QR token |
| POST | `reward/claim` | customer | creates a pending redemption for a full card (one at a time) |
| POST | `campaign/claim` | customer | prepares a campaign redemption |
| GET/POST | `subscription/check`, `subscription/show`, `subscription/redeem` | customer | drink-subscription status and redemption (daily limit per plan) |
| PATCH | `customer/notifications` | customer | toggles push opt-in |
| POST | `customer/delete` | customer | removes personal data and push subscription |

## Push

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/push/subscribe` | customer | `{ customerId, orgId, subscription }` stores the Web Push subscription |
| POST | `/api/push/click` | customer | called by the service worker; records `clicked_at` on the notification |

## Barista

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/barista/manifest` | public | barista PWA manifest (`scope: /barista/`) |
| GET | `/api/barista/setup/validate?t=` | public | checks a device setup token |
| POST | `/api/barista/setup` | setup token | `{ t, password }` consumes the token, sets the password, signs in, sets the `barista_handle` cookie |
| GET | `/api/barista/whoami?handle=` | public | display name and cafe for the remembered device |
| POST | `/api/barista/verify` | barista | `{ token }` shows the customer, stamps and offer or campaign details for a scanned QR |
| POST | `/api/barista/confirm` | barista | `{ token, drinkName?, menuItemId? }` consumes the token atomically and records the visit, reward, campaign, offer or subscription redemption |
| GET | `/api/barista/recent` | barista | recent confirmations at the barista's branch |

## Owner dashboard

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET, PUT | `/api/org` | session | read and update the organization (name, color, logo, `pwa_config`, discount bounds, onboarding flag) |
| POST | `/api/brand/extract` | session | `{ url }` runs the brand extractor; returns `{ brand, config, confidence }` |
| POST, DELETE | `/api/storage/upload` | session | multipart upload of `logo`, `banner` or `menu` images |
| POST | `/api/locations` | owner | create a branch |
| GET | `/api/branches` | session | branches with metrics |
| GET, POST | `/api/staff` | owner | list staff; create a barista for a branch (returns a setup token) |
| DELETE | `/api/staff/{id}` | owner | remove a staff account |
| POST | `/api/staff/{id}/setup-token` | owner | issue a new 24-hour setup token (revokes older ones) |
| GET, POST | `/api/menu-items`; PUT, DELETE `/api/menu-items/{id}` | session | menu management |
| GET, POST | `/api/loyalty/rewards`; POST, PUT `/api/loyalty/redeem` | session | rewards and manual redemption |
| POST | `/api/campaigns/send` | session or cron | `{ campaignId }` sends a campaign to its target RFM segment and locations |
| POST | `/api/campaigns/rfm`, `/api/campaigns/churn` | session | recompute RFM segments or churn risk on demand |
| GET | `/api/hub-earnings` | session | earnings breakdown by segment for a period and optional location |
| GET | `/api/analytics/activity-feed`, `/api/analytics/campaign-performance` | session | hub feeds |
| GET | `/api/reviews`; POST `/api/reviews/{id}/reply` | session | Google reviews and replies |
| GET | `/api/google/connect`; GET `/api/google/callback` | session; OAuth redirect | connect a branch to Google Business Profile |
| GET | `/api/instagram/connect`; POST `save-token`, `disconnect` | session | connect Instagram |
| POST | `/api/influencers/discover`; DELETE `/api/influencers/{id}` | session | run discovery now; remove an influencer |

## Jobs (`/api/cron/*`)

All accept `POST` (and `GET`) with the cron secret. See the schedule in [self-hosting](self-hosting.md#scheduled-jobs) and the behaviour in [engines](engines.md).

`daily-intelligence`, `notification-queue`, `campaign-scheduler`, `hourly-weather`, `birthday-check`, `weekly-rfm`, `weekly-model-update`, `weekly-measurement`, `sync-reviews`, `discover-influencers`, `cleanup-influencers`, `dead-hour-trigger` (no-op kept for compatibility; dead-hour targeting runs inside `daily-intelligence`).

## Webhooks

| Method | Path | Auth | Body |
| --- | --- | --- | --- |
| POST | `/api/webhooks/pos/adisyo` | webhook | `{ order_id, location_api_key, total_amount, items?, payment_method?, receipt_number?, timestamp? }` |
| POST | `/api/webhooks/pos/simpra` | webhook | `{ orderId, apiKey, totalAmount, orderItems?, paymentType?, receiptNumber?, orderDate? }` |

Both resolve the branch by its POS API key, attach the order to a recent unmatched visit at that branch (5-minute window) and auto-redeem a pending reward. Responses: `401` bad secret, `404` unknown branch, `503` when `POS_WEBHOOK_SECRET` is not configured.

## Errors

Errors are returned as `{ "error": "<message>" }` with a meaningful status: `400` validation, `401` unauthenticated, `403` wrong role or organization, `404` not found, `409` already used or duplicate, `429` double scan, `500` server error. Customer-facing messages are in Turkish.
