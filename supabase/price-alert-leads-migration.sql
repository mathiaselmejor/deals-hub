-- Migración incremental: alertas por email + columnas extra (idempotente)

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

alter table public.price_alert_leads enable row level security;

drop policy if exists "Anyone can create price alert leads" on public.price_alert_leads;
create policy "Anyone can create price alert leads"
  on public.price_alert_leads for insert
  with check (true);

drop policy if exists "Service reads price alert leads" on public.price_alert_leads;
create policy "Service reads price alert leads"
  on public.price_alert_leads for select
  using (public.current_user_is_admin());

create index if not exists price_alert_leads_email_idx on public.price_alert_leads (email, active);
