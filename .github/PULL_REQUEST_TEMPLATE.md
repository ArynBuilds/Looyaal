## What and why

<!-- What does this change, and what problem does it solve? Link issues with "Fixes #123". -->

## How it was tested

<!-- Steps you ran, data you used, screenshots or recordings for UI changes (customer, barista, dashboard). -->

## Checklist

- [ ] `npx tsc --noEmit`, `npm run lint` and `npm run build` pass
- [ ] No file exceeds 500 lines; inputs are validated with Zod; no `any`
- [ ] The service-role key is only used server-side
- [ ] New tables have `org_id` and RLS (`get_user_org_id()`), in a new migration file
- [ ] New or changed environment variables are in `.env.example` and the README
- [ ] Docs updated (`README.md`, `docs/`) if behaviour, endpoints or engine constants changed
- [ ] Engine changes include an executable check and consider cold-start cafes, multiple branches and customers without push
