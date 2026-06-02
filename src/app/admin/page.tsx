import { createServiceClient } from "@/lib/supabase/admin";
import { getAffiliateStatus, isAffiliateConfigured } from "@/lib/affiliate";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function AffiliateSetupPanel({
  configured,
  status,
  clicks,
}: {
  configured: boolean;
  status: Record<string, boolean>;
  clicks: number;
}) {
  const networks = [
    {
      key: "amazon",
      label: "Amazon",
      env: "NEXT_PUBLIC_AMAZON_TAG",
      signup: "https://afiliados.amazon.es/",
      idHint: "Store ID (ej. jere0f7-21)",
      done: status.amazon,
    },
    {
      key: "awin",
      label: "Awin (PcComponentes, MediaMarkt…)",
      env: "NEXT_PUBLIC_AWIN_PUBLISHER_ID",
      signup: "https://ui.awin.com/publisher-signup",
      idHint: "Publisher ID (Account → Account details). Tuyo: 2917459",
      done: status.awin,
    },
    {
      key: "ebay",
      label: "eBay",
      env: "NEXT_PUBLIC_EBAY_CAMPAIGN_ID",
      signup: "https://partnernetwork.ebay.es/",
      idHint: "Campaign ID (EPN)",
      done: status.ebay,
    },
    {
      key: "aliexpress",
      label: "AliExpress Portals",
      env: "NEXT_PUBLIC_ALIEXPRESS_TRACKING_ID",
      signup: "https://portals.aliexpress.com/",
      idHint: "Código _c3iyuOdJ + NEXT_PUBLIC_ALIEXPRESS_TRACKING_NAME=default",
      done: status.aliexpress,
    },
  ];

  return (
    <section
      className={`mb-10 rounded-2xl border p-6 ${
        configured ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"
      }`}
    >
      <h2 className="text-lg font-bold">
        {configured ? "💰 Monetización activa" : "⚠️ Monetización pendiente"}
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        {configured
          ? `Enlaces afiliados activos. ${clicks} clics registrados esta semana.`
          : "Los clics llevan UTM tracking pero sin comisión hasta configurar IDs en Vercel."}
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {networks.map((n) => (
          <li key={n.key} className="rounded-lg bg-black/20 px-3 py-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{n.label}</span>
              <span className={n.done ? "text-emerald-400" : "text-slate-500"}>
                {n.done ? "✓ Configurado" : "○ Pendiente"}
              </span>
            </div>
            {!n.done && (
              <div className="mt-2 space-y-1 text-xs text-slate-500">
                <a
                  href={n.signup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-indigo-400 hover:underline"
                >
                  Registrarse →
                </a>
                <span>Pega {n.idHint} en {n.env}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
      {!configured && (
        <a
          href="/guia-afiliados"
          className="mt-4 inline-block text-sm font-semibold text-amber-300 hover:underline"
        >
          Ver guía de registro →
        </a>
      )}
    </section>
  );
}

async function getStats() {
  const supabase = createServiceClient();
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const sinceIso = since.toISOString();

  const [
    { count: pageViews },
    { count: affiliateClicks },
    { count: searches },
    { count: productClicks },
    { data: events },
    { count: users },
    { data: profiles },
  ] = await Promise.all([
    supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "page_view")
      .gte("created_at", sinceIso),
    supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "affiliate_click")
      .gte("created_at", sinceIso),
    supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "search")
      .gte("created_at", sinceIso),
    supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "product_click")
      .gte("created_at", sinceIso),
    supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id, email, full_name, provider, created_at, last_seen_at, is_admin")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const sessions = new Set(
    (events ?? []).map((e) => e.session_id).filter(Boolean)
  );

  const topProducts: Record<string, number> = {};
  (events ?? [])
    .filter((e) => e.event_type === "affiliate_click")
    .forEach((e) => {
      const id = (e.payload as { productId?: string })?.productId;
      if (id) topProducts[id] = (topProducts[id] ?? 0) + 1;
    });

  const topProductsList = Object.entries(topProducts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {
    pageViews: pageViews ?? 0,
    affiliateClicks: affiliateClicks ?? 0,
    searches: searches ?? 0,
    productClicks: productClicks ?? 0,
    uniqueSessions: sessions.size,
    totalUsers: users ?? 0,
    profiles: profiles ?? [],
    recentEvents: events ?? [],
    topProductsList,
  };
}

export default async function AdminPage() {
  let stats;
  try {
    stats = await getStats();
  } catch {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8">
          <h2 className="text-lg font-bold text-rose-300">Supabase no configurado</h2>
          <p className="mt-2 text-sm text-slate-400">
            Añade las variables NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY y
            SUPABASE_SERVICE_ROLE_KEY en Vercel y ejecuta supabase/schema.sql en tu proyecto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <AffiliateSetupPanel configured={isAffiliateConfigured()} status={getAffiliateStatus()} clicks={stats.affiliateClicks} />

      <p className="mb-6 text-sm text-slate-500">Últimos 7 días</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Visitas" value={stats.pageViews} />
        <StatCard label="Sesiones únicas" value={stats.uniqueSessions} />
        <StatCard label="Clics afiliados" value={stats.affiliateClicks} sub="Comprar / Ir" />
        <StatCard label="Búsquedas" value={stats.searches} />
        <StatCard label="Clics producto" value={stats.productClicks} />
        <StatCard label="Usuarios" value={stats.totalUsers} sub="Registrados" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-card p-6">
          <h2 className="font-bold">Top productos (clics afiliados)</h2>
          {stats.topProductsList.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Sin datos aún</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {stats.topProductsList.map(([id, count]) => (
                <li key={id} className="flex justify-between text-sm">
                  <a href={`/producto/${id}`} className="text-indigo-400 hover:underline">
                    {id}
                  </a>
                  <span className="font-mono text-slate-400">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-card p-6">
          <h2 className="font-bold">Usuarios recientes</h2>
          {stats.profiles.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Ningún usuario registrado</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-slate-500">
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Proveedor</th>
                    <th className="pb-2">Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.profiles.map((p) => (
                    <tr key={p.id} className="border-b border-white/5">
                      <td className="py-2 pr-4">{p.email ?? "—"}</td>
                      <td className="py-2 pr-4 capitalize">{p.provider ?? "—"}</td>
                      <td className="py-2">{p.is_admin ? "✓" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="mt-10 rounded-2xl border border-white/10 bg-card p-6">
        <h2 className="font-bold">Eventos recientes</h2>
        <div className="mt-4 max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-500">
                <th className="pb-2 pr-3">Hora</th>
                <th className="pb-2 pr-3">Tipo</th>
                <th className="pb-2 pr-3">Ruta</th>
                <th className="pb-2">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentEvents.map((e) => (
                <tr key={e.id} className="border-b border-white/5">
                  <td className="py-2 pr-3 whitespace-nowrap text-slate-500">
                    {new Date(e.created_at).toLocaleString("es-ES")}
                  </td>
                  <td className="py-2 pr-3">{e.event_type}</td>
                  <td className="py-2 pr-3 text-slate-400">{e.path ?? "—"}</td>
                  <td className="py-2 font-mono text-slate-500">
                    {JSON.stringify(e.payload).slice(0, 80)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
