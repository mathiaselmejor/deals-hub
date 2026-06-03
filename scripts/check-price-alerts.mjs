#!/usr/bin/env node
/**
 * Dispara comprobación de alertas (local o producción).
 * Uso: node scripts/check-price-alerts.mjs
 * Requiere CRON_SECRET en .env.local
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const secret = process.env.CRON_SECRET;
const base =
  process.env.PRICE_ALERTS_CRON_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://deals-hub-iota.vercel.app";

if (!secret) {
  console.error("Falta CRON_SECRET en .env.local");
  process.exit(1);
}

const url = `${base}/api/cron/check-price-alerts`;
const res = await fetch(url, {
  method: "POST",
  headers: { "x-cron-secret": secret },
});
const body = await res.json();
console.log(res.status, JSON.stringify(body, null, 2));
process.exit(res.ok ? 0 : 1);
