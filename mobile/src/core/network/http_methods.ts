import { API_BASE_URL, API_TIMEOUT_MS } from '../config/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) { super(message); this.name = 'ApiError'; this.status = status; }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    const raw = await response.text();
    let data: any = null;
    try { data = raw ? JSON.parse(raw) : null; } catch { data = { message: raw }; }
    if (!response.ok) {
      throw new ApiError(data?.message || data?.error || `Request failed (${response.status})`, response.status);
    }
    return (data?.data ?? data) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') throw new ApiError('The server took too long to respond.');
    throw new ApiError(error instanceof Error ? error.message : 'Unable to connect to the server.');
  } finally { clearTimeout(timeout); }
}
