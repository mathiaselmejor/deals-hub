"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent } from "@/components/AnalyticsTracker";
import {
  loadImageSearchSession,
  saveImageSearchSession,
  searchByImageFile,
} from "@/lib/image-search-client";
import type { ImageSearchAnalysis } from "@/lib/image-search";

type Props = {
  variant?: "full" | "compact";
  onSuccess?: (query: string, analysis: ImageSearchAnalysis) => void;
};

export function ImageSearchPanel({ variant = "full", onSuccess }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [lastSession, setLastSession] = useState<ReturnType<typeof loadImageSearchSession>>(null);

  useEffect(() => {
    fetch("/api/search/image")
      .then((r) => r.json())
      .then((d) => setConfigured(!!d.configured))
      .catch(() => setConfigured(false));
    setLastSession(loadImageSearchSession());
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Selecciona una imagen (JPG, PNG o WebP).");
        return;
      }

      setError(null);
      setLoading(true);
      const objectUrl = URL.createObjectURL(file);
      previewRef.current = objectUrl;
      setPreview(objectUrl);

      try {
        const result = await searchByImageFile(file);
        saveImageSearchSession({
          query: result.query,
          analysis: result.analysis,
          productIds: result.productIds,
          previewUrl: objectUrl,
        });

        trackEvent("image_search", {
          query: result.query,
          productType: result.analysis.productType,
          confidence: result.analysis.confidence,
          results: result.count,
        });

        onSuccess?.(result.query, result.analysis);

        const params = new URLSearchParams({
          q: result.query,
          src: "image",
        });
        router.push(`/buscar?${params.toString()}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No pudimos analizar la imagen.");
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, router],
  );

  const onFileChange = (files: FileList | null) => {
    const file = files?.[0];
    if (file) void processFile(file);
  };

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith("image/"));
      if (!item) return;
      e.preventDefault();
      const file = item.getAsFile();
      if (file) void processFile(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [processFile]);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  if (variant === "compact") {
    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files)}
        />
        <button
          type="button"
          title="Buscar por imagen"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-base transition hover:border-indigo-500/40 hover:bg-indigo-500/10 disabled:opacity-50"
        >
          {loading ? "…" : "📷"}
        </button>
      </>
    );
  }

  return (
    <section className="rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 to-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">📷 Buscar por imagen</h2>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            ¿No sabes cómo se llama? Sube una foto, captura de pantalla o pega desde el portapapeles.
            Detectamos el producto y buscamos ofertas en el catálogo.
          </p>
        </div>
        {configured === false && (
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-300">
            Requiere GEMINI_API_KEY
          </span>
        )}
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onFileChange(e.dataTransfer.files);
        }}
        onClick={() => !loading && inputRef.current?.click()}
        className={`mt-5 cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
          dragOver
            ? "border-violet-400 bg-violet-500/10"
            : "border-white/15 bg-black/20 hover:border-violet-500/40"
        } ${loading ? "pointer-events-none opacity-70" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files)}
        />

        {preview && !loading ? (
          <div className="mx-auto max-w-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Vista previa" className="mx-auto max-h-40 rounded-lg object-contain" />
            <p className="mt-3 text-sm text-slate-400">Pulsa para cambiar la imagen</p>
          </div>
        ) : loading ? (
          <div>
            <p className="text-3xl animate-pulse">🔍</p>
            <p className="mt-3 font-medium text-white">Analizando imagen…</p>
            <p className="mt-1 text-sm text-slate-400">Identificando producto y buscando ofertas</p>
          </div>
        ) : (
          <div>
            <p className="text-4xl">🖼️</p>
            <p className="mt-3 font-medium text-white">Arrastra una foto aquí</p>
            <p className="mt-1 text-sm text-slate-400">
              o pulsa para elegir · Ctrl+V para pegar · cámara en móvil
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
      )}

      {lastSession && !loading && (
        <p className="mt-4 text-sm text-slate-500">
          Última búsqueda visual:{" "}
          <Link
            href={`/buscar?q=${encodeURIComponent(lastSession.query)}&src=image`}
            className="text-violet-300 hover:underline"
          >
            {lastSession.analysis.productName || lastSession.query}
          </Link>
        </p>
      )}

      <ul className="mt-5 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
        <li>✓ Foto de producto en tienda o en casa</li>
        <li>✓ Captura de Instagram / TikTok</li>
        <li>✓ Etiqueta o packaging visible</li>
      </ul>
    </section>
  );
}
