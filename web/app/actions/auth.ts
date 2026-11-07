"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api/errors";
import { apiEndpoints } from "@/lib/api/endpoints";
import { apiFetch } from "@/lib/api/client";
import type { SessionUser } from "@/lib/auth/session";
import { clearSession } from "@/lib/auth/session";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "bus_token";

type LoginResponse = {
  user: SessionUser;
  token: string;
};

export type LoginActionState = { error?: string };

const safeNextPath = (value: FormDataEntryValue | null): string => {
  if (typeof value !== "string" || !value.startsWith("/")) return "/trips";
  const destination = new URL(value, "http://localhost");
  if (destination.origin !== "http://localhost") return "/trips";
  return `${destination.pathname}${destination.search}${destination.hash}`;
};

const tokenMaxAge = (token: string): number => {
  const payload = token.split(".")[1];
  if (!payload) throw new Error("The authentication service returned an invalid token.");
  const decoded = JSON.parse(
    Buffer.from(payload, "base64url").toString("utf8"),
  ) as { exp?: unknown };
  if (typeof decoded.exp !== "number" || !Number.isFinite(decoded.exp)) {
    throw new Error("The authentication token has no valid expiration.");
  }
  return Math.max(0, Math.floor(decoded.exp - Date.now() / 1000));
};

export const loginAction = async (
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  const email = formData.get("email");
  const password = formData.get("password");
  const nextPath = safeNextPath(formData.get("next"));

  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return { error: "Enter your email and password." };
  }

  let result: LoginResponse;
  try {
    result = await apiFetch<LoginResponse>(apiEndpoints.auth.login, {
      method: "POST",
      body: { email: email.trim(), password },
      token: "",
    });
  } catch (error) {
    const message =
      error instanceof ApiError && error.status < 500
        ? error.message
        : "Unable to sign in right now. Please try again.";
    return { error: message };
  }

  if (!result.token || !["ADMIN", "EMPLOYEE"].includes(result.user.role)) {
    return {
      error:
        "This portal is for staff. Customers should use the mobile app.",
    };
  }

  let verified: { user: SessionUser };
  try {
    verified = await apiFetch<{ user: SessionUser }>(apiEndpoints.auth.me, { token: result.token });
  } catch (error) {
    if (error instanceof ApiError) {
      const message =
        error.status >= 500
          ? "Unable to verify your account right now."
          : error.message;
      return { error: message };
    }
    throw error;
  }

  if (!["ADMIN", "EMPLOYEE"].includes(verified.user.role)) {
    return {
      error:
        "This portal is for staff. Customers should use the mobile app.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: tokenMaxAge(result.token),
  });
  redirect(nextPath);
};

export const logoutAction = async (): Promise<void> => {
  await clearSession();
  redirect("/login");
};
