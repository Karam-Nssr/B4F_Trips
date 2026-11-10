import "server-only";

import { cookies } from "next/headers";

import { ApiError } from "@/lib/api/errors";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "bus_token";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
};

export const apiFetch = async <T>(
  path: string,
  { method = "GET", body, token }: ApiOptions = {},
): Promise<T> => {
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL is not configured for the web application.");
  }

  const bearerToken = token ?? (await cookies()).get(COOKIE_NAME)?.value;
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  let payload: ApiEnvelope<T> | { success: false; message?: string };
  try {
    const parsed: unknown = await response.json();
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid API response.");
    }
    payload = parsed as
      | ApiEnvelope<T>
      | { success: false; message?: string };
  } catch {
    throw new ApiError(
      response.status >= 500
        ? "The service is temporarily unavailable."
        : "The service returned an invalid response.",
      response.status,
    );
  }

  if (!response.ok || !payload.success) {
    const message =
      response.status >= 500
        ? "The service is temporarily unavailable."
        : payload.message || "The request could not be completed.";
    throw new ApiError(message, response.status);
  }

  return (payload as ApiEnvelope<T>).data;
};

export const apiList = async <T>(
  path: string,
  query: Record<string, string | number | undefined> = {},
): Promise<{ items: T[]; pagination?: Pagination }> => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }

  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL is not configured for the web application.");
  }

  const bearerToken =
    (await cookies()).get(COOKIE_NAME)?.value;
  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/api${path}${suffix}`,
    {
      headers: bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {},
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    },
  );

  let payload: {
    success: boolean;
    message?: string;
    data?: T[];
    pagination?: Pagination;
  };
  try {
    const parsed: unknown = await response.json();
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid API response.");
    }
    payload = parsed as typeof payload;
  } catch {
    throw new ApiError(
      response.status >= 500
        ? "The service is temporarily unavailable."
        : "The service returned an invalid response.",
      response.status,
    );
  }

  if (!response.ok || !payload.success || !Array.isArray(payload.data)) {
    const message =
      response.status >= 500
        ? "The service is temporarily unavailable."
        : payload.message || "The request could not be completed.";
    throw new ApiError(message, response.status);
  }

  return { items: payload.data, pagination: payload.pagination };
};

export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  perPage: number;
};
