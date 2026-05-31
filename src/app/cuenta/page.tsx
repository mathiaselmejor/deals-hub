import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser, isUserAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mi cuenta",
  robots: { index: false, follow: false },
};

export default async function CuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?redirect=/cuenta");

  const params = await searchParams;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const admin = await isUserAdmin(user.id);

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="rounded-2xl border border-white/10 bg-card p-8">
        <h1 className="text-2xl font-bold">Mi cuenta</h1>

        {params.error === "not_admin" && (
          <p className="mt-4 rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            No tienes permisos de administrador.
          </p>
        )}

        <div className="mt-6 flex items-center gap-4">
          {profile?.avatar_url || user.user_metadata?.avatar_url ? (
            <img
              src={profile?.avatar_url ?? user.user_metadata.avatar_url}
              alt=""
              className="h-16 w-16 rounded-full border border-white/10"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500 text-2xl font-bold">
              {(user.email?.[0] ?? "U").toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold">
              {profile?.full_name ?? user.user_metadata?.full_name ?? "Usuario"}
            </p>
            <p className="text-sm text-slate-400">{user.email}</p>
            <p className="text-xs capitalize text-slate-500">
              {profile?.provider ?? user.app_metadata?.provider ?? "email"}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {admin && (
            <Link
              href="/admin"
              className="block rounded-xl bg-amber-500/20 px-4 py-3 text-center font-semibold text-amber-300 transition hover:bg-amber-500/30"
            >
              Panel de administración →
            </Link>
          )}
          <Link
            href="/guia-afiliados"
            className="block rounded-xl border border-white/10 px-4 py-3 text-center transition hover:bg-white/5"
          >
            Guía de afiliados
          </Link>
          <Link
            href="/videos"
            className="block rounded-xl border border-white/10 px-4 py-3 text-center transition hover:bg-white/5"
          >
            Guiones para vídeos
          </Link>
        </div>

        <form action="/auth/signout" method="post" className="mt-8">
          <button
            type="submit"
            className="w-full rounded-xl border border-rose-500/30 py-3 text-sm text-rose-400 transition hover:bg-rose-500/10"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
