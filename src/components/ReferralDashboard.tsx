"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ReferralData = {
  code: string;
  shareUrl: string;
  minSales: number;
  confirmedSales: number;
  pendingSales: number;
  grossCommissionEur: number;
  reward: {
    eligible: boolean;
    rewardEur: number;
    maxRewardEur: number;
  };
};

export function ReferralDashboard() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referrals")
      .then(async (r) => {
        if (r.status === 401) {
          setError("login");
          return;
        }
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? "Error");
        setData(json);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error === "login") {
    return (
      <div className="mt-8 rounded-2xl border border-white/10 bg-card p-6 text-center">
        <p className="text-slate-400">Inicia sesión para obtener tu enlace de referido.</p>
        <Link
          href="/login?redirect=/referidos"
          className="mt-4 inline-block rounded-xl bg-indigo-500 px-6 py-3 font-semibold"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <p className="mt-8 text-center text-rose-400">
        No se pudo cargar el programa. ¿Ejecutaste supabase/referrals.sql?
      </p>
    );
  }

  if (!data) {
    return <p className="mt-8 text-center text-slate-500">Cargando tu panel...</p>;
  }

  const copy = async () => {
    await navigator.clipboard.writeText(data.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progress = Math.min(100, (data.confirmedSales / data.minSales) * 100);

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-2xl border border-white/10 bg-card p-6">
        <p className="text-xs uppercase tracking-wider text-slate-500">Tu enlace</p>
        <p className="mt-2 break-all font-mono text-sm text-indigo-300">{data.shareUrl}</p>
        <button
          type="button"
          onClick={copy}
          className="mt-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-bold"
        >
          {copied ? "¡Copiado!" : "Copiar enlace"}
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-card p-6">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Ventas confirmadas</span>
          <span className="font-bold">
            {data.confirmedSales} / {data.minSales}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Pendientes de confirmar: {data.pendingSales}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Comisión bruta estimada: {data.grossCommissionEur.toFixed(2)} €
        </p>
      </div>

      {data.reward.eligible ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
          <p className="font-bold text-emerald-300">¡Eres elegible para premio!</p>
          <p className="mt-2 text-2xl font-bold text-emerald-400">
            Hasta {data.reward.rewardEur.toFixed(2)} €
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Máximo permitido: 50% de la comisión real ({data.reward.maxRewardEur.toFixed(2)} €).
            Te contactaremos para el pago.
          </p>
        </div>
      ) : (
        <p className="text-center text-sm text-slate-500">
          Te faltan {Math.max(0, data.minSales - data.confirmedSales)} ventas confirmadas para
          el premio.
        </p>
      )}
    </div>
  );
}
