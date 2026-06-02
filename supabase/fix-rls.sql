-- Corrige recursión infinita en políticas RLS de profiles
-- Ejecutar en Supabase → SQL Editor

create or replace function public.current_user_is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

drop policy if exists "Admins read all profiles" on public.profiles;
drop policy if exists "Admins read analytics" on public.analytics_events;

create policy "Admins read all profiles"
  on public.profiles for select
  using (public.current_user_is_admin());

create policy "Admins read analytics"
  on public.analytics_events for select
  using (public.current_user_is_admin());
