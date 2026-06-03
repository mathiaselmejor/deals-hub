import { TRADEDOUBLER_PROGRAMS, isTradedoublerConfigured } from "@/lib/tradedoubler";

export function TradedoublerPanel() {
  const configured = isTradedoublerConfigured();
  const mediamarkt = TRADEDOUBLER_PROGRAMS.mediamarkt;

  return (
    <section className="mb-10 rounded-2xl border border-rose-500/25 bg-rose-500/5 p-6">
      <h2 className="text-lg font-bold">Tradedoubler — MediaMarkt</h2>
      <p className="mt-2 text-sm text-slate-400">
        MediaMarkt España no está en Awin. Programa oficial:{" "}
        <strong className="text-slate-200">{mediamarkt.programId}</strong>.
        {configured ? (
          <span className="text-emerald-400"> Site ID configurado ✓</span>
        ) : (
          <span className="text-amber-300"> Falta NEXT_PUBLIC_TRADEDOUBLER_SITE_ID</span>
        )}
      </p>
      <a
        href={mediamarkt.directoryUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-sm text-rose-300 hover:underline"
      >
        Solicitar programa MediaMarkt en Tradedoubler →
      </a>
    </section>
  );
}
