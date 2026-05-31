import fs from "fs";

const PROJECT_REF = "xawuoysscwpkzwhkxruu";
const token = process.env.SB_ACCESS_TOKEN;
if (!token) {
  console.error("Missing SB_ACCESS_TOKEN");
  process.exit(1);
}

const sql = fs.readFileSync("supabase/schema.sql", "utf8")
  .replace(/^--.*$/gm, "")
  .trim();

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: sql }),
});

const body = await res.text();
if (!res.ok) {
  console.error("SQL failed:", res.status, body);
  process.exit(1);
}
console.log("Schema applied OK");
