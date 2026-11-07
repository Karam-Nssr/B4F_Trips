import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";

export type Role = "ADMIN" | "EMPLOYEE" | "USER";

export type SessionUser = {
  _id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
};

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "bus_token";

export const getSession = async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const result = await apiFetch<{ user: SessionUser }>(apiEndpoints.auth.me, { token });
    if (!result.user || !["ADMIN", "EMPLOYEE"].includes(result.user.role)) {
      return null;
    }
    return result.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
};

export const requireSession = async (): Promise<SessionUser> => {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
};

export const requireRole = async (
  roles: Role[],
): Promise<SessionUser> => {
  const user = await requireSession();
  if (!roles.includes(user.role)) redirect("/forbidden");
  return user;
};

export const clearSession = async (): Promise<void> => {
  (await cookies()).delete(COOKIE_NAME);
};
