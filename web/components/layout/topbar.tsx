"use client";

import type { Role } from "@/lib/auth/session";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export const Topbar = ({ role, name }: { role: Role; name: string }) => {
  const pathname = usePathname();
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const sectionLabel = pathname.startsWith("/trips")
    ? "Trip management"
    : pathname.startsWith("/buses")
      ? "Buses & seats"
      : pathname.startsWith("/reservations")
        ? "Reservations"
        : pathname.startsWith("/schedules")
          ? "Schedules"
          : pathname.startsWith("/users")
            ? "Team & access"
            : "Workspace";

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 md:h-20">
      <div className="min-w-0">
        <p className="truncate text-xs text-slate-500">Workspace / {sectionLabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-primary">
          {initials}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold text-slate-900">{name}</span>
          <span className="block text-xs capitalize text-slate-500">
            {role === "ADMIN" ? "Administrator" : "Employee"}
          </span>
        </span>
        <form action={logoutAction}>
          <Button size="sm" type="submit" variant="ghost">Log out</Button>
        </form>
      </div>
    </header>
  );
};
