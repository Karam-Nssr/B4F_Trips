import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { requireSession } from "@/lib/auth/session";

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const user = await requireSession();

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <Sidebar role={user.role} />
      <div className="order-1 flex min-w-0 flex-1 flex-col md:order-2">
        <Topbar role={user.role} name={user.name} />
        <main className="flex-1 p-4 sm:p-6 xl:p-10">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
