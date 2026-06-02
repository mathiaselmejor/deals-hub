import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl font-bold text-indigo-400">404</p>
      <h1 className="mt-4 text-xl font-bold">Página no encontrada</h1>
      <p className="mt-2 text-sm text-slate-400">
        El producto o la ruta que buscas no existe en DealsHub.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
      >
        Ver ofertas
      </Link>
      <Link href="/buscar" className="mt-4 text-sm text-indigo-400 hover:underline">
        Buscar productos
      </Link>
    </div>
  );
}
