import programsData from "../../data/awin-programs-es.json";
import type { StoreId } from "./types";

export type AwinProgram = {
  id: string;
  storeId: StoreId;
  merchantId: string;
  name: string;
  website: string;
  commission?: string;
  priority?: number;
  joinUrl: string;
};

export type AwinProgramStatus = "joined" | "pending" | "notjoined" | "rejected" | "suspended" | "unknown";

const data = programsData as {
  publisherId: string;
  programs: AwinProgram[];
  notOnAwin?: { storeId: string; note: string }[];
};

export function getAwinPublisherId(): string {
  return process.env.NEXT_PUBLIC_AWIN_PUBLISHER_ID?.trim() || data.publisherId;
}

export function getAwinPrograms(): AwinProgram[] {
  return data.programs;
}

export function getAwinMerchantId(store: StoreId): string | undefined {
  return data.programs.find((p) => p.storeId === store)?.merchantId;
}

export function getAwinMerchantMap(): Partial<Record<StoreId, string>> {
  const map: Partial<Record<StoreId, string>> = {};
  for (const p of data.programs) {
    map[p.storeId] = p.merchantId;
  }
  return map;
}

export function isAwinMonetizedStore(store: StoreId): boolean {
  return !!getAwinMerchantId(store);
}

export function getAwinNotOnAwinNotes(): { storeId: string; note: string }[] {
  return data.notOnAwin ?? [];
}

export function buildAwinAffiliateUrl(
  merchantId: string,
  destinationUrl: string,
  publisherId: string,
  clickref: string,
): string {
  return `https://www.awin1.com/cread.php?awinmid=${merchantId}&awinaffid=${publisherId}&clickref=${encodeURIComponent(clickref)}&ued=${encodeURIComponent(destinationUrl)}`;
}

export async function fetchAwinProgramStatuses(): Promise<
  Record<string, { status: AwinProgramStatus; name?: string }>
> {
  const token = process.env.AWIN_ACCESS_TOKEN?.trim();
  const publisherId = getAwinPublisherId();
  if (!token || !publisherId) return {};

  const out: Record<string, { status: AwinProgramStatus; name?: string }> = {};
  for (const rel of ["joined", "pending", "notjoined", "rejected", "suspended"] as const) {
    const url = `https://api.awin.com/publishers/${publisherId}/programmes?relationship=${rel}&countryCode=ES&accessToken=${token}`;
    try {
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) continue;
      const list = (await res.json()) as { id: number; name: string }[];
      for (const prog of list) {
        const local = data.programs.find((p) => p.merchantId === String(prog.id));
        if (local) {
          out[local.storeId] = { status: rel, name: prog.name };
        }
      }
    } catch {
      /* ignore */
    }
  }
  return out;
}
