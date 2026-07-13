create table if not exists public.analyses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users (id) on delete set null,
    match_score numeric(5, 2) not null check (match_score between 0 and 100),
    matched_skills jsonb not null default '[]'::jsonb,
    missing_skills jsonb not null default '[]'::jsonb,
    bullet_suggestions jsonb not null default '[]'::jsonb,
    summary text not null,
    job_description text not null,
    resume_text text not null,
    created_at timestamptz not null default now()
);

create index if not exists analyses_created_at_idx
    on public.analyses (created_at desc);

create index if not exists analyses_user_id_created_at_idx
    on public.analyses (user_id, created_at desc)
    where user_id is not null;

alter table public.analyses enable row level security;

-- This application currently accesses Supabase only from FastAPI with the
-- service-role key. Browser roles receive no table privileges. The service role
-- bypasses RLS; add user-scoped policies when Supabase Auth is implemented.
drop policy if exists "Users can view own analyses" on public.analyses;
drop policy if exists "Service role can insert analyses" on public.analyses;
revoke all on table public.analyses from anon, authenticated;
grant all on table public.analyses to service_role;

comment on table public.analyses is
    'Resume/job-description analysis results written by the FastAPI service.';
