"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-4xl">⚠️</p>
      <h1 className="mt-4 text-xl font-bold">Algo ha fallado</h1>
      <p className="mt-2 text-sm text-slate-400">
        {error.message || "Error inesperado al cargar la página."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
      >
        Reintentar
      </button>
      <a href="/" className="mt-4 text-sm text-indigo-400 hover:underline">
        Volver al inicio
      </a>
    </div>
  );
}
