"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Ofertas", icon: "🔥" },
  { href: "/buscar", label: "Buscar", icon: "🔍" },
  { href: "/rankings", label: "Rankings", icon: "🏆" },
  { href: "/guia-afiliados", label: "Guía", icon: "💰" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 md:hidden">
      <div className="flex justify-around py-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium ${
              pathname === item.href || (item.href === "/buscar" && pathname.startsWith("/buscar"))
                ? "text-indigo-400"
                : "text-slate-500"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
