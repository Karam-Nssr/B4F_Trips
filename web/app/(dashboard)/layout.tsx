import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { requireSession } from "@/lib/auth/session";

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const user = await requireSession();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar role={user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar role={user.role} name={user.name} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
