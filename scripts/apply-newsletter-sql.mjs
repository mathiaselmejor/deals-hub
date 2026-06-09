#!/usr/bin/env node
/** Aplica solo la tabla newsletter_subscribers en Supabase. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i > 0) process.env[t.slice(0, i)] ??= t.slice(i + 1);
  }
}

const token = process.env.SB_ACCESS_TOKEN ?? process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF ?? "xawuoysscwpkzwhkxruu";
if (!token) {
  console.error("Falta SB_ACCESS_TOKEN");
  process.exit(1);
}

const sql = `
create table if not exists public.newsletter_subscribers (
  email text primary key,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
drop policy if exists "Service manages newsletter subscribers" on public.newsletter_subscribers;
create policy "Anyone can subscribe to newsletter"
  on public.newsletter_subscribers for insert with check (true);
create policy "Service manages newsletter subscribers"
  on public.newsletter_subscribers for all
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());
`;

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});
const body = await res.text();
console.log(res.ok ? "✓ newsletter_subscribers OK" : `✗ ${res.status}: ${body.slice(0, 300)}`);
process.exit(res.ok ? 0 : 1);
