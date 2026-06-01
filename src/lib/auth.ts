import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

export async function getSessionUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

function adminEmailsFromEnv(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function isUserAdmin(userId: string, userEmail?: string | null): Promise<boolean> {
  const adminEmails = adminEmailsFromEnv();
  const email = userEmail?.toLowerCase();
  if (email && adminEmails.includes(email)) return true;

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, email")
    .eq("id", userId)
    .single();

  if (!profile) return false;
  if (profile.is_admin) return true;
  if (profile.email && adminEmails.includes(profile.email.toLowerCase())) return true;
  return false;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) return { user: null, admin: false as const };
  const admin = await isUserAdmin(user.id, user.email);
  return { user, admin };
}
