import axios, { AxiosRequestConfig, Method } from 'axios';

// Thin fetch wrapper para sa Node.js/Express backend gamit ang Axios.
// Pinapanatili nito ang API base URL at auth-token handling sa iisang lugar.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export type RequestOptions = Omit<AxiosRequestConfig, "url" | "method" | "data" | "headers"> & {
  method?: Method | string;
  body?: unknown;
  token?: string;
  query?: Record<string, any>;
  headers?: Record<string, string>;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, query, headers, method = "GET", ...rest } = options;

  try {
    const response = await axios({
      url: `${API_URL}${path}`,
      method: method,
      params: query,
      data: body,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...rest,
    });

    return response.data as T;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const statusText = error.response?.statusText ?? "Internal Server Error";
      const errorData = error.response?.data;
      const message = typeof errorData === "string" ? errorData : JSON.stringify(errorData) || error.message;
      
      throw new Error(`API ${method.toUpperCase()} ${path} failed (${status} ${statusText}): ${message}`);
    }
    throw error;
  }
}