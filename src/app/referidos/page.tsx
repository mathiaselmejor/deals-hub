import type { Metadata } from "next";
import Link from "next/link";
import { ReferralDashboard } from "@/components/ReferralDashboard";
import { REFERRAL_MAX_REWARD_RATIO, REFERRAL_MIN_SALES } from "@/lib/referrals";

export const metadata: Metadata = {
  title: "Programa de referidos",
  description: "Comparte DealsHub y gana premios por ventas generadas",
};

export default function ReferidosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">🎁 Programa de referidos</h1>
      <p className="mt-4 text-slate-400">
        Comparte tu enlace. Si consigues al menos{" "}
        <strong className="text-white">{REFERRAL_MIN_SALES} ventas confirmadas</strong>, recibes
        un premio en efectivo o cupón —{" "}
        <strong className="text-white">como máximo el {REFERRAL_MAX_REWARD_RATIO * 100}%</strong>{" "}
        de la comisión real que hayamos ganado gracias a ti (nunca más de la mitad).
      </p>

      <div className="mt-8 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6 text-sm text-slate-300">
        <h2 className="font-bold text-indigo-200">Cómo funciona</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Inicia sesión y copia tu enlace personal.</li>
          <li>Compártelo en redes, WhatsApp o tu blog.</li>
          <li>Cuando alguien compre desde tu enlace, registramos la venta (confirmación manual o por red).</li>
          <li>Con 3+ ventas confirmadas, calculamos tu premio (máx. 50% de comisión).</li>
        </ol>
      </div>

      <ReferralDashboard />

      <p className="mt-8 text-center text-sm text-slate-500">
        <Link href="/guia-afiliados" className="text-indigo-400 hover:underline">
          Cómo monetizamos DealsHub
        </Link>
      </p>
    </div>
  );
}
