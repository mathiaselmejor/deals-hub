const fs = require("fs");
const https = require("https");

const PROJECT_REF = "xawuoysscwpkzwhkxruu";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use Supabase SQL via postgres meta - run through pg if DATABASE_URL set
const sql = fs.readFileSync("supabase/schema.sql", "utf8")
  .replace(/^--.*$/gm, "")
  .trim();

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("Set DATABASE_URL (postgres connection string from Supabase Settings > Database)");
    process.exit(1);
  }
  const { Client } = require("pg");
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);
  console.log("Schema applied successfully.");
  await client.end();
}

main().catch((e) => { console.error(e.message); process.exit(1); });
