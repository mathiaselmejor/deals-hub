import { createClient } from "@/lib/supabase/server";

export async function getSessionUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const supabase = await createClient();
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
  const admin = await isUserAdmin(user.id);
  return { user, admin };
}
