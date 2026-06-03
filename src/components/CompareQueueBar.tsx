"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  COMPARE_QUEUE_EVENT,
  clearCompareQueue,
  getCompareQueue,
  removeFromCompareQueue,
  type CompareQueueItem,
} from "@/lib/compare-queue";

export function CompareQueueBar() {
  const router = useRouter();
  const [queue, setQueue] = useState<CompareQueueItem[]>([]);

  const sync = useCallback(() => setQueue(getCompareQueue()), []);

  useEffect(() => {
    sync();
    window.addEventListener(COMPARE_QUEUE_EVENT, sync);
    return () => window.removeEventListener(COMPARE_QUEUE_EVENT, sync);
  }, [sync]);

  if (queue.length === 0) return null;

  const goCompare = () => {
    if (queue.length < 2) {
      router.push(`/comparar?a=${queue[0].id}`);
      return;
    }
    router.push(`/comparar?a=${queue[0].id}&b=${queue[1].id}`);
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4 md:bottom-6">
      <div className="mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-indigo-500/40 bg-card/95 p-3 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {queue.map((p) => (
            <div
              key={p.id}
              className="relative flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-white/5 px-2 py-1.5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
              <p className="truncate text-xs font-medium">{p.name}</p>
              <button
                type="button"
                aria-label="Quitar"
                onClick={() => removeFromCompareQueue(p.id)}
                className="shrink-0 text-slate-500 hover:text-white"
              >
                ×
              </button>
            </div>
          ))}
          {queue.length === 1 && (
            <p className="hidden text-xs text-slate-500 sm:block">Añade otro con ⚔️ +</p>
          )}
        </div>
        <button type="button" onClick={goCompare} className="btn-primary shrink-0 px-4 py-2 text-xs">
          Comparar →
        </button>
        <button
          type="button"
          onClick={clearCompareQueue}
          className="shrink-0 text-xs text-slate-500 hover:text-white"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
