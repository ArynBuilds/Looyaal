# Looyaal — Notes for AI coding agents

Self-hosted customer-loyalty and AI-marketing platform for independent cafes.
Next.js 16 (App Router) + Supabase (Postgres, GoTrue, PostgREST, Storage) + TypeScript + Tailwind CSS 4.
One cafe per install. See `README.md` and `docs/` for the full architecture.

## Commands
- `npm run dev` — dev server (set `LOOYAAL_SCHEDULER=off` to keep crons quiet)
- `npm run build` — production build
- `npm run lint` — lint
- `npx tsc --noEmit` — typecheck
- `docker compose up -d --build` — full stack (Supabase + app)

## Architecture constraints
- No file may exceed 500 lines. Split by responsibility instead.
- One module = one concern. No barrel files that re-export everything.
- Prefer many small files over few large ones.
- Never ship backend without UI or UI without backend.

## Code style
- TypeScript strict, no `any`.
- Server Components by default; `'use client'` only when needed.
- Zod for all validation (API inputs, form data).
- Named exports (default exports only for Next.js pages/layouts).

## Critical rules
- Service role key: server-side only (`lib/supabase/admin.ts`), never in client code.
- API routes: SSR client (`lib/supabase/server.ts`) for auth, admin client for data.
- Every tenant table has `org_id`; RLS goes through `get_user_org_id()`.
- Customers never use Supabase Auth: they log in by phone number and get an
  HMAC-signed session cookie (`lib/customer-session.ts`).
- Schema changes go in a new file in `supabase/migrations/`; the `migrate`
  compose service applies them in filename order.
- Customer-facing copy is Turkish first. No emojis anywhere in the UI.
