// Thin fetch wrapper for talking to the Node.js/Express backend.
// Keeps the API base URL and auth-token handling in one place.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(`API ${options.method ?? "GET"} ${path} failed (${res.status}): ${message}`);
  }

  // Handle empty responses (e.g. 204 No Content)
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}
