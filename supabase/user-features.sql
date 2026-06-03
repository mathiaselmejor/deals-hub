-- Favoritos, alertas de precio y señales para recomendaciones
-- Ejecutar después de schema.sql

create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.price_alerts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  target_price numeric(10, 2) not null,
  price_at_create numeric(10, 2),
  active boolean not null default true,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- Alertas por email sin cuenta (opt-in público)
create table if not exists public.price_alert_leads (
  id bigint generated always as identity primary key,
  email text not null,
  product_id text not null,
  target_price numeric(10, 2) not null,
  active boolean not null default true,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (email, product_id)
);

alter table public.price_alerts
  add column if not exists price_at_create numeric(10, 2);

alter table public.price_alerts
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.user_signals (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  session_id text,
  signal_type text not null check (signal_type in ('view', 'click', 'search', 'favorite')),
  product_id text,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists favorites_user_idx on public.favorites (user_id);
create index if not exists price_alerts_user_idx on public.price_alerts (user_id, active);
create index if not exists user_signals_user_idx on public.user_signals (user_id, created_at desc);
create index if not exists user_signals_session_idx on public.user_signals (session_id, created_at desc);

alter table public.favorites enable row level security;
alter table public.price_alerts enable row level security;
alter table public.price_alert_leads enable row level security;
alter table public.user_signals enable row level security;

create policy "Users manage own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own price alerts"
  on public.price_alerts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Anyone can create price alert leads"
  on public.price_alert_leads for insert
  with check (true);

create policy "Service reads price alert leads"
  on public.price_alert_leads for select
  using (public.current_user_is_admin());

create policy "Insert signals"
  on public.user_signals for insert
  with check (user_id is null or auth.uid() = user_id);

create policy "Users read own signals"
  on public.user_signals for select
  using (auth.uid() = user_id);

create policy "Admins read all signals"
  on public.user_signals for select
  using (public.current_user_is_admin());

-- Newsletter semanal (resumen de chollos)
create table if not exists public.newsletter_subscribers (
  email text primary key,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

create policy "Anyone can subscribe to newsletter"
  on public.newsletter_subscribers for insert
  with check (true);

create policy "Service manages newsletter subscribers"
  on public.newsletter_subscribers for all
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());
