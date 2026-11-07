import type { Role } from "@/lib/auth/session";

import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export const Topbar = ({ role, name }: { role: Role; name: string }) => {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Management</p>
        <h1 className="text-sm font-semibold text-slate-900">Intercity Bus Reservation System</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-slate-600 sm:inline">
          {name} · {role}
        </span>
        {role === "ADMIN" && (
          <a
            href="/trips/new"
            className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
          >
            New trip
          </a>
        )}
        <form action={logoutAction}>
          <Button size="sm" type="submit" variant="outline">Log out</Button>
        </form>
      </div>
    </header>
  );
};
