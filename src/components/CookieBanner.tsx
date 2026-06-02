"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("dealshub-cookies")) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("dealshub-cookies", "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0a0a12]/95 p-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-400">
          Usamos cookies analíticas para mejorar recomendaciones y medir clics afiliados.{" "}
          <Link href="/privacidad" className="text-indigo-400 hover:underline">
            Política de privacidad
          </Link>
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-xl bg-indigo-500 px-6 py-2 text-sm font-semibold text-white"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
