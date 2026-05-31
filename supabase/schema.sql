-- Ejecuta esto en Supabase → SQL Editor
-- https://supabase.com/dashboard

-- Perfiles de usuario (se crea al registrarse)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  provider text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

-- Eventos para el panel de administración
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in ('page_view', 'product_click', 'search', 'affiliate_click', 'login')),
  payload jsonb not null default '{}',
  user_id uuid references auth.users (id) on delete set null,
  session_id text,
  path text,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_type_idx on public.analytics_events (event_type);

-- Auto-crear perfil al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_app_meta_data->>'provider'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.analytics_events enable row level security;

-- Usuario ve su propio perfil
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Cualquiera puede insertar eventos (anónimo o logueado)
create policy "Anyone can insert analytics"
  on public.analytics_events for insert
  with check (true);

-- Solo admins leen analytics (por is_admin en profiles)
create policy "Admins read analytics"
  on public.analytics_events for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

create policy "Admins read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- IMPORTANTE: Hazte admin (cambia el email por el tuyo)
-- update public.profiles set is_admin = true where email = 'tu-email@gmail.com';
