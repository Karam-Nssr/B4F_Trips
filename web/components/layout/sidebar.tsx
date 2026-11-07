"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { Role } from "@/lib/auth/session";

const navigation: Array<{ href: string; label: string; adminOnly?: boolean }> = [
  { href: "/trips", label: "Trips" },
  { href: "/schedules", label: "Schedules", adminOnly: true },
  { href: "/buses", label: "Buses", adminOnly: true },
  { href: "/reservations", label: "Reservations" },
  { href: "/users", label: "Users", adminOnly: true },
];

export const Sidebar = ({ role }: { role: Role }) => {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 border-r border-slate-200 bg-white text-slate-900 md:flex md:flex-col">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">B4F</p>
          <h2 className="text-lg font-semibold">Trips Portal</h2>
        </div>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navigation.filter((item) => !item.adminOnly || role === "ADMIN").map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-4 text-xs text-slate-500">
        Staff-only access
      </div>
    </aside>
  );
};
