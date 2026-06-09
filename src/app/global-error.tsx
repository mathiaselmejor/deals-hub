"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#070b14",
          color: "#e2e8f0",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <p style={{ fontSize: "2.5rem", margin: 0 }}>⚠️</p>
          <h1 style={{ marginTop: "1rem", fontSize: "1.25rem" }}>DealsHub no pudo cargar</h1>
          <p style={{ marginTop: "0.75rem", color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1.5 }}>
            Ha ocurrido un error inesperado. Prueba de nuevo o vuelve al inicio.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.25rem",
              borderRadius: "0.75rem",
              border: "none",
              background: "linear-gradient(135deg,#6366f1,#a855f7)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
          <a href="/" style={{ display: "block", marginTop: "1rem", color: "#818cf8", fontSize: "0.875rem" }}>
            Ir al inicio
          </a>
        </div>
      </body>
    </html>
  );
}
