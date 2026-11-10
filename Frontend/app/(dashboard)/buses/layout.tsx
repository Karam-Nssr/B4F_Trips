import type { ReactNode } from "react";

import { requireRole } from "@/lib/auth/session";

const BusesLayout = async ({ children }: { children: ReactNode }) => {
  await requireRole(["ADMIN"]);
  return children;
};

export default BusesLayout;
