import { createServiceClient } from "@/lib/supabase/admin";

const BUCKET = "deals-hub-data";
const STORE_PATH = "referrals/store.json";

export type ReferralProfileRow = {
  userId: string;
  code: string;
  createdAt: string;
};

export type ReferralClickRow = {
  code: string;
  sessionId?: string | null;
  landingPath?: string | null;
  createdAt: string;
};

export type ReferralConversionRow = {
  code: string;
  productId?: string | null;
  store?: string | null;
  orderAmountEur?: number | null;
  commissionEur: number;
  status: "pending" | "confirmed" | "rejected";
  createdAt: string;
};

type ReferralsStore = {
  profiles: ReferralProfileRow[];
  clicks: ReferralClickRow[];
  conversions: ReferralConversionRow[];
};

const emptyStore = (): ReferralsStore => ({
  profiles: [],
  clicks: [],
  conversions: [],
});

async function ensureBucket(admin: ReturnType<typeof createServiceClient>) {
  const { data: buckets } = await admin.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    await admin.storage.createBucket(BUCKET, { public: false });
  }
}

async function loadStore(admin: ReturnType<typeof createServiceClient>): Promise<ReferralsStore> {
  await ensureBucket(admin);
  const { data, error } = await admin.storage.from(BUCKET).download(STORE_PATH);
  if (error || !data) return emptyStore();
  try {
    const text = await data.text();
    const parsed = JSON.parse(text) as ReferralsStore;
    return {
      profiles: parsed.profiles ?? [],
      clicks: parsed.clicks ?? [],
      conversions: parsed.conversions ?? [],
    };
  } catch {
    return emptyStore();
  }
}

async function saveStore(admin: ReturnType<typeof createServiceClient>, store: ReferralsStore) {
  await ensureBucket(admin);
  const body = JSON.stringify(store, null, 2);
  await admin.storage.from(BUCKET).upload(STORE_PATH, body, {
    upsert: true,
    contentType: "application/json",
  });
}

export async function storageGetProfile(userId: string): Promise<ReferralProfileRow | null> {
  const admin = createServiceClient();
  const store = await loadStore(admin);
  return store.profiles.find((p) => p.userId === userId) ?? null;
}

export async function storageUpsertProfile(userId: string, code: string): Promise<ReferralProfileRow> {
  const admin = createServiceClient();
  const store = await loadStore(admin);
  const existing = store.profiles.find((p) => p.userId === userId);
  if (existing) return existing;
  const row: ReferralProfileRow = {
    userId,
    code,
    createdAt: new Date().toISOString(),
  };
  store.profiles.push(row);
  await saveStore(admin, store);
  return row;
}

export async function storageAddClick(row: Omit<ReferralClickRow, "createdAt">) {
  const admin = createServiceClient();
  const store = await loadStore(admin);
  store.clicks.push({ ...row, createdAt: new Date().toISOString() });
  if (store.clicks.length > 5000) store.clicks = store.clicks.slice(-5000);
  await saveStore(admin, store);
}

export async function storageGetConversions(code: string): Promise<ReferralConversionRow[]> {
  const admin = createServiceClient();
  const store = await loadStore(admin);
  return store.conversions.filter((c) => c.code === code);
}

export async function referralsSqlAvailable(): Promise<boolean> {
  const admin = createServiceClient();
  const { error } = await admin.from("referral_profiles").select("code").limit(1);
  return !error;
}
