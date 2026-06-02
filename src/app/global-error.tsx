"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", textAlign: "center" }}>
        <h1>DealsHub — error crítico</h1>
        <p style={{ color: "#666" }}>{error.message}</p>
        <button type="button" onClick={() => reset()} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
          Reintentar
        </button>
      </body>
    </html>
  );
}
