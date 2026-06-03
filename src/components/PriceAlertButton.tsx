"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/products";

type AlertState = {
  targetPrice: number;
  currentPrice: number;
  hit: boolean;
  notifiedAt: string | null;
};

export function PriceAlertButton({
  productId,
  currentPrice,
  productName,
}: {
  productId: string;
  currentPrice: number;
  productName?: string;
}) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [target, setTarget] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [guestDone, setGuestDone] = useState(false);

  const suggested =
    currentPrice > 0
      ? [0.95, 0.9, 0.85].map((m) => Math.max(1, Math.round(currentPrice * m * 100) / 100))
      : [];

  const loadAlert = useCallback(async () => {
    const res = await fetch(`/api/price-alerts?productId=${encodeURIComponent(productId)}`);
    if (res.status === 401) return;
    if (!res.ok) return;
    const data = await res.json();
    if (data.alert) {
      setAlert({
        targetPrice: Number(data.alert.target_price),
        currentPrice: data.currentPrice ?? currentPrice,
        hit: !!data.hit,
        notifiedAt: data.alert.notified_at,
      });
      setTarget(String(data.alert.target_price));
    }
  }, [productId, currentPrice]);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        setLoggedIn(!!user);
        if (user) void loadAlert();
      });
  }, [loadAlert]);

  const saveLoggedIn = async () => {
    const price = parseFloat(target.replace(",", "."));
    if (!price || price <= 0) {
      setError("Introduce un precio válido");
      return;
    }
    if (currentPrice > 0 && price >= currentPrice) {
      setError(`El objetivo debe ser menor que ${formatPrice(currentPrice)}`);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/price-alerts", {
      method: alert ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        targetPrice: price,
        priceAtCreate: currentPrice > 0 ? currentPrice : null,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar");
      if (data.code === "schema_missing") {
        setError("Activa las tablas en Supabase (user-features.sql)");
      }
      return;
    }
    setAlert({
      targetPrice: price,
      currentPrice: data.currentPrice ?? currentPrice,
      hit: !!data.hit,
      notifiedAt: null,
    });
    setOpen(false);
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  };

  const saveGuest = async () => {
    const price = parseFloat(target.replace(",", "."));
    if (!email.trim() || !price || price <= 0) {
      setError("Email y precio objetivo requeridos");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/price-alerts/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), productId, targetPrice: price }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Error al registrar");
      return;
    }
    setGuestDone(true);
    setOpen(false);
  };

  const remove = async () => {
    setLoading(true);
    await fetch("/api/price-alerts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setAlert(null);
    setTarget("");
    setLoading(false);
    setOpen(false);
  };

  if (guestDone) {
    return (
      <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
        ✓ Te avisaremos en {email}
      </span>
    );
  }

  if (alert && !open) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <div
          className={`rounded-xl border px-4 py-2.5 text-sm ${
            alert.hit
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
              : "border-amber-500/30 bg-amber-500/10 text-amber-200"
          }`}
        >
          🔔 Alerta: {formatPrice(alert.targetPrice)}
          {alert.hit && (
            <span className="ml-2 font-bold">
              ¡Ahora {formatPrice(alert.currentPrice || currentPrice)}!
            </span>
          )}
          {alert.notifiedAt && alert.hit && (
            <span className="ml-1 text-xs opacity-80">(avisado)</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs text-slate-500 hover:text-white"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={loading}
          className="text-xs text-rose-400/80 hover:text-rose-300"
        >
          Quitar
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          if (suggested[1]) setTarget(String(suggested[1]));
          setOpen(true);
          setGuestMode(false);
          setError(null);
        }}
        className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20"
      >
        🔔 Alerta de precio
      </button>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
      <p className="text-sm font-semibold text-amber-200">Alerta cuando baje a:</p>
      {currentPrice > 0 && (
        <p className="mt-1 text-xs text-slate-500">
          Precio actual: {formatPrice(currentPrice)}
          {productName ? ` · ${productName}` : ""}
        </p>
      )}

      {suggested.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggested.map((p, i) => (
            <button
              key={p}
              type="button"
              onClick={() => setTarget(String(p))}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-amber-500/20"
            >
              {i === 0 ? "−5%" : i === 1 ? "−10%" : "−15%"} · {formatPrice(p)}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="number"
          step="0.01"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Precio €"
          className="w-32 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />
        <span className="text-sm text-slate-500">€</span>
      </div>

      {loggedIn === false && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => setGuestMode(!guestMode)}
            className="text-xs text-indigo-300 hover:underline"
          >
            {guestMode ? "Usar cuenta" : "O recibir aviso por email sin cuenta"}
          </button>
          {guestMode && (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          )}
        </div>
      )}

      {loggedIn === false && !guestMode && (
        <p className="mt-3 text-xs text-slate-500">
          <Link href={`/login?redirect=/producto/${productId}`} className="text-indigo-400 hover:underline">
            Inicia sesión
          </Link>{" "}
          para guardar alertas en tu panel.
        </p>
      )}

      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {loggedIn || guestMode ? (
          <button
            type="button"
            disabled={loading}
            onClick={guestMode && !loggedIn ? saveGuest : saveLoggedIn}
            className="rounded-lg bg-amber-500/40 px-4 py-2 text-xs font-bold text-amber-100 disabled:opacity-50"
          >
            {loading ? "Guardando…" : "Activar alerta"}
          </button>
        ) : null}
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-500">
          Cancelar
        </button>
      </div>
    </div>
  );
}
