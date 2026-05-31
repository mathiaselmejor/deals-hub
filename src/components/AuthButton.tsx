"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
        setIsAdmin(profile?.is_admin ?? false);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-xl border border-white/15 px-3 py-2 text-sm font-medium transition hover:bg-white/5"
      >
        Entrar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isAdmin && (
        <Link
          href="/admin"
          className="hidden rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 sm:inline-block"
        >
          Admin
        </Link>
      )}
      <Link
        href="/cuenta"
        className="flex items-center gap-2 rounded-xl border border-white/10 px-2 py-1.5 text-sm transition hover:bg-white/5"
      >
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt=""
            className="h-6 w-6 rounded-full"
          />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-xs">
            {(user.email?.[0] ?? "U").toUpperCase()}
          </span>
        )}
        <span className="hidden max-w-[100px] truncate sm:inline">
          {user.user_metadata?.full_name ?? user.email?.split("@")[0]}
        </span>
      </Link>
    </div>
  );
}
