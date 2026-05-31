"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/cuenta";
  const error = searchParams.get("error");
  const [loading, setLoading] = useState<string | null>(null);

  const signIn = async (provider: "google" | "facebook") => {
    setLoading(provider);
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-white/10 bg-card p-8">
        <h1 className="text-2xl font-bold">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-slate-400">
          Accede para guardar favoritos, alertas de precio y tu panel personal.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            Error al iniciar sesión. Inténtalo de nuevo.
          </p>
        )}

        <div className="mt-8 space-y-3">
          <button
            onClick={() => signIn("google")}
            disabled={!!loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3.5 font-medium transition hover:bg-white/10 disabled:opacity-50"
          >
            {loading === "google" ? "..." : "🔵"} Continuar con Google
          </button>

          <button
            onClick={() => signIn("facebook")}
            disabled={!!loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 py-3.5 font-medium transition hover:bg-blue-500/20 disabled:opacity-50"
          >
            {loading === "facebook" ? "..." : "📘"} Continuar con Facebook
          </button>
        </div>

        <div className="mt-6 rounded-lg bg-white/5 p-4 text-xs text-slate-500">
          <p>
            <strong className="text-slate-400">Instagram:</strong> Meta (dueña de Instagram) no permite
            login directo en webs pequeñas. Usa <strong>Facebook</strong> — si tu Instagram está vinculado
            a tu cuenta Meta, es la misma identidad.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Al entrar aceptas nuestra política de privacidad. No compartimos tus datos con terceros
          excepto para autenticación.
        </p>

        <Link href="/" className="mt-6 block text-center text-sm text-indigo-400 hover:underline">
          ← Volver a ofertas
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
