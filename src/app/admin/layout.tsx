import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, admin } = await requireAdmin();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  if (!admin) {
    redirect("/cuenta?error=not_admin");
  }

  return (
    <div className="min-h-screen bg-[#0a0a12]">
      <div className="border-b border-white/10 bg-card/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Panel de administración
            </p>
            <h1 className="text-xl font-bold">DealsHub Monitor</h1>
          </div>
          <nav className="flex gap-4 text-sm">
            <a href="/admin" className="text-indigo-400 hover:underline">
              Dashboard
            </a>
            <a href="/" className="text-slate-400 hover:text-white">
              Ver web
            </a>
            <a href="/guia-afiliados" className="text-slate-400 hover:text-white">
              Guía afiliados
            </a>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-slate-500 hover:text-rose-400">
                Salir
              </button>
            </form>
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
