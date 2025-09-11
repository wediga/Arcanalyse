// Minimal, robust fetch wrapper with small QoL features.
const RAW_BASE = import.meta.env.VITE_API_BASE as string | undefined;
// normalize base to never have a trailing slash
const BASE = RAW_BASE ? RAW_BASE.replace(/\/+$/, "") : "";

export type ApiError = Error & { status?: number; body?: unknown };
export type Json = unknown;

function shouldSetJsonContentType(init?: RequestInit): boolean {
  if (!init || !("body" in init) || init.body == null) return false;
  // Don't set JSON content type for FormData/Blob/ArrayBuffer/etc.
  const b = init.body as any;
  if (typeof FormData !== "undefined" && b instanceof FormData) return false;
  if (typeof Blob !== "undefined" && b instanceof Blob) return false;
  return true;
}

export async function apiFetch<T = Json>(
  path: string,
  init?: RequestInit & { parseAs?: "json" | "text" | "blob" }
): Promise<T> {
  const url = `${BASE}${path}`;
  const headers: Record<string, string> = { Accept: "application/json", ...(init?.headers as any) };

  if (shouldSetJsonContentType(init) && !("Content-Type" in headers)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    let body: unknown;
    try {
      const ct = res.headers.get("content-type") || "";
      body = ct.includes("application/json") ? await res.json() : await res.text();
    } catch {
      /* ignore parsing errors */
    }
    const err: ApiError = new Error(`HTTP ${res.status} ${res.statusText} for ${path}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  const mode = init?.parseAs ?? "json";
  if (res.status === 204) return undefined as T;
  if (mode === "text") return (await res.text()) as T;
  if (mode === "blob") return (await res.blob()) as T;
  return (await res.json()) as T;
}

// Optional convenience helpers (nice ergonomics, kannst du nutzen oder weglassen)
export const apiGet = <T = Json>(path: string, init?: RequestInit) =>
  apiFetch<T>(path, { ...init, method: "GET" });

export const apiPost = <T = Json>(path: string, body?: unknown, init?: RequestInit) =>
  apiFetch<T>(path, {
    ...init,
    method: "POST",
    body: body != null ? JSON.stringify(body) : undefined,
  });
