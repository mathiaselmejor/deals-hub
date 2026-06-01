import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export const maxDuration = 300;

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 503 });
  }
  const auth = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");

  if (auth !== `Bearer ${secret}` && headerSecret !== secret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const cwd = process.cwd();
    const script = path.join(cwd, "scripts", "offer-engine.mjs");
    const { stdout, stderr } = await execAsync(`node "${script}"`, {
      cwd,
      timeout: 280000,
      env: process.env,
    });

    return NextResponse.json({
      ok: true,
      stdout: stdout.slice(-4000),
      stderr: stderr.slice(-2000),
    });
  } catch (e) {
    const err = e as { message?: string; stdout?: string; stderr?: string };
    return NextResponse.json(
      {
        ok: false,
        error: err.message,
        stdout: err.stdout?.slice(-2000),
        stderr: err.stderr?.slice(-2000),
      },
      { status: 500 },
    );
  }
}

/** Vercel Cron envía GET */
export async function GET(request: Request) {
  return POST(request);
}

