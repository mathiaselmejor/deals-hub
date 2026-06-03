const RESEND_URL = "https://api.resend.com/emails";

export function isEmailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim());
}

function formatEur(n: number, currency = "EUR") {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(n);
}

async function sendResendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) return { ok: false, error: "email_not_configured" };

  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [params.to], subject: params.subject, html: params.html }),
    });
    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: err.slice(0, 200) };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "send_failed" };
  }
}

export async function sendPriceAlertEmail(params: {
  to: string;
  productName: string;
  productUrl: string;
  targetPrice: number;
  currentPrice: number;
  currency?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { to, productName, productUrl, targetPrice, currentPrice } = params;
  const fmt = (n: number) => formatEur(n, params.currency);
  const savings = Math.max(0, targetPrice - currentPrice);

  const html = `
<!DOCTYPE html>
<html lang="es">
<body style="font-family:system-ui,sans-serif;background:#0a0a12;color:#e2e8f0;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#131b2e;border-radius:16px;padding:28px;border:1px solid rgba(255,255,255,0.08)">
    <p style="margin:0 0 8px;font-size:12px;color:#818cf8;text-transform:uppercase;letter-spacing:0.08em">DealsHub · Alerta de precio</p>
    <h1 style="margin:0 0 16px;font-size:22px;color:#fff">¡Precio objetivo alcanzado!</h1>
    <p style="margin:0 0 20px;line-height:1.5;color:#94a3b8">
      El producto que vigilabas ya está a <strong style="color:#34d399">${fmt(currentPrice)}</strong>
      (tu objetivo era ${fmt(targetPrice)}).
    </p>
    <p style="margin:0 0 8px;font-weight:600;color:#fff">${productName}</p>
    ${
      savings > 0
        ? `<p style="margin:0 0 20px;font-size:14px;color:#fb7185">Por debajo de tu alerta en ${fmt(savings)}</p>`
        : ""
    }
    <a href="${productUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;text-decoration:none;padding:14px 24px;border-radius:12px;font-weight:700">
      Ver oferta →
    </a>
    <p style="margin:24px 0 0;font-size:11px;color:#64748b">
      Recibes este correo porque activaste una alerta en DealsHub. Gestiona alertas en tu cuenta.
    </p>
  </div>
</body>
</html>`;

  return sendResendEmail({
    to,
    subject: `🔔 ${productName} — ya a ${fmt(currentPrice)}`,
    html,
  });
}

export type WeeklyDealItem = {
  name: string;
  price: number;
  url: string;
  discount?: number;
};

export async function sendWeeklyNewsletterEmail(params: {
  to: string;
  deals: WeeklyDealItem[];
  siteUrl: string;
  unsubscribeUrl?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { to, deals, siteUrl, unsubscribeUrl } = params;
  const fmt = formatEur;

  const rows = deals
    .slice(0, 8)
    .map(
      (d) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
        <a href="${d.url}" style="color:#e2e8f0;text-decoration:none;font-weight:600">${d.name}</a>
        <div style="margin-top:4px;font-size:13px;color:#34d399">${fmt(d.price)}${d.discount ? ` · -${d.discount}%` : ""}</div>
      </td>
    </tr>`,
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="es">
<body style="font-family:system-ui,sans-serif;background:#0a0a12;color:#e2e8f0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#131b2e;border-radius:16px;padding:28px;border:1px solid rgba(255,255,255,0.08)">
    <p style="margin:0 0 8px;font-size:12px;color:#818cf8;text-transform:uppercase;letter-spacing:0.08em">DealsHub · Resumen semanal</p>
    <h1 style="margin:0 0 12px;font-size:22px;color:#fff">Los mejores chollos de la semana</h1>
    <p style="margin:0 0 24px;line-height:1.5;color:#94a3b8">
      Precios verificados y ofertas destacadas en Amazon y tiendas afiliadas.
    </p>
    <table style="width:100%;border-collapse:collapse">${rows}</table>
    <a href="${siteUrl}" style="display:inline-block;margin-top:24px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;text-decoration:none;padding:14px 24px;border-radius:12px;font-weight:700">
      Ver más ofertas →
    </a>
    <p style="margin:24px 0 0;font-size:11px;color:#64748b">
      Recibes este correo porque te suscribiste al resumen semanal de DealsHub.
      ${unsubscribeUrl ? `<a href="${unsubscribeUrl}" style="color:#64748b">Darse de baja</a>` : ""}
    </p>
  </div>
</body>
</html>`;

  return sendResendEmail({
    to,
    subject: "📬 Tu resumen semanal de chollos — DealsHub",
    html,
  });
}
