#!/usr/bin/env node
/**
 * Sincroniza .env.local → Vercel vía REST API (sin depender de npx en PATH).
 */
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import crypto from "crypto";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const SYNC_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_EMAILS",
  "NEXT_PUBLIC_AMAZON_TAG",
  "NEXT_PUBLIC_AWIN_PUBLISHER_ID",
  "NEXT_PUBLIC_EBAY_CAMPAIGN_ID",
  "NEXT_PUBLIC_ALIEXPRESS_TRACKING_ID",
  "NEXT_PUBLIC_ALIEXPRESS_TRACKING_NAME",
  "NEXT_PUBLIC_SITE_URL",
  "CRON_SECRET",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "GEMINI_API_KEY",
  "GOOGLE_GENERATIVE_AI_API_KEY",
  "AWIN_ACCESS_TOKEN",
  "NEXT_PUBLIC_TRADEDOUBLER_SITE_ID",
  "NEXT_PUBLIC_TRADETRACKER_ID",
  "SB_ACCESS_TOKEN",
  "SUPABASE_ACCESS_TOKEN",
];

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i > 0) out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

function loadVercelToken() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN;
  const candidates = [
    path.join(os.homedir(), "AppData", "Roaming", "xdg.data", "com.vercel.cli", "auth.json"),
    path.join(os.homedir(), ".vercel", "auth.json"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf-8")).token;
    }
  }
  throw new Error("No Vercel token. Ejecuta: npx vercel login");
}

async function api(token, method, urlPath, body) {
  const res = await fetch(`https://api.vercel.com${urlPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 300)}`);
  return data;
}

const envPath = path.join(root, ".env.local");
const env = loadEnvFile(envPath);

if (!env.CRON_SECRET) {
  env.CRON_SECRET = crypto.randomBytes(32).toString("hex");
  let lines = fs.readFileSync(envPath, "utf-8");
  lines = lines.includes("CRON_SECRET=")
    ? lines.replace(/CRON_SECRET=.*/g, `CRON_SECRET=${env.CRON_SECRET}`)
    : `${lines.trimEnd()}\nCRON_SECRET=${env.CRON_SECRET}\n`;
  fs.writeFileSync(envPath, lines);
  console.log("🔑 CRON_SECRET generado → .env.local");
}
if (!env.NEXT_PUBLIC_SITE_URL) env.NEXT_PUBLIC_SITE_URL = "https://deals-hub-iota.vercel.app";

const token = loadVercelToken();
const teams = await api(token, "GET", "/v2/teams");
const team = teams.teams?.find((t) => t.slug === "deals2") || teams.teams?.[0];
const teamParam = team ? `?teamId=${team.id}` : "";

const projects = await api(token, "GET", `/v9/projects${teamParam}`);
const project = projects.projects?.find((p) => p.name === "deals-hub");
if (!project) throw new Error("Proyecto deals-hub no encontrado en Vercel");

const existing = await api(token, "GET", `/v9/projects/${project.id}/env${teamParam}`);
const byKey = new Map((existing.envs || []).map((e) => [`${e.key}:${e.target?.join(",")}`, e]));

let created = 0;
for (const key of SYNC_KEYS) {
  const value = env[key];
  if (!value) continue;
  for (const target of ["production", "preview", "development"]) {
    const exists = [...byKey.keys()].some((k) => k.startsWith(`${key}:`) && k.includes(target));
    if (exists) {
      console.log(`  ≈ ${key}@${target} (ya existe)`);
      continue;
    }
    try {
      await api(token, "POST", `/v10/projects/${project.id}/env${teamParam}`, {
        key,
        value,
        type: key.includes("SECRET") || key.includes("KEY") || key === "CRON_SECRET" ? "encrypted" : "plain",
        target: [target],
      });
      console.log(`  ✓ ${key} → ${target}`);
      created++;
    } catch (e) {
      if (/already exists|ENV_ALREADY_EXISTS/i.test(String(e.message))) {
        console.log(`  ≈ ${key}@${target}`);
      } else {
        console.error(`  ✗ ${key}@${target}:`, e.message.slice(0, 120));
      }
    }
  }
}

console.log(`\n✅ Vercel API: ${created} variables nuevas. Proyecto: ${project.name}`);
