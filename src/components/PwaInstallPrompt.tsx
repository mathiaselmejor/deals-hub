"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("pwa-dismiss") === "1") {
      setDismissed(true);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (dismissed || !deferred) return null;

  const install = async () => {
    await deferred.prompt();
    setDeferred(null);
    localStorage.setItem("pwa-dismiss", "1");
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-indigo-500/30 bg-[#0a0a12]/95 p-4 shadow-xl backdrop-blur-md lg:bottom-6 lg:left-auto lg:right-6">
      <p className="text-sm font-semibold text-white">Instala DealsHub</p>
      <p className="mt-1 text-xs text-slate-400">
        Acceso rápido a alertas y comparador desde tu móvil, como una app.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={install}
          className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
        >
          Instalar
        </button>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem("pwa-dismiss", "1");
            setDismissed(true);
          }}
          className="rounded-xl px-4 py-2 text-xs text-slate-500"
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
