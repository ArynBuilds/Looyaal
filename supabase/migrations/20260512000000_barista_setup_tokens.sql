-- Single-use, time-bounded tokens that pair a freshly created barista
-- account to the barista's own phone during the install/setup flow.
create table public.barista_setup_tokens (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    org_id uuid not null references public.organizations(id) on delete cascade,
    token text not null unique,
    issued_by uuid references public.users(id),
    issued_at timestamptz not null default now(),
    expires_at timestamptz not null,
    consumed_at timestamptz,
    revoked_at timestamptz
);

create index barista_setup_tokens_user_idx
    on public.barista_setup_tokens (user_id)
    where consumed_at is null and revoked_at is null;

create index barista_setup_tokens_token_idx
    on public.barista_setup_tokens (token)
    where consumed_at is null and revoked_at is null;

alter table public.barista_setup_tokens enable row level security;

grant select, insert, update on public.barista_setup_tokens to service_role;
