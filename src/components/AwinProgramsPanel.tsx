import { getAwinNotOnAwinNotes, getAwinPrograms } from "@/lib/awin-programs";

export function AwinProgramsPanel() {
  const programs = getAwinPrograms();
  const notOnAwin = getAwinNotOnAwinNotes();

  return (
    <section className="mb-10 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-6">
      <h2 className="text-lg font-bold">Programas Awin (España)</h2>
      <p className="mt-2 text-sm text-slate-400">
        Publisher ID <strong className="text-slate-200">2917459</strong>. Solicita unión a cada tienda en{" "}
        <a
          href="https://ui.awin.com/user/affiliate-signup/join-programmes"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:underline"
        >
          ui.awin.com → Join programmes
        </a>
        . Automatización:{" "}
        <code className="text-xs">python scripts/awin-join-programs.py --pause-login</code>
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {programs.map((p) => (
          <li key={p.id} className="rounded-lg bg-black/20 px-3 py-2 text-sm">
            <div className="font-medium">{p.name}</div>
            <div className="text-xs text-slate-500">Merchant {p.merchantId} · {p.commission}</div>
            <a
              href={p.joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-xs text-indigo-400 hover:underline"
            >
              Solicitar unión →
            </a>
          </li>
        ))}
      </ul>
      {notOnAwin.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200/90">
          <p className="font-semibold">No disponibles en Awin ES</p>
          <ul className="mt-1 list-inside list-disc text-amber-200/70">
            {notOnAwin.map((n) => (
              <li key={n.storeId}>
                {n.storeId}: {n.note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
