import { createServiceClient } from "@/lib/supabase/admin";

export async function priceAlertsTableAvailable(): Promise<boolean> {
  try {
    const admin = createServiceClient();
    const { error } = await admin.from("price_alerts").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
}

export async function priceAlertLeadsTableAvailable(): Promise<boolean> {
  try {
    const admin = createServiceClient();
    const { error } = await admin.from("price_alert_leads").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
}
