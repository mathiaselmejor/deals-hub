-- Programa de referidos DealsHub
-- Ejecutar en Supabase SQL Editor después de schema.sql

create table if not exists public.referral_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.referral_clicks (
  id bigint generated always as identity primary key,
  code text not null references public.referral_profiles (code) on delete cascade,
  session_id text,
  landing_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.referral_conversions (
  id bigint generated always as identity primary key,
  code text not null references public.referral_profiles (code) on delete cascade,
  product_id text,
  store text,
  order_amount_eur numeric(10, 2),
  commission_eur numeric(10, 2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  external_ref text,
  created_at timestamptz not null default now()
);

create table if not exists public.referral_rewards (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  period_key text not null,
  confirmed_sales int not null default 0,
  gross_commission_eur numeric(10, 2) not null default 0,
  reward_eur numeric(10, 2) not null default 0,
  max_reward_eur numeric(10, 2) not null default 0,
  status text not null default 'eligible' check (status in ('eligible', 'paid', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (user_id, period_key)
);

create index if not exists referral_clicks_code_idx on public.referral_clicks (code, created_at desc);
create index if not exists referral_conversions_code_idx on public.referral_conversions (code, status);

alter table public.referral_profiles enable row level security;
alter table public.referral_clicks enable row level security;
alter table public.referral_conversions enable row level security;
alter table public.referral_rewards enable row level security;

create policy "Users read own referral profile"
  on public.referral_profiles for select
  using (auth.uid() = user_id);

create policy "Users insert own referral profile"
  on public.referral_profiles for insert
  with check (auth.uid() = user_id);

create policy "Anyone insert referral clicks"
  on public.referral_clicks for insert
  with check (true);

create policy "Users read own conversions via profile"
  on public.referral_conversions for select
  using (
    code in (select code from public.referral_profiles where user_id = auth.uid())
  );

create policy "Users read own rewards"
  on public.referral_rewards for select
  using (auth.uid() = user_id);

create policy "Admins manage referrals"
  on public.referral_profiles for all
  using (public.current_user_is_admin());

create policy "Admins read referral clicks"
  on public.referral_clicks for select
  using (public.current_user_is_admin());

create policy "Admins manage conversions"
  on public.referral_conversions for all
  using (public.current_user_is_admin());

create policy "Admins manage rewards"
  on public.referral_rewards for all
  using (public.current_user_is_admin());
