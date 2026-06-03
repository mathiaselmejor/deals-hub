/** Programas Tradedoubler verificados (España). */
export const TRADEDOUBLER_PROGRAMS = {
  mediamarkt: {
    programId: "270504",
    name: "MediaMarkt ES",
    signupUrl: "https://publishers.tradedoubler.com/",
    directoryUrl: "https://directory.tradedoubler.com/es/programs/270504-MediaMarkt",
  },
} as const;

export type TradedoublerStoreId = keyof typeof TRADEDOUBLER_PROGRAMS;

export function getTradedoublerSiteId(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_TRADEDOUBLER_SITE_ID?.trim() ||
    process.env.NEXT_PUBLIC_TRADETRACKER_ID?.trim() ||
    undefined
  );
}

export function getTradedoublerProgramId(store: TradedoublerStoreId): string {
  return TRADEDOUBLER_PROGRAMS[store].programId;
}

export function buildTradedoublerAffiliateUrl(
  programId: string,
  siteId: string,
  destinationUrl: string,
  clickRef?: string,
): string {
  const params = new URLSearchParams({
    p: programId,
    a: siteId,
    url: destinationUrl,
  });
  if (clickRef) params.set("epi", clickRef.slice(0, 64));
  return `https://clk.tradedoubler.com/click?${params.toString()}`;
}

export function isTradedoublerConfigured(): boolean {
  return !!getTradedoublerSiteId();
}
