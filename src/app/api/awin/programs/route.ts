import { NextResponse } from "next/server";
import statusData from "../../../data/awin-program-status.json";
import {
  fetchAwinProgramStatuses,
  getAwinNotOnAwinNotes,
  getAwinPrograms,
  getAwinPublisherId,
} from "@/lib/awin-programs";
import { getAffiliateStatus } from "@/lib/affiliate";

export const dynamic = "force-dynamic";

export async function GET() {
  const affiliate = getAffiliateStatus();
  const programs = getAwinPrograms();
  const cached = statusData as {
    updatedAt?: string;
    programs?: Record<string, { status: string; name?: string }>;
  };

  let live: Record<string, { status: string; name?: string }> = {};
  if (process.env.AWIN_ACCESS_TOKEN) {
    live = await fetchAwinProgramStatuses();
  }

  const merged = programs.map((p) => ({
    ...p,
    status:
      live[p.storeId]?.status ??
      cached.programs?.[p.storeId]?.status ??
      "unknown",
  }));

  return NextResponse.json({
    publisherId: getAwinPublisherId(),
    affiliateConfigured: affiliate.awin,
    programs: merged,
    notOnAwin: getAwinNotOnAwinNotes(),
    joinAllUrl: "https://ui.awin.com/user/affiliate-signup/join-programmes",
    updatedAt: cached.updatedAt ?? new Date().toISOString(),
  });
}
