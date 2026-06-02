#!/usr/bin/env node
/**
 * Sincroniza estado de programas Awin (joined/pending/notjoined).
 * Requiere AWIN_ACCESS_TOKEN en .env.local (ui.awin.com → API Credentials).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const programsFile = path.join(root, "data", "awin-programs-es.json");
const statusFile = path.join(root, "data", "awin-program-status.json");

function loadEnv() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const out = {};
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const env = { ...process.env, ...loadEnv() };
const token = env.AWIN_ACCESS_TOKEN;
const publisherId = env.NEXT_PUBLIC_AWIN_PUBLISHER_ID || "2917459";

if (!token) {
  console.error("Falta AWIN_ACCESS_TOKEN — obtén el token en https://ui.awin.com/awin-api");
  process.exit(1);
}

const programs = JSON.parse(fs.readFileSync(programsFile, "utf-8")).programs;
const status = { updatedAt: new Date().toISOString(), publisherId, programs: {} };

for (const rel of ["joined", "pending", "notjoined", "rejected", "suspended"]) {
  const url = `https://api.awin.com/publishers/${publisherId}/programmes?relationship=${rel}&countryCode=ES&accessToken=${token}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`API ${rel}: HTTP ${res.status}`);
    continue;
  }
  const list = await res.json();
  for (const prog of list) {
    const local = programs.find((p) => p.merchantId === String(prog.id));
    if (local) {
      status.programs[local.storeId] = {
        merchantId: local.merchantId,
        name: prog.name,
        status: rel,
      };
      console.log(`${rel.padEnd(10)} ${local.storeId} (${prog.name})`);
    }
  }
}

for (const p of programs) {
  if (!status.programs[p.storeId]) {
    status.programs[p.storeId] = { merchantId: p.merchantId, name: p.name, status: "unknown" };
    console.log(`unknown    ${p.storeId}`);
  }
}

fs.writeFileSync(statusFile, JSON.stringify(status, null, 2) + "\n", "utf-8");
console.log(`\n✓ ${statusFile}`);
