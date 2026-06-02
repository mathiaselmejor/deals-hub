import { NextResponse } from "next/server";

export const maxDuration = 60;

const GITHUB_REPO = "mathiaselmejor/deals-hub";
const WORKFLOW_FILE = "refresh-catalog.yml";

/** Vercel Cron: dispara GitHub Actions (el motor no puede escribir JSON en serverless). */
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

  const ghToken = process.env.GITHUB_TOKEN ?? process.env.GITHUB_PAT;

  if (ghToken) {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ghToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ref: "main" }),
      },
    );

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { ok: false, error: "GitHub dispatch failed", detail: detail.slice(0, 500) },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      provider: "github-actions",
      message: "Workflow refresh-catalog disparado",
    });
  }

  return NextResponse.json({
    ok: true,
    provider: "github-actions-scheduled",
    message:
      "El catálogo se actualiza automáticamente cada 6 h en GitHub Actions. Opcional: añade GITHUB_TOKEN en Vercel para disparar desde este cron.",
  });
}

export async function GET(request: Request) {
  return POST(request);
}
