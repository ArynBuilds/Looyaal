# Contributing to Looyaal

Thank you for helping. Looyaal is used by real cafes, so we value small, well-explained, tested changes over large rewrites.

## Ways to contribute

- **Report a bug** with the bug report template. Include steps, expected and actual behaviour, logs (`docker compose logs app`) and your version.
- **Propose a feature** with the feature request template before writing a large change, so we can agree on the approach.
- **Improve the docs.** If something in `docs/` does not match the code, the code wins; please fix the doc.
- **Security issues** go through private reporting, never public issues. See [SECURITY.md](SECURITY.md).

Good first areas: translations of customer-facing copy, a holdback group for incremental-lift measurement, new UI variants, the known engine issues in [docs/engines.md](docs/engines.md#21-known-limitations).

## Development setup

You need Node.js 22, npm and Docker with Compose v2.

```bash
git clone <your fork> looyaal && cd looyaal
npm ci
cp .env.example .env
node scripts/generate-secrets.mjs
docker compose up -d kong auth rest storage db migrate    # Supabase only
LOOYAAL_SCHEDULER=off npm run dev                          # app with hot reload
```

Open `http://localhost:3000`, create the owner account and run through onboarding. To exercise a job manually:

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/daily-intelligence
```

Supabase Studio is available with `docker compose --profile studio up -d`.

## Checks

Run these before every pull request; CI runs the same:

```bash
npx tsc --noEmit
npm run lint
npm run build
npx tsx lib/thompson-sampling.test.ts
```

Changes to scoring, learning or attribution logic should come with a small executable check in the same style as `lib/thompson-sampling.test.ts` or `scripts/check-customer-session.ts` (plain `node:assert`, run with `npx tsx`).

## Code conventions

- **TypeScript strict, no `any`.** Use proper types or `unknown` with narrowing.
- **No file over 500 lines.** One module, one concern. Split by responsibility, not by line count. No barrel files that re-export everything.
- **Server Components by default**; add `'use client'` only when a component needs browser APIs or state.
- **Validate every input with Zod**: API bodies, query parameters, form data.
- **Named exports**, except Next.js pages and layouts.
- **Supabase clients**: use `lib/supabase/server.ts` to identify the signed-in user, `lib/supabase/admin.ts` (service role) for data access after your own authorization check. The service-role key must never reach client code.
- **Tenancy**: every new table gets `org_id`, RLS enabled and a policy using `get_user_org_id()`. Tables holding tokens or secrets get RLS with no policies (service role only).
- **Schema changes** go in a new, timestamped file in `supabase/migrations/` (`YYYYMMDDHHMMSS_description.sql`). Never edit an applied migration; the `migrate` service applies files once, in filename order. Regenerate `types/database.ts` when the schema changes.
- **Time**: store timestamps in UTC; store derived local fields (day of week, hour) in the location's time zone using `lib/timezone.ts`.
- **UI variants** use only design tokens (`var(--...)`) and `cqw` units; see [docs/pwa-builder.md](docs/pwa-builder.md#13-adding-a-new-variant).
- **Copy**: customer-facing text is Turkish first today; keep new strings easy to extract for translation. No emojis in the UI.
- **Never build backend without UI or UI without backend.** A feature is done when an owner, barista or customer can use it.
- **Engines**: keep scoring functions pure (no database calls) like `lib/nba-engine.ts`, and document new constants in `docs/engines.md`.

## Commits and pull requests

- Branch from the default branch; keep one logical change per pull request.
- Write commit messages in the imperative mood (`Add weather context to dead-hour scoring`). Reference issues with `Fixes #123`.
- Fill in the pull request template: what changed, why, how you tested it, screenshots for UI changes, and whether migrations or environment variables are involved.
- Update `README.md`, `docs/` and `.env.example` when behaviour, configuration or endpoints change.
- A maintainer reviews every pull request. Expect questions about edge cases: cold-start cafes with little data, multiple branches in different time zones, and customers without push subscriptions.

## License

By contributing you agree that your contributions are licensed under the [MIT License](LICENSE).
