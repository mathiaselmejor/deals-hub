"use client";

import { useState } from "react";

export function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setStatus("ok");
      setMessage("¡Listo! Recibirás el resumen semanal de chollos.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "No se pudo suscribir");
    }
  };

  if (compact) {
    return (
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="email"
          required
          placeholder="Tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold"
        >
          Suscribir
        </button>
      </form>
    );
  }

  return (
    <section className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-card p-6">
      <h2 className="text-lg font-bold">Resumen semanal de chollos</h2>
      <p className="mt-2 text-sm text-slate-400">
        Cada lunes: las mejores bajadas de precio y ofertas destacadas. Sin spam.
      </p>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold"
        >
          {status === "loading" ? "Enviando…" : "Quiero el resumen"}
        </button>
      </form>
      {message && (
        <p className={`mt-2 text-sm ${status === "ok" ? "text-emerald-400" : "text-rose-400"}`}>
          {message}
        </p>
      )}
    </section>
  );
}
