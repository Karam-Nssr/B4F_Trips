"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BusFront,
  CalendarDays,
  ClipboardList,
  Route,
  Users,
} from "lucide-react";

import { Brand } from "@/components/shared/brand";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/auth/session";

const navigation = [
  { href: "/trips", label: "Trips", icon: Route },
  {
    href: "/schedules",
    label: "Schedules",
    icon: CalendarDays,
    adminOnly: true,
  },
  { href: "/buses", label: "Buses & seats", icon: BusFront, adminOnly: true },
  { href: "/reservations", label: "Reservations", icon: ClipboardList },
  { href: "/users", label: "Team & access", icon: Users, adminOnly: true },
];

export const Sidebar = ({ role }: { role: Role }) => {
  const pathname = usePathname();
  const visibleNavigation = navigation.filter(
    (item) => !item.adminOnly || role === "ADMIN",
  );
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <aside className="order-2 hidden min-h-screen w-56 shrink-0 border-r border-slate-200 bg-white text-slate-900 md:order-1 md:flex md:flex-col">
        <div className="flex h-20 items-center border-b border-slate-200 px-5">
          <Brand />
        </div>
        <p className="px-5 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {role === "ADMIN" ? "Admin workspace" : "Staff workspace"}
        </p>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {visibleNavigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-blue-50 text-primary"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="m-3 rounded-lg bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-800">
            Staff workspace
          </p>
          <p className="mt-1 text-xs text-slate-500">Nawa operations</p>
        </div>
      </aside>
      <nav
        aria-label="Primary navigation"
        className="order-2 flex gap-1 overflow-x-auto border-t border-slate-200 bg-white px-2 py-2 md:hidden"
      >
        {visibleNavigation.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-medium",
              isActive(href)
                ? "bg-blue-50 text-primary"
                : "text-slate-600 hover:bg-slate-100",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
};
